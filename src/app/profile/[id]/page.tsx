import React from 'react'
import { createServerClient } from '@/lib/supabase-server'
import { UserProfile } from '@/types'
import { User, Star, Film } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProfileClient } from '@/components/ProfileClient'

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = await createServerClient()

    // First check if the user exists at all
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError.message, userError.code)
      return null
    }

    if (!user) return null

    const [
      { count: reviews },
      { count: watchlist },
      { count: followers },
      { count: following },
    ] = await Promise.all([
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('watchlist').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ])

    return {
      ...user,
      total_reviews: reviews || 0,
      total_watchlist: watchlist || 0,
      followers_count: followers || 0,
      following_count: following || 0,
    }
  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return null
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params

  // Validate UUID format before querying
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400">Invalid profile ID</p>
        <Link href="/" className="text-cyan-300 hover:underline text-sm mt-2 inline-block">
          Go home
        </Link>
      </div>
    )
  }

  const profile = await getUserProfile(id)

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-slate-400">User not found</p>
        <p className="text-slate-500 text-sm">
          The profile may still be setting up. Try refreshing in a moment.
        </p>
        <Link href="/">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            Go home
          </Button>
        </Link>
      </div>
    )
  }

  return <ProfileClient profile={profile} />
}