'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Share2, Copy } from 'lucide-react'
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface SocialShareProps {
  title: string
  url: string
  posterUrl?: string
}

export function SocialShare({ title, url, posterUrl }: SocialShareProps) {
  const [showMenu, setShowMenu] = React.useState(false)

  const shareToTwitter = () => {
    const text = `Just watched "${title}" on CineVault! Check it out: ${url}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank'
    )
  }

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
    setShowMenu(false)
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-cyan-500 hover:bg-cyan-600"
      >
        <Share2 size={16} />
        <span className="ml-2">Share</span>
      </Button>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10"
        >
          <button
            onClick={shareToTwitter}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-700 transition-colors text-left rounded-t-lg"
          >
            <FaXTwitter size={16} />
            <span>Share on Twitter</span>
          </button>
          <button
            onClick={shareToFacebook}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-700 transition-colors text-left"
          >
            <FaFacebook size={16} />
            <span>Share on Facebook</span>
          </button>
          <button
            onClick={copyLink}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-700 transition-colors text-left rounded-b-lg"
          >
            <Copy size={16} />
            <span>Copy Link</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}
