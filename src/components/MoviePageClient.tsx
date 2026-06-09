'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Play, X, BookmarkPlus, BookmarkCheck, ChevronDown, Check, Star, Calendar, TrendingUp } from 'lucide-react'
import { getTMDBImageUrl, getRating, getYear } from '@/lib/tmdb'
import { ReviewForm } from '@/components/ReviewForm'
import { ReviewCard } from '@/components/ReviewCard'
import { MediaCard } from '@/components/MediaCard'
import { SocialShare } from '@/components/SocialShare'
import { Button } from '@/components/ui/button'
import { Movie } from '@/types'
import { useAuthStore, useWatchlistStore } from '@/store'
import { addToWatchlist, removeFromWatchlist, getUserWatchlist } from '@/actions'
import { toast } from 'sonner'

interface MoviePageClientProps {
  movie: Movie
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

export function MoviePageClient({ movie, reviews, shareUrl }: MoviePageClientProps) {
  const [trailerOpen, setTrailerOpen] = React.useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(false)
  const [watchlistLoading, setWatchlistLoading] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const user = useAuthStore((state) => state.user)
  const { items, addItem, removeItem, setItems } = useWatchlistStore()

  const watchlistEntry = items.find(
    (i) => i.media_type === 'movie' && i.media_id === movie.id
  )
  const isInWatchlist = !!watchlistEntry

  React.useEffect(() => {
    if (!user || items.length > 0) return
    getUserWatchlist(user.id).then(setItems).catch(console.error)
  }, [user])

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
    if (!user) { toast.error('Sign in to add to your watchlist'); return }
    setStatusMenuOpen(false)
    setWatchlistLoading(true)
    try {
      if (watchlistEntry) {
        await removeFromWatchlist(watchlistEntry.id)
        removeItem(watchlistEntry.id)
      }
      const data = await addToWatchlist(user.id, 'movie', movie.id, movie.title, movie.poster_path)
      addItem({ ...data, status })
      const label = STATUS_OPTIONS.find((s) => s.value === status)?.label
      toast.success(`Added as "${label}"`)
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
      toast.error(error.message || 'Failed to remove')
    } finally {
      setWatchlistLoading(false)
    }
  }

