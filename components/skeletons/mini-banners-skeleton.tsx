import * as React from 'react'

export function MiniBannersSkeleton() {
  const bannerData = [
    { gradient: 'from-slate-100 via-blue-50 to-indigo-100' },
    { gradient: 'from-gray-100 via-slate-50 to-gray-200' },
    { gradient: 'from-stone-100 via-amber-50 to-orange-100' }
  ]
  
  return (
    <div className='w-full bg-gray-50 px-0 sm:px-4'>
      <div className='w-full'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4'>
          {Array.from({ length: 3 }).map((_, index) => {
            const banner = bannerData[index]
            return (
              <div
                key={index}
                className='relative pb-[100%] overflow-hidden shadow-md rounded-2xl animate-pulse'
              >
                {/* Exact background match */}
                <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`} />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-blue-900/30 to-indigo-900/40" />
                
                {/* Content skeleton matching exact layout */}
                <div className='absolute inset-0 flex flex-col items-center justify-center p-6 text-center'>
                  {/* Title skeleton */}
                  <div className='h-8 bg-gray-300/70 rounded-lg mb-2' style={{ width: '140px' }}></div>
                  {/* Subtitle skeleton */}
                  <div className='h-4 bg-gray-300/60 rounded-lg mb-4' style={{ width: '180px' }}></div>
                  {/* Button skeleton */}
                  <div className='h-8 bg-white/70 rounded-full border border-white/20 shadow-lg' style={{ width: '90px' }}></div>
                </div>
                
                {/* Premium corner accent skeleton */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/70 rounded-full border border-white/30 shadow-sm"></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
