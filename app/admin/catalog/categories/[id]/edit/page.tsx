'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FiSave, FiArrowLeft, FiEdit, FiTag, FiSettings, FiGlobe, FiFolder } from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface TaxonomyItem {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  WEB_URL: string
  ACTIVE: number
  LONG_DESCRIPTION?: string | null
  SHORT_DESC?: string | null
  META_TAGS?: string | null
  SORT_POSITION?: string | null
  CATEGORY_STYLE?: string | null
}

interface CategoryFormData {
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  CATEGORY_NAME: string
  WEB_URL: string
  ACTIVE: number
  SHORT_DESC: string
  LONG_DESCRIPTION: string
  META_TAGS: string
  SORT_POSITION: string
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState<TaxonomyItem[]>([])
  const [formData, setFormData] = useState<CategoryFormData>({
    DEPT: '',
    TYP: 'EMPTY',
    SUBTYP_1: 'EMPTY',
    SUBTYP_2: 'EMPTY',
    SUBTYP_3: 'EMPTY',
    CATEGORY_NAME: '',
    WEB_URL: '',
    ACTIVE: 1,
    SHORT_DESC: '',
    LONG_DESCRIPTION: '',
    META_TAGS: '',
    SORT_POSITION: '',
  })
  const [parentCategory, setParentCategory] = useState<TaxonomyItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories for parent selection
        const categoriesResponse = await fetch('/api/admin/catalog/categories')
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories')
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)

        // Fetch current category data
        const categoryResponse = await fetch(`/api/admin/catalog/categories/${resolvedParams.id}`)
        if (!categoryResponse.ok) throw new Error('Failed to fetch category')
        const categoryData = await categoryResponse.json()

        // Find parent category based on hierarchy
        let parentCategory = null
        if (categoryData.SUBTYP_3 !== 'EMPTY') {
          parentCategory = categoriesData.find(
            (cat: TaxonomyItem) =>
              cat.DEPT === categoryData.DEPT &&
              cat.TYP === categoryData.TYP &&
              cat.SUBTYP_1 === categoryData.SUBTYP_1 &&
              cat.SUBTYP_2 === categoryData.SUBTYP_2 &&
              cat.SUBTYP_3 === 'EMPTY'
          )
        } else if (categoryData.SUBTYP_2 !== 'EMPTY') {
          parentCategory = categoriesData.find(
            (cat: TaxonomyItem) =>
              cat.DEPT === categoryData.DEPT &&
              cat.TYP === categoryData.TYP &&
              cat.SUBTYP_1 === categoryData.SUBTYP_1 &&
              cat.SUBTYP_2 === 'EMPTY' &&
              cat.SUBTYP_3 === 'EMPTY'
          )
        } else if (categoryData.SUBTYP_1 !== 'EMPTY') {
          parentCategory = categoriesData.find(
            (cat: TaxonomyItem) =>
              cat.DEPT === categoryData.DEPT &&
              cat.TYP === categoryData.TYP &&
              cat.SUBTYP_1 === 'EMPTY' &&
              cat.SUBTYP_2 === 'EMPTY' &&
              cat.SUBTYP_3 === 'EMPTY'
          )
        } else if (categoryData.TYP !== 'EMPTY') {
          parentCategory = categoriesData.find(
            (cat: TaxonomyItem) =>
              cat.DEPT === categoryData.DEPT &&
              cat.TYP === 'EMPTY' &&
              cat.SUBTYP_1 === 'EMPTY' &&
              cat.SUBTYP_2 === 'EMPTY' &&
              cat.SUBTYP_3 === 'EMPTY'
          )
        }

        // Set parent category if found
        if (parentCategory) {
          setParentCategory(parentCategory)
        }

        // Set form data
        setFormData({
          DEPT: categoryData.DEPT,
          TYP: categoryData.TYP,
          SUBTYP_1: categoryData.SUBTYP_1,
          SUBTYP_2: categoryData.SUBTYP_2,
          SUBTYP_3: categoryData.SUBTYP_3,
          CATEGORY_NAME: getCategoryName(categoryData),
          WEB_URL: categoryData.WEB_URL,
          ACTIVE: categoryData.ACTIVE,
          SHORT_DESC: categoryData.SHORT_DESC || '',
          LONG_DESCRIPTION: categoryData.LONG_DESCRIPTION || '',
          META_TAGS: categoryData.META_TAGS || '',
          SORT_POSITION: categoryData.SORT_POSITION || '',
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load category data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id, toast])

  // Helper function to get category name based on hierarchy
  const getCategoryName = (category: TaxonomyItem): string => {
    if (category.SUBTYP_3 !== 'EMPTY') return category.SUBTYP_3
    if (category.SUBTYP_2 !== 'EMPTY') return category.SUBTYP_2
    if (category.SUBTYP_1 !== 'EMPTY') return category.SUBTYP_1
    if (category.TYP !== 'EMPTY') return category.TYP
    return category.DEPT
  }

  // Function to determine the next level in the hierarchy
  const getNextLevel = (parent: TaxonomyItem): keyof CategoryFormData => {
    if (parent.DEPT !== 'EMPTY' && parent.TYP === 'EMPTY') return 'TYP'
    if (parent.TYP !== 'EMPTY' && parent.SUBTYP_1 === 'EMPTY') return 'SUBTYP_1'
    if (parent.SUBTYP_1 !== 'EMPTY' && parent.SUBTYP_2 === 'EMPTY') return 'SUBTYP_2'
    if (parent.SUBTYP_2 !== 'EMPTY' && parent.SUBTYP_3 === 'EMPTY') return 'SUBTYP_3'
    return 'DEPT'
  }

  // Function to generate URL-friendly string
  const generateUrlSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Update web URL whenever category name or parent changes
  useEffect(() => {
    if (formData.CATEGORY_NAME) {
      const categorySlug = generateUrlSlug(formData.CATEGORY_NAME)
      const newWebUrl = parentCategory?.WEB_URL
        ? `${parentCategory.WEB_URL}-${categorySlug}`
        : categorySlug
      setFormData((prev) => ({ ...prev, WEB_URL: newWebUrl }))
    }
  }, [formData.CATEGORY_NAME, parentCategory?.WEB_URL])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare the data for submission
      const submitData = {
        ...formData,
        // If there's a parent category, use its hierarchy and add the new category name
        ...(parentCategory
          ? {
              DEPT: parentCategory.DEPT,
              TYP: parentCategory.TYP,
              SUBTYP_1: parentCategory.SUBTYP_1,
              SUBTYP_2: parentCategory.SUBTYP_2,
              SUBTYP_3: parentCategory.SUBTYP_3,
              [getNextLevel(parentCategory)]: formData.CATEGORY_NAME,
            }
          : {
              // If no parent, it's a top-level category
              DEPT: formData.CATEGORY_NAME,
              TYP: 'EMPTY',
              SUBTYP_1: 'EMPTY',
              SUBTYP_2: 'EMPTY',
              SUBTYP_3: 'EMPTY',
            }),
        // Remove CATEGORY_NAME as it's not a database field
        CATEGORY_NAME: undefined,
      }

      const response = await fetch(`/api/admin/catalog/categories/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update category')
      }

      toast({
        title: 'Success',
        description: 'Category updated successfully',
      })

      router.push('/admin/catalog/categories')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update category. Please try again.')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update category',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add this function to build the category tree
  const buildCategoryTree = (items: TaxonomyItem[]) => {
    const tree: { [key: string]: TaxonomyItem[] } = {}

    // Group items by their hierarchy level
    items.forEach((item) => {
      const key = `${item.DEPT}-${item.TYP}-${item.SUBTYP_1}-${item.SUBTYP_2}-${item.SUBTYP_3}`
      if (!tree[key]) {
        tree[key] = []
      }
      tree[key].push(item)
    })

    return tree
  }

  // Add this function to render category options
  const renderCategoryOptions = (items: TaxonomyItem[]) => {
    const tree = buildCategoryTree(items)
    const options: React.ReactElement[] = []

    Object.entries(tree).forEach(([key, items]) => {
      const mainItem = items[0]
      const hierarchy = []
      let level = ''

      // Only process active categories
      if (mainItem.ACTIVE === 1) {
        if (mainItem.DEPT && mainItem.DEPT !== 'EMPTY') {
          hierarchy.push(mainItem.DEPT)
          level = 'Category'
        }
        if (mainItem.TYP && mainItem.TYP !== 'EMPTY') {
          hierarchy.push(mainItem.TYP)
          level = 'Type'
        }
        if (mainItem.SUBTYP_1 && mainItem.SUBTYP_1 !== 'EMPTY') {
          hierarchy.push(mainItem.SUBTYP_1)
          level = 'Subtype 1'
        }
        if (mainItem.SUBTYP_2 && mainItem.SUBTYP_2 !== 'EMPTY') {
          hierarchy.push(mainItem.SUBTYP_2)
          level = 'Subtype 2'
        }
        if (mainItem.SUBTYP_3 && mainItem.SUBTYP_3 !== 'EMPTY') {
          hierarchy.push(mainItem.SUBTYP_3)
          level = 'Subtype 3'
        }

        if (hierarchy.length > 0) {
          const label = hierarchy.join(' > ')
          options.push(
            <SelectItem
              key={mainItem.WEB_TAXONOMY_ID}
              value={mainItem.WEB_TAXONOMY_ID.toString()}
            >
              <div className='flex flex-col py-1'>
                <span className='font-medium'>{label}</span>
                <span className='text-xs text-gray-500'>
                  <span className='px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium'>
                    {level}
                  </span>
                </span>
              </div>
            </SelectItem>
          )
        }
      }
    })

    return options
  }

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, CATEGORY_NAME: value }))
  }

  const handleParentChange = (value: string) => {
    if (value === 'none') {
      setParentCategory(null)
      return
    }
    const selected = categories.find(
      (c) => c.WEB_TAXONOMY_ID.toString() === value
    )
    setParentCategory(selected || null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/20 via-transparent to-[#00437f]/20 rounded-full blur-xl"></div>
            <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-[#00437f]/20 border-t-[#00437f]"></div>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading category...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => router.back()}
                  className='h-10 w-10 bg-gradient-to-br from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl'
                >
                  <FiArrowLeft className='h-5 w-5' />
                </Button>
                <div>
                  <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>Edit Category</h1>
                  <p className='text-lg font-medium text-gray-600 dark:text-gray-300'>Update category information</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-11 px-8 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/40 rounded-xl'
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  size='sm'
                  disabled={isSubmitting}
                  className='h-11 px-10 text-sm font-medium bg-gradient-to-r from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl'
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className='h-4 w-4' />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl border border-red-200/50 dark:border-red-800/50 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <FiSettings className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-12 gap-6'>
            {/* Left Column - Main Category Details */}
            <div className='col-span-8 space-y-6'>
              {/* Basic Information */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                        <FiEdit className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Category name and hierarchy</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Category Name *
                        </label>
                        <Input
                          id="name"
                          value={formData.CATEGORY_NAME}
                          onChange={handleCategoryNameChange}
                          placeholder="Enter category name"
                          required
                          className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Enter a descriptive name for your category
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Parent Category
                        </label>
                        <Select
                          value={parentCategory?.WEB_TAXONOMY_ID.toString() || 'none'}
                          onValueChange={handleParentChange}
                        >
                          <SelectTrigger className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200">
                            <SelectValue placeholder="Select parent category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl shadow-xl">
                            <SelectItem value="none" className="hover:bg-[#00437f]/10 rounded-lg">
                              <div className="flex flex-col py-1">
                                <span className="font-medium">New Department (Top Level)</span>
                                <span className="text-xs text-gray-500">Create a new top-level category</span>
                              </div>
                            </SelectItem>
                            {renderCategoryOptions(categories)}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Choose a parent category or create a new top-level department
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Additional Information */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                        <FiGlobe className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Additional Information</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Provide additional details about your category</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Short Description
                        </label>
                        <Textarea
                          id="SHORT_DESC"
                          name="SHORT_DESC"
                          value={formData.SHORT_DESC}
                          onChange={handleInputChange}
                          placeholder="Enter short description"
                          className="min-h-[120px] px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200 resize-y"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          A brief description for quick reference
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Long Description
                        </label>
                        <Textarea
                          id="LONG_DESCRIPTION"
                          name="LONG_DESCRIPTION"
                          value={formData.LONG_DESCRIPTION}
                          onChange={handleInputChange}
                          placeholder="Enter long description"
                          className="min-h-[120px] px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200 resize-y"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Detailed description of the category
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Meta Tags
                        </label>
                        <Input
                          id="META_TAGS"
                          name="META_TAGS"
                          value={formData.META_TAGS}
                          onChange={handleInputChange}
                          placeholder="Enter meta tags"
                          className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          SEO keywords separated by commas
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Sort Position
                        </label>
                        <Input
                          id="SORT_POSITION"
                          name="SORT_POSITION"
                          value={formData.SORT_POSITION}
                          onChange={handleInputChange}
                          placeholder="Enter sort position"
                          className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Position in the category list (lower numbers appear first)
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column - Settings & Preview */}
            <div className='col-span-4 space-y-6'>
              {/* Settings Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                        <FiSettings className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Category status and visibility</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                        <div className="space-y-0.5">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Status
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Set the category as active or inactive
                          </p>
                        </div>
                        <Switch
                          checked={formData.ACTIVE === 1}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev) => ({
                              ...prev,
                              ACTIVE: e.target.checked ? 1 : 0,
                            }))
                          }}
                          className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Preview Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                        <FiFolder className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preview</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Category URL and structure</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Web URL
                        </label>
                        <div className="p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                          <p className="text-sm text-gray-600 dark:text-gray-400 break-all font-mono">
                            {formData.WEB_URL || 'Will be generated automatically'}
                          </p>
                        </div>
                      </div>
                      
                      {parentCategory && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Parent Category
                          </label>
                          <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                              {parentCategory.DEPT !== 'EMPTY' ? parentCategory.DEPT : ''}
                              {parentCategory.TYP !== 'EMPTY' ? ` > ${parentCategory.TYP}` : ''}
                              {parentCategory.SUBTYP_1 !== 'EMPTY' ? ` > ${parentCategory.SUBTYP_1}` : ''}
                              {parentCategory.SUBTYP_2 !== 'EMPTY' ? ` > ${parentCategory.SUBTYP_2}` : ''}
                              {parentCategory.SUBTYP_3 !== 'EMPTY' ? ` > ${parentCategory.SUBTYP_3}` : ''}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 