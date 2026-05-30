import React from 'react'
import { createServerClient } from '@/lib/supabase-server'
import { UserProfile } from '@/types'
import { User, Star, Film } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = await createServerClient()

    const { data: user } = await supabase
      .from('users').select('*').eq('id', userId).single()

    if (!user) return null

    const { count: reviews } = await supabase
      .from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId)

    const { count: watchlist } = await supabase
      .from('watchlist').select('*', { count: 'exact', head: true }).eq('user_id', userId)

    const { count: followers } = await supabase
      .from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId)

    const { count: following } = await supabase
      .from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)

    return {
      ...user,
      total_reviews: reviews || 0,
      total_watchlist: watchlist || 0,
      followers_count: followers || 0,
      following_count: following || 0,
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const profile = await getUserProfile(id)

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400">User not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-start gap-6">
          <div className="shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-24 h-24 rounded-full" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <User size={40} className="text-cyan-300" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{profile.username}</h1>
            {profile.bio && <p className="text-slate-300 mb-4">{profile.bio}</p>}
            <div className="flex gap-8 mb-6">
              {[
                { value: profile.total_reviews, label: 'Reviews' },
                { value: profile.total_watchlist, label: 'Watchlist' },
                { value: profile.followers_count, label: 'Followers' },
                { value: profile.following_count, label: 'Following' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-cyan-300">{value}</div>
                  <p className="text-slate-400 text-sm">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Link href={`/profile/${id}/reviews`}>
                <Button className="gap-2"><Star size={18} />View Reviews</Button>
              </Link>
              <Link href={`/profile/${id}/watchlist`}>
                <Button variant="outline" className="gap-2 border-cyan-500 text-cyan-300 hover:bg-cyan-500/10">
                  <Film size={18} />Watchlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Reviews</h2>
        <p className="text-slate-400">Coming soon...</p>
      </section>
    </div>
  )
}