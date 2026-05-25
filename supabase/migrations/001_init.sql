-- Create tables
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  media_id integer not null,
  title text not null,
  poster_path text not null,
  status text default 'plan_to_watch' check (status in ('plan_to_watch', 'watching', 'completed', 'dropped')),
  rating integer check (rating >= 1 and rating <= 10),
  notes text,
  watched_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(user_id, media_type, media_id)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  media_id integer not null,
  title text not null,
  content text not null,
  rating integer not null check (rating >= 1 and rating <= 10),
  likes_count integer default 0,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(user_id, media_type, media_id)
);

create table if not exists review_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  review_id uuid not null references reviews(id) on delete cascade,
  created_at timestamp default now(),
  unique(user_id, review_id)
);

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references users(id) on delete cascade,
  following_id uuid not null references users(id) on delete cascade,
  created_at timestamp default now(),
  check (follower_id != following_id),
  unique(follower_id, following_id)
);

-- Create functions
create or replace function increment_review_likes(review_id uuid)
returns void as $$
begin
  update reviews set likes_count = likes_count + 1 where id = review_id;
end;
$$ language plpgsql security definer;

create or replace function decrement_review_likes(review_id uuid)
returns void as $$
begin
  update reviews set likes_count = greatest(0, likes_count - 1) where id = review_id;
end;
$$ language plpgsql security definer;

-- Enable RLS
alter table users enable row level security;
alter table watchlist enable row level security;
alter table reviews enable row level security;
alter table review_likes enable row level security;
alter table follows enable row level security;

-- RLS Policies
-- Users can read all users
create policy "Users are viewable by everyone" on users for select using (true);

-- Users can update own profile
create policy "Users can update own profile" on users for update using (auth.uid() = id);

-- Users can read own and others' watchlists
create policy "Watchlist is readable by owner and public" on watchlist for select using (
  user_id = auth.uid() or true
);

-- Users can only create/update/delete own watchlist
create policy "Users can create own watchlist" on watchlist for insert with check (user_id = auth.uid());
create policy "Users can update own watchlist" on watchlist for update using (user_id = auth.uid());
create policy "Users can delete own watchlist" on watchlist for delete using (user_id = auth.uid());

-- Reviews are public
create policy "Reviews are readable by everyone" on reviews for select using (true);

-- Users can create reviews
create policy "Users can create reviews" on reviews for insert with check (user_id = auth.uid());

-- Users can update own reviews
create policy "Users can update own reviews" on reviews for update using (user_id = auth.uid());

-- Users can delete own reviews
create policy "Users can delete own reviews" on reviews for delete using (user_id = auth.uid());

-- Review likes
create policy "Review likes are readable by everyone" on review_likes for select using (true);
create policy "Users can like reviews" on review_likes for insert with check (user_id = auth.uid());
create policy "Users can unlike reviews" on review_likes for delete using (user_id = auth.uid());

-- Follows
create policy "Follows are readable by everyone" on follows for select using (true);
create policy "Users can create follows" on follows for insert with check (follower_id = auth.uid());
create policy "Users can delete follows" on follows for delete using (follower_id = auth.uid());

-- Create indexes
create index idx_watchlist_user_id on watchlist(user_id);
create index idx_reviews_user_id on reviews(user_id);
create index idx_reviews_media on reviews(media_type, media_id);
create index idx_review_likes_review_id on review_likes(review_id);
create index idx_follows_follower on follows(follower_id);
create index idx_follows_following on follows(following_id);
