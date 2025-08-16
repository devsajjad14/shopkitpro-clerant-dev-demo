import WishlistSectionClient from '@/components/account/WishlistSectionClient'
import { AccountSection } from '@/components/account/section'

export default function WishlistPage() {
  return (
    <AccountSection
      title="Your Wishlist"
      description="View and manage your saved products"
    >
      <WishlistSectionClient />
    </AccountSection>
  )
} 