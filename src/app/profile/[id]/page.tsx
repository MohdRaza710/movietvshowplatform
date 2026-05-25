import React from 'react'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types'
import { User, Star, Film } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!user) return null

    const { count: reviews } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: watchlist } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: followers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    const { count: following } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    return {
      ...user,
      total_reviews: reviews || 0,
      total_watchlist: watchlist || 0,
      followers_count: followers || 0,
      following_count: following || 0,
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const profile = await getUserProfile(id)

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400">User not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <User size={40} className="text-cyan-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{profile.username}</h1>
            {profile.bio && <p className="text-slate-300 mb-4">{profile.bio}</p>}

            {/* Stats */}
            <div className="flex gap-8 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">
                  {profile.total_reviews}
                </div>
                <p className="text-slate-400 text-sm">Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">
                  {profile.total_watchlist}
                </div>
                <p className="text-slate-400 text-sm">Watchlist</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">
                  {profile.followers_count}
                </div>
                <p className="text-slate-400 text-sm">Followers</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">
                  {profile.following_count}
                </div>
                <p className="text-slate-400 text-sm">Following</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link href={`/profile/${id}/reviews`}>
                <Button className="gap-2">
                  <Star size={18} />
                  View Reviews
                </Button>
              </Link>
              <Link href={`/profile/${id}/watchlist`}>
                <Button className="gap-2" variant="outline" className="border-cyan-500 text-cyan-300 hover:bg-cyan-500/10">
                  <Film size={18} />
                  Watchlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Recent Reviews</h2>
        <p className="text-slate-400">Coming soon...</p>
      </motion.section>
    </div>
  )
}
