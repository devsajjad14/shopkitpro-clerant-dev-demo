'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FiArrowLeft, FiImage, FiPlus, FiTrash2, FiGlobe, FiSave, FiX, FiEdit, FiEdit2, FiDollarSign, FiPackage, FiTruck, FiTag, FiSettings, FiEye, FiSearch } from 'react-icons/fi'
import Image from 'next/image'
import { getAttributes } from '@/lib/actions/attributes'
import { getBrands } from '@/lib/actions/brands'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/lib/actions/products'
import { ProductImageUpload, ProductImageUploadRef } from '@/components/ProductImageUpload'
import { Label } from '@/components/ui/label'
import { addCacheBuster } from '@/lib/utils/image-utils'

interface ImageSet {
  large: string
  medium: string
  small: string
}

interface ProductImages {
  main: ImageSet | null
  alternates: string[]
}

interface ProductVariant {
  id: string
  title: string
  price: string
  sku: string
  inventory: string
  combinations: string[]
  barcode?: string
  available?: boolean
  colorImage?: string
}

interface ProductOption {
  id: string
  name: string
  values: string[]
}

interface Attribute {
  id: string
  name: string
  display: string
  values: { id: string; value: string }[]
}

interface Brand {
  id: number
  name: string
  alias: string
  status: string
}

interface FormData {
  title: string
  description: string
  price: string
  comparePrice: string
  sku: string
  barcode: string
  type: string
  status: string
  visibility: string
  featured: string
  category: string
  brand: string
  tags: string
  weight: string
  length: string
  width: string
  height: string
  seoTitle: string
  seoDescription: string
  seoUrl: string
  collections: string
  quantity: string
  trackQuantity: boolean
  hasSkuOrBarcode: boolean
  continueSellingWhenOutOfStock: boolean
  shopLocationQuantity: string
  styleId: string
}

interface TaxonomyItem {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  WEB_URL: string
  ACTIVE: number
}

