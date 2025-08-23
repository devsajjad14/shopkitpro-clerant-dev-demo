import * as React from 'react'

export function CompanyIntroSkeleton() {
  return (
    <section className='bg-gradient-to-r from-blue-50 to-gray-100 py-16'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row items-center gap-8 lg:gap-12'>
          {/* Image Section - Exact match */}
          <div className='w-full lg:w-1/2 opacity-100 translate-y-0'>
            <div className='relative group overflow-hidden rounded-lg shadow-xl w-fit mx-auto'>
              <div className='w-[600px] h-[450px] bg-gradient-to-br from-blue-200 via-blue-100 to-gray-200 rounded-lg animate-pulse flex items-center justify-center'>
                <div className="text-center text-gray-600">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-400/50 rounded"></div>
                  <div className="h-4 bg-gray-400/50 rounded w-48 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Section - Exact match */}
          <div className='w-full lg:w-1/2 text-center lg:text-left space-y-6'>
            {/* Title skeleton */}
            <div className="animate-pulse">
              <div className='h-12 sm:h-16 bg-gray-300 rounded w-full mb-6'></div>
            </div>
            
            {/* Paragraph skeletons */}
            <div className="animate-pulse space-y-4">
              <div className='h-6 bg-gray-200 rounded w-full'></div>
              <div className='h-6 bg-gray-200 rounded w-11/12'></div>
              <div className='h-6 bg-gray-200 rounded w-5/6'></div>
            </div>
            
            <div className="animate-pulse space-y-4">
              <div className='h-6 bg-gray-200 rounded w-full'></div>
              <div className='h-6 bg-gray-200 rounded w-10/12'></div>
              <div className='h-6 bg-gray-200 rounded w-4/5'></div>
            </div>

            {/* Link skeleton */}
            <div className="animate-pulse">
              <div className='h-6 bg-gray-300 rounded w-1/2'></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
