-- PUYOKO Database RBAC Setup & Row Level Security (RLS) Configuration
-- Execute this script in your Supabase SQL Editor to enable database-enforced RBAC.

-- 1. Create User Roles Table
create table if not exists user_roles (
  email text primary key,
  role text not null check (role in ('director', 'agent')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on user_roles
alter table user_roles enable row level security;

-- 2. Create helper function to resolve current user's role
create or replace function get_user_role()
returns text as $$
declare
  user_email text;
  user_role text;
begin
  user_email := auth.jwt() ->> 'email';
  if user_email is null then
    return 'anonymous';
  end if;
  
  -- Hardcoded fallback for the primary Director
  if user_email = 'puyophilippinescebu@gmail.com' then
    return 'director';
  end if;
  
  -- Check in database
  select role into user_role from user_roles where email = user_email;
  
  if user_role is not null then
    return user_role;
  else
    return 'agent'; -- Default fallback role for authenticated users
  end if;
end;
$$ language plpgsql security definer;

-- 3. Define Policies for user_roles
-- Drop existing policies if any
drop policy if exists "user_roles_select_policy" on user_roles;
drop policy if exists "user_roles_modify_policy" on user_roles;

-- Allow users to read their own role, and Directors to read all roles
create policy "user_roles_select_policy" on user_roles 
  for select 
  using (
    (auth.jwt() ->> 'email' = email) or 
    (get_user_role() = 'director')
  );

-- Only Directors can insert/update/delete role records
create policy "user_roles_modify_policy" on user_roles 
  for all 
  to authenticated 
  using (get_user_role() = 'director')
  with check (get_user_role() = 'director');


-- 4. Secure the Properties table
-- Enable RLS
alter table properties enable row level security;

drop policy if exists "properties_select_policy" on properties;
drop policy if exists "properties_modify_policy" on properties;

-- SELECT policy: Anyone (including anonymous public visitors) can view properties
create policy "properties_select_policy" on properties 
  for select 
  using (true);

-- INSERT/UPDATE/DELETE policy: Only users with 'director' role can edit properties table directly
create policy "properties_modify_policy" on properties 
  for all 
  to authenticated 
  using (get_user_role() = 'director')
  with check (get_user_role() = 'director');


-- 5. Secure the Property Requests table
-- Enable RLS
alter table property_requests enable row level security;

drop policy if exists "property_requests_select_policy" on property_requests;
drop policy if exists "property_requests_insert_policy" on property_requests;
drop policy if exists "property_requests_modify_policy" on property_requests;

-- SELECT policy: Directors can see all requests, agents can only see their own requests
create policy "property_requests_select_policy" on property_requests 
  for select 
  to authenticated 
  using (
    (get_user_role() = 'director') or 
    ("requestedBy" = auth.jwt() ->> 'email')
  );

-- INSERT policy: Authenticated users can insert requests where requestedBy is their email or if they are Director
create policy "property_requests_insert_policy" on property_requests 
  for insert 
  to authenticated 
  with check (
    ("requestedBy" = auth.jwt() ->> 'email') or 
    (get_user_role() = 'director')
  );

-- UPDATE/DELETE policy: Owners of the request or Directors can update or delete
create policy "property_requests_modify_policy" on property_requests 
  for all 
  to authenticated 
  using (
    (get_user_role() = 'director') or 
    ("requestedBy" = auth.jwt() ->> 'email')
  )
  with check (
    (get_user_role() = 'director') or 
    ("requestedBy" = auth.jwt() ->> 'email')
  );


-- 6. Secure the Blogs & Events tables
-- Enable RLS
alter table blogs enable row level security;
alter table events enable row level security;

drop policy if exists "blogs_select_policy" on blogs;
drop policy if exists "blogs_modify_policy" on blogs;
drop policy if exists "events_select_policy" on events;
drop policy if exists "events_modify_policy" on events;

-- SELECT: Anyone can read blogs & events
create policy "blogs_select_policy" on blogs for select using (true);
create policy "events_select_policy" on events for select using (true);

-- INSERT/UPDATE/DELETE: Any authenticated agent or director can write to blogs & events
create policy "blogs_modify_policy" on blogs 
  for all 
  to authenticated 
  using (get_user_role() in ('director', 'agent'))
  with check (get_user_role() in ('director', 'agent'));

create policy "events_modify_policy" on events 
  for all 
  to authenticated 
  using (get_user_role() in ('director', 'agent'))
  with check (get_user_role() in ('director', 'agent'));