  const trailer = movie.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube')
    ?? movie.videos?.results?.[0]
  const hasTrailer = !!trailer
  const currentStatusLabel = STATUS_OPTIONS.find((s) => s.value === watchlistEntry?.status)
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="min-h-full">
      {/* ── Trailer Modal ── */}
      <AnimatePresence>
        {trailerOpen && trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setTrailerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.90, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.90, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setTrailerOpen(false)}
                className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/10 transition-colors"
              >
                <X size={18} />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                title={trailer.name ?? `${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <div className="relative min-h-[80vh]">
        <Image
          src={getTMDBImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          fill
          priority
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#0B0F19] via-[#0B0F19]/80 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0B0F19] via-[#0B0F19]/50 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-[#0B0F19]/40 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[80vh] flex items-center py-20">
          <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr] gap-10 items-center w-full">

            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden md:block"
            >
              <div className="relative aspect-2/3 rounded-2xl overflow-hidden shadow-2xl glow-card ring-1 ring-white/10">
                <Image
                  src={getTMDBImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              {/* Genres */}
              {movie.genres && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres.slice(0, 3).map((genre) => (
                    <span key={genre.id} className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.07] border border-white/10 text-slate-300">
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-5 leading-tight tracking-tight">
                {movie.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-amber-300 font-bold text-sm">{getRating(movie.vote_average)}/10</span>
                </div>

                {movie.release_date && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm bg-white/5 border border-white/[0.07] px-3 py-1.5 rounded-xl">
                    <Calendar size={14} />
                    {getYear(movie.release_date)}
                  </div>
                )}

                {movie.popularity && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm bg-white/5 border border-white/[0.07] px-3 py-1.5 rounded-xl">
                    <TrendingUp size={14} />
                    {movie.popularity.toFixed(0)} popularity
                  </div>
                )}
              </div>

              {/* Overview */}
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
                {movie.overview}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                {hasTrailer && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTrailerOpen(true)}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-lg shadow-violet-900/40 transition-colors"
                  >
                    <Play size={16} className="fill-white" />
                    Watch Trailer
                  </motion.button>
                )}

                {/* Watchlist button */}
                {user ? (
                  isInWatchlist ? (
                    <div className="flex items-center gap-0" ref={menuRef}>
                      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-l-xl text-emerald-400 text-sm font-medium select-none">
                        <BookmarkCheck size={15} />
                        <span>{currentStatusLabel?.icon} {currentStatusLabel?.label ?? 'In Watchlist'}</span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setStatusMenuOpen((v) => !v)}
                          disabled={watchlistLoading}
                          className="flex items-center px-2 py-3 bg-emerald-500/10 border border-emerald-500/25 border-l-0 rounded-r-xl text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        >
                          <ChevronDown size={15} className={`transition-transform duration-200 ${statusMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {statusMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -6, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.96 }}
                              className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-2xl shadow-2xl z-20 overflow-hidden border border-white/8"
                            >
                              <p className="px-4 pt-3 pb-1 text-xs text-slate-500 font-semibold uppercase tracking-wider">Move to...</p>
                              <div className="p-1.5">
                                {STATUS_OPTIONS.map((opt) => (
                                  <button key={opt.value} onClick={() => handleAddWithStatus(opt.value)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-200 hover:bg-white/[0.07] transition-colors">
                                    <span>{opt.icon}</span>
                                    <span className="flex-1">{opt.label}</span>
                                    {watchlistEntry?.status === opt.value && <Check size={13} className="text-emerald-400" />}
                                  </button>
                                ))}
                                <div className="h-px bg-white/6 my-1.5 mx-2" />
                                <button onClick={handleRemove} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
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
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={() => setStatusMenuOpen((v) => !v)}
                        disabled={watchlistLoading}
                        className="flex items-center gap-2.5 px-5 py-3 bg-white/[0.07] hover:bg-white/10 border border-white/10 hover:border-violet-500/40 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {watchlistLoading ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <BookmarkPlus size={16} />
                        )}
                        Add to Watchlist
                        <ChevronDown size={14} className={`transition-transform ${statusMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {statusMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.96 }}
                            className="absolute left-0 top-full mt-2 w-52 glass-strong rounded-2xl shadow-2xl z-20 overflow-hidden border border-white/8"
                          >
                            <p className="px-4 pt-3 pb-1 text-xs text-slate-500 font-semibold uppercase tracking-wider">Add as...</p>
                            <div className="p-1.5">
                              {STATUS_OPTIONS.map((opt) => (
                                <button key={opt.value} onClick={() => handleAddWithStatus(opt.value)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-white/[0.07] transition-colors">
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
                    <Button variant="outline" className="flex items-center gap-2 border-white/12 text-slate-300 hover:text-white hover:border-violet-500/40 text-sm">
                      <BookmarkPlus size={16} />
                      Add to Watchlist
                    </Button>
                  </a>
                )}

                <SocialShare title={movie.title} url={shareUrl} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile poster */}
      <div className="md:hidden max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="relative w-40 mx-auto aspect-2/3 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <Image src={getTMDBImageUrl(movie.poster_path, 'w500')} alt={movie.title} fill className="object-cover" />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-16">

        {/* Cast */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-7 tracking-tight">Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
              {movie.credits.cast.slice(0, 12).map((actor) => (
                <div key={actor.id} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-slate-800/60 ring-1 ring-white/6 group-hover:ring-violet-500/30 transition-all">
                    {actor.profile_path ? (
                      <Image
                        src={getTMDBImageUrl(actor.profile_path, 'w185')}
                        alt={actor.name}
                        fill
                        className="object-cover group-hover:scale-[1.06] transition-transform duration-300"
                        sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 15vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-slate-600 text-2xl">👤</span>
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-white text-xs sm:text-sm line-clamp-1">{actor.name}</p>
                  <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">{actor.character}</p>
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
        >
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Reviews & Ratings</h2>
            {avgRating && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="text-amber-300 font-bold">{avgRating}</span>
                <span className="text-slate-500 text-sm">/ 10</span>
                <span className="text-slate-600 text-xs">({reviews.length})</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <ReviewForm mediaType="movie" mediaId={movie.id} title={movie.title} />
          </div>

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review: any) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div className="text-center py-12 text-slate-600 bg-white/2 rounded-2xl border border-white/5">
                <Star size={28} className="mx-auto mb-3 text-slate-700" />
                <p>No reviews yet. Be the first to review this movie!</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Recommendations */}
        {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-7 tracking-tight">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {movie.recommendations.results.slice(0, 12).map((rec: any) => (
                <MediaCard key={rec.id} media={rec} type="movie" />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
