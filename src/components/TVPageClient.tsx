'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Play, X, BookmarkPlus, BookmarkCheck, ChevronDown, Check } from 'lucide-react'
import { getTMDBImageUrl, getRating, getYear } from '@/lib/tmdb'
import { ReviewForm } from '@/components/ReviewForm'
import { ReviewCard } from '@/components/ReviewCard'
import { MediaCard } from '@/components/MediaCard'
import { SocialShare } from '@/components/SocialShare'
import { Button } from '@/components/ui/button'
import { TVShow } from '@/types'
import { useAuthStore, useWatchlistStore } from '@/store'
import { addToWatchlist, removeFromWatchlist, getUserWatchlist } from '@/actions'
import { toast } from 'sonner'

interface TVPageClientProps {
  show: TVShow
  reviews: any[]
  shareUrl: string
}

type WatchlistStatus = 'plan_to_watch' | 'watching' | 'completed' | 'dropped'

const STATUS_OPTIONS: { value: WatchlistStatus; label: string; icon: string }[] = [
  { value: 'plan_to_watch', label: 'Plan to Watch', icon: '📋' },
  { value: 'watching', label: 'Watching', icon: '👀' },
  { value: 'completed', label: 'Completed', icon: '✅' },
  { value: 'dropped', label: 'Dropped', icon: '❌' },
]

