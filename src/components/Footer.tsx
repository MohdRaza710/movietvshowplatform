import Link from 'next/link'
import { Clapperboard, ExternalLink } from 'lucide-react'
import { FaGithub} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const NAV = [
  { label: 'Movies', href: '/movie' },
  { label: 'TV Shows', href: '/tv' },
  { label: 'Watchlist', href: '/watchlist' },
  { label: 'Search', href: '/search' },
]

const SOCIAL = [
  { icon: FaGithub, href: 'https://github.com/MohdRaza710', label: 'GitHub' },
  { icon: FaXTwitter, href: 'https://x.com/MohammedRa78084', label: 'Twitter' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-white/6 mt-20" style={{ background: '#080C14' }}>
      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg">
                <Clapperboard size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl text-gradient">CineVault</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Your premium destination to discover, track, and discuss the best in cinema and television.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/[0.07] text-slate-400 hover:text-white hover:bg-violet-600/20 hover:border-violet-500/30 transition-all"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Explore</h4>
            <ul className="space-y-2.5">
              {NAV.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-violet-300 text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data attribution */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">Powered By</h4>
            <div className="space-y-3">
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors group"
              >
                <span className="w-6 h-6 rounded bg-[#032541] flex items-center justify-center text-[#01B4E4] font-bold text-[9px]">
                  tmdb
                </span>
                <span>The Movie Database</span>
                <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <p className="text-slate-600 text-xs leading-relaxed max-w-xs">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} CineVault. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Created by{' '}
            <span className="text-violet-400 font-medium">Mohammed Raza</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
