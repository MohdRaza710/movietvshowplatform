'use client'

import React from 'react'
import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          setUser(profile || {
            id: user.id,
            email: user.email!,
            username: user.email!.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setUser(data || {
              id: session.user.id,
              email: session.user.email!,
              username: session.user.email!.split('@')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          })
      } else {
        setUser(null)
      }
    })

    return () => { subscription?.unsubscribe() }
  }, [setUser, setLoading])

  return <>{children}</>
}