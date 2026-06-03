import { getTrendingMovies, getTrendingTV, getPopularMovies, getTopRatedMovies } from '@/lib/tmdb'
import { MediaCarousel } from '@/components/MediaCarousel'
import { HeroSection } from '@/components/HeroSection'
import Footer from '@/components/Footer'

export default async function HomePage() {
  try {
    const [trendingMovies, trendingTV, popularMovies, topRatedMovies] = await Promise.all([
      getTrendingMovies(),
      getTrendingTV(),
      getPopularMovies(),
      getTopRatedMovies(),
    ])

    return (
      <div className="min-h-full">
        {/* Hero Section */}
        {trendingMovies.results.length > 0 && (
          <HeroSection movie={trendingMovies.results[0]} />
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
          <MediaCarousel
            title="🔥 Trending Movies"
            items={trendingMovies.results}
            type="movie"
          />

          <MediaCarousel
            title="🌟 Trending TV Shows"
            items={trendingTV.results}
            type="tv"
          />

          <MediaCarousel
            title="⭐ Popular Movies"
            items={popularMovies.results}
            type="movie"
          />

          <MediaCarousel
            title="🏆 Top Rated"
            items={topRatedMovies.results}
            type="movie"
          />
        </div>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Failed to fetch movies:', error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400">Failed to load content. Please try again later.</p>
      </div>
    )
  }
}
