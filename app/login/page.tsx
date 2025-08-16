import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { SocialLogin } from '@/components/auth/social-login'
import Link from 'next/link'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string
    error?: string
    success?: string
  }>
}) {
  const resolvedSearchParams = await searchParams
  const session = await auth()

  if (session) {
    redirect(decodeURIComponent(resolvedSearchParams.callbackUrl || '/account'))
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16'>
      <div className='w-full max-w-sm sm:max-w-md transform rounded-2xl bg-white p-6 sm:p-8 shadow-xl transition-all duration-300 sm:scale-100 sm:hover:shadow-2xl'>
        <div className='mb-6 sm:mb-8 text-center'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>Log in</h1>
          <p className='mt-2 text-sm text-gray-600'>Continue to your account</p>

          {resolvedSearchParams.success && (
            <div className='mt-4 rounded-lg bg-green-50 p-3 border border-green-200'>
              <p className='text-sm text-green-700'>
                {resolvedSearchParams.success}
              </p>
            </div>
          )}

          {resolvedSearchParams.error && (
            <div className='mt-4 rounded-lg bg-red-50 p-3 border border-red-200'>
              <p className='text-sm text-red-700'>
                {resolvedSearchParams.error === 'CredentialsSignin'
                  ? 'Invalid email or password'
                  : 'Authentication error occurred'}
              </p>
            </div>
          )}
        </div>

        <div className='space-y-5 sm:space-y-6'>
          <LoginForm callbackUrl={resolvedSearchParams.callbackUrl} />

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-200' />
            </div>
            <div className='relative flex justify-center text-xs sm:text-sm'>
              <span className='bg-white px-2 text-gray-500'>
                Or continue with
              </span>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row justify-center gap-3'>
            <SocialLogin provider='google' />
            <SocialLogin provider='facebook' disabled />
            <SocialLogin provider='x' disabled />
          </div>
        </div>

        <div className='mt-6 text-center text-xs sm:text-sm text-gray-600'>
          New to our platform?{' '}
          <Link
            href={`/signup${
              resolvedSearchParams.callbackUrl
                ? `?callbackUrl=${encodeURIComponent(
                    resolvedSearchParams.callbackUrl
                  )}`
                : ''
            }`}
            className='font-medium text-primary-600 hover:text-primary-500 hover:underline transition-colors'
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
