'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Play, X } from 'lucide-react'
import { getTMDBImageUrl, getRating, getYear } from '@/lib/tmdb'
import { ReviewForm } from '@/components/ReviewForm'
import { ReviewCard } from '@/components/ReviewCard'
import { MediaCard } from '@/components/MediaCard'
import { SocialShare } from '@/components/SocialShare'
import { Button } from '@/components/ui/button'
import { TVShow } from '@/types'

interface TVPageClientProps {
  show: TVShow
  reviews: any[]
  shareUrl: string
}

export function TVPageClient({ show, reviews, shareUrl }: TVPageClientProps) {
  const [trailerOpen, setTrailerOpen] = React.useState(false)

  // Find the official trailer from TMDB video results
  const trailer = show.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  ) ?? show.videos?.results?.[0]

  const hasTrailer = !!trailer

  return (
    <div className="min-h-full">
      {/* Trailer Modal */}
      <AnimatePresence>
        {trailerOpen && trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setTrailerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setTrailerOpen(false)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
                aria-label="Close trailer"
              >
                <X size={18} />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                title={trailer.name ?? `${show.name} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Backdrop */}
      <div className="relative h-100 overflow-hidden">
        <Image
          src={getTMDBImageUrl(show.backdrop_path, 'original')}
          alt={show.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-32 relative z-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-1"
          >
            <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={getTMDBImageUrl(show.poster_path, 'w342')}
                alt={show.name}
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{show.name}</h1>
              <p className="text-slate-400">{getYear(show.first_air_date)}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold text-yellow-400">{getRating(show.vote_average)}</span>
                <span className="text-slate-300">/10</span>
              </div>
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300">
                {show.number_of_seasons} season{show.number_of_seasons !== 1 ? 's' : ''}
              </div>
              <div className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300">
                {show.number_of_episodes} episode{show.number_of_episodes !== 1 ? 's' : ''}
              </div>
            </div>

            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {show.genres.map((genre) => (
                  <span key={genre.id} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-300 text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-lg text-slate-200 leading-relaxed">{show.overview}</p>

            <div className="flex gap-4 flex-wrap">
              {hasTrailer && (
                <Button
                  className="bg-cyan-500 hover:bg-cyan-600 gap-2"
                  onClick={() => setTrailerOpen(true)}
                >
                  <Play size={18} />
                  Watch Trailer
                </Button>
              )}
              <SocialShare title={show.name} url={shareUrl} />
              
              <Button disabled className="bg-slate-700 gap-2">
                
                <Play size={18} />
                Watch Movie
              </Button>
            </div>

          </motion.div>
        </div>

        {/* Cast */}
        {show.credits?.cast && show.credits.cast.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {show.credits.cast.slice(0, 12).map((actor) => (
                <div key={actor.id} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                    {actor.profile_path ? (
                      <Image
                        src={getTMDBImageUrl(actor.profile_path, 'w185')}
                        alt={actor.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-slate-600 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-white text-sm line-clamp-1">{actor.name}</p>
                  <p className="text-slate-400 text-xs line-clamp-1">{actor.character}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Reviews */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="reviews"
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Reviews & Ratings</h2>
          <div className="mb-8">
            <ReviewForm mediaType="tv" mediaId={show.id} title={show.name} />
          </div>

          {reviews.length > 0 && (
            <div className="mb-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400">
                    {(reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                  </div>
                  <p className="text-slate-400 text-sm">Average Rating</p>
                </div>
                <div className="text-slate-300">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review: any) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <p className="text-slate-400 text-center py-8">No reviews yet. Be the first to review this show!</p>
            )}
          </div>
        </motion.section>

        {/* Recommendations */}
        {show.recommendations?.results && show.recommendations.results.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Recommendations</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {show.recommendations.results.slice(0, 12).map((rec: any) => (
                <MediaCard key={rec.id} media={rec} type="tv" />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}