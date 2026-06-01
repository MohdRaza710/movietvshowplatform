-- ============================================
-- CineVault - Safe Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PUBLIC USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  username    text NOT NULL,
  avatar_url  text,
  bio         text,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

-- 2. WATCHLIST TABLE
CREATE TABLE IF NOT EXISTS public.watchlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  media_type  text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_id    integer NOT NULL,
  title       text NOT NULL,
  poster_path text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'plan_to_watch'
              CHECK (status IN ('plan_to_watch', 'watching', 'completed', 'dropped')),
  rating      numeric,
  notes       text,
  watched_at  timestamptz,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

-- Add unique constraint to watchlist if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'watchlist_user_id_media_type_media_id_key'
  ) THEN
    ALTER TABLE public.watchlist
      ADD CONSTRAINT watchlist_user_id_media_type_media_id_key
      UNIQUE (user_id, media_type, media_id);
  END IF;
END $$;

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  media_type  text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_id    integer NOT NULL,
  title       text NOT NULL,
  content     text NOT NULL,
  rating      integer NOT NULL CHECK (rating BETWEEN 1 AND 10),
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

-- Safely add likes_count column if it doesn't exist
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0 NOT NULL;

-- Add unique constraint to reviews if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_user_id_media_type_media_id_key'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_user_id_media_type_media_id_key
      UNIQUE (user_id, media_type, media_id);
  END IF;
END $$;

-- 4. REVIEW LIKES TABLE
CREATE TABLE IF NOT EXISTS public.review_likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  review_id   uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, review_id)
);

-- 5. FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now() NOT NULL,
  UNIQUE (follower_id, following_id)
);

-- Add check constraint to follows if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'follows_no_self_follow'
  ) THEN
    ALTER TABLE public.follows
      ADD CONSTRAINT follows_no_self_follow
      CHECK (follower_id <> following_id);
  END IF;
END $$;

-- ============================================
-- RPC FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_review_likes(review_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.reviews
  SET likes_count = likes_count + 1
  WHERE id = review_id;
$$;

CREATE OR REPLACE FUNCTION public.decrement_review_likes(review_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.reviews
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = review_id;
$$;

-- ============================================
-- AUTO-SYNC TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'user_name',
      LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', '_')),
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- BACKFILL existing auth users
-- ============================================

INSERT INTO public.users (id, email, username, avatar_url, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'preferred_username',
    au.raw_user_meta_data->>'user_name',
    LOWER(REPLACE(COALESCE(au.raw_user_meta_data->>'full_name', ''), ' ', '_')),
    SPLIT_PART(au.email, '@', 1)
  ),
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  ),
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows      ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (avoids "already exists" errors)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users are publicly readable"           ON public.users;
  DROP POLICY IF EXISTS "Users can update own profile"         ON public.users;
  DROP POLICY IF EXISTS "Watchlist is private to owner"        ON public.watchlist;
  DROP POLICY IF EXISTS "Reviews are publicly readable"        ON public.reviews;
  DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Users can update own reviews"         ON public.reviews;
  DROP POLICY IF EXISTS "Users can delete own reviews"         ON public.reviews;
  DROP POLICY IF EXISTS "Review likes are publicly readable"   ON public.review_likes;
  DROP POLICY IF EXISTS "Authenticated users can like reviews" ON public.review_likes;
  DROP POLICY IF EXISTS "Users can unlike their own likes"     ON public.review_likes;
  DROP POLICY IF EXISTS "Follows are publicly readable"        ON public.follows;
  DROP POLICY IF EXISTS "Authenticated users can follow"       ON public.follows;
  DROP POLICY IF EXISTS "Users can unfollow"                   ON public.follows;
END $$;

-- USERS
CREATE POLICY "Users are publicly readable"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- WATCHLIST
CREATE POLICY "Watchlist is private to owner"
  ON public.watchlist FOR ALL USING (auth.uid() = user_id);

-- REVIEWS
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- REVIEW LIKES
CREATE POLICY "Review likes are publicly readable"
  ON public.review_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like reviews"
  ON public.review_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON public.review_likes FOR DELETE USING (auth.uid() = user_id);

-- FOLLOWS
CREATE POLICY "Follows are publicly readable"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);