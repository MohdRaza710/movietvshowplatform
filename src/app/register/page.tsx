'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, Film, CheckCircle2, XCircle } from 'lucide-react'
// import { FaGithub } from "react-icons/fa";
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [oauthLoading, setOauthLoading] = React.useState<'google' | 'github' | null>(null)

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const passwordStrong = Object.values(passwordChecks).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) { toast.error('Passwords do not match'); return }
    if (!passwordStrong) { toast.error('Password does not meet requirements'); return }
    if (username.length < 3) { toast.error('Username must be at least 3 characters'); return }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, full_name: username } },
      })
      if (error) throw error
      if (!data.user) throw new Error('No user returned')

      const { error: profileError } = await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email!,
        username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username,
          display_name: username,
        })
      }

      if (data.session) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        toast.success('Welcome to CineVault! 🎬')
        router.push('/')
      } else {
        toast.success('Account created! Check your email to confirm.')
        router.push('/login')
      }
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        toast.error('An account with this email already exists')
      } else {
        toast.error(error.message || 'Failed to create account')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setOauthLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`)
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.75_0.15_55/12%)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.55_0.22_280/12%)_0%,transparent_60%)]" />
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-[oklch(0.75_0.15_55/6%)] blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              className="w-11 h-11 bg-linear-to-br from-[oklch(0.80_0.16_70)] to-[oklch(0.55_0.22_280)] rounded-xl flex items-center justify-center shadow-lg"
            >
              <Film size={22} className="text-white" />
            </motion.div>
            <div>
              <span className="text-2xl font-bold text-gradient">CineVault</span>
              <p className="text-xs text-muted-foreground -mt-0.5">Your cinematic universe</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">Create your account</h1>
          <p className="text-muted-foreground text-center text-sm mb-7">Join thousands of movie lovers</p>

          <div className="grid grid-cols-1 gap-3 mb-6">
            <Button variant="outline" onClick={() => handleOAuthLogin('google')} disabled={!!oauthLoading} className="h-10 border-border hover:bg-muted/50 gap-2">
              {oauthLoading === 'google' ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Google
            </Button>
            {/* <Button variant="outline" onClick={() => handleOAuthLogin('github')} disabled={!!oauthLoading} className="h-10 border-border hover:bg-muted/50 gap-2">
              {oauthLoading === 'github' ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <FaGithub size={16} />}
              GitHub
            </Button> */}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or register with email</span></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="cinephile42" required minLength={3} maxLength={20} className="pl-9 h-10 bg-input/30 border-border" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required className="pl-9 h-10 bg-input/30 border-border" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required className="pl-9 pr-10 h-10 bg-input/30 border-border" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex flex-col gap-1 pt-1">
                  {[{ key: 'length', label: 'At least 8 characters' }, { key: 'upper', label: 'One uppercase letter' }, { key: 'number', label: 'One number' }].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1.5">
                      {passwordChecks[key as keyof typeof passwordChecks]
                        ? <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                        : <XCircle size={12} className="text-muted-foreground shrink-0" />}
                      <span className={`text-xs ${passwordChecks[key as keyof typeof passwordChecks] ? 'text-green-400' : 'text-muted-foreground'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" required
                  className={`pl-9 pr-10 h-10 bg-input/30 border-border ${confirmPassword.length > 0 && !passwordsMatch ? 'border-destructive' : ''}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading || !passwordsMatch || !passwordStrong}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}