'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { MediaCard } from './MediaCard'
import { Movie, TVShow } from '@/types'

interface MediaCarouselProps {
  title: string
  items: (Movie | TVShow)[]
  type: 'movie' | 'tv'
  isLoading?: boolean
  viewAllHref?: string
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-[45vw] sm:w-[30vw] md:w-[22vw] lg:w-[16vw] xl:w-[14vw]">
      <div className="w-full aspect-2/3 rounded-xl overflow-hidden bg-white/4 relative">
        <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-white/4 via-white/8 to-white/4" />
      </div>
      <div className="mt-2.5 space-y-1.5">
        <div className="h-3 rounded-full bg-white/5 w-4/5 animate-pulse" />
        <div className="h-2.5 rounded-full bg-white/3 w-2/5 animate-pulse" />
      </div>
    </div>
  )
}

export function MediaCarousel({
  title,
  items,
  type,
  isLoading,
  viewAllHref,
}: MediaCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)

  const checkScroll = React.useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 8)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8)
    }
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [items, checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.75
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      })
    }
  }

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-48 rounded-lg bg-white/6 animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    )
  }

  const defaultHref = type === 'movie' ? '/movie' : '/tv'

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
        <motion.div whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
          <a
            href={viewAllHref ?? defaultHref}
            className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors shrink-0 group"
          >
            See All
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>

      {/* Carousel */}
      <div className="relative group/carousel">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {items.slice(0, 14).map((item, i) => (
            <motion.div
              key={`${type}-${item.id}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.4) }}
              className="shrink-0 w-[45vw] sm:w-[30vw] md:w-[22vw] lg:w-[16vw] xl:w-[14vw]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <MediaCard media={item} type={type} />
            </motion.div>
          ))}
        </div>

        {/* Left arrow */}
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scroll('left')}
            className="hidden sm:flex absolute left-0 top-[40%] -translate-y-1/2 -translate-x-4 w-10 h-10 items-center justify-center rounded-full bg-black/80 border border-white/12 text-white backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 hover:bg-violet-600/90 hover:border-violet-500/50 transition-all shadow-xl z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </motion.button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => scroll('right')}
            className="hidden sm:flex absolute right-0 top-[40%] -translate-y-1/2 translate-x-4 w-10 h-10 items-center justify-center rounded-full bg-black/80 border border-white/12 text-white backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 hover:bg-violet-600/90 hover:border-violet-500/50 transition-all shadow-xl z-10"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </motion.button>
        )}
      </div>

      {/* Mobile 2-col grid (below sm) is handled by the scrollable flex above on small screens) */}
    </section>
  )
}
