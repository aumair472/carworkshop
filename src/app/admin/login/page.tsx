'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string

    try {
      const supabase = createClientSupabase()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(signInError.message)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#4472C4]">
            Car<span className="text-[#E8601C]">Workshop</span><span className="text-[#1F2937]">.ae</span>
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">Admin Panel</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1F2937] mb-5">Sign In</h2>

          {error && (
            <div className="mb-4">
            <Alert variant="danger">{error}</Alert>
          </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" name="email" type="email" required autoComplete="email" placeholder="admin@carworkshop.ae" />
            <Input label="Password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
