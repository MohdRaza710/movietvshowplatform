'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, LogOut, Menu, X, Film, Tv, Bookmark, Clapperboard } from 'lucide-react'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const NAV_LINKS = [
  { href: '/movie', label: 'Movies', icon: Film },
  { href: '/tv', label: 'TV Shows', icon: Tv },
  { href: '/watchlist', label: 'Watchlist', icon: Bookmark },
]

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser } = useAuthStore()
  const [showMenu, setShowMenu] = React.useState(false)
  const [showMobileMenu, setShowMobileMenu] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [scrolled, setScrolled] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
      toast.success('Logged out successfully')
    } catch {
      toast.error('Failed to logout')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowMobileMenu(false)
    }
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <motion.header
        initial={false}
        animate={scrolled ? 'scrolled' : 'top'}
        variants={{
          top: {
            paddingTop: '1rem',
            paddingBottom: '1rem',
          },
          scrolled: {
            paddingTop: '0.625rem',
            paddingBottom: '0.625rem',
          },
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-strong border-b border-white/[0.07] shadow-2xl shadow-black/40'
            : 'bg-linear-to-b from-black/70 via-black/40 to-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg glow-purple">
                  <Clapperboard size={18} className="text-white" />
                </div>
                <span className="hidden sm:inline font-bold text-lg text-gradient">
                  CineVault
                </span>
              </motion.div>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm">
              <div className="relative w-full group">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies, shows..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </form>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(href)
                      ? 'text-white bg-white/8'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                  {isActive(href) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-violet-500"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <div className="relative" ref={menuRef}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 hover:border-violet-500/30 hover:bg-white/8 transition-all"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-7 h-7 rounded-full ring-1 ring-violet-500/30" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center ring-1 ring-violet-500/30">
                        <User size={14} className="text-violet-300" />
                      </div>
                    )}
                    <span className="text-sm text-white/90 font-medium max-w-25 truncate">{user.username}</span>
                  </motion.button>

                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-52 glass-strong rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/8"
                      >
                        <div className="p-1">
                          <Link
                            href={`/profile/${user.id}`}
                            onClick={() => setShowMenu(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-white/[0.07] rounded-xl text-sm text-white/90 transition-colors"
                          >
                            <User size={15} className="text-violet-400" />
                            My Profile
                          </Link>
                          <Link
                            href="/watchlist"
                            onClick={() => setShowMenu(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-white/[0.07] rounded-xl text-sm text-white/90 transition-colors"
                          >
                            <Bookmark size={15} className="text-violet-400" />
                            My Watchlist
                          </Link>
                          <div className="h-px bg-white/6 mx-2 my-1" />
                          <button
                            onClick={() => { handleLogout(); setShowMenu(false) }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-red-500/10 rounded-xl text-sm text-red-400 transition-colors"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-white hover:bg-white/[0.07] text-sm"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 text-sm px-4"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: Search + Hamburger */}
            <div className="sm:hidden flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/8 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>
              </form>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg bg-white/5 border border-white/8 hover:bg-white/9 transition-colors"
              >
                <AnimatePresence mode="wait">
                  {showMobileMenu ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X size={20} className="text-violet-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu size={20} className="text-slate-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="sm:hidden overflow-hidden glass-strong border-b border-white/[0.07] sticky top-14.25 z-40"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(href)
                      ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}

              <div className="h-px bg-white/6 my-3" />

              {user ? (
                <>
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-slate-300 hover:text-white text-sm"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-5 h-5 rounded-full" />
                    ) : (
                      <User size={16} className="text-violet-400" />
                    )}
                    My Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setShowMobileMenu(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 text-sm"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link href="/login" className="flex-1" onClick={() => setShowMobileMenu(false)}>
                    <Button variant="outline" className="w-full border-white/12 text-slate-300 hover:text-white text-sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setShowMobileMenu(false)}>
                    <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
