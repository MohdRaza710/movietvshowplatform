'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, Star, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getTMDBImageUrl, getRating, getYear } from '@/lib/tmdb'
import { Movie, TVShow } from '@/types'

interface MediaCardProps {
  media: Movie | TVShow
  type: 'movie' | 'tv'
  isInWatchlist?: boolean
  onAddToWatchlist?: () => void
}

export function MediaCard({
  media,
  type,
  isInWatchlist,
  onAddToWatchlist,
}: MediaCardProps) {
  const title = type === 'movie' ? (media as Movie).title : (media as TVShow).name
  const releaseDate =
    type === 'movie' ? (media as Movie).release_date : (media as TVShow).first_air_date
  const rating = getRating(media.vote_average)
  const year = getYear(releaseDate)

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group relative rounded-xl overflow-hidden glow-card hover:glow-card-hover transition-shadow duration-300"
    >
      <Link href={`/${type}/${media.id}`} className="block">
        {/* Poster */}
        <div className="relative w-full aspect-2/3 bg-slate-800/80 rounded-xl overflow-hidden">
          <Image
            src={getTMDBImageUrl(media.poster_path, 'w342')}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 18vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          />

          {/* Bottom gradient — always present, intensifies on hover */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating badge — top left */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/8">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-amber-300">{rating}</span>
          </div>

          {/* Watchlist button — top right */}
          {onAddToWatchlist && (
            <motion.button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddToWatchlist()
              }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg border transition-all z-10 ${
                isInWatchlist
                  ? 'bg-violet-600 border-violet-500 shadow-lg shadow-violet-900/50'
                  : 'bg-black/70 border-white/12 backdrop-blur-sm hover:bg-violet-600/80 hover:border-violet-500/50'
              }`}
            >
              {isInWatchlist ? (
                <Check size={14} className="text-white" />
              ) : (
                <Plus size={14} className="text-white" />
              )}
            </motion.button>
          )}

          {/* Hover overlay content */}
          <div className="absolute inset-0 flex flex-col justify-end p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <h3 className="font-bold text-white text-sm line-clamp-2 mb-2 drop-shadow-lg">{title}</h3>
            <div className="flex items-center justify-between">
              {year && (
                <span className="text-xs text-slate-300 font-medium">{year}</span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-violet-300 font-semibold ml-auto bg-violet-500/15 px-2 py-0.5 rounded-lg border border-violet-500/20">
                <Eye size={11} />
                View
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
