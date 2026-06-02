'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, User, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export function Header() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [showMenu, setShowMenu] = React.useState(false)
  const [showMobileMenu, setShowMobileMenu] = React.useState(false)
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
    <>
      <header className="sticky top-0 z-50 bg-linear-to-b from-slate-950 to-slate-950/80 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-linear-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CV</span>
                </div>
                <span className="hidden sm:inline font-bold text-lg bg-linear-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                  CineVault
                </span>
              </motion.div>
            </Link>

            {/* Search - Hidden on mobile */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md">
              <div className="relative w-full">
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

            {/* Mobile Search - Small version */}
            <form onSubmit={handleSearch} className="sm:hidden flex-1 max-w-xs mx-2">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300"
                >
                  <Search size={16} />
                </button>
              </div>
            </form>

            {/* Nav Links - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/watchlist" className="text-slate-300 hover:text-cyan-300 transition-colors">
                Watchlist
              </Link>
            </nav>

            {/* Desktop Auth - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-3">
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
                    <span className="text-sm text-white">{user.username}</span>
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

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {showMobileMenu ? (
                <X size={24} className="text-cyan-300" />
              ) : (
                <Menu size={24} className="text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="sm:hidden bg-slate-800 border-b border-slate-700 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link
                  href={`/profile/${user.id}`}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-cyan-300"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="w-6 h-6 rounded-full" />
                  ) : (
                    <User size={16} className="text-cyan-300" />
                  )}
                  <span className="text-sm">My Profile</span>
                </Link>
                <Link
                  href="/watchlist"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-cyan-300 text-sm"
                >
                  My Watchlist
                </Link>
                <button
                  onClick={() => { handleLogout(); setShowMobileMenu(false) }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-red-400 flex items-center gap-2 text-sm"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/watchlist"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-cyan-300 text-sm"
                >
                  Watchlist
                </Link>
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </>
  )
}