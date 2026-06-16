-- PUYOKO Database Leads & Inquiry Setup
-- Execute this script in your Supabase SQL Editor to enable database lead management.

-- 1. Create Inquiries Table
create table if not exists inquiries (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  message text,
  property_title text,
  property_price text,
  property_address text,
  tour_date text,
  tour_mode text,
  tour_time text,
  assigned_agent text,
  agent_contact text,
  form_type text not null, -- 'Contact Inquiry' | 'Tour Booking'
  status text not null default 'New' check (status in ('New', 'Viewing Scheduled', 'Closed', 'Spam')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table inquiries enable row level security;

-- 2. Define RLS Policies
drop policy if exists "inquiries_select_policy" on inquiries;
drop policy if exists "inquiries_insert_policy" on inquiries;
drop policy if exists "inquiries_update_policy" on inquiries;
drop policy if exists "inquiries_delete_policy" on inquiries;

-- SELECT policy: Only authenticated Directors and Agents can read leads
create policy "inquiries_select_policy" on inquiries 
  for select 
  to authenticated
  using (get_user_role() in ('director', 'agent'));

-- INSERT policy: Allow anyone (anonymous public website visitors) to submit inquiries
create policy "inquiries_insert_policy" on inquiries 
  for insert 
  with check (true);

-- UPDATE policy: Directors and Agents can modify leads (change status, assign agent, etc.)
create policy "inquiries_update_policy" on inquiries 
  for update 
  to authenticated
  using (get_user_role() in ('director', 'agent'))
  with check (get_user_role() in ('director', 'agent'));

-- DELETE policy: Only Directors can delete inquiries (e.g. cleaning up spam)
create policy "inquiries_delete_policy" on inquiries 
  for delete 
  to authenticated
  using (get_user_role() = 'director');
