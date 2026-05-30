'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Film, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSent(true)
      toast.success('Reset link sent! Check your inbox.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.22_280/10%)_0%,transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 bg-linear-to-br from-[oklch(0.80_0.16_70)] to-[oklch(0.55_0.22_280)] rounded-xl flex items-center justify-center shadow-lg">
              <Film size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">CineVault</span>
          </div>

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-muted-foreground text-sm mb-6">
                We sent a password reset link to <span className="text-foreground font-medium">{email}</span>
              </p>
              <Link href="/login">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white text-center mb-1">Reset Password</h1>
              <p className="text-muted-foreground text-center text-sm mb-7">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="pl-9 h-10 bg-input/30 border-border"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-10 bg-primary hover:bg-primary/90 font-semibold">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : 'Send Reset Link'}
                </Button>
              </form>

              <div className="text-center mt-6">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors">
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}