export function TVPageClient({ show, reviews, shareUrl }: TVPageClientProps) {
  const [trailerOpen, setTrailerOpen] = React.useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(false)
  const [watchlistLoading, setWatchlistLoading] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const user = useAuthStore((state) => state.user)
  const { items, addItem, removeItem, setItems } = useWatchlistStore()

  const watchlistEntry = items.find(
    (i) => i.media_type === 'tv' && i.media_id === show.id
  )
  const isInWatchlist = !!watchlistEntry

  // Load watchlist on mount if user is logged in and store is empty
  React.useEffect(() => {
    if (!user || items.length > 0) return
    getUserWatchlist(user.id)
      .then(setItems)
      .catch(console.error)
  }, [user])

  // Close menu on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAddWithStatus = async (status: WatchlistStatus) => {
    if (!user) {
      toast.error('Sign in to add to your watchlist')
      return
    }
    setStatusMenuOpen(false)
    setWatchlistLoading(true)
    try {
      // If already in watchlist, remove first then re-add with new status
      if (watchlistEntry) {
        await removeFromWatchlist(watchlistEntry.id)
        removeItem(watchlistEntry.id)
      }
      const data = await addToWatchlist(
        user.id,
        'tv',
        show.id,
        show.name,           // Fixed: Use name for TV shows
        show.poster_path,    // Fixed: Correct poster path
        status
      )
      addItem({ ...data, status })
      const label = STATUS_OPTIONS.find((s) => s.value === status)?.label
      toast.success(`Added to watchlist as "${label}"`)
    } catch (error: any) {
      if (error?.code === '23505') {
        toast.error('Already in your watchlist')
      } else {
        toast.error(error.message || 'Failed to update watchlist')
      }
    } finally {
      setWatchlistLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!watchlistEntry) return
    setWatchlistLoading(true)
    try {
      await removeFromWatchlist(watchlistEntry.id)
      removeItem(watchlistEntry.id)
      toast.success('Removed from watchlist')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove from watchlist')
    } finally {
      setWatchlistLoading(false)
    }
  }

  // Find the official trailer from TMDB video results
  const trailer = show.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  ) ?? show.videos?.results?.[0]

  const hasTrailer = !!trailer
  const currentStatusLabel = STATUS_OPTIONS.find(
    (s) => s.value === watchlistEntry?.status
  )

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
      <div className="relative h-80 sm:h-100 md:h-120 overflow-hidden">
        <Image
          src={getTMDBImageUrl(show.backdrop_path, 'original')}
          alt={show.name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-8 sm:mt-16 md:mt-32 relative z-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12">
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-4 sm:space-y-6"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">{show.name}</h1>
              <p className="text-slate-400 text-sm sm:text-base">{getYear(show.first_air_date)}</p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="flex items-center gap-2 bg-yellow-500/20 px-3 sm:px-4 py-2 rounded-lg">
                <span className="text-xl sm:text-2xl font-bold text-yellow-400">{getRating(show.vote_average)}</span>
                <span className="text-slate-300 text-sm sm:text-base">/10</span>
              </div>
              <div className="px-3 sm:px-4 py-2 bg-slate-800 rounded-lg text-slate-300 text-xs sm:text-sm">
                {show.number_of_seasons} season{show.number_of_seasons !== 1 ? 's' : ''}
              </div>
              <div className="px-3 sm:px-4 py-2 bg-slate-800 rounded-lg text-slate-300 text-xs sm:text-sm">
                {show.number_of_episodes} episode{show.number_of_episodes !== 1 ? 's' : ''}
              </div>
            </div>

            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {show.genres.map((genre) => (
                  <span key={genre.id} className="px-2 sm:px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-300 text-xs sm:text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed line-clamp-4 sm:line-clamp-none">{show.overview}</p>

            <div className="flex gap-2 sm:gap-3 flex-wrap items-center">
              {hasTrailer && (
                <Button
                  className="bg-cyan-500 hover:bg-cyan-600 gap-2"
                  onClick={() => setTrailerOpen(true)}
                >
                  <Play size={18} />
                  Watch Trailer
                </Button>
              )}

              {/* Watchlist Button */}
              {user ? (
                isInWatchlist ? (
                  /* Already saved */
                  <div className="flex items-center gap-0" ref={menuRef}>
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/40 rounded-l-lg text-green-400 text-sm font-medium select-none">
                      <BookmarkCheck size={16} />
                      <span>
                        {currentStatusLabel?.icon} {currentStatusLabel?.label ?? 'In Watchlist'}
                      </span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setStatusMenuOpen((v) => !v)}
                        disabled={watchlistLoading}
                        className="flex items-center px-2 py-2 bg-green-500/20 border border-green-500/40 border-l-0 rounded-r-lg text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                        aria-label="Change status"
                      >
                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-200 ${statusMenuOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      <AnimatePresence>
                        {statusMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.96 }}
                            transition={{ duration: 0.13 }}
                            className="absolute right-0 top-full mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden"
                          >
                            <p className="px-3 pt-2.5 pb-1 text-xs text-slate-500 font-medium uppercase tracking-wider">
                              Move to...
                            </p>
                            <div className="p-1">
                              {STATUS_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  onClick={() => handleAddWithStatus(opt.value)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-700 transition-colors text-left"
                                >
                                  <span>{opt.icon}</span>
                                  <span className="flex-1">{opt.label}</span>
                                  {watchlistEntry?.status === opt.value && (
                                    <Check size={13} className="text-green-400 shrink-0" />
                                  )}
                                </button>
                              ))}
                              <div className="h-px bg-slate-700 my-1 mx-2" />
                              <button
                                onClick={handleRemove}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                              >
                                <X size={14} />
                                Remove from Watchlist
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  /* Not saved */
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setStatusMenuOpen((v) => !v)}
                      disabled={watchlistLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500/60 rounded-lg text-slate-200 text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {watchlistLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <BookmarkPlus size={16} />
                      )}
                      Add to Watchlist
                      <ChevronDown
                        size={14}
                        className={`ml-0.5 transition-transform duration-200 ${statusMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {statusMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.96 }}
                          transition={{ duration: 0.13 }}
                          className="absolute left-0 top-full mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden"
                        >
                          <p className="px-3 pt-2.5 pb-1 text-xs text-slate-500 font-medium uppercase tracking-wider">
                            Add as...
                          </p>
                          <div className="p-1">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => handleAddWithStatus(opt.value)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-700 transition-colors text-left"
                              >
                                <span>{opt.icon}</span>
                                <span>{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              ) : (
                <a href="/login">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                    <BookmarkPlus size={16} />
                    Add to Watchlist
                  </button>
                </a>
              )}

              <SocialShare title={show.name} url={shareUrl} />

              <Button disabled className="bg-slate-700 gap-2">
                <Play size={18} />
                Watch show
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Cast, Reviews, Recommendations sections remain the same */}
        {/* ... (keeping the rest of your original code unchanged) */}
        {show.credits?.cast && show.credits.cast.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
              {show.credits.cast.slice(0, 12).map((actor) => (
                <div key={actor.id} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-slate-800">
                    {actor.profile_path ? (
                      <Image
                        src={getTMDBImageUrl(actor.profile_path, 'w185')}
                        alt={actor.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-slate-600 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-white text-xs sm:text-sm line-clamp-1">{actor.name}</p>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Reviews & Ratings</h2>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Recommendations</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
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