'use client'

import React from 'react'
import { useEffect } from 'react'
import { useAuthStore, useWatchlistStore } from '@/store'
import { getUserWatchlist } from '@/actions'
import { motion, AnimatePresence } from 'framer-motion'
import { getTMDBImageUrl } from '@/lib/tmdb'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Bookmark, Film, Tv, Clock, Eye, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type WatchlistStatus = 'plan_to_watch' | 'watching' | 'completed' | 'dropped'

const STATUS_CONFIG: Record<WatchlistStatus, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  plan_to_watch: {
    label: 'Plan to Watch',
    icon: <Clock size={14} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  watching: {
    label: 'Watching',
    icon: <Eye size={14} />,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle2 size={14} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  dropped: {
    label: 'Dropped',
    icon: <XCircle size={14} />,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="aspect-[2/3] bg-white/[0.04] animate-pulse rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03]" />
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-3 bg-white/[0.05] rounded-full w-4/5 animate-pulse" />
        <div className="h-2.5 bg-white/[0.03] rounded-full w-2/5 animate-pulse" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
        <Bookmark size={32} className="text-violet-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Your vault is empty</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        Start adding movies and TV shows to keep track of what you want to watch.
      </p>
      <div className="flex gap-3">
        <Link
          href="/movie"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          <Film size={15} />
          Browse Movies
        </Link>
        <Link
          href="/tv"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.10] border border-white/[0.08] text-white text-sm font-medium transition-colors"
        >
          <Tv size={15} />
          Browse TV Shows
        </Link>
      </div>
    </motion.div>
  )
}

export default function WatchlistPage() {
  const user = useAuthStore((state) => state.user)
  const { items, setItems } = useWatchlistStore()
  const [loading, setLoading] = React.useState(true)
  const [selectedStatus, setSelectedStatus] = React.useState<WatchlistStatus | 'all'>('all')

  useEffect(() => {
    if (!user) { setLoading(false); return }

    const loadWatchlist = async () => {
      try {
        const data = await getUserWatchlist(user.id)
        setItems(data)
      } catch (error) {
        toast.error('Failed to load watchlist')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadWatchlist()
  }, [user, setItems])

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
          <Bookmark size={32} className="text-violet-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to access your vault</h2>
        <p className="text-slate-500 text-sm mb-6">Track movies and shows you want to watch, are watching, or have completed.</p>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-900/40"
        >
          Sign In
        </Link>
      </div>
    )
  }

  const filteredItems = selectedStatus === 'all'
    ? items
    : items.filter((item) => item.status === selectedStatus)

  const groupedItems = Object.groupBy(filteredItems, (item) => item.status) as Record<WatchlistStatus, typeof items>

  const allStatuses = Object.keys(STATUS_CONFIG) as WatchlistStatus[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">My Vault</h1>
        <p className="text-slate-500">
          {items.length} {items.length === 1 ? 'title' : 'titles'} saved
        </p>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-10 flex-wrap"
      >
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            selectedStatus === 'all'
              ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30'
              : 'bg-white/[0.04] border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/[0.07]'
          }`}
        >
          All ({items.length})
        </button>
        {allStatuses.map((status) => {
          const cfg = STATUS_CONFIG[status]
          const count = items.filter((i) => i.status === status).length
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selectedStatus === status
                  ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                  : 'bg-white/[0.04] border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/[0.07]'
              }`}
            >
              {cfg.icon}
              {cfg.label}
              <span className="opacity-60">({count})</span>
            </button>
          )
        })}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-slate-500"
        >
          <p>No items in this category yet.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStatus}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-14"
          >
            {allStatuses.map((status) => {
              const statusItems = groupedItems[status] || []
              if (statusItems.length === 0) return null
              const cfg = STATUS_CONFIG[status]

              return (
                <section key={status}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`flex items-center gap-2 ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <h2 className="text-xl font-bold text-white">{cfg.label}</h2>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.border} ${cfg.color} border`}>
                      {statusItems.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {statusItems.map((item, idx) => {
                      const displayTitle = item.title || 'Untitled'

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.04 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="group relative glow-card hover:glow-card-hover transition-shadow duration-300 rounded-xl"
                        >
                          <Link href={`/${item.media_type}/${item.media_id}`}>
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800/60">
                              {item.poster_path ? (
                                <Image
                                  src={getTMDBImageUrl(item.poster_path, 'w342')}
                                  alt={displayTitle}
                                  fill
                                  sizes="(max-width: 768px) 45vw, (max-width: 1024px) 25vw, 16vw"
                                  className="object-cover group-hover:scale-[1.06] transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                  <span className="text-slate-600 text-xs">No poster</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                              {/* Status badge */}
                              <div className={`absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.border} ${cfg.color} border backdrop-blur-sm`}>
                                {cfg.icon}
                              </div>

                              {item.rating && (
                                <div className="absolute bottom-2 left-2 text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/25 text-amber-300 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                  {item.rating}/10
                                </div>
                              )}
                            </div>
                          </Link>
                          <div className="pt-2.5 px-0.5">
                            <p className="text-sm font-semibold text-white line-clamp-1 group-hover:text-violet-200 transition-colors">{displayTitle}</p>
                            <p className="text-xs text-slate-500 mt-0.5 capitalize">{item.media_type}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
