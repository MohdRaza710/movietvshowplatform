'use client'

import React, { useEffect, useState } from 'react'
import { getAllTvShows } from '@/lib/tmdb'
import { MediaCard } from '@/components/MediaCard'
import { TVShow } from '@/types'
import { Loader2 } from 'lucide-react'

export default function TVShowsPage() {
  const [tvShows, setTvShows] = useState<TVShow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchTvShows = async () => {
      try {
        const data = await getAllTvShows(page)
        if (page === 1) {
          setTvShows(data.results)
        } else {
          setTvShows(prev => [...prev, ...data.results])
        }
        setHasMore(page < data.total_pages)
      } catch (error) {
        console.error('Failed to fetch TV shows:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTvShows()
  }, [page])

  return (
    <div className="min-h-screen pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-1">TV Shows</h1>
          <p className="text-slate-500 text-sm">{tvShows.length} titles</p>
        </div>

        {loading && page === 1 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="aspect-[2/3] bg-white/[0.04] rounded-xl animate-pulse" />
                <div className="mt-2 h-3 bg-white/[0.04] rounded-full w-4/5 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-10">
              {tvShows.map(show => (
                <MediaCard key={show.id} media={show} type="tv" />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mb-14">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  className="flex items-center gap-2.5 px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-900/30"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
