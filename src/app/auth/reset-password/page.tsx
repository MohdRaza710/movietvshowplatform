'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Film, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const passwordStrong = Object.values(passwordChecks).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch || !passwordStrong) return
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated! Please sign in.')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
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

          <h1 className="text-2xl font-bold text-white text-center mb-1">New Password</h1>
          <p className="text-muted-foreground text-center text-sm mb-7">Choose a strong new password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9 pr-10 h-10 bg-input/30 border-border"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex flex-col gap-1 pt-1">
                  {[
                    { key: 'length', label: 'At least 8 characters' },
                    { key: 'upper', label: 'One uppercase letter' },
                    { key: 'number', label: 'One number' },
                  ].map(({ key, label }) => (
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
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`pl-9 h-10 bg-input/30 border-border ${confirmPassword.length > 0 && !passwordsMatch ? 'border-destructive' : ''}`}
                />
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !passwordsMatch || !passwordStrong}
              className="w-full h-10 bg-primary hover:bg-primary/90 font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : 'Update Password'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}