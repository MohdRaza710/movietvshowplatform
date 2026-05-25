'use client'

import React from 'react'
import { useEffect } from 'react'
import { useAuthStore, useWatchlistStore } from '@/store'
import { getUserWatchlist } from '@/actions'
import { motion } from 'framer-motion'
import { getTMDBImageUrl } from '@/lib/tmdb'
import Image from 'next/image'
import Link from 'next/link'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type WatchlistStatus = 'plan_to_watch' | 'watching' | 'completed' | 'dropped'

const STATUS_LABELS: Record<WatchlistStatus, string> = {
  plan_to_watch: '📋 Plan to Watch',
  watching: '👀 Currently Watching',
  completed: '✅ Completed',
  dropped: '❌ Dropped',
}

export default function WatchlistPage() {
  const user = useAuthStore((state) => state.user)
  const { items, setItems } = useWatchlistStore()
  const [loading, setLoading] = React.useState(true)
  const [selectedStatus, setSelectedStatus] = React.useState<WatchlistStatus | 'all'>('all')

  useEffect(() => {
    if (!user) return

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

  const filteredItems = selectedStatus === 'all'
    ? items
    : items.filter((item) => item.status === selectedStatus)

  const groupedItems = Object.groupBy(filteredItems, (item) => item.status) as Record<WatchlistStatus, typeof items>

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400">
          Please <Link href="/login" className="text-cyan-300 hover:underline">sign in</Link> to view your watchlist
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">My Vault</h1>
        <p className="text-slate-400">Manage your movies and TV shows</p>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-8 flex-wrap"
      >
        <Button
          onClick={() => setSelectedStatus('all')}
          className={selectedStatus === 'all' ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-slate-800 hover:bg-slate-700'}
        >
          All ({items.length})
        </Button>
        {(Object.keys(STATUS_LABELS) as WatchlistStatus[]).map((status) => (
          <Button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={
              selectedStatus === status
                ? 'bg-cyan-500 hover:bg-cyan-600'
                : 'bg-slate-800 hover:bg-slate-700'
            }
          >
            {STATUS_LABELS[status]} ({items.filter((i) => i.status === status).length})
          </Button>
        ))}
      </motion.div>

      {/* Watchlist Items */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-slate-400"
        >
          <p>Your vault is empty. Start adding movies and shows!</p>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {(Object.keys(STATUS_LABELS) as WatchlistStatus[]).map((status) => {
            const statusItems = groupedItems[status] || []
            if (statusItems.length === 0) return null

            return (
              <motion.section
                key={status}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  {STATUS_LABELS[status]}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {statusItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      className="group relative"
                    >
                      <Link href={`/${item.media_type}/${item.media_id}`}>
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                          <Image
                            src={getTMDBImageUrl(item.poster_path, 'w342')}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {item.rating && (
                            <div className="absolute bottom-2 left-2 bg-yellow-500/90 px-2 py-1 rounded text-xs font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.rating}/10
                            </div>
                          )}
                        </div>
                      </Link>
                      <p className="mt-2 text-sm font-medium text-white truncate">
                        {item.title}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )
          })}
        </div>
      )}
    </div>
  )
}
