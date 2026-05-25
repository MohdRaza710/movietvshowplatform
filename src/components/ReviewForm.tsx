'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useAuthStore } from '@/store'
import { createReview, updateReview, deleteReview } from '@/actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ReviewFormProps {
  mediaType: 'movie' | 'tv'
  mediaId: number
  title: string
  existingReview?: {
    id: string
    content: string
    rating: number
  }
  onSuccess?: () => void
}

export function ReviewForm({
  mediaType,
  mediaId,
  title,
  existingReview,
  onSuccess,
}: ReviewFormProps) {
  const [content, setContent] = React.useState(existingReview?.content || '')
  const [rating, setRating] = React.useState(existingReview?.rating || 8)
  const [isLoading, setIsLoading] = React.useState(false)
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg border border-cyan-500/20"
      >
        <p className="text-slate-300">Sign in to write a review</p>
      </motion.div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (existingReview) {
        await updateReview(existingReview.id, content, rating)
        toast.success('Review updated!')
      } else {
        await createReview(user.id, mediaType, mediaId, title, content, rating)
        toast.success('Review published!')
        setContent('')
        setRating(8)
      }
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to save review')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg border border-cyan-500/20"
    >
      <div>
        <label className="block text-sm font-medium text-cyan-300 mb-2">
          Your Rating
        </label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  className={
                    i < rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-600'
                  }
                />
              </button>
            ))}
          </div>
          <span className="text-xl font-bold text-yellow-400">{rating}/10</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-300 mb-2">
          Your Review
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          rows={4}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !content.trim()}
        className="w-full bg-cyan-500 hover:bg-cyan-600"
      >
        {isLoading
          ? 'Publishing...'
          : existingReview
            ? 'Update Review'
            : 'Publish Review'}
      </Button>
    </motion.form>
  )
}
