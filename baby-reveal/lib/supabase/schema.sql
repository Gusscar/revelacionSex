-- Baby Reveal App - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar text,
  created_at timestamptz default now()
);

-- Events table
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete set null,
  title text not null,
  baby_name text,
  reveal_date timestamptz not null,
  theme text not null default 'confetti',
  reveal_mode text not null default 'countdown',
  slug text unique not null,
  cover_image text,
  result text check (result in ('boy', 'girl')),
  is_revealed boolean default false,
  fake_reveal_count int default 0,
  keeper_token text unique not null,
  created_at timestamptz default now()
);

-- Participants table
create table if not exists participants (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  nickname text not null,
  avatar text,
  team_vote text check (team_vote in ('boy', 'girl')),
  joined_at timestamptz default now()
);

-- Reactions table
create table if not exists reactions (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  type text not null,
  created_at timestamptz default now()
);

-- Comments table
create table if not exists comments (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  nickname text,
  message text not null,
  created_at timestamptz default now()
);

-- Media uploads table
create table if not exists media_uploads (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  media_url text not null,
  media_type text check (media_type in ('image', 'video')) not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table events enable row level security;
alter table participants enable row level security;
alter table reactions enable row level security;
alter table comments enable row level security;
alter table media_uploads enable row level security;

-- Drop existing policies before recreating
drop policy if exists "Profiles are viewable by everyone" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

drop policy if exists "Events are viewable by everyone" on events;
drop policy if exists "Authenticated users can create events" on events;
drop policy if exists "Owners can update events" on events;
drop policy if exists "Owners can delete events" on events;

drop policy if exists "Participants are viewable by everyone" on participants;
drop policy if exists "Anyone can join events" on participants;
drop policy if exists "Users can update own participation" on participants;

drop policy if exists "Reactions are viewable by everyone" on reactions;
drop policy if exists "Anyone can react" on reactions;

drop policy if exists "Comments are viewable by everyone" on comments;
drop policy if exists "Anyone can comment" on comments;

drop policy if exists "Media is viewable by everyone" on media_uploads;
drop policy if exists "Anyone can upload media" on media_uploads;

-- Profiles policies
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Events policies
create policy "Events are viewable by everyone" on events for select using (true);
create policy "Authenticated users can create events" on events for insert with check (true);
create policy "Owners can update events" on events for update using (auth.uid() = owner_id);
create policy "Owners can delete events" on events for delete using (auth.uid() = owner_id);

-- Participants policies
create policy "Participants are viewable by everyone" on participants for select using (true);
create policy "Anyone can join events" on participants for insert with check (true);
create policy "Users can update own participation" on participants for update using (auth.uid() = user_id or user_id is null);

-- Reactions policies
create policy "Reactions are viewable by everyone" on reactions for select using (true);
create policy "Anyone can react" on reactions for insert with check (true);

-- Comments policies
create policy "Comments are viewable by everyone" on comments for select using (true);
create policy "Anyone can comment" on comments for insert with check (true);

-- Media uploads policies
create policy "Media is viewable by everyone" on media_uploads for select using (true);
create policy "Anyone can upload media" on media_uploads for insert with check (true);

-- Realtime (ignore error if already added)
do $$ begin
  alter publication supabase_realtime add table participants;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table reactions;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table comments;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table events;
exception when others then null; end $$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
