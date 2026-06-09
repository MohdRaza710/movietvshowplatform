'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Info, Star } from 'lucide-react'
import { getTMDBImageUrl, getRating, getYear } from '@/lib/tmdb'
import { Movie } from '@/types'

interface HeroSectionProps {
  movie: Movie
}

export function HeroSection({ movie }: HeroSectionProps) {
  const year = getYear(movie.release_date)
  const rating = getRating(movie.vote_average)

  return (
    <div className="relative min-h-[88vh] flex items-end overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <Image
          src={getTMDBImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Multi-layer gradient for cinematic depth */}
        <div className="absolute inset-0 bg-linear-to-r from-[#0B0F19] via-[#0B0F19]/75 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-[#0B0F19]/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-32">
        <div className="max-w-2xl">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300 text-xs font-semibold tracking-wide uppercase">Featured Today</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-4"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            {movie.title}
          </motion.h1>

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 mb-5"
          >
            {/* Rating */}
            <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/25 px-3 py-1 rounded-full backdrop-blur-sm">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-amber-300 text-sm font-bold">{rating}</span>
            </div>

            {/* Year */}
            {year && (
              <span className="text-slate-400 text-sm font-medium bg-white/[0.06] px-3 py-1 rounded-full border border-white/[0.08]">
                {year}
              </span>
            )}

            {/* Genres */}
            {movie.genres?.slice(0, 3).map((genre) => (
              <span
                key={genre.id}
                className="text-slate-300 text-sm px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm"
              >
                {genre.name}
              </span>
            ))}
          </motion.div>

          {/* Overview */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed line-clamp-3 mb-8 max-w-xl"
          >
            {movie.overview}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            <Link href={`/movie/${movie.id}`}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-lg shadow-violet-900/50 transition-colors"
              >
                <Play size={17} className="fill-white" />
                Watch Trailer
              </motion.button>
            </Link>

            <Link href={`/movie/${movie.id}`}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/[0.1] hover:bg-white/[0.16] border border-white/[0.15] text-white font-semibold text-sm backdrop-blur-sm transition-all"
              >
                <Info size={17} />
                More Info
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0B0F19] to-transparent pointer-events-none" />
    </div>
  )
}
