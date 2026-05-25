import React from 'react'
import { getActivityFeed } from '@/actions'
import { ActivityFeed } from '@/components/ActivityFeed'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export default async function FeedPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400">Please sign in to view your feed</p>
      </div>
    )
  }

  const activities = await getActivityFeed(user.id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Your Feed</h1>
        <p className="text-slate-400">See what your friends are watching</p>
      </motion.div>

      <ActivityFeed
        items={activities.map((activity: any) => ({
          id: activity.id,
          user: activity.users,
          type: 'reviewed',
          media: {
            id: activity.media_id,
            title: activity.title,
            poster: activity.poster_path || '',
            type: activity.media_type,
          },
          rating: activity.rating,
          createdAt: activity.created_at,
        }))}
      />
    </div>
  )
}
