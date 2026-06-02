'use client'

import React from 'react'
import Link from 'next/link'
import { User, Star, Film, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserProfile } from '@/types'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { followUser, unfollowUser, isFollowing } from '@/actions'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface ProfileClientProps {
  profile: UserProfile
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const currentUser = useAuthStore((state) => state.user)
  const [following, setFollowing] = React.useState(false)
  const [followLoading, setFollowLoading] = React.useState(false)
  const [stats, setStats] = React.useState({
    total_reviews: profile.total_reviews,
    total_watchlist: profile.total_watchlist,
    followers_count: profile.followers_count,
    following_count: profile.following_count,
  })

  const isOwnProfile = currentUser?.id === profile.id

  // Check follow status
  React.useEffect(() => {
    if (!currentUser || isOwnProfile) return
    isFollowing(currentUser.id, profile.id)
      .then(setFollowing)
      .catch(console.error)
  }, [currentUser, profile.id, isOwnProfile])

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Sign in to follow users')
      return
    }
    setFollowLoading(true)
    try {
      if (following) {
        await unfollowUser(currentUser.id, profile.id)
        setFollowing(false)
        setStats((s) => ({ ...s, followers_count: s.followers_count - 1 }))
        toast.success(`Unfollowed ${profile.username}`)
      } else {
        await followUser(currentUser.id, profile.id)
        setFollowing(true)
        setStats((s) => ({ ...s, followers_count: s.followers_count + 1 }))
        toast.success(`Following ${profile.username}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update follow status')
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-start gap-4 sm:gap-6 flex-wrap">
          {/* Avatar */}
          <div className="shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full object-cover ring-2 ring-slate-700"
              />
            ) : (
              <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full bg-cyan-500/20 flex items-center justify-center ring-2 ring-slate-700">
                <User size={32} className="text-cyan-300 sm:w-10 md:w-10" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{profile.username}</h1>
              {!isOwnProfile && currentUser && (
                <Button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={
                    following
                      ? 'bg-slate-700 hover:bg-red-500/20 hover:text-red-400 border border-slate-600 text-slate-300 text-sm'
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white text-sm'
                  }
                >
                  <Users size={16} className="mr-1.5" />
                  {followLoading ? '...' : following ? 'Following' : 'Follow'}
                </Button>
              )}
              {isOwnProfile && (
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                  Your profile
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm sm:text-base text-slate-300 mb-4 max-w-xl">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-4 sm:gap-6 mb-6 flex-wrap">
              {[
                { value: stats.total_reviews, label: 'Reviews' },
                { value: stats.total_watchlist, label: 'Watchlist' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-cyan-300">{value}</div>
                  <p className="text-slate-400 text-xs sm:text-sm">{label}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <Link href={isOwnProfile ? '/watchlist' : `#`}>
                <Button
                  variant="outline"
                  className="gap-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 text-sm"
                >
                  <Film size={16} />
                  Watchlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}