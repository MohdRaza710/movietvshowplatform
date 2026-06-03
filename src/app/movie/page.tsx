'use client'

import React, { useEffect, useState } from 'react'
import { getAllMovies } from '@/lib/tmdb'
import { MediaCard } from '@/components/MediaCard'
import { Movie } from '@/types'
import { Loader2 } from 'lucide-react'

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getAllMovies(page)
        if (page === 1) {
          setMovies(data.results)
        } else {
          setMovies(prev => [...prev, ...data.results])
        }
        setHasMore(page < data.total_pages)
      } catch (error) {
        console.error('Failed to fetch movies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [page])

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 pt-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
          All Movies
        </h1>

        {loading && page === 1 ? (
          <div className="flex items-center justify-center min-h-100">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {movies.map(movie => (
                <MediaCard key={movie.id} media={movie} type="movie" />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mb-12">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
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
