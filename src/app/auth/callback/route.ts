import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth&reason=no_code`)
  }

  const redirectResponse = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Split large cookies into chunks to avoid HTTP 431
            const maxChunkSize = 3180
            if (value.length > maxChunkSize) {
              // Delete any previous chunks
              for (let i = 0; i < 5; i++) {
                redirectResponse.cookies.set(`${name}.${i}`, '', { ...options, maxAge: 0 })
              }
              // Write new chunks
              let i = 0
              let remaining = value
              while (remaining.length > 0) {
                const chunk = remaining.slice(0, maxChunkSize)
                remaining = remaining.slice(maxChunkSize)
                redirectResponse.cookies.set(`${name}.${i}`, chunk, options)
                i++
              }
            } else {
              redirectResponse.cookies.set(name, value, options)
            }
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('OAuth code exchange error:', error?.message)
    return NextResponse.redirect(
      `${origin}/login?error=oauth&reason=${encodeURIComponent(error?.message ?? 'exchange_failed')}`
    )
  }

  // Upsert user profile
  const username =
    data.user.user_metadata?.preferred_username ||
    data.user.user_metadata?.user_name ||
    data.user.user_metadata?.full_name?.toLowerCase().replace(/\s+/g, '_') ||
    data.user.email!.split('@')[0]

  const avatarUrl =
    data.user.user_metadata?.avatar_url ||
    data.user.user_metadata?.picture ||
    null

  const { error: upsertError } = await supabase.from('users').upsert(
    {
      id: data.user.id,
      email: data.user.email!,
      username,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  if (upsertError) {
    await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        display_name: data.user.user_metadata?.full_name || username,
        username,
        avatar_url: avatarUrl,
      },
      { onConflict: 'id' }
    )
  }

  return redirectResponse
}