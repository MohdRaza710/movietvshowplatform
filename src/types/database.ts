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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'watchlist_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'review_likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'review_likes_review_id_fkey'
            columns: ['review_id']
            isOneToOne: false
            referencedRelation: 'reviews'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey'
            columns: ['follower_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follows_following_id_fkey'
            columns: ['following_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_review_likes: {
        Args: { review_id: string }
        Returns: undefined
      }
      decrement_review_likes: {
        Args: { review_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
