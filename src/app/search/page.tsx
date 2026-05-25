'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { searchMulti } from '@/lib/tmdb'
import { MediaCard } from '@/components/MediaCard'
import { motion } from 'framer-motion'

export default function SearchPage() {
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Search Results {query && `for "${query}"`}
        </h1>
        <p className="text-slate-400">
          {loading ? 'Searching...' : `Found ${results.length} result${results.length !== 1 ? 's' : ''}`}
        </p>
      </motion.div>

      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-slate-400"
        >
          <p>Enter a search term to get started</p>
        </motion.div>
      )}

      {loading && (
        <div className="text-center py-12 text-slate-400">
          <p>Loading results...</p>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-slate-400"
        >
          <p>No results found for "{query}"</p>
        </motion.div>
      )}

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {results.map((item) => (
            <MediaCard
              key={`${item.media_type}-${item.id}`}
              media={item}
              type={item.media_type}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
