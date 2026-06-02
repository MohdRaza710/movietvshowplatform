'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
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

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative rounded-lg overflow-hidden"
    >
      <Link href={`/${type}/${media.id}`}>
        <div className="relative w-full aspect-2/3 bg-slate-800 rounded-lg overflow-hidden">
          <Image
            src={getTMDBImageUrl(media.poster_path, 'w342')}
            alt={title}
            fill
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Info on hover */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="font-bold text-white line-clamp-2 mb-2">{title}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-yellow-500/90 px-2 py-1 rounded">
                <span className="text-sm font-bold text-black">
                  {getRating(media.vote_average)}
                </span>
              </div>
              <span className="text-xs text-slate-300">{getYear(releaseDate)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to watchlist button */}
      {onAddToWatchlist && (
        <button
          onClick={onAddToWatchlist}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all z-10 ${
            isInWatchlist
              ? 'bg-cyan-500'
              : 'bg-black/50 hover:bg-cyan-500'
          }`}
        >
          {isInWatchlist ? (
            <Check size={16} className="text-white" />
          ) : (
            <Plus size={16} className="text-white" />
          )}
        </button>
      )}
    </motion.div>
  )
}
