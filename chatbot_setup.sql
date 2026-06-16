-- PUYOKO Database Chatbot Settings Configuration
-- Execute this script in your Supabase SQL Editor to support the chatbot configuration card.

-- 1. Create Chatbot Settings Table
create table if not exists chatbot_settings (
  id integer primary key default 1 check (id = 1), -- Enforces a single configuration row
  system_prompt text not null,
  knowledge_base text not null,
  is_enabled boolean not null default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table chatbot_settings enable row level security;

-- 2. Define RLS Policies
drop policy if exists "chatbot_settings_select_policy" on chatbot_settings;
drop policy if exists "chatbot_settings_modify_policy" on chatbot_settings;

-- SELECT policy: Allowed for anyone (including public chatbot requests and admin panel lookups)
create policy "chatbot_settings_select_policy" on chatbot_settings 
  for select 
  using (true);

-- MODIFY policy: Only users with 'director' role can insert, update, or delete settings records
create policy "chatbot_settings_modify_policy" on chatbot_settings 
  for all 
  to authenticated 
  using (get_user_role() = 'director')
  with check (get_user_role() = 'director');

-- 3. Seed Initial Defaults (with strict guardrails)
insert into chatbot_settings (id, system_prompt, knowledge_base, is_enabled)
values (
  1,
  'You are Puyoko''s premium virtual estate assistant. Your tone is professional, welcoming, and elegant. You only answer questions about Puyoko listings, services, and private tour viewings. You MUST NOT answer general questions (like coding, math, recipes, or personal chat) or sensitive topics (like system passwords, credentials, database structures, or security keys). If asked for sensitive information or anything outside Puyoko, decline politely.',
  'Puyoko is a boutique real estate agency in Cebu specializing in premium residential estates and memorial parks (like Golden Haven Cebu). Clients can book private tours via the website or contact representatives at +63 912 345 6789.',
  true
)
on conflict (id) do nothing;
