export interface Movie {
  id: number
  title: string
  overview: string
  release_date: string
  poster_path: string
  backdrop_path: string
  vote_average: number
  popularity: number
  genres: Genre[]
  credits?: Credits
  recommendations?: { results: Movie[] }
  videos?: { results: Video[] }
}

export interface TVShow {
  id: number
  name: string
  overview: string
  first_air_date: string
  poster_path: string
  backdrop_path: string
  vote_average: number
  popularity: number
  genres: Genre[]
  number_of_seasons: number
  number_of_episodes: number
  credits?: Credits
  recommendations?: { results: TVShow[] }
  videos?: { results: Video[] }
}

export interface Genre {
  id: number
  name: string
}

export interface Credits {
  cast: Cast[]
  crew: Crew[]
}

export interface Cast {
  id: number
  name: string
  character: string
  profile_path: string
  order: number
}

export interface Crew {
  id: number
  name: string
  job: string
  profile_path: string
}

export interface Video {
  id: string
  name: string
  key: string
  type: string
  site: string
}

// Database Types
export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  media_type: 'movie' | 'tv'
  media_id: number
  title: string
  poster_path: string
  status: 'plan_to_watch' | 'watching' | 'completed' | 'dropped'
  rating?: number
  notes?: string
  watched_at?: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  media_type: 'movie' | 'tv'
  media_id: number
  title: string
  content: string
  rating: number // 1-10
  likes_count: number
  created_at: string
  updated_at: string
  user?: User
  liked_by_current_user?: boolean
}

export interface ActivityFeedItem {
  id: string
  user_id: string
  type: 'watched' | 'reviewed' | 'watchlisted'
  media_type: 'movie' | 'tv'
  media_id: number
  media_title: string
  media_poster: string
  review_id?: string
  rating?: number
  created_at: string
  user?: User
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface UserProfile extends User {
  total_reviews: number
  total_watchlist: number
  followers_count: number
  following_count: number
  is_following?: boolean
}
