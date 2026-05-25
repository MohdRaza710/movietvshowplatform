import { getMovieDetails, getTMDBImageUrl, getRating, getYear } from '@/lib/tmdb'
import { getMediaReviews } from '@/actions'
import { ReviewForm } from '@/components/ReviewForm'
import { ReviewCard } from '@/components/ReviewCard'
import { MediaCard } from '@/components/MediaCard'
import { SocialShare } from '@/components/SocialShare'
import { Movie } from '@/types'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface MoviePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params
  const movie = await getMovieDetails(Number(id))

  return {
    title: `${movie.title} - CineVault`,
    description: movie.overview,
    openGraph: {
      images: [getTMDBImageUrl(movie.poster_path, 'original')],
    },
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params
  const movie = await getMovieDetails(Number(id))
  const reviews = await getMediaReviews('movie', Number(id))

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/movie/${id}`

  return (
    <div className="min-h-full">
      {/* Hero Backdrop */}
      <div className="relative h-100 overflow-hidden">
        <Image
          src={getTMDBImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-1"
          >
            <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={getTMDBImageUrl(movie.poster_path, 'w342')}
                alt={movie.title}
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
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {movie.title}
              </h1>
              <p className="text-slate-400">{getYear(movie.release_date)}</p>
            </div>

            {/* Rating & Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold text-yellow-400">
                  {getRating(movie.vote_average)}
                </span>
                <span className="text-slate-300">/10</span>
              </div>

              <div className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300">
                {movie.popularity.toFixed(0)} popularity
              </div>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-300 text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-lg text-slate-200 leading-relaxed">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              {movie.videos?.results?.length > 0 && (
                <Button className="bg-cyan-500 hover:bg-cyan-600 gap-2">
                  <Play size={18} />
                  Watch Trailer
                </Button>
              )}
              <SocialShare title={movie.title} url={shareUrl} />
            </div>
          </motion.div>
        </div>

        {/* Cast */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.credits.cast.slice(0, 12).map((actor) => (
                <div
                  key={actor.id}
                  className="group cursor-pointer"
                >
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
                        <span className="text-slate-600">No image</span>
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

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="reviews"
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Reviews & Ratings</h2>

          {/* Review Form */}
          <div className="mb-8">
            <ReviewForm
              mediaType="movie"
              mediaId={movie.id}
              title={movie.title}
            />
          </div>

          {/* Review Stats */}
          {reviews.length > 0 && (
            <div className="mb-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                  </div>
                  <p className="text-slate-400 text-sm">Average Rating</p>
                </div>
                <div className="text-slate-300">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <p className="text-slate-400 text-center py-8">
                No reviews yet. Be the first to review this movie!
              </p>
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
            <h2 className="text-3xl font-bold text-white mb-6">Recommendations</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.recommendations.results.slice(0, 12).map((rec) => (
                <MediaCard
                  key={rec.id}
                  media={rec}
                  type="movie"
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
