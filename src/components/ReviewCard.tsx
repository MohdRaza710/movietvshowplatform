'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Trash2, Edit2, User } from 'lucide-react'
import { Review } from '@/types'
import { Button } from '@/components/ui/button'
import { deleteReview, toggleReviewLike } from '@/actions'
import { toast } from 'sonner'
import { useAuthStore } from '@/store'
import { format } from 'date-fns'

interface ReviewCardProps {
  review: Review & { users?: { id: string; username: string; avatar_url: string | null } }
  onEdit?: (review: Review) => void
  onLikesChange?: () => void
}

export function ReviewCard({ review, onEdit, onLikesChange }: ReviewCardProps) {
  const user = useAuthStore((state) => state.user)
  const [isLiking, setIsLiking] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [liked, setLiked] = React.useState(review.liked_by_current_user)

  const isAuthor = user?.id === review.user_id

  const handleDelete = async () => {
    if (!confirm('Delete this review?')) return
    setIsDeleting(true)
    try {
      await deleteReview(review.id)
      toast.success('Review deleted')
    } catch (error) {
      toast.error('Failed to delete review')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Sign in to like reviews')
      return
    }
    setIsLiking(true)
    try {
      await toggleReviewLike(user.id, review.id)
      setLiked(!liked)
      onLikesChange?.()
    } catch (error) {
      toast.error('Failed to update like')
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {review.users?.avatar_url ? (
            <img
              src={review.users.avatar_url}
              alt={review.users.username}
              className="w-8 sm:w-10 h-8 sm:h-10 rounded-full shrink-0"
            />
          ) : (
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
              <User size={18} className="text-cyan-300 sm:w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm sm:text-base truncate">{review.users?.username || 'Anonymous'}</p>
            <p className="text-xs text-slate-400">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 sm:px-3 py-1 rounded-full">
            <span className="text-xs sm:text-sm font-bold text-yellow-400">{review.rating}/10</span>
          </div>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 mb-4">{review.content}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleLike}
          disabled={isLiking}
          className={`text-xs sm:text-sm ${liked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}
        >
          <Heart size={14} className={`${liked ? 'fill-current' : ''} sm:w-4`} />
          <span className="ml-1 text-xs">{review.likes_count}</span>
        </Button>

        {isAuthor && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit?.(review)}
              className="text-slate-400 hover:text-cyan-400 text-xs sm:text-sm"
            >
              <Edit2 size={14} className="sm:w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-slate-400 hover:text-red-400 text-xs sm:text-sm"
            >
              <Trash2 size={14} className="sm:w-4" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}
