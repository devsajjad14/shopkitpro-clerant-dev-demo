'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiEdit2, FiTag, FiLoader, FiCalendar, FiEye, FiSettings } from 'react-icons/fi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAttribute } from '@/lib/actions/attributes'

interface Attribute {
  id: string
  name: string
  display: string
  status: 'active' | 'draft' | 'archived'
  createdAt: string
  values: { value: string }[]
}

export default function AttributeViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [attribute, setAttribute] = useState<Attribute | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAttribute()
  }, [resolvedParams.id])

  const loadAttribute = async () => {
    setIsLoading(true)
    try {
      const data = await getAttribute(resolvedParams.id)
      setAttribute(data)
    } catch (error) {
      console.error('Error loading attribute:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='max-w-7xl mx-auto p-6'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00437f]"></div>
              <p className='text-sm text-gray-500'>Loading attribute...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!attribute) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='max-w-7xl mx-auto p-6'>
          <div className='flex flex-col items-center justify-center min-h-[400px]'>
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 rounded-2xl blur-2xl'></div>
              <div className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl text-center'>
                <div className='w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FiTag className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>Attribute Not Found</h3>
                <p className='text-gray-600 dark:text-gray-300 mb-6'>The attribute you're looking for doesn't exist or has been removed.</p>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className='h-11 px-6 border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200'
                >
                  <FiArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-7xl mx-auto p-6 space-y-6'>
        {/* Premium Header */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
          <div className='relative flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg'>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()} 
                  className="h-8 w-8 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200"
                >
                  <FiArrowLeft className="h-4 w-4" />
                </Button>
                <div className='w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md'>
                  <FiEye className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    {attribute.name}
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    View attribute details
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/admin/catalog/attributes/${attribute.id}/edit`)}
              className="h-10 px-4 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-md hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <FiEdit2 className="mr-2 h-4 w-4" />
              Edit Attribute
            </Button>
          </div>
        </div>

                 {/* Attribute Details */}
         <div className='grid grid-cols-1 gap-6'>
           {/* Basic Information Card */}
           <div className='relative group'>
             <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
             <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
               <div className='space-y-6'>
                 <div className='flex items-center gap-3 mb-4'>
                   <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                     <FiTag className='h-5 w-5 text-white' />
                   </div>
                   <div>
                     <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Basic Information</h3>
                     <p className='text-sm text-gray-600 dark:text-gray-300'>Attribute details and metadata</p>
                   </div>
                 </div>
                 <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                   <div className='space-y-2'>
                     <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                       <FiTag className='h-4 w-4 text-[#00437f]' />
                       Name
                     </label>
                     <p className='text-base text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2'>
                       {attribute.name}
                     </p>
                   </div>
                   <div className='space-y-2'>
                     <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                       <FiSettings className='h-4 w-4 text-[#00437f]' />
                       Display Name
                     </label>
                     <p className='text-base text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2'>
                       {attribute.display}
                     </p>
                   </div>
                   <div className='space-y-2'>
                     <label className='text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                       <FiCalendar className='h-4 w-4 text-[#00437f]' />
                       Created At
                     </label>
                     <p className='text-base text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2'>
                       {new Date(attribute.createdAt).toLocaleDateString('en-US', {
                         year: 'numeric',
                         month: 'long',
                         day: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                     </p>
                   </div>
                 </div>
               </div>
             </Card>
           </div>

           {/* Status Card */}
           <div className='relative group'>
             <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
             <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
               <div className='space-y-6'>
                 <div className='flex items-center gap-3 mb-4'>
                   <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                     <FiSettings className='h-5 w-5 text-white' />
                   </div>
                   <div>
                     <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Status & Settings</h3>
                     <p className='text-sm text-gray-600 dark:text-gray-300'>Current status and configuration</p>
                   </div>
                 </div>
                 <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                   <div className='space-y-2'>
                     <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                       Current Status
                     </label>
                     <div className='mt-2'>
                       <Badge 
                         variant={attribute.status === 'active' ? 'default' : 'secondary'}
                         className={`text-sm px-3 py-1.5 ${
                           attribute.status === 'active' 
                             ? 'bg-green-500 text-white ring-1 ring-green-600/20' 
                             : attribute.status === 'draft'
                             ? 'bg-yellow-500 text-white ring-1 ring-yellow-600/20'
                             : 'bg-gray-500 text-white ring-1 ring-gray-600/20'
                         }`}
                       >
                         {attribute.status.charAt(0).toUpperCase() + attribute.status.slice(1)}
                       </Badge>
                     </div>
                   </div>
                   <div className='space-y-2'>
                     <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                       Attribute ID
                     </label>
                     <p className='text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 mt-2'>
                       {attribute.id}
                     </p>
                   </div>
                 </div>
               </div>
             </Card>
           </div>
         </div>

        {/* Values Card */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
            <div className='space-y-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                  <FiTag className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Attribute Values</h3>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>
                    {attribute.values.length} value{attribute.values.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
              <div className='flex flex-wrap gap-3'>
                {attribute.values.length > 0 ? (
                  attribute.values.map((value, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-[#00437f]/30 text-[#00437f] bg-[#00437f]/5 text-sm px-3 py-1.5 hover:bg-[#00437f]/10 transition-all duration-200"
                    >
                      <FiTag className="h-3 w-3 mr-1.5" />
                      {value.value}
                    </Badge>
                  ))
                ) : (
                  <div className='text-center text-gray-500 dark:text-gray-400 py-8 w-full'>
                    <FiTag className='h-8 w-8 mx-auto mb-2 opacity-50' />
                    <p>No values defined for this attribute</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 