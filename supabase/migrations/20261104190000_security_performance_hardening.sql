-- Hardening from Supabase security + performance advisors.
-- 1. Role-check helpers move to a non-exposed `private` schema (not callable via /rest/v1/rpc).
-- 2. Trigger functions get a fixed search_path; handle_new_user is not callable by API roles.
-- 3. Policies wrap auth.uid()/helpers in (select ...) so they are evaluated once per query, not per row.
-- 4. Overlapping permissive UPDATE policies are merged into one per table.
-- 5. Index the ticket_comments.author_id foreign key.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('technician', 'admin')
  );
$$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

revoke all on function private.is_staff() from public, anon;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Trigger functions: pinned search_path, schema-qualified references.
create or replace function public.touch_ticket()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status in ('resolved', 'closed') and old.status not in ('resolved', 'closed') then
    new.resolved_at := now();
  elsif new.status in ('open', 'in_progress') then
    new.resolved_at := null;
  end if;
  return new;
end;
$$;

create or replace function public.guard_ticket_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  -- auth.uid() is null for trusted server-side contexts (service role, SQL editor, seed scripts).
  if auth.uid() is not null and not private.is_staff() then
    if new.status is distinct from old.status
       or new.assignee_id is distinct from old.assignee_id
       or new.priority is distinct from old.priority
       or new.requester_id is distinct from old.requester_id then
      raise exception 'Only technicians or admins can change status, priority or assignee';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.guard_profile_role()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not private.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;

-- Trigger-only functions should not be reachable through the Data API.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.touch_ticket() from public, anon, authenticated;
revoke all on function public.guard_ticket_fields() from public, anon, authenticated;
revoke all on function public.guard_profile_role() from public, anon, authenticated;

-- Recreate policies ---------------------------------------------------------
drop policy "profiles: read own or staff reads all" on public.profiles;
drop policy "profiles: update own" on public.profiles;
drop policy "profiles: admin updates any" on public.profiles;
drop policy "tickets: requester reads own, staff reads all" on public.tickets;
drop policy "tickets: anyone signed in creates for self" on public.tickets;
drop policy "tickets: requester updates own" on public.tickets;
drop policy "tickets: staff update any (assign/status)" on public.tickets;
drop policy "tickets: admin deletes" on public.tickets;
drop policy "comments: read if ticket visible" on public.ticket_comments;
drop policy "comments: add if ticket visible" on public.ticket_comments;
drop policy "comments: author or admin deletes" on public.ticket_comments;

create policy "profiles: read own or staff reads all" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select private.is_staff()));
create policy "profiles: update own, admin updates any" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));

create policy "tickets: requester reads own, staff reads all" on public.tickets
  for select to authenticated using (requester_id = (select auth.uid()) or (select private.is_staff()));
create policy "tickets: signed-in users create for self" on public.tickets
  for insert to authenticated with check (requester_id = (select auth.uid()));
-- Requesters may update their own ticket (guard trigger limits them to title/description); staff any.
create policy "tickets: requester updates own, staff update any" on public.tickets
  for update to authenticated
  using (requester_id = (select auth.uid()) or (select private.is_staff()))
  with check (requester_id = (select auth.uid()) or (select private.is_staff()));
create policy "tickets: admin deletes" on public.tickets
  for delete to authenticated using ((select private.is_admin()));

create policy "comments: read if ticket visible" on public.ticket_comments
  for select to authenticated using (
    exists (select 1 from public.tickets t
            where t.id = ticket_id and (t.requester_id = (select auth.uid()) or (select private.is_staff()))));
create policy "comments: add if ticket visible" on public.ticket_comments
  for insert to authenticated with check (
    author_id = (select auth.uid()) and exists (
      select 1 from public.tickets t
      where t.id = ticket_id and (t.requester_id = (select auth.uid()) or (select private.is_staff()))));
create policy "comments: author or admin deletes" on public.ticket_comments
  for delete to authenticated using (author_id = (select auth.uid()) or (select private.is_admin()));

-- Old public helpers are no longer referenced.
drop function public.is_staff();
drop function public.is_admin();

create index if not exists ticket_comments_author_idx on public.ticket_comments (author_id);
