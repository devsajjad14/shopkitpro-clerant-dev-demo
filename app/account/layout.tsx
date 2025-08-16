import { AccountSidebar } from '@/components/account/sidebar'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='flex flex-col md:flex-row gap-8'>
        <AccountSidebar />
        <main className='flex-1'>{children}</main>
      </div>
    </div>
  )
}
