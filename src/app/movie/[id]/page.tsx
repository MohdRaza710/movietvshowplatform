import { getMovieDetails, getTMDBImageUrl } from '@/lib/tmdb'
import { getMediaReviews } from '@/actions'
import { MoviePageClient } from '@/components/MoviePageClient'

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
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/movie/${id}`

  return <MoviePageClient movie={movie} reviews={reviews} shareUrl={shareUrl} />
}