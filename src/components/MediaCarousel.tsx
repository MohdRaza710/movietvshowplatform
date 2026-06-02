'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MediaCard } from './MediaCard'
import { Movie, TVShow } from '@/types'
import { Button } from '@/components/ui/button'

interface MediaCarouselProps {
  title: string
  items: (Movie | TVShow)[]
  type: 'movie' | 'tv'
  isLoading?: boolean
}

export function MediaCarousel({
  title,
  items,
  type,
  isLoading,
}: MediaCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  React.useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [items])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 400
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      })
      setTimeout(checkScroll, 300)
    }
  }

  if (isLoading) {
    return (
      <section className="py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-2/3 bg-linear-to-r from-slate-800 to-slate-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="relative group hidden sm:block">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide pb-4"
        >
          {items.slice(0, 12).map((item, i) => (
            <div
              key={`${type}-${item.id}-${i}`}
              className="shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6"
            >
              <MediaCard media={item} type={type} />
            </div>
          ))}
        </div>

        {canScrollLeft && (
          <Button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 bg-cyan-500/90 hover:bg-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            size="icon"
          >
            <ChevronLeft size={20} />
          </Button>
        )}

        {canScrollRight && (
          <Button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 bg-cyan-500/90 hover:bg-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            size="icon"
          >
            <ChevronRight size={20} />
          </Button>
        )}
      </div>

      {/* Mobile Grid View */}
      <div className="sm:hidden grid grid-cols-2 gap-2">
        {items.slice(0, 6).map((item, i) => (
          <div key={`${type}-${item.id}-${i}`}>
            <MediaCard media={item} type={type} />
          </div>
        ))}
      </div>
    </section>
  )
}
