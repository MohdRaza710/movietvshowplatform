-- =============================================
-- CineVault Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- Extends auth.users with app-specific data
-- =============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  username text unique,
  avatar_url text,
  bio text default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    lower(replace(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), ' ', '_')) || '_' || substr(new.id::text, 1, 8),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- 2. REVIEWS TABLE
-- =============================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  media_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  rating integer not null check (rating >= 1 and rating <= 10),
  content text not null check (char_length(content) >= 10),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  -- One review per user per media item
  unique(user_id, media_id, media_type)
);

-- =============================================
-- 3. REVIEW LIKES TABLE
-- =============================================
create table public.review_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  review_id uuid references public.reviews(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, review_id)
);

-- =============================================
-- 4. WATCHLIST TABLE
-- =============================================
create table public.watchlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  media_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  status text not null default 'plan_to_watch' check (status in ('plan_to_watch', 'watching', 'completed', 'dropped')),
  user_rating integer check (user_rating is null or (user_rating >= 1 and user_rating <= 10)),
  notes text default '',
  is_public boolean default true,
  poster_path text,
  title text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, media_id, media_type)
);

-- =============================================
-- 5. FOLLOWS TABLE
-- =============================================
create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- =============================================
-- 6. ACTIVITIES TABLE
-- =============================================
create table public.activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_type text not null check (activity_type in ('reviewed', 'added_to_watchlist', 'completed', 'started_watching', 'dropped', 'followed_user')),
  media_id integer,
  media_type text check (media_type in ('movie', 'tv')),
  media_title text,
  media_poster_path text,
  target_user_id uuid references public.profiles(id) on delete set null,
  metadata jsonb default '{}',
  created_at timestamptz default now() not null
);

-- =============================================
-- INDEXES
-- =============================================
create index idx_reviews_media on public.reviews(media_id, media_type);
create index idx_reviews_user on public.reviews(user_id);
create index idx_review_likes_review on public.review_likes(review_id);
create index idx_review_likes_user on public.review_likes(user_id);
create index idx_watchlist_user on public.watchlist(user_id);
create index idx_watchlist_media on public.watchlist(media_id, media_type);
create index idx_watchlist_status on public.watchlist(user_id, status);
create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);
create index idx_activities_user on public.activities(user_id);
create index idx_activities_created on public.activities(created_at desc);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Profiles: everyone can read, only owner can update
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Reviews: everyone can read, only authenticated can create, only owner can update/delete
alter table public.reviews enable row level security;
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Authenticated users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- Review Likes: everyone can read, authenticated can create/delete own
alter table public.review_likes enable row level security;
create policy "Review likes are viewable by everyone" on public.review_likes for select using (true);
create policy "Authenticated users can like reviews" on public.review_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike reviews" on public.review_likes for delete using (auth.uid() = user_id);

-- Watchlist: public items visible to all, private only to owner, owner CRUD
alter table public.watchlist enable row level security;
create policy "Public watchlist items are viewable by everyone" on public.watchlist for select using (is_public = true or auth.uid() = user_id);
create policy "Authenticated users can create watchlist items" on public.watchlist for insert with check (auth.uid() = user_id);
create policy "Users can update own watchlist items" on public.watchlist for update using (auth.uid() = user_id);
create policy "Users can delete own watchlist items" on public.watchlist for delete using (auth.uid() = user_id);

-- Follows: everyone can read, authenticated can create/delete own
alter table public.follows enable row level security;
create policy "Follows are viewable by everyone" on public.follows for select using (true);
create policy "Authenticated users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Activities: everyone can read, system creates (via trigger or server action)
alter table public.activities enable row level security;
create policy "Activities are viewable by everyone" on public.activities for select using (true);
create policy "Authenticated users can create activities" on public.activities for insert with check (auth.uid() = user_id);

-- =============================================
-- TRIGGERS: Auto-log activities
-- =============================================

-- Activity on review creation
create or replace function public.log_review_activity()
returns trigger as $$
begin
  insert into public.activities (user_id, activity_type, media_id, media_type, metadata)
  values (
    new.user_id,
    'reviewed',
    new.media_id,
    new.media_type,
    jsonb_build_object('rating', new.rating, 'review_id', new.id)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert on public.reviews
  for each row execute function public.log_review_activity();

-- Activity on watchlist status change
create or replace function public.log_watchlist_activity()
returns trigger as $$
begin
  -- Only log if it's a new insert or status changed
  if (TG_OP = 'INSERT') then
    insert into public.activities (user_id, activity_type, media_id, media_type, media_title, media_poster_path)
    values (
      new.user_id,
      'added_to_watchlist',
      new.media_id,
      new.media_type,
      new.title,
      new.poster_path
    );
  elsif (TG_OP = 'UPDATE' and old.status != new.status) then
    insert into public.activities (user_id, activity_type, media_id, media_type, media_title, media_poster_path)
    values (
      new.user_id,
      case new.status
        when 'completed' then 'completed'
        when 'watching' then 'started_watching'
        when 'dropped' then 'dropped'
        else 'added_to_watchlist'
      end,
      new.media_id,
      new.media_type,
      new.title,
      new.poster_path
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_watchlist_changed
  after insert or update on public.watchlist
  for each row execute function public.log_watchlist_activity();

-- Activity on follow
create or replace function public.log_follow_activity()
returns trigger as $$
begin
  insert into public.activities (user_id, activity_type, target_user_id)
  values (new.follower_id, 'followed_user', new.following_id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_follow_created
  after insert on public.follows
  for each row execute function public.log_follow_activity();

-- =============================================
-- HELPER VIEWS
-- =============================================

-- View: reviews with like count and user profile
create or replace view public.reviews_with_user as
select
  r.*,
  p.display_name,
  p.username,
  p.avatar_url,
  coalesce(rl.like_count, 0) as like_count
from public.reviews r
join public.profiles p on r.user_id = p.id
left join (
  select review_id, count(*) as like_count
  from public.review_likes
  group by review_id
) rl on r.id = rl.review_id;

-- Updated_at auto-update function
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at();
create trigger update_reviews_updated_at before update on public.reviews for each row execute function public.update_updated_at();
create trigger update_watchlist_updated_at before update on public.watchlist for each row execute function public.update_updated_at();
