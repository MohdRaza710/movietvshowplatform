import { getTVShowDetails, getTMDBImageUrl } from '@/lib/tmdb'
import { getMediaReviews } from '@/actions'
import { TVPageClient } from '@/components/TVPageClient'

interface TVPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TVPageProps) {
  const { id } = await params
  const show = await getTVShowDetails(Number(id))
  return {
    title: `${show.name} - CineVault`,
    description: show.overview,
    openGraph: {
      images: [getTMDBImageUrl(show.poster_path, 'original')],
    },
  }
}

export default async function TVPage({ params }: TVPageProps) {
  const { id } = await params
  const show = await getTVShowDetails(Number(id))
  const reviews = await getMediaReviews('tv', Number(id))
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tv/${id}`

  return <TVPageClient show={show} reviews={reviews} shareUrl={shareUrl} />
}