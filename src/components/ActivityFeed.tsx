'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { getTMDBImageUrl } from '@/lib/tmdb'
import { User, Star } from 'lucide-react'

interface ActivityFeedItemProps {
  id: string
  user: {
    id: string
    username: string
    avatar_url: string | null
  }
  type: 'watched' | 'reviewed' | 'watchlisted'
  media: {
    id: number
    title: string
    poster: string
    type: 'movie' | 'tv'
  }
  rating?: number
  createdAt: string
}

export function ActivityFeedItem({
  id,
  user,
  type,
  media,
  rating,
  createdAt,
}: ActivityFeedItemProps) {
  const getActionText = () => {
    switch (type) {
      case 'watched':
        return 'watched'
      case 'reviewed':
        return `reviewed (${rating}/10)`
      case 'watchlisted':
        return 'added to watchlist'
      default:
        return 'interacted with'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition-colors"
    >
      <div className="flex gap-4">
        <div className="shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <User size={20} className="text-cyan-300" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/profile/${user.id}`}
              className="font-semibold text-cyan-300 hover:text-cyan-200"
            >
              {user.username}
            </Link>
            <span className="text-slate-400">{getActionText()}</span>
          </div>

          <Link
            href={`/${media.type}/${media.id}`}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-12 h-16 shrink-0 rounded overflow-hidden">
              <Image
                src={getTMDBImageUrl(media.poster, 'w185')}
                alt={media.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white group-hover:text-cyan-300 truncate">
                {media.title}
              </p>
              {rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-yellow-400">{rating}/10</span>
                </div>
              )}
            </div>
          </Link>

          <p className="text-xs text-slate-400 mt-2">
            {format(new Date(createdAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function ActivityFeed({
  items,
}: {
  items: ActivityFeedItemProps[]
}) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-slate-400">No activity yet. Follow someone to get started!</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ActivityFeedItem key={item.id} {...item} />
      ))}
    </div>
  )
}
