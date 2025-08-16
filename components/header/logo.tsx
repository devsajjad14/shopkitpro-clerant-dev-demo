// components/header/logo.tsx
import Image from 'next/image'
import Link from 'next/link'
import useSettingStore from '@/hooks/use-setting-store'

export default function Logo() {
  const logo = useSettingStore(state => state.getSetting('logo'))
  return (
    <Link href='/' className='block' prefetch={false} aria-label='Home'>
      <Image
        src={logo && logo !== '' ? logo : '/images/site/logo.svg'}
        alt='Logo'
        width={120}
        height={40}
        priority
        className='w-auto h-20' // Fixed aspect ratio
      />
    </Link>
  )
}
