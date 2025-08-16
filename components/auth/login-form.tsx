'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { loginAction } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [email, setEmail] = useState('')
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: '',
    callbackUrl: callbackUrl || '/account',
  })
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    if (state?.redirect) {
      // Update auth store before redirecting
      async function updateAuthStore() {
        try {
          const response = await fetch('/api/auth/session')
          const data = await response.json()
          setUser(data?.user ?? null)
        } catch (error) {
          console.error('Failed to update auth store:', error)
        }
        if (state.redirect) {
          router.push(state.redirect)
        }
      }
      updateAuthStore()
    }
  }, [state, router, setUser])

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setShowPasswordField(true)
    }
  }

  return (
    <form
      action={formAction}
      className='space-y-4 sm:space-y-5'
      onSubmit={showPasswordField ? undefined : handleContinue}
    >
      <input
        type='hidden'
        name='callbackUrl'
        value={callbackUrl || '/account'}
      />

      <div className='space-y-2 sm:space-y-3'>
        <label
          htmlFor='email'
          className='block text-sm font-medium text-gray-700'
        >
          Email address
        </label>
        <Input
          id='email'
          name='email'
          type='email'
          placeholder='Enter your email'
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base'
        />
      </div>

      {showPasswordField && (
        <div className='space-y-2 sm:space-y-3'>
          <div className='flex items-center justify-between'>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              Password
            </label>
            <Link
              href='/forgot-password'
              className='text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-500 hover:underline transition-colors'
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id='password'
            name='password'
            type='password'
            placeholder='Enter your password'
            required
            minLength={6}
            className='block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base'
          />
        </div>
      )}

      <Button
        type={showPasswordField ? 'submit' : 'button'}
        className='cursor-pointer w-full rounded-md bg-black py-2.5 sm:py-3 px-4 text-sm sm:text-base font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200'
        disabled={isPending}
        onClick={!showPasswordField ? handleContinue : undefined}
      >
        {isPending
          ? 'Signing in...'
          : showPasswordField
          ? 'Sign In'
          : 'Continue with email'}
      </Button>

      {state?.error && (
        <p className='mt-2 text-center text-xs sm:text-sm text-red-600'>{state.error}</p>
      )}
    </form>
  )
}
