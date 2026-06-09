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
        {/* Cinematic Hero */}
        {trendingMovies.results.length > 0 && (
          <HeroSection movie={trendingMovies.results[0]} />
        )}

        {/* Content sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-14">
          <MediaCarousel
            title="Trending Movies"
            items={trendingMovies.results}
            type="movie"
            viewAllHref="/movie"
          />

          <MediaCarousel
            title="Trending TV Shows"
            items={trendingTV.results}
            type="tv"
            viewAllHref="/tv"
          />

          <MediaCarousel
            title="Popular Movies"
            items={popularMovies.results}
            type="movie"
            viewAllHref="/movie"
          />

          <MediaCarousel
            title="Top Rated"
            items={topRatedMovies.results}
            type="movie"
            viewAllHref="/movie"
          />
        </div>

        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Failed to fetch movies:', error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-slate-400 text-lg">Failed to load content. Please try again later.</p>
      </div>
    )
  }
}
