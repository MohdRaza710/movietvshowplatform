import { Movie, TVShow } from '@/types'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

interface TMDBResponse<T> {
  results: T[]
  total_pages: number
  total_results: number
  page: number
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
  url.searchParams.append('api_key', API_KEY || '')

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  })

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!response.ok) throw new Error(`TMDB API error: ${response.statusText}`)
  return response.json() as Promise<T>
}

// Movies
export async function getTrendingMovies(page = 1) {
  return fetchTMDB<TMDBResponse<Movie>>('/trending/movie/week', {
    page,
  })
}

export async function getPopularMovies(page = 1) {
  return fetchTMDB<TMDBResponse<Movie>>('/movie/popular', { page })
}

export async function getTopRatedMovies(page = 1) {
  return fetchTMDB<TMDBResponse<Movie>>('/movie/top_rated', { page })
}

export async function getNowPlayingMovies(page = 1) {
  return fetchTMDB<TMDBResponse<Movie>>('/movie/now_playing', { page })
}

export async function getAllMovies(page = 1) {
  return fetchTMDB<TMDBResponse<Movie>>('/discover/movie', { page })
}

export async function getMovieDetails(id: number) {
  return fetchTMDB<Movie>(`/movie/${id}`, {
    append_to_response: 'credits,recommendations,videos',
  })
}

export async function getMovieRecommendations(id: number) {
  return fetchTMDB<TMDBResponse<Movie>>(`/movie/${id}/recommendations`)
}

export async function searchMovies(query: string, page = 1) {
  return fetchTMDB<TMDBResponse<Movie>>('/search/movie', {
    query,
    page,
  })
}

// TV Shows
export async function getTrendingTV(page = 1) {
  return fetchTMDB<TMDBResponse<TVShow>>('/trending/tv/week', { page })
}

export async function getPopularTV(page = 1) {
  return fetchTMDB<TMDBResponse<TVShow>>('/tv/popular', { page })
}

export async function getTopRatedTV(page = 1) {
  return fetchTMDB<TMDBResponse<TVShow>>('/tv/top_rated', { page })
}

export async function getAllTvShows(page = 1) {
  return fetchTMDB<TMDBResponse<TVShow>>('/discover/tv', { page })
}

export async function getTVShowDetails(id: number) {
  return fetchTMDB<TVShow>(`/tv/${id}`, {
    append_to_response: 'credits,recommendations,videos',
  })
}

export async function getTVRecommendations(id: number) {
  return fetchTMDB<TMDBResponse<TVShow>>(`/tv/${id}/recommendations`)
}

export async function searchTV(query: string, page = 1) {
  return fetchTMDB<TMDBResponse<TVShow>>('/search/tv', {
    query,
    page,
  })
}

export async function searchMulti(query: string, page = 1) {
  return fetchTMDB<TMDBResponse<Movie | TVShow>>('/search/multi', {
    query,
    page,
  })
}

// Utilities
export function getTMDBImageUrl(path: string | null, size = 'w500') {
  if (!path) return '/placeholder.jpg'
  return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}${size}${path}`
}

export function getRating(rating: number) {
  return rating ? rating.toFixed(1) : 'N/A'
}

export function getYear(dateString: string) {
  return dateString ? new Date(dateString).getFullYear() : 'N/A'
}
