'use client'

import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Film } from 'lucide-react'
import { motion } from 'framer-motion'

function SetSessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuthStore()
  const [status, setStatus] = React.useState('Completing sign in...')

  React.useEffect(() => {
    const run = async () => {
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')

      if (!accessToken) {
        setStatus('No token found, redirecting...')
        router.replace('/login?error=oauth&reason=no_token')
        return
      }

      try {
        setStatus('Setting up your session...')

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })

        if (error || !data.user) {
          throw error || new Error('No user returned')
        }

        setStatus('Loading your profile...')

        // Fetch or create profile
        let profile = null
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (userProfile) {
          profile = userProfile
        } else {
          // Create profile if it doesn't exist
          const username =
            data.user.user_metadata?.preferred_username ||
            data.user.user_metadata?.user_name ||
            data.user.user_metadata?.full_name?.toLowerCase().replace(/\s+/g, '_') ||
            data.user.email!.split('@')[0]

          const { data: newProfile } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: data.user.email!,
              username,
              avatar_url: data.user.user_metadata?.avatar_url || null,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })
            .select()
            .single()

          profile = newProfile
        }

        setUser(profile || {
          id: data.user.id,
          email: data.user.email!,
          username: data.user.email!.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        setStatus('Welcome! Redirecting...')
        router.replace('/')
      } catch (err: any) {
        console.error('Session error:', err)
        setStatus('Something went wrong, redirecting...')
        router.replace('/login?error=oauth&reason=session_failed')
      }
    }

    run()
  }, [searchParams, router, setUser])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 bg-linear-to-br from-[oklch(0.80_0.16_70)] to-[oklch(0.55_0.22_280)] rounded-xl flex items-center justify-center shadow-lg"
      >
        <Film size={22} className="text-white" />
      </motion.div>
      <p className="text-slate-300 text-sm animate-pulse">{status}</p>
    </div>
  )
}

function SetSessionFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 bg-linear-to-br from-[oklch(0.80_0.16_70)] to-[oklch(0.55_0.22_280)] rounded-xl flex items-center justify-center shadow-lg"
      >
        <Film size={22} className="text-white" />
      </motion.div>
      <p className="text-slate-300 text-sm animate-pulse">Completing sign in...</p>
    </div>
  )
}

export default function SetSessionPage() {
  return (
    <Suspense fallback={<SetSessionFallback />}>
      <SetSessionContent />
    </Suspense>
  )
}