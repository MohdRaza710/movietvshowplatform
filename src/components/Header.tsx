'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export function Header() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [showMenu, setShowMenu] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
      toast.success('Logged out!')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-linear-to-b from-slate-950 to-slate-950/80 border-b border-slate-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-linear-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <span className="font-bold text-lg bg-linear-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                CineVault
              </span>
            </motion.div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, shows..."
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/watchlist" className="text-slate-300 hover:text-cyan-300 transition-colors">
              Watchlist
            </Link>
            <Link href="/feed" className="text-slate-300 hover:text-cyan-300 transition-colors">
              Feed
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <User size={16} className="text-cyan-300" />
                    </div>
                  )}
                  <span className="text-sm text-white hidden md:inline">{user.username}</span>
                </button>

                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50"
                  >
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-2 hover:bg-slate-700 rounded-t-lg text-sm text-white"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/watchlist"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-2 hover:bg-slate-700 text-sm text-white"
                    >
                      My Watchlist
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setShowMenu(false) }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-700 rounded-b-lg text-red-400 flex items-center gap-2 text-sm"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:border-slate-500">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}