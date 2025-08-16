// app/account/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AccountCard, AccountSection } from '@/components/account/section'
import { Icons } from '@/components/icons'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useCartStore } from '@/lib/stores/cart-store'

export default async function AccountPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <AccountSection
      title='Your Account Dashboard'
      description='Quick access to your account management'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AccountCard
          title='Profile Details'
          description='View and edit personal information'
          icon={<Icons.user className='h-6 w-6' />}
          href='/account/profile'
        />
        <AccountCard
          title='Address Book'
          description='Manage shipping & billing addresses'
          icon={<Icons.mapPin className='h-6 w-6' />}
          href='/account/addresses'
        />
        <AccountCard
          title='Order History'
          description='View past purchases and tracking'
          icon={<Icons.package className='h-6 w-6' />}
          href='/account/orders'
        />
        <AccountCard
          title='Wishlist'
          description='Manage your wishlist'
          icon={<Icons.heart className='h-6 w-6' />}
          href='/account/wishlist'
        />
        <AccountCard
          title='Security Settings'
          description='Password and authentication'
          icon={<Icons.lock className='h-6 w-6' />}
          href='/account/security'
          disabled
        />
        <AccountCard
          title='Notifications'
          description='Manage email preferences'
          icon={<Icons.bell className='h-6 w-6' />}
          href='/account/notifications'
          disabled
        />
      </div>
    </AccountSection>
  )
}
