'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

type Provider = 'google' | 'facebook' | 'x'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

export function SocialLogin({
  provider,
  disabled = false,
}: {
  provider: Provider
  disabled?: boolean
}) {
  const handleSignIn = () => signIn(provider)

  const providerData = {
    google: {
      icon: <Icons.google className='h-4 w-4 sm:h-5 sm:w-5' />,
      className: 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200',
      text: 'Google',
    },
    facebook: {
      icon: <Icons.facebook className='h-4 w-4 sm:h-5 sm:w-5 text-[#1877F2]' />,
      className: 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200',
      text: 'Facebook',
    },
    x: {
      icon: <Icons.x className='h-4 w-4 sm:h-5 sm:w-5' />,
      className: 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200',
      text: '',
    },
  }

  return (
    <Button
      variant='outline'
      className={`flex items-center justify-center gap-2 rounded-md px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium shadow-sm transition-all hover:shadow-md ${
        providerData[provider].className
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleSignIn}
      disabled={disabled}
      aria-label={`Sign in with ${provider}`}
    >
      <span className='bg-white p-1 rounded-sm'>
        {providerData[provider].icon}
      </span>
      <span className='hidden sm:inline'>{providerData[provider].text}</span>
    </Button>
  )
}
