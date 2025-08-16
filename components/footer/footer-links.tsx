'use client'

import Link from 'next/link'

export default function FooterLinks() {
  const links = [
    {
      title: 'Customer Service',
      items: [
        { label: 'Your Account', href: '/usermanagement/manageacct.cfm' },
        { label: 'Contact Us', href: '/info/contact-us' },
        { label: 'Gift Cards', href: '/giftcard.cfm' },
      ],
    },
    {
      title: 'Information',
      items: [
        { label: 'Terms and Conditions', href: '/info/terms-and-conditions' },
        { label: 'Visit Our Blog', href: '/blog/' },
      ],
    },
    {
      title: 'Company Info',
      items: [
        { label: 'About Us', href: '/info/about-us' },
        { label: 'Careers', href: '/info/careers' },
      ],
    },
  ]

  return (
    <div className="mt-10 text-gray-300">
      {/* On mobile, show Customer Service and Information side by side */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {links.slice(0, 2).map((section, index) => (
          <div key={index}>
            <h3 className='text-lg font-semibold mb-3 text-gray-100'>
              {section.title}
            </h3>
            <ul className='space-y-2'>
              {section.items.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className='hover:text-gray-50 transition'
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {/* On desktop, show Company Info as third column; on mobile, full width below */}
        <div className="col-span-2 md:col-span-1 mt-6 md:mt-0">
          <h3 className='text-lg font-semibold mb-3 text-gray-100'>
            {links[2].title}
          </h3>
          <ul className='space-y-2'>
            {links[2].items.map((item, idx) => (
              <li key={idx}>
                <Link
                  href={item.href}
                  className='hover:text-gray-50 transition'
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
