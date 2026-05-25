'use server'

import { createServerClient } from '@/lib/supabase'
import { Review, WatchlistItem } from '@/types'
import { revalidatePath } from 'next/cache'

// Auth Actions
export async function getCurrentUser() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  revalidatePath('/')
}

// Watchlist Actions
export async function addToWatchlist(
  userId: string,
  mediaType: 'movie' | 'tv',
  mediaId: number,
  title: string,
  posterPath: string
) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('watchlist')
    .insert({
      user_id: userId,
      media_type: mediaType,
      media_id: mediaId,
      title,
      poster_path: posterPath,
      status: 'plan_to_watch',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFromWatchlist(itemId: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('watchlist').delete().eq('id', itemId)
  if (error) throw error
  revalidatePath('/watchlist')
}

export async function updateWatchlistItem(
  itemId: string,
  updates: Partial<WatchlistItem>
) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('watchlist')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserWatchlist(userId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Review Actions
export async function createReview(
  userId: string,
  mediaType: 'movie' | 'tv',
  mediaId: number,
  title: string,
  content: string,
  rating: number
) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: userId,
      media_type: mediaType,
      media_id: mediaId,
      title,
      content,
      rating,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath(`/${mediaType}/${mediaId}`)
  return data
}

export async function updateReview(
  reviewId: string,
  content: string,
  rating: number
) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('reviews')
    .update({ content, rating, updated_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteReview(reviewId: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
  if (error) throw error
  revalidatePath('/reviews')
}

export async function getMediaReviews(
  mediaType: 'movie' | 'tv',
  mediaId: number
) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*, users:user_id(id, username, avatar_url)')
    .eq('media_type', mediaType)
    .eq('media_id', mediaId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Review Likes
export async function toggleReviewLike(userId: string, reviewId: string) {
  const supabase = createServerClient()

  const { data: existingLike } = await supabase
    .from('review_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('review_id', reviewId)
    .single()

  if (existingLike) {
    await supabase
      .from('review_likes')
      .delete()
      .eq('user_id', userId)
      .eq('review_id', reviewId)

    await supabase.rpc('decrement_review_likes', { review_id: reviewId })
  } else {
    await supabase.from('review_likes').insert({
      user_id: userId,
      review_id: reviewId,
    })

    await supabase.rpc('increment_review_likes', { review_id: reviewId })
  }

  revalidatePath(`/reviews/${reviewId}`)
}

// Follow Actions
export async function followUser(userId: string, targetUserId: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: userId,
      following_id: targetUserId,
    })

  if (error) throw error
  revalidatePath(`/profile/${targetUserId}`)
}

export async function unfollowUser(userId: string, targetUserId: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', userId)
    .eq('following_id', targetUserId)

  if (error) throw error
  revalidatePath(`/profile/${targetUserId}`)
}

export async function isFollowing(userId: string, targetUserId: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', userId)
    .eq('following_id', targetUserId)
    .single()

  return !!data
}

// Activity Feed
export async function getActivityFeed(userId: string) {
  const supabase = createServerClient()

  // Get reviews from followed users
  const { data: followingData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  const followingIds = followingData?.map((f) => f.following_id) || []

  if (followingIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*, users:user_id(id, username, avatar_url)')
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}
