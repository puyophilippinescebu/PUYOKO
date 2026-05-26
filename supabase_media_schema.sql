-- PUYOKO Media & Insights CMS Database Schema
-- Paste this script into your Supabase SQL Editor and click RUN.

-- 1. Create Blogs Table
create table if not exists blogs (
  id text primary key,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null,
  author text not null,
  date text not null,
  "readTime" text not null,
  image text not null,
  tags text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable RLS for Blogs (allows instant admin updates from client)
alter table blogs disable row level security;

-- 2. Create Events Table
create table if not exists events (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  date text not null,
  time text not null,
  image text not null,
  highlights text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable RLS for Events (allows instant admin updates from client)
alter table events disable row level security;
