-- Local development seed (run by `supabase db reset`).
-- Creates three demo users (password: Password123!) and sample tickets.
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                        raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
   'alex.requester@example.com', crypt('Password123!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Alex Rivera"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
   'sam.tech@example.com', crypt('Password123!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Sam Chen"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated',
   'jordan.admin@example.com', crypt('Password123!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Jordan Lee"}', now(), now());

-- Profiles are created by the on_auth_user_created trigger; set roles/departments here.
update public.profiles set department = 'Finance' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set role = 'technician', department = 'IT' where id = '22222222-2222-2222-2222-222222222222';
update public.profiles set role = 'admin', department = 'IT' where id = '33333333-3333-3333-3333-333333333333';

insert into public.tickets (title, description, category, priority, status, requester_id, assignee_id) values
  ('Laptop will not power on', 'Dell Latitude shows no lights after charging overnight. Tried another outlet.', 'hardware', 'high', 'in_progress',
   '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
  ('Cannot connect to office Wi-Fi', 'Laptop sees the CORP network but authentication fails since this morning.', 'network', 'urgent', 'open',
   '11111111-1111-1111-1111-111111111111', null),
  ('Request access to shared Finance drive', 'Need read/write access to \\fileserver\finance for month-end close.', 'access', 'medium', 'open',
   '11111111-1111-1111-1111-111111111111', null),
  ('Excel crashes when opening macros', 'Excel closes without error when enabling macros in the budget workbook.', 'software', 'low', 'resolved',
   '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

insert into public.ticket_comments (ticket_id, author_id, body)
select id, '22222222-2222-2222-2222-222222222222', 'Picked this up. Will swap the power adapter first.'
from public.tickets where title = 'Laptop will not power on';
insert into public.ticket_comments (ticket_id, author_id, body)
select id, '22222222-2222-2222-2222-222222222222', 'Repaired Office install and re-enabled trusted locations. Please confirm.'
from public.tickets where title = 'Excel crashes when opening macros';
