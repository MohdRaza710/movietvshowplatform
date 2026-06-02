'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Info } from 'lucide-react'
import { getTMDBImageUrl, getRating } from '@/lib/tmdb'
import { Movie } from '@/types'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  movie: Movie
}

export function HeroSection({ movie }: HeroSectionProps) {
  return (
    <div className="relative h-80 sm:h-100 md:h-150 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={getTMDBImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 to-transparent" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 md:p-12"
      >
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white"
          >
            {movie.title}
          </motion.h1>

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-2 sm:gap-4"
          >
            <div className="flex items-center gap-2 bg-yellow-500/90 px-2 sm:px-3 py-1 rounded text-sm sm:text-base">
              <span className="font-bold text-black">⭐ {getRating(movie.vote_average)}</span>
            </div>
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {movie.genres.slice(0, 2).map((genre) => (
                  <span key={genre.id} className="px-2 sm:px-3 py-1 bg-slate-800/80 rounded text-xs sm:text-sm text-slate-300">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Overview */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm sm:text-base md:text-lg text-slate-200 max-w-xl line-clamp-2 sm:line-clamp-3"
          >
            {movie.overview}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-2 sm:gap-4 flex-wrap"
          >
            <Link href={`/movie/${movie.id}`}>
              <Button className="bg-cyan-500 hover:bg-cyan-600 gap-2 text-sm sm:text-base">
                <Info size={16} className="sm:w-4.5" />
                Learn More
              </Button>
            </Link>
            <Link href={`/movie/${movie.id}#reviews`}>
              <Button variant="outline" className="border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 text-sm sm:text-base">
                Read Reviews
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
