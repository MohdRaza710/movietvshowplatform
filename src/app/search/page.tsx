'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchMulti } from '@/lib/tmdb'
import { MediaCard } from '@/components/MediaCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Film, Tv, Loader2 } from 'lucide-react'

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="aspect-[2/3] bg-white/[0.04] rounded-xl animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03]" />
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-3 bg-white/[0.05] rounded-full w-4/5 animate-pulse" />
        <div className="h-2.5 bg-white/[0.03] rounded-full w-2/5 animate-pulse" />
      </div>
    </div>
  )
}

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(!!query)

  React.useEffect(() => {
    if (!query) {
      setResults([])
      setLoading(false)
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        const data = await searchMulti(query)
        setResults(
          data.results.filter(
            (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
          )
        )
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [query])

  const movies = results.filter((r) => r.media_type === 'movie')
  const shows = results.filter((r) => r.media_type === 'tv')

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Search size={18} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {query ? `"${query}"` : 'Search'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {loading
                ? 'Searching...'
                : query
                ? `${results.length} result${results.length !== 1 ? 's' : ''} found`
                : 'Enter a search term above'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Empty — no query */}
      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-5">
            <Search size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Start searching</h3>
          <p className="text-slate-500 text-sm">Type a movie or TV show name in the search bar above</p>
        </motion.div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* No results */}
      {!loading && results.length === 0 && query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-5">
            <Search size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
          <p className="text-slate-500 text-sm">Try a different search term or check your spelling</p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {!loading && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Movies section */}
            {movies.length > 0 && (
              <section>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/15 flex items-center justify-center">
                    <Film size={15} className="text-violet-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Movies</h2>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/15 text-violet-400">
                    {movies.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {movies.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <MediaCard media={item} type="movie" />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* TV section */}
            {shows.length > 0 && (
              <section>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                    <Tv size={15} className="text-blue-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white">TV Shows</h2>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/15 text-blue-400">
                    {shows.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {shows.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <MediaCard media={item} type="tv" />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function SearchFallback() {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-white mb-2">Search</h1>
      <p className="text-slate-500">Loading...</p>
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <Suspense fallback={<SearchFallback />}>
        <SearchResults />
      </Suspense>
    </div>
  )
}
