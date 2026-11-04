-- IT Help Desk Ticket Tracker: initial schema
-- Tables: profiles, tickets, ticket_comments  |  Row Level Security on all tables

create type public.user_role       as enum ('requester', 'technician', 'admin');
create type public.ticket_category as enum ('hardware', 'software', 'network', 'access', 'other');
create type public.ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.ticket_status   as enum ('open', 'in_progress', 'resolved', 'closed');

-- Profiles: one row per auth user ------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text,
  department  text,
  role        public.user_role not null default 'requester',
  created_at  timestamptz not null default now()
);

-- Tickets -------------------------------------------------------------------
create table public.tickets (
  id           bigint generated always as identity primary key,
  title        text not null check (char_length(title) between 5 and 120),
  description  text not null check (char_length(description) >= 10),
  category     public.ticket_category not null default 'other',
  priority     public.ticket_priority not null default 'medium',
  status       public.ticket_status   not null default 'open',
  requester_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  assignee_id  uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
create index tickets_requester_idx on public.tickets (requester_id);
create index tickets_assignee_idx  on public.tickets (assignee_id);
create index tickets_status_idx    on public.tickets (status, priority);

-- Comments ------------------------------------------------------------------
create table public.ticket_comments (
  id         bigint generated always as identity primary key,
  ticket_id  bigint not null references public.tickets (id) on delete cascade,
  author_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index ticket_comments_ticket_idx on public.ticket_comments (ticket_id, created_at);

-- Helpers -------------------------------------------------------------------
-- SECURITY DEFINER so policies can read the caller's role without recursing into profiles RLS.
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('technician', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Keep updated_at / resolved_at current.
create or replace function public.touch_ticket()
returns trigger language plpgsql as $$
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
create trigger tickets_touch before update on public.tickets
  for each row execute function public.touch_ticket();

-- Requesters may only edit title/description of their own ticket; workflow fields are staff-only.
create or replace function public.guard_ticket_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_staff() then
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
create trigger tickets_guard before update on public.tickets
  for each row execute function public.guard_ticket_fields();

-- Stop users promoting themselves.
create or replace function public.guard_profile_role()
returns trigger language plpgsql as $$
begin
  -- auth.uid() is null for trusted server-side contexts (service role, SQL editor, seed scripts).
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- Auto-create a requester profile on sign-up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security --------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.tickets         enable row level security;
alter table public.ticket_comments enable row level security;

-- profiles
create policy "profiles: read own or staff reads all" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_staff());
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admin updates any" on public.profiles
  for update to authenticated using (public.is_admin()) with check (true);

-- tickets
create policy "tickets: requester reads own, staff reads all" on public.tickets
  for select to authenticated using (requester_id = auth.uid() or public.is_staff());
create policy "tickets: anyone signed in creates for self" on public.tickets
  for insert to authenticated with check (requester_id = auth.uid());
create policy "tickets: requester updates own" on public.tickets
  for update to authenticated using (requester_id = auth.uid()) with check (requester_id = auth.uid());
create policy "tickets: staff update any (assign/status)" on public.tickets
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "tickets: admin deletes" on public.tickets
  for delete to authenticated using (public.is_admin());

-- ticket_comments: visible/creatable by anyone who can see the parent ticket
create policy "comments: read if ticket visible" on public.ticket_comments
  for select to authenticated using (
    exists (select 1 from public.tickets t
            where t.id = ticket_id and (t.requester_id = auth.uid() or public.is_staff())));
create policy "comments: add if ticket visible" on public.ticket_comments
  for insert to authenticated with check (
    author_id = auth.uid() and exists (
      select 1 from public.tickets t
      where t.id = ticket_id and (t.requester_id = auth.uid() or public.is_staff())));
create policy "comments: author or admin deletes" on public.ticket_comments
  for delete to authenticated using (author_id = auth.uid() or public.is_admin());
