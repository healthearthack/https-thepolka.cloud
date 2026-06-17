-- Run this entire file in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run)

-- 1. Profiles table: maps a user id to a username + email
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- 2. Posts table
create table public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(content) <= 280 and char_length(content) > 0),
  created_at timestamptz not null default now()
);

-- 3. Survey responses: one-time "where do you get your news from" prompt
create table public.survey_responses (
  user_id uuid primary key references auth.users (id) on delete cascade,
  news_source text not null check (news_source in ('online', 'tv', 'print', 'word_of_mouth')),
  created_at timestamptz not null default now()
);

-- 4. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.survey_responses enable row level security;

-- 5. Profiles policies: anyone logged in can read all profiles (to show
--    usernames on posts). Users can update their own row only. Inserts are
--    handled by the trigger below (running as the table owner), so no
--    insert policy is needed for normal use.
create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 6. Posts policies: anyone logged in can read all posts, create their own,
--    and delete only their own.
create policy "Posts are readable by authenticated users"
  on public.posts for select
  to authenticated
  using (true);

create policy "Users can create their own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);

-- 7. Survey policies: users can read/insert only their own response.
create policy "Users can read their own survey response"
  on public.survey_responses for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own survey response"
  on public.survey_responses for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 8. Index for feed ordering
create index posts_created_at_idx on public.posts (created_at desc);

-- 9. Trigger: automatically create a profile row whenever a new auth user
--    is created (works even before email confirmation, and runs with
--    elevated privileges so it isn't blocked by RLS).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    lower(new.raw_user_meta_data->>'username'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
