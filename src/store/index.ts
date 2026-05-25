import { create } from 'zustand'
import { User, WatchlistItem, Review } from '@/types'

interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}))

interface WatchlistStore {
  items: WatchlistItem[]
  isLoading: boolean
  addItem: (item: WatchlistItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, item: Partial<WatchlistItem>) => void
  setItems: (items: WatchlistItem[]) => void
  setLoading: (loading: boolean) => void
}

export const useWatchlistStore = create<WatchlistStore>((set) => ({
  items: [],
  isLoading: false,
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })),
  setItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),
}))

interface ReviewStore {
  reviews: Review[]
  isLoading: boolean
  addReview: (review: Review) => void
  removeReview: (id: string) => void
  updateReview: (id: string, review: Partial<Review>) => void
  setReviews: (reviews: Review[]) => void
  setLoading: (loading: boolean) => void
}

export const useReviewStore = create<ReviewStore>((set) => ({
  reviews: [],
  isLoading: false,
  addReview: (review) => set((state) => ({ reviews: [review, ...state.reviews] })),
  removeReview: (id) =>
    set((state) => ({ reviews: state.reviews.filter((review) => review.id !== id) })),
  updateReview: (id, updates) =>
    set((state) => ({
      reviews: state.reviews.map((review) =>
        review.id === id ? { ...review, ...updates } : review
      ),
    })),
  setReviews: (reviews) => set({ reviews }),
  setLoading: (isLoading) => set({ isLoading }),
}))