export default function AddProductPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [productImages, setProductImages] = useState<ProductImages>({
    main: null,
    alternates: [],
  })
  const [options, setOptions] = useState<ProductOption[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [currentOption, setCurrentOption] = useState<ProductOption>({
    id: '',
    name: '',
    values: [''],
  })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    comparePrice: '',
    sku: '',
    barcode: '',
    type: '',
    status: 'active',
    visibility: 'online',
    featured: 'no',
    category: '',
    brand: '',
    tags: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    seoTitle: '',
    seoDescription: '',
    seoUrl: '',
    collections: '',
    quantity: '',
    trackQuantity: false,
    hasSkuOrBarcode: false,
    continueSellingWhenOutOfStock: false,
    shopLocationQuantity: '0',
    styleId: Math.floor(Math.random() * 1000000).toString(),
  })

  const [taxonomyItems, setTaxonomyItems] = useState<TaxonomyItem[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  const router = useRouter()
  const imageUploadRef = useRef<ProductImageUploadRef>(null)

  // Add loading state for save button
  const [isSaving, setIsSaving] = useState(false)

  const [excludedCombinations, setExcludedCombinations] = useState<string[][]>([])

  const [colorImages, setColorImages] = useState<{ [color: string]: File | string | null }>({})
  const [colorImagePreviews, setColorImagePreviews] = useState<{ [color: string]: string | null }>({})

  function generateCombinations(options: ProductOption[]): string[][] {
    if (options.length === 0) return []
    if (options.length === 1) return options[0].values.map(v => [v])
    // Default: full matrix
    const values = options.map((option) => option.values)
    const combinations: string[][] = []

    function generate(current: string[], index: number) {
      if (index === values.length) {
        combinations.push([...current])
        return
      }
      for (const value of values[index]) {
        current[index] = value
        generate(current, index + 1)
      }
    }

    generate([], 0)
    return combinations
  }

  // Move these to component scope
  const colorIdx = options.findIndex(opt => opt.name.toLowerCase() === 'color')
  const sizeIdx = options.findIndex(opt => opt.name.toLowerCase() === 'size')

  // Compute visible combinations for the Color Images section
  const allCombinations = generateCombinations(options)
  const visibleCombinations = allCombinations.filter(
    (combination: string[]) =>
      !excludedCombinations.some((excluded) =>
        excluded.length === combination.length &&
        excluded.every((val, i) => val === combination[i])
      )
  )

  useEffect(() => {
    loadAttributes()
    loadBrands()
    const fetchTaxonomy = async () => {
      try {
        const response = await fetch('/api/admin/catalog/categories')
        if (!response.ok) throw new Error('Failed to fetch taxonomy')
        const data = await response.json()
        setTaxonomyItems(data)
      } catch (error) {
        console.error('Error fetching taxonomy:', error)
      }
    }
    fetchTaxonomy()
  }, [])

  const loadAttributes = async () => {
    const data = await getAttributes()
    setAttributes(data)
  }

  const loadBrands = async () => {
    try {
      const response = await getBrands()
      if (response.success && response.data) {
        setBrands(response.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const startEditing = () => {
    setCurrentOption({
      id: Date.now().toString(),
      name: '',
      values: [''],
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setCurrentOption({
      id: '',
      name: '',
      values: [''],
    })
  }

  const handleOptionNameChange = (attributeId: string) => {
    const selectedAttribute = attributes.find((attr) => attr.id === attributeId)
    if (selectedAttribute) {
      // If we're editing an existing option, preserve the current values
      // Only set new values if this is a new option (no existing values)
      const shouldSetNewValues = currentOption.values.length === 0 || 
        (currentOption.values.length === 1 && currentOption.values[0] === '')
      
      setCurrentOption({
        ...currentOption,
        name: selectedAttribute.name,
        values: shouldSetNewValues ? selectedAttribute.values.map((v) => v.value) : currentOption.values,
      })
    }
  }

  const saveOption = () => {
    if (currentOption.name && currentOption.values.length > 0) {
      // Filter out empty values before saving
      const filteredValues = currentOption.values.filter(value => value.trim() !== '')
      
      if (filteredValues.length === 0) {
        alert('Please add at least one value for this option')
        return
      }
      
      setOptions(prevOptions => {
        // Find existing option by name (case-insensitive)
        const existingOptionIndex = prevOptions.findIndex(opt => 
          opt.name.toLowerCase() === currentOption.name.toLowerCase()
        )
        
        if (existingOptionIndex >= 0) {
          // Merge with existing option
          const existingOption = prevOptions[existingOptionIndex]
          const mergedValues = [...new Set([...existingOption.values, ...filteredValues])]
          
          const newOptions = [...prevOptions]
          newOptions[existingOptionIndex] = {
            ...existingOption,
            values: mergedValues
          }
          return newOptions
        } else {
          // Add as new option
          const newOption = {
            ...currentOption,
            values: filteredValues
          }
          return [...prevOptions, newOption]
        }
      })
      cancelEditing()
    }
  }

  const handleVariantImageChange = (variantId: string, imageUrl: string) => {
    setVariants((prevVariants) => {
      const newVariants = [...prevVariants]
      const variantIndex = newVariants.findIndex((v) => v.id === variantId)

      if (variantIndex >= 0) {
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          colorImage: imageUrl,
        }
      } else {
        newVariants.push({
          id: variantId,
          title: '',
          price: '',
          sku: '',
          inventory: '',
          combinations: [],
          barcode: '',
          available: true,
          colorImage: imageUrl,
        })
      }

      return newVariants
    })
  }

  const handleColorImageSelect = (color: string, file: File) => {
    setColorImages(prev => ({ ...prev, [color]: file }))
    setColorImagePreviews(prev => ({ ...prev, [color]: URL.createObjectURL(file) }))
  }

  const handleColorImageRemove = (color: string) => {
    setColorImages(prev => ({ ...prev, [color]: null }))
    setColorImagePreviews(prev => ({ ...prev, [color]: null }))
  }

  // Enhanced delete variant function with full sync
  const handleDeleteVariant = (combination: string[]) => {
    
    // Update excluded combinations
    const newExcludedCombinations = [...excludedCombinations, combination]
    setExcludedCombinations(newExcludedCombinations)
    
    // Calculate visible combinations with the new excluded list
    const visibleCombinations = generateCombinations(options).filter(
      (combo) =>
        !newExcludedCombinations.some((excluded) =>
          excluded.length === combo.length &&
          excluded.every((val, i) => val === combo[i])
        )
    )

    // Get all unique values used in visible combinations for each option
    const usedValues: { [optionName: string]: Set<string> } = {}
    
    visibleCombinations.forEach(combo => {
      combo.forEach((value, index) => {
        const optionName = options[index]?.name
        if (optionName) {
          if (!usedValues[optionName]) {
            usedValues[optionName] = new Set()
          }
          usedValues[optionName].add(value)
        }
      })
    })

    // Update options to only include values that are actually used
    const updatedOptions = options.map(option => ({
      ...option,
      values: option.values.filter(value => 
        usedValues[option.name]?.has(value) ?? false
      )
    }))

    // Remove color images for colors that are no longer used
    const usedColors = usedValues['color'] || new Set()
    const currentColors = Object.keys(colorImages)
    
    const updatedColorImages = { ...colorImages }
    const updatedColorImagePreviews = { ...colorImagePreviews }
    
    currentColors.forEach(color => {
      if (!usedColors.has(color)) {
        updatedColorImages[color] = null
        updatedColorImagePreviews[color] = null
      }
    })

    // Update all states synchronously
    setOptions(updatedOptions)
    setColorImages(updatedColorImages)
    setColorImagePreviews(updatedColorImagePreviews)
    
  }

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      if (!formData.title) {
        alert('Please enter a product title')
        return
      }

      // Upload images first and get the result
      let finalImages = productImages
      if (imageUploadRef.current) {
        finalImages = await imageUploadRef.current.uploadAllImages()
        setProductImages(finalImages)
      }

      // Find the selected brand
      const selectedBrand = brands.find(brand => brand.id.toString() === formData.brand)

      const generateUrlHandle = (title: string) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }

      const hasColorOption = options.some(
        (opt) => opt.name.toLowerCase() === 'color'
      )

      const allCombinations = generateCombinations(options)
      // Only include visible combinations (not excluded)
      const visibleCombinations = allCombinations.filter(
        (combination) =>
          !excludedCombinations.some((excluded) =>
            excluded.length === combination.length &&
            excluded.every((val, i) => val === combination[i])
          )
      )

      // Before building productData, upload all color images if needed
      const uploadedColorImages: { [key: string]: string } = {}
      
      // Get unique colors from all combinations
      const uniqueColors = new Set<string>()
      for (const combination of visibleCombinations) {
        const colorValue = colorIdx !== -1 && combination.length > colorIdx ? combination[colorIdx] : ''
        if (colorValue) {
          uniqueColors.add(colorValue)
        }
      }
      
      // Upload one image per color
      for (const colorValue of uniqueColors) {
        const file = colorImages[colorValue]
        if (file && typeof file !== 'string') {
          // Upload file for this color
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          uploadFormData.append('styleId', formData.styleId)
          uploadFormData.append('isVariant', 'true')
          uploadFormData.append('color', colorValue)
          uploadFormData.append('size', '') // No specific size for Option 1
          const response = await fetch('/api/upload/product-platform-asset', {
            method: 'POST',
            body: uploadFormData,
          })
          if (response.ok) {
            const data = await response.json()
            uploadedColorImages[colorValue] = addCacheBuster(data.mainImage)
          }
        } else if (typeof file === 'string') {
          uploadedColorImages[colorValue] = file
        }
      }

      const productData = {
        styleId: parseInt(formData.styleId),
        name: formData.title,
        style: formData.type || '',
        quantityAvailable: parseInt(formData.quantity) || 0,
        onSale: parseFloat(formData.price) < parseFloat(formData.comparePrice) ? 'Y' : 'N',
        isNew: 'Y',
        smallPicture: finalImages.main?.small || '',
        mediumPicture: finalImages.main?.medium || '',
        largePicture: finalImages.main?.large || '',
        department: formData.category || '',
        type: formData.type || '',
        subType: '',
        brand: selectedBrand?.name || '',
        sellingPrice: parseFloat(formData.price) || 0,
        regularPrice: parseFloat(formData.comparePrice) || 0,
        longDescription: formData.description || '',
        of7: formData.featured || 'no',
        of12: formData.length || null,
        of13: formData.width || null,
        of15: formData.height || null,
        forceBuyQtyLimit: null,
        lastReceived: null,
        urlHandle: generateUrlHandle(formData.title),
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .join(','),
        barcode: formData.barcode || '',
        sku: formData.hasSkuOrBarcode ? formData.sku : '',
        trackInventory: formData.trackQuantity === true,
        continueSellingOutOfStock: formData.continueSellingWhenOutOfStock === true,
        stockQuantity: parseInt(formData.quantity) || 0,
        // New schema: Create product attributes first
        productAttributes: options.map(option => {
          const attribute = attributes.find(attr => attr.name === option.name)
          if (!attribute) return null
          return {
            attributeId: attribute.id,
            attributeValues: option.values.map(value => {
              const attrValue = attribute.values.find(v => v.value === value)
              return {
                attributeValueId: attrValue?.id || value,
                value: value
              }
            })
          }
        }).filter((attr): attr is NonNullable<typeof attr> => attr !== null),
        // New schema: Create variations with attributes
        variations: visibleCombinations.map((combination) => {
          // Find existing variant that matches this combination
          const existingVariant = variants.find(
            (v) =>
              v.combinations.length === combination.length &&
              v.combinations.every((val, i) => val === combination[i])
          )

          // Always get price from variants array (UI source of truth)
          let price = 0
          if (existingVariant && existingVariant.price !== undefined) {
            price = parseFloat(existingVariant.price) || 0
          }

          const colorValue = colorIdx !== -1 && combination.length > colorIdx ? combination[colorIdx] : ''
          const sizeValue = sizeIdx !== -1 && combination.length > sizeIdx ? combination[sizeIdx] : ''
          
          const variant = existingVariant || {
            id: `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: combination[0],
            price: '',
            sku: '',
            inventory: '',
            combinations: combination,
            barcode: '',
            available: true,
            colorImage: '',
          }

          return {
            skuId: existingVariant
              ? parseInt(existingVariant.sku) || Math.floor(Math.random() * 1000000)
              : Math.floor(Math.random() * 1000000),
            quantity: existingVariant ? parseInt(existingVariant.inventory) || 0 : 0,
            colorImage: uploadedColorImages[colorValue] || '',
            sku: existingVariant?.sku || '',
            barcode: existingVariant?.barcode || formData.barcode || '',
            available: existingVariant ? existingVariant.available || true : true,
            price: price,
            // New schema: Link variation to its attributes
            variantAttributes: combination.map((value, index) => {
              const option = options[index]
              const attribute = attributes.find(attr => attr.name === option.name)
              if (!attribute) return null
              const attrValue = attribute.values.find(v => v.value === value)
              return {
                attributeId: attribute.id,
                attributeValueId: attrValue?.id || value,
                value: value
              }
            }).filter((attr): attr is NonNullable<typeof attr> => attr !== null)
          }
        }),
        alternateImages: finalImages.alternates.map((image) => ({
          AltImage: image,
        })),
      }

      const response = await createProduct(productData)

      if (response.success) {
        router.push('/admin/catalog/products')
      } else {
        alert(response.error || 'Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Failed to add product')
    } finally {
      setIsSaving(false)
    }
  }

  const buildCategoryTree = (items: TaxonomyItem[]) => {
    const tree: { [key: string]: TaxonomyItem[] } = {}

    items.forEach((item) => {
      const key = `${item.DEPT}-${item.TYP}-${item.SUBTYP_1}-${item.SUBTYP_2}-${item.SUBTYP_3}`
      if (!tree[key]) {
        tree[key] = []
      }
      tree[key].push(item)
    })

    return tree
  }

  const renderCategoryOptions = (items: TaxonomyItem[]) => {
    const tree = buildCategoryTree(items)
    const options: React.ReactElement[] = []

    Object.entries(tree).forEach(([key, items]) => {
      const mainItem = items[0]
      const hierarchy = []
      let level = ''

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
            <option
              key={mainItem.WEB_TAXONOMY_ID}
              value={mainItem.WEB_TAXONOMY_ID.toString()}
            >
              {label} ({level})
            </option>
          )
        }
      }
    })

    return options
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
                  <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>Add Product</h1>
                  <p className='text-lg font-medium text-gray-600 dark:text-gray-300'>
                    Create a new product in your store
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-11 px-6 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/40 rounded-xl'
                  onClick={() => router.back()}
                >
                  <FiX className="h-4 w-4" />
                  Discard
                </Button>
                <Button
                  size='sm'
                  disabled={isSaving}
                  className='h-11 px-8 text-sm font-medium bg-gradient-to-r from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl'
                  onClick={handleSubmit}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8 space-y-8">
            {/* Basic Information Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiEdit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Basic Information</h3>
                    <p className="text-gray-600 dark:text-gray-300">Product name and description</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      Product Name
                    </Label>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      className="h-12 px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50"
                    />
                  </div>
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      Description
                    </Label>
                    <Textarea
                      name='description'
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder='Enter product description'
                      rows={4}
                      className='px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50 resize-y'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media Section Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiImage className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Media</h3>
                    <p className="text-gray-600 dark:text-gray-300">Product images and media</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <ProductImageUpload
                    styleId={parseInt(formData.styleId)}
                    onImagesChange={setProductImages}
                    ref={imageUploadRef}
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing</h3>
                    <p className="text-gray-600 dark:text-gray-300">Product pricing and costs</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                        Price *
                      </Label>
                      <Input
                        name='price'
                        type='number'
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder='0.00'
                        required
                        className='h-12 px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                      />
                    </div>
                    <div>
                      <div className='flex items-center gap-1 mb-3'>
                        <Label className='block text-lg font-semibold text-gray-900 dark:text-white'>
                          Compare at Price
                        </Label>
                        <div className='relative group'>
                          <FiGlobe className='h-4 w-4 text-gray-400 cursor-help' />
                          <div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block'>
                            <div className='bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap'>
                              To display markdown, enter a value higher than your
                              price. Often shown with a strikethrough
                              <div className='absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900'></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Input
                        name='comparePrice'
                        type='number'
                        value={formData.comparePrice}
                        onChange={handleInputChange}
                        placeholder='0.00'
                        className='h-12 px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Section Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiPackage className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h3>
                    <p className="text-gray-600 dark:text-gray-300">Stock management and tracking</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        id='trackQuantity'
                        name='trackQuantity'
                        checked={formData.trackQuantity}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            trackQuantity: e.target.checked,
                          }))
                        }}
                        className='h-4 w-4 rounded border-gray-300 text-[#00437f] focus:ring-[#00437f]'
                      />
                      <label
                        htmlFor='trackQuantity'
                        className='text-sm font-medium text-gray-700 dark:text-gray-300'
                      >
                        Track quantity
                      </label>
                    </div>

                    {formData.trackQuantity && (
                      <div className='pl-7 space-y-4 border-l-2 border-[#00437f]/20'>
                        <div className='flex items-center justify-between gap-4'>
                          <label className='text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap'>
                            Quantity
                          </label>
                          <div className='flex-1 max-w-[200px]'>
                            <Input
                              name='quantity'
                              type='number'
                              value={formData.quantity}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  quantity: e.target.value,
                                }))
                              }}
                              placeholder='0'
                              className='w-full h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                            />
                          </div>
                        </div>

                        <div className='flex items-center gap-3'>
                          <input
                            type='checkbox'
                            id='continueSellingWhenOutOfStock'
                            name='continueSellingWhenOutOfStock'
                            checked={formData.continueSellingWhenOutOfStock}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                continueSellingWhenOutOfStock: e.target.checked,
                              }))
                            }}
                            className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                          />
                          <label
                            htmlFor='continueSellingWhenOutOfStock'
                            className='text-sm font-medium text-gray-700'
                          >
                            Continue selling when out of stock
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='space-y-4 pt-4 border-t border-gray-100'>
                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        id='hasSkuOrBarcode'
                        name='hasSkuOrBarcode'
                        checked={formData.hasSkuOrBarcode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasSkuOrBarcode: e.target.checked,
                          }))
                        }
                        className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <label
                        htmlFor='hasSkuOrBarcode'
                        className='text-sm font-medium text-gray-700'
                      >
                        This product has a SKU or barcode
                      </label>
                    </div>

                    {formData.hasSkuOrBarcode && (
                      <div className='pl-7 space-y-4 border-l-2 border-gray-100 ml-1.5'>
                        <div className='grid grid-cols-2 gap-6'>
                          <div>
                            <label className='block text-base font-medium text-gray-700 mb-2'>
                              SKU (Stock Keeping Unit)
                            </label>
                            <Input
                              name='sku'
                              value={formData.sku}
                              onChange={handleInputChange}
                              placeholder='Enter SKU'
                              className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                            />
                          </div>
                          <div>
                            <label className='block text-base font-medium text-gray-700 mb-2'>
                              Barcode (ISBN, UPC, GTIN, etc.)
                            </label>
                            <Input
                              name='barcode'
                              value={formData.barcode}
                              onChange={handleInputChange}
                              placeholder='Enter barcode'
                              className='h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Section Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiTruck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping</h3>
                    <p className="text-gray-600 dark:text-gray-300">Product shipping and dimensions</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      Weight
                    </Label>
                    <Input
                      name='weight'
                      type='number'
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder='0.0'
                      className='h-12 px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                    />
                  </div>
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      Dimensions
                    </Label>
                    <div className='grid grid-cols-3 gap-2'>
                      <Input
                        name='length'
                        value={formData.length}
                        onChange={handleInputChange}
                        placeholder='Length'
                        className='h-12 px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                      />
                      <Input
                        name='width'
                        value={formData.width}
                        onChange={handleInputChange}
                        placeholder='Width'
                        className='h-12 px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                      />
                      <Input
                        name='height'
                        value={formData.height}
                        onChange={handleInputChange}
                        placeholder='Height'
                        className='h-12 px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variants Section Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiSettings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Variants</h3>
                    <p className="text-gray-600 dark:text-gray-300">Add options like size or color to create variants of this product</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {isEditing && (
                    <div className='mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm'>
                      <div className='space-y-6'>
                        <div>
                          <label className='block text-base font-medium text-gray-700 mb-2'>
                            Option name *
                          </label>
                          <select
                            value={currentOption.name}
                            onChange={(e) => handleOptionNameChange(e.target.value)}
                            className='w-full h-10 px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                          >
                            <option value=''>Select an attribute</option>
                            {attributes.map((attr) => (
                              <option key={attr.id} value={attr.id}>
                                {attr.display}
                              </option>
                            ))}
                          </select>
                        </div>

                        {currentOption.name && (
                          <div>
                            <label className='block text-base font-medium text-gray-700 mb-2'>
                              Option values *
                            </label>
                            <div className='space-y-3'>
                              {currentOption.values.map((value, index) => (
                                <div key={index} className='flex items-center gap-3'>
                                  <Input
                                    value={value}
                                    onChange={(e) => {
                                      const newValues = [...currentOption.values]
                                      newValues[index] = e.target.value
                                      setCurrentOption({
                                        ...currentOption,
                                        values: newValues
                                      })
                                    }}
                                    className='h-10 px-4 text-base border border-gray-300 bg-white rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                                  />
                                  {currentOption.values.length > 1 && (
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      onClick={() => {
                                        setCurrentOption({
                                          ...currentOption,
                                          values: currentOption.values.filter((_, i) => i !== index),
                                        })
                                      }}
                                      className='text-red-600 hover:text-red-700'
                                    >
                                      <FiTrash2 className='h-4 w-4' />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  setCurrentOption({
                                    ...currentOption,
                                    values: [...currentOption.values, '']
                                  })
                                }}
                                className='text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                              >
                                <FiPlus className='mr-2 h-4 w-4' />
                                Add Value
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className='flex justify-end gap-3 pt-4 border-t'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={cancelEditing}
                            className='text-gray-600 hover:text-red-500'
                          >
                            Cancel
                          </Button>
                          <Button
                            size='sm'
                            onClick={saveOption}
                            disabled={!currentOption.name}
                            className='bg-blue-600 hover:bg-blue-700 text-white'
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isEditing && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={startEditing}
                      className='mt-4 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                    >
                      <FiPlus className='mr-2 h-4 w-4' />
                      Add another option
                    </Button>
                  )}

                  {/* Current Options List */}
                  {options.length > 0 && (
                    <div className='mt-6'>
                      <h4 className='font-medium text-gray-900 mb-3'>Current Options</h4>
                      <div className='space-y-2'>
                        {options.map((option, optionIdx) => (
                          <div
                            key={option.id}
                            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'
                          >
                            <div>
                              <span className='font-medium text-gray-900'>{option.name}</span>
                              <span className='text-sm text-gray-500 ml-2'>
                                ({option.values.join(', ')})
                              </span>
                            </div>
                            <div className='flex gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  // Start editing this existing option
                                  setCurrentOption({
                                    id: option.id,
                                    name: option.name,
                                    values: [...option.values]
                                  })
                                  setIsEditing(true)
                                }}
                                className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                              >
                                <FiEdit className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  const newOptions = options.filter(o => o.id !== option.id)
                                  setOptions(newOptions)
                                  // Recompute variants
                                  const newCombinations = generateCombinations(newOptions)
                                  setVariants(prevVariants =>
                                    newCombinations.map(combination => {
                                      // Try to find a matching variant from previous variants
                                      const existing = prevVariants.find(v =>
                                        v.combinations.length === combination.length &&
                                        v.combinations.every((val, i) => val === combination[i])
                                      )
                                      return existing || {
                                        id: `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                        title: combination[0],
                                        price: '',
                                        sku: '',
                                        inventory: '',
                                        combinations: combination,
                                        barcode: '',
                                        available: true,
                                        colorImage: '',
                                      }
                                    })
                                  )
                                }}
                                className='text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                <FiTrash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {options.length > 0 && (
                    <div className='mt-8'>
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='font-medium text-gray-900'>Variants</h4>
                        <div className='text-sm text-gray-500'>
                          {generateCombinations(options).length} variants
                        </div>
                      </div>
                      <div className='overflow-x-auto'>
                        <table className='w-full'>
                          <thead>
                            <tr className='border-b'>
                              {options.map((option) => (
                                <th key={option.id} className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                                  {option.name}
                                </th>
                              ))}
                              <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>Price</th>
                              <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>SKU</th>
                              <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>Inventory</th>
                              <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>Available</th>
                              <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generateCombinations(options)
                              .filter(
                                (combination) =>
                                  !excludedCombinations.some((excluded) =>
                                    excluded.length === combination.length &&
                                    excluded.every((val, i) => val === combination[i])
                                  )
                              )
                              .map((combination, index) => {
                                const existingVariant = variants.find(
                                  (v) =>
                                    v.combinations.length === combination.length &&
                                    v.combinations.every((val, i) => val === combination[i])
                                )
                                const variant = existingVariant || {
                                  id: `new-${Date.now()}-${index}`,
                                  title: combination[0],
                                  price: '',
                                  sku: '',
                                  inventory: '',
                                  combinations: combination,
                                  barcode: '',
                                  available: true,
                                  colorImage: '',
                                }
                                const colorValue = colorIdx !== -1 && combination.length > colorIdx ? combination[colorIdx] : ''
                                const sizeValue = sizeIdx !== -1 && combination.length > sizeIdx ? combination[sizeIdx] : ''
                                return (
                                  <tr key={index} className='border-b last:border-b-0 hover:bg-gray-50'>
                                    {combination.map((value, valueIndex) => (
                                      <td key={valueIndex} className='px-4 py-3 text-sm text-gray-900'>
                                        {value}
                                      </td>
                                    ))}
                                    <td className='px-4 py-3'>
                                      <Input
                                        type='number'
                                        value={variant.price}
                                        onChange={(e) => {
                                          const newVariants = [...variants]
                                          const existingIndex = newVariants.findIndex(
                                            (v) =>
                                              v.combinations.length ===
                                                combination.length &&
                                              v.combinations.every(
                                                (val, i) => val === combination[i]
                                              )
                                          )
                                          if (existingIndex >= 0) {
                                            newVariants[existingIndex] = {
                                              ...newVariants[existingIndex],
                                              price: e.target.value,
                                            }
                                          } else {
                                            newVariants.push({
                                              ...variant,
                                              price: e.target.value,
                                            })
                                          }
                                          setVariants(newVariants)
                                        }}
                                        className='w-full'
                                      />
                                    </td>
                                    <td className='px-4 py-3'>
                                      <Input
                                        value={variant.sku}
                                        onChange={(e) => {
                                          const newVariants = [...variants]
                                          const existingIndex = newVariants.findIndex(
                                            (v) =>
                                              v.combinations.length ===
                                                combination.length &&
                                              v.combinations.every(
                                                (val, i) => val === combination[i]
                                              )
                                          )
                                          if (existingIndex >= 0) {
                                            newVariants[existingIndex] = {
                                              ...newVariants[existingIndex],
                                              sku: e.target.value,
                                            }
                                          } else {
                                            newVariants.push({
                                              ...variant,
                                              sku: e.target.value,
                                            })
                                          }
                                          setVariants(newVariants)
                                        }}
                                        className='w-full'
                                      />
                                    </td>
                                    <td className='px-4 py-3'>
                                      <Input
                                        type='number'
                                        value={variant.inventory}
                                        onChange={(e) => {
                                          const newVariants = [...variants]
                                          const existingIndex = newVariants.findIndex(
                                            (v) =>
                                              v.combinations.length ===
                                                combination.length &&
                                              v.combinations.every(
                                                (val, i) => val === combination[i]
                                              )
                                          )
                                          if (existingIndex >= 0) {
                                            newVariants[existingIndex] = {
                                              ...newVariants[existingIndex],
                                              inventory: e.target.value,
                                            }
                                          } else {
                                            newVariants.push({
                                              ...variant,
                                              inventory: e.target.value,
                                            })
                                          }
                                          setVariants(newVariants)
                                        }}
                                        className='w-full'
                                      />
                                    </td>
                                    <td className='px-4 py-3'>
                                      <input
                                        type='checkbox'
                                        checked={variant.available === true}
                                        onChange={(e) => {
                                          const newVariants = [...variants]
                                          const existingIndex = newVariants.findIndex(
                                            (v) =>
                                              v.combinations.length ===
                                                combination.length &&
                                              v.combinations.every(
                                                (val, i) => val === combination[i]
                                              )
                                          )
                                          if (existingIndex >= 0) {
                                            newVariants[existingIndex] = {
                                              ...newVariants[existingIndex],
                                              available: e.target.checked,
                                            }
                                          } else {
                                            newVariants.push({
                                              ...variant,
                                              available: e.target.checked,
                                            })
                                          }
                                          setVariants(newVariants)
                                        }}
                                        className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                      />
                                    </td>
                                    <td className='px-4 py-3'>
                                      <Button
                                        variant='destructive'
                                        size='icon'
                                        onClick={() => {
                                          handleDeleteVariant(combination)
                                        }}
                                        aria-label='Delete variant'
                                      >
                                        <FiTrash2 className='h-4 w-4' />
                                      </Button>
                                    </td>
                                  </tr>
                                )
                              })}
                          </tbody>
                        </table>
                      </div>

                      {/* Color Images Section - Part of Variants */}
                      {options.some(opt => opt.name.toLowerCase() === 'color') && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-base font-medium text-gray-900">Color Images</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Upload one image per color. This image will be used for all sizes of that color.
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {(() => {
                                // Get unique colors from VISIBLE variants only (not all options)
                                const visibleCombinations = generateCombinations(options).filter(
                                  (combination) =>
                                    !excludedCombinations.some((excluded) =>
                                      excluded.length === combination.length &&
                                      excluded.every((val, i) => val === combination[i])
                                    )
                                )
                                
                                const colorIdx = options.findIndex(opt => opt.name.toLowerCase() === 'color')
                                if (colorIdx === -1) return null
                                
                                // Get unique colors from visible combinations only
                                const usedColors = new Set<string>()
                                visibleCombinations.forEach(combination => {
                                  if (combination[colorIdx]) {
                                    usedColors.add(combination[colorIdx])
                                  }
                                })
                                
                                return Array.from(usedColors).map((colorValue) => {
                                  // Get all sizes that use this color
                                  const sizesUsingThisColor = visibleCombinations
                                    .filter((combination: string[]) => {
                                      return combination[colorIdx] === colorValue
                                    })
                                    .map((combination: string[]) => {
                                      const sizeIdx = options.findIndex(opt => opt.name.toLowerCase() === 'size')
                                      return sizeIdx !== -1 ? combination[sizeIdx] : null
                                    })
                                    .filter((size): size is string => size !== null)
                                    .filter((size: string, index: number, arr: string[]) => arr.indexOf(size) === index) // unique sizes
                                
                                  return (
                                    <div key={colorValue} className="space-y-2">
                                      <div className="relative aspect-square w-full group">
                                        {colorImagePreviews[colorValue] ? (
                                          <Image
                                            src={colorImagePreviews[colorValue]}
                                            alt={`${colorValue} color image`}
                                            fill
                                            className="object-cover rounded-lg border"
                                            unoptimized
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                                            <FiImage className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-xs text-gray-500 text-center">Upload {colorValue} image</span>
                                          </div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                          {colorValue}
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                          <div
                                            onClick={() => {
                                              const input = document.createElement('input')
                                              input.type = 'file'
                                              input.accept = 'image/*'
                                              input.onchange = (e) => {
                                                const file = (e.target as HTMLInputElement).files?.[0]
                                                if (file) {
                                                  handleColorImageSelect(colorValue, file)
                                                }
                                              }
                                              input.click()
                                            }}
                                          >
                                            <Button variant="secondary" size="icon" className="h-8 w-8">
                                              <FiEdit2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                          {colorImagePreviews[colorValue] && (
                                            <Button
                                              variant="destructive"
                                              size="icon"
                                              onClick={() => handleColorImageRemove(colorValue)}
                                              className="h-8 w-8"
                                            >
                                              <FiX className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-xs text-center text-muted-foreground">
                                        <div className="font-medium">{colorValue}</div>
                                        <div>Used for: {sizesUsingThisColor.join(', ')}</div>
                                      </div>
                                    </div>
                                  )
                                })
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Section Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiEye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">SEO</h3>
                    <p className="text-gray-600 dark:text-gray-300">Search engine optimization</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      Page title
                    </Label>
                    <Input
                      name='seoTitle'
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      placeholder='Enter page title'
                      className='h-12 px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                    />
                  </div>
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      Meta description
                    </Label>
                    <Textarea
                      name='seoDescription'
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      placeholder='Enter meta description'
                      rows={3}
                      className='px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50 resize-y'
                    />
                  </div>
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      URL and handle
                    </Label>
                    <Input
                      name='seoUrl'
                      value={formData.seoUrl}
                      onChange={handleInputChange}
                      placeholder='Enter URL handle'
                      className='h-12 px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-4 space-y-8">
            {/* Status Section Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiTag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Status</h3>
                    <p className="text-gray-600 dark:text-gray-300">Product status and visibility</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      Status
                    </Label>
                    <select
                      name='status'
                      value={formData.status}
                      onChange={handleInputChange}
                      className='w-full h-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-base focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                    >
                      <option value='draft'>Draft</option>
                      <option value='active'>Active</option>
                      <option value='archived'>Archived</option>
                    </select>
                  </div>
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      Visibility
                    </Label>
                    <select
                      name='visibility'
                      value={formData.visibility}
                      onChange={handleInputChange}
                      className='w-full h-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-base focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                    >
                      <option value='online'>Online Store</option>
                      <option value='hidden'>Hidden</option>
                    </select>
                  </div>
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      Featured
                    </Label>
                    <select
                      name='featured'
                      value={formData.featured}
                      onChange={handleInputChange}
                      className='w-full h-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-base focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                    >
                      <option value='no'>No</option>
                      <option value='yes'>Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Section Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiSearch className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Organization</h3>
                    <p className="text-gray-600 dark:text-gray-300">Product category and brand</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className='space-y-2'>
                    <Label htmlFor='category' className='text-sm font-medium'>Category</Label>
                    <select
                      id='category'
                      name='category'
                      value={formData.category}
                      onChange={handleInputChange}
                      className='w-full h-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-base focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                    >
                      <option value=''>Select a category</option>
                      {renderCategoryOptions(taxonomyItems)}
                    </select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='brand' className='text-sm font-medium'>Brand</Label>
                    <select
                      id='brand'
                      name='brand'
                      value={formData.brand}
                      onChange={handleInputChange}
                      className='w-full h-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-base focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                    >
                      <option value=''>Select a brand</option>
                      {brands
                        .filter(brand => brand.status === 'active')
                        .map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Section Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiTag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Tags</h3>
                    <p className="text-gray-600 dark:text-gray-300">Product tags and keywords</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className='block text-lg font-semibold text-gray-900 dark:text-white mb-3'>
                      Tags
                    </Label>
                    <Input
                      name='tags'
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder='Add tags'
                      className='h-12 px-4 text-base border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300 hover:border-[#00437f]/50'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
