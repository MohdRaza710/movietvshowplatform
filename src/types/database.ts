export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          media_type: 'movie' | 'tv'
          media_id: number
          title: string
          poster_path: string
          status: 'plan_to_watch' | 'watching' | 'completed' | 'dropped'
          rating: number | null
          notes: string | null
          watched_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          media_type: 'movie' | 'tv'
          media_id: number
          title: string
          poster_path: string
          status: 'plan_to_watch' | 'watching' | 'completed' | 'dropped'
          rating?: number | null
          notes?: string | null
          watched_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          media_type?: 'movie' | 'tv'
          media_id?: number
          title?: string
          poster_path?: string
          status?: 'plan_to_watch' | 'watching' | 'completed' | 'dropped'
          rating?: number | null
          notes?: string | null
          watched_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          media_type: 'movie' | 'tv'
          media_id: number
          title: string
          content: string
          rating: number
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          media_type: 'movie' | 'tv'
          media_id: number
          title: string
          content: string
          rating: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          media_type?: 'movie' | 'tv'
          media_id?: number
          title?: string
          content?: string
          rating?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      review_likes: {
        Row: {
          id: string
          user_id: string
          review_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          review_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          review_id?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
