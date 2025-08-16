'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { use } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  FiArrowLeft,
  FiImage,
  FiPlus,
  FiTrash2,
  FiGlobe,
  FiSave,
  FiX,
  FiEdit,
  FiEdit2,
  FiDollarSign,
  FiPackage,
  FiTruck,
  FiTag,
  FiSettings,
  FiEye,
  FiSearch,
} from 'react-icons/fi'
import Image from 'next/image'
import { getAttributes } from '@/lib/actions/attributes'
import { getBrands } from '@/lib/actions/brands'
import { useRouter } from 'next/navigation'
import { getProduct, updateProduct } from '@/lib/actions/products'
import {
  ProductImageUpload,
  ProductImageUploadRef,
} from '@/components/ProductImageUpload'
import { Label } from '@/components/ui/label'
import { addCacheBuster } from '@/lib/utils/image-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { deleteProductImagesByFilenames } from '@/lib/utils/blob-utils'

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
  available: boolean
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

interface Brand {
  id: number
  name: string
  alias: string
  status: string
}

function generateCombinations(options: ProductOption[]): string[][] {
  if (options.length === 0) return []
  if (options.length === 1) return options[0].values.map((v) => [v])
  // Default: full matrix
  const values = options.map((option) => option.values)
  const combinations: string[][] = []
  function generate(current: string[], index: number) {
    if (index === values.length) {
      combinations.push([...current])
      return
    }
    for (const value of values[index]) {
      current.push(value)
      generate(current, index + 1)
      current.pop()
    }
  }
  generate([], 0)
  return combinations
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ styleId: string }>
}) {
  console.log('EditProductPage rendered with params:', params)
  const resolvedParams = use(params)
  console.log('Resolved params:', resolvedParams)

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
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(true)
  const [formData, setFormData] = useState({
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
  })
  const [taxonomyItems, setTaxonomyItems] = useState<TaxonomyItem[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  const router = useRouter()
  const imageUploadRef = useRef<ProductImageUploadRef>(null)

  // Add loading state for save button
  const [isSaving, setIsSaving] = useState(false)

  const [excludedCombinations, setExcludedCombinations] = useState<string[][]>(
    []
  )

  const [colorImages, setColorImages] = useState<{
    [color: string]: File | string | null
  }>({})
  const [colorImagePreviews, setColorImagePreviews] = useState<{
    [colorSizeKey: string]: string | null
  }>({})

  // Add ref to access current options state without causing circular dependencies
  const optionsRef = useRef(options)
  optionsRef.current = options

  // Move these to component scope
  const colorIdx = options.findIndex(
    (opt) => opt.name.toLowerCase() === 'color'
  )
  const sizeIdx = options.findIndex((opt) => opt.name.toLowerCase() === 'size')

  const variantsRef = useRef(variants)
  variantsRef.current = variants

  useEffect(() => {
    console.log('useEffect triggered with styleId:', resolvedParams.styleId)
    const loadAllData = async () => {
      try {
        // First load brands and product data
        const [brandsResponse, product] = await Promise.all([
          getBrands(),
          getProduct(resolvedParams.styleId),
        ])

        if (brandsResponse.success && brandsResponse.data) {
          setBrands(brandsResponse.data)

          // Find brand ID after brands are loaded
          if (product) {
            const brandId =
              brandsResponse.data
                .find((brand) => brand.name === product.brand)
                ?.id.toString() || ''

            // Set form data with brand ID
            setFormData((prev) => ({
              ...prev,
              title: product.name || '',
              description: product.longDescription || '',
              price: product.sellingPrice?.toString() || '',
              comparePrice: product.regularPrice?.toString() || '',
              sku: product.sku || '',
              barcode: product.barcode || '',
              type: product.type || '',
              status: 'active',
              visibility: 'online',
              category: product.department || '',
              brand: brandId,
              tags: product.tags || '',
              featured: product.of7 || 'no',
              weight: '',
              length: product.of12 || '',
              width: product.of13 || '',
              height: product.of15 || '',
              seoTitle: product.name || '',
              seoDescription: product.longDescription || '',
              seoUrl: product.urlHandle || '',
              collections: '',
              quantity: product.quantityAvailable?.toString() || '',
              trackQuantity: Boolean(product.trackInventory),
              hasSkuOrBarcode: !!(product.sku || product.barcode),
              continueSellingWhenOutOfStock: Boolean(
                product.continueSellingOutOfStock
              ),
              shopLocationQuantity: '0',
            }))

            // Set images
            const allImages = []
            if (product.largePicture) {
              allImages.push(product.largePicture)
            }
            if (product.alternateImages && product.alternateImages.length > 0) {
              const altImages = product.alternateImages
                .map((img) => img.AltImage)
                .filter((img): img is string => img !== null)
              allImages.push(...altImages)
            }
            setProductImages({
              main: product.largePicture
                ? {
                    large: product.largePicture,
                    medium: product.mediumPicture || product.largePicture,
                    small: product.smallPicture || product.largePicture,
                  }
                : null,
              alternates:
                product.alternateImages
                  ?.map((img) => img.AltImage)
                  .filter((img): img is string => img !== null) || [],
            })

            // Set variants and options
            if (product.variations && product.variations.length > 0) {
              console.log(
                'Raw variations data:',
                JSON.stringify(product.variations, null, 2)
              )

              // Extract options from variant attributes (not product attributes)
              const variantAttributeMap = new Map()
              product.variations.forEach((variation) => {
                if (variation.attributes && variation.attributes.length > 0) {
                  variation.attributes.forEach((attr) => {
                    const attrName = attr.attribute.name
                    if (!variantAttributeMap.has(attrName)) {
                      variantAttributeMap.set(attrName, new Set())
                    }
                    variantAttributeMap
                      .get(attrName)
                      .add(attr.attributeValue.value)
                  })
                }
              })

              // Create options from variant attributes
              const optionsArr: ProductOption[] = []
              variantAttributeMap.forEach((values, attrName) => {
                optionsArr.push({
                  id: `${attrName}-${Date.now()}`,
                  name: attrName,
                  values: Array.from(values),
                })
              })

              console.log(
                'Final extracted options from variant attributes:',
                optionsArr
              )
              setOptions(optionsArr)

              // Create variants from variations with their attributes
              const mappedVariants = product.variations.map((v) => {
                let combinations: string[] = []

                // Use variant attributes
                if (v.attributes && v.attributes.length > 0) {
                  const variantAttributeMap = new Map()
                  v.attributes.forEach((attr) => {
                    const attrName = attr.attribute.name
                    variantAttributeMap.set(attrName, attr.attributeValue.value)
                  })

                  // Create combinations array based on options order
                  combinations = optionsArr.map(
                    (option) => variantAttributeMap.get(option.name) || ''
                  )
                }

                return {
                  id: v.skuId.toString(),
                  title: combinations[0] || '',
                  price: v.price?.toString() || '',
                  sku: v.sku || v.skuId.toString(),
                  inventory: v.quantity?.toString() || '0',
                  combinations: combinations,
                  barcode: v.barcode || '',
                  available: v.available || false,
                  colorImage: v.colorImage || '',
                }
              })

              console.log(
                'Mapped variants from variant attributes:',
                JSON.stringify(mappedVariants, null, 2)
              )
              setVariants(mappedVariants)
            }
          }
        }

        // Load remaining data
        await Promise.all([
          loadAttributes(),
          fetch('/api/admin/catalog/categories')
            .then((res) => res.json())
            .then((data) => setTaxonomyItems(data)),
        ])

        setIsLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setIsLoading(false)
      }
    }
    loadAllData()
  }, [resolvedParams.styleId])

  const loadAttributes = async () => {
    console.log('Loading attributes...')
    try {
      const data = await getAttributes()
      console.log('Attributes loaded:', data)
      setAttributes(data)
    } catch (error) {
      console.error('Error loading attributes:', error)
    }
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

  const loadProduct = async () => {
    console.log('Starting to load product with ID:', resolvedParams.styleId)
    try {
      const product = await getProduct(resolvedParams.styleId)
      console.log('Raw product data:', JSON.stringify(product, null, 2))

      if (product) {
        // Convert boolean values to ensure they are proper booleans
        const trackInventory = Boolean(product.trackInventory)
        const continueSellingOutOfStock = Boolean(
          product.continueSellingOutOfStock
        )

        console.log('Boolean values:', {
          trackInventory,
          continueSellingOutOfStock,
          rawTrackInventory: product.trackInventory,
          rawContinueSellingOutOfStock: product.continueSellingOutOfStock,
        })

        setFormData({
          title: product.name || '',
          description: product.longDescription || '',
          price: product.sellingPrice?.toString() || '',
          comparePrice: product.regularPrice?.toString() || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          type: product.type || '',
          status: 'active',
          visibility: 'online',
          category: product.department || '',
          brand: '', // We'll set this after brands are loaded
          tags: product.tags || '',
          featured: product.of7 || 'no',
          weight: '',
          length: product.of12 || '',
          width: product.of13 || '',
          height: product.of15 || '',
          seoTitle: product.name || '',
          seoDescription: product.longDescription || '',
          seoUrl: product.urlHandle || '',
          collections: '',
          quantity: product.quantityAvailable?.toString() || '',
          trackQuantity: trackInventory,
          hasSkuOrBarcode: !!(product.sku || product.barcode),
          continueSellingWhenOutOfStock: continueSellingOutOfStock,
          shopLocationQuantity: '0',
        })

        // Set images
        const allImages = []

        // Add main image if it exists
        if (product.largePicture) {
          allImages.push(product.largePicture)
        }

        // Add alternate images if they exist
        if (product.alternateImages && product.alternateImages.length > 0) {
          const altImages = product.alternateImages
            .map((img) => img.AltImage)
            .filter((img): img is string => img !== null)
          allImages.push(...altImages)
        }

        console.log('Setting images:', allImages)
        setProductImages({
          main: product.largePicture
            ? {
                large: product.largePicture,
                medium: product.mediumPicture || product.largePicture,
                small: product.smallPicture || product.largePicture,
              }
            : null,
          alternates:
            product.alternateImages
              ?.map((img) => img.AltImage)
              .filter((img): img is string => img !== null) || [],
        })

        // Set variants and options
        if (product.variations && product.variations.length > 0) {
          console.log(
            'Raw variations data:',
            JSON.stringify(product.variations, null, 2)
          )

          // Extract options from variant attributes (not product attributes)
          const variantAttributeMap = new Map()
          product.variations.forEach((variation) => {
            if (variation.attributes && variation.attributes.length > 0) {
              variation.attributes.forEach((attr) => {
                const attrName = attr.attribute.name
                if (!variantAttributeMap.has(attrName)) {
                  variantAttributeMap.set(attrName, new Set())
                }
                variantAttributeMap.get(attrName).add(attr.attributeValue.value)
              })
            }
          })

          // Create options from variant attributes
          const optionsArr: ProductOption[] = []
          variantAttributeMap.forEach((values, attrName) => {
            optionsArr.push({
              id: `${attrName}-${Date.now()}`,
              name: attrName,
              values: Array.from(values),
            })
          })

          console.log(
            'Final extracted options from variant attributes:',
            optionsArr
          )
          setOptions(optionsArr)

          // Create variants from variations with their attributes
          const mappedVariants = product.variations.map((v) => {
            let combinations: string[] = []

            // Use variant attributes
            if (v.attributes && v.attributes.length > 0) {
              const variantAttributeMap = new Map()
              v.attributes.forEach((attr) => {
                const attrName = attr.attribute.name
                variantAttributeMap.set(attrName, attr.attributeValue.value)
              })

              // Create combinations array based on options order
              combinations = optionsArr.map(
                (option) => variantAttributeMap.get(option.name) || ''
              )
            }

            return {
              id: v.skuId.toString(),
              title: combinations[0] || '',
              price: v.price?.toString() || '',
              sku: v.sku || v.skuId.toString(),
              inventory: v.quantity?.toString() || '0',
              combinations: combinations,
              barcode: v.barcode || '',
              available: v.available || false,
              colorImage: v.colorImage || '',
            }
          })

          console.log(
            'Mapped variants from variant attributes:',
            JSON.stringify(mappedVariants, null, 2)
          )
          setVariants(mappedVariants)
        }
      } else {
        console.log('No product data received')
      }
    } catch (error) {
      console.error('Error loading product:', error)
      alert('Failed to load product')
    } finally {
      console.log('Finished loading product')
      setIsLoading(false)
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      )
      setProductImages((prev) => ({
        ...prev,
        alternates: [...prev.alternates, ...newImages],
      }))
    }
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
      const shouldSetNewValues =
        currentOption.values.length === 0 ||
        (currentOption.values.length === 1 && currentOption.values[0] === '')

      setCurrentOption({
        ...currentOption,
        name: selectedAttribute.name,
        values: shouldSetNewValues
          ? selectedAttribute.values.map((v) => v.value)
          : currentOption.values,
      })
    }
  }

  const saveOption = () => {
    if (currentOption.name && currentOption.values.length > 0) {
      // Filter out empty values before saving
      const filteredValues = currentOption.values.filter(
        (value) => value.trim() !== ''
      )

      if (filteredValues.length === 0) {
        alert('Please add at least one value for this option')
        return
      }

      console.log('Saving option:', {
        name: currentOption.name,
        originalValues: currentOption.values,
        filteredValues: filteredValues,
      })

      setOptions((prevOptions) => {
        // Find existing option by name (case-insensitive)
        const existingOptionIndex = prevOptions.findIndex(
          (opt) => opt.name.toLowerCase() === currentOption.name.toLowerCase()
        )

        console.log('Existing option index:', existingOptionIndex)
        console.log('Previous options:', prevOptions)

        if (existingOptionIndex >= 0) {
          // Merge with existing option
          const existingOption = prevOptions[existingOptionIndex]
          const mergedValues = [
            ...new Set([...existingOption.values, ...filteredValues]),
          ]

          console.log('Merging options:', {
            existing: existingOption.values,
            new: filteredValues,
            merged: mergedValues,
          })

          const newOptions = [...prevOptions]
          newOptions[existingOptionIndex] = {
            ...existingOption,
            values: mergedValues,
          }
          return newOptions
        } else {
          // Add as new option
          const newOption = {
            ...currentOption,
            values: filteredValues,
          }
          console.log('Adding new option:', newOption)
          return [...prevOptions, newOption]
        }
      })
      cancelEditing()
    }
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      // Upload images first and get the result
      let finalImages = productImages
      let hasNewMainImages = false
      let hasNewAlternateImages = false
      
      if (imageUploadRef.current) {
        console.log('[PRODUCT-EDIT] Starting image upload process...')
        
        // Store original images for comparison
        const originalImages = { ...productImages }
        
        // Upload any new images
        finalImages = await imageUploadRef.current.uploadAllImages()
        setProductImages(finalImages)
        
        // Detect if images actually changed by comparing URLs
        hasNewMainImages = (
          originalImages.main?.large !== finalImages.main?.large ||
          originalImages.main?.medium !== finalImages.main?.medium ||
          originalImages.main?.small !== finalImages.main?.small
        )
        
        hasNewAlternateImages = (
          originalImages.alternates.length !== finalImages.alternates.length ||
          !originalImages.alternates.every((img, idx) => img === finalImages.alternates[idx])
        )
        
        console.log('[PRODUCT-EDIT] Image comparison results:')
        console.log('- Original main:', originalImages.main)
        console.log('- Final main:', finalImages.main)
        console.log('- Original alternates:', originalImages.alternates)
        console.log('- Final alternates:', finalImages.alternates)
        console.log(`- Main changed: ${hasNewMainImages}, Alternates changed: ${hasNewAlternateImages}`)
        
        // Force cleanup for any image changes to ensure old images are removed
        if (hasNewMainImages || hasNewAlternateImages) {
          console.log('[PRODUCT-EDIT] 🧹 Images changed - will trigger cleanup of old images')
          
          // Force cleanup flags to true when images change to ensure reliable cleanup
          hasNewMainImages = true  // Force main image cleanup
          hasNewAlternateImages = hasNewAlternateImages  // Keep alternate detection
        }
      } else {
        finalImages = productImages
        console.log('[PRODUCT-EDIT] No image upload ref, using existing images')
      }

      // Upload variant/color images if needed
      const uploadedColorImages: { [key: string]: string } = {}
      let hasNewColorImages = false
      const colorIdx = options.findIndex(
        (opt) => opt.name.toLowerCase() === 'color'
      )
      const sizeIdx = options.findIndex(
        (opt) => opt.name.toLowerCase() === 'size'
      )

      // Get visible combinations (same logic as add page)
      const allCombinations = generateCombinations(options)
      const visibleCombinations = allCombinations.filter(
        (combination) =>
          !excludedCombinations.some(
            (excluded) =>
              excluded.length === combination.length &&
              excluded.every((val, i) => val === combination[i])
          )
      )

      // Get unique colors from all combinations
      const uniqueColors = new Set<string>()
      for (const combination of visibleCombinations) {
        const colorValue =
          colorIdx !== -1 && combination.length > colorIdx
            ? combination[colorIdx]
            : ''
        if (colorValue) {
          uniqueColors.add(colorValue)
        }
      }
      
      console.log('[PRODUCT-EDIT] Color images state:', colorImages)
      console.log('[PRODUCT-EDIT] Unique colors to process:', Array.from(uniqueColors))

      // Upload one image per color
      for (const colorValue of uniqueColors) {
        const file = colorImages[colorValue]
        console.log(`[PRODUCT-EDIT] Processing color ${colorValue}:`, {
          file: file ? (typeof file === 'string' ? 'string URL' : 'File object') : 'null',
          fileName: file instanceof File ? file.name : 'N/A'
        })

        if (file && typeof file !== 'string') {
          // Upload file for this color - this indicates a new color image
          console.log(`[PRODUCT-EDIT] 🎨 Uploading new color image for ${colorValue}`)
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          uploadFormData.append('styleId', resolvedParams.styleId)
          uploadFormData.append('isVariant', 'true')
          uploadFormData.append('color', colorValue)
          uploadFormData.append('size', '') // No specific size for Option 1
          
          try {
            const response = await fetch('/api/upload/product-platform-asset', {
              method: 'POST',
              body: uploadFormData,
            })
            if (response.ok) {
              const data = await response.json()
              uploadedColorImages[colorValue] = addCacheBuster(data.mainImage)
              console.log(`[PRODUCT-EDIT] ✅ Color image upload success for ${colorValue}: ${uploadedColorImages[colorValue]}`)
            } else {
              console.error(`[PRODUCT-EDIT] ❌ Color image upload failed for ${colorValue}:`, response.status, response.statusText)
            }
          } catch (error) {
            console.error(`[PRODUCT-EDIT] ❌ Color image upload error for ${colorValue}:`, error)
          }
        } else if (typeof file === 'string') {
          uploadedColorImages[colorValue] = file
          console.log(`[PRODUCT-EDIT] 📎 Using existing color image for ${colorValue}: ${file}`)
        } else {
          console.log(`[PRODUCT-EDIT] ⚠️  No color image for ${colorValue}`)
        }
      }
      
      // Color image change detection - DON'T CHECK FOR CHANGES
      // The color upload system handles its own cleanup during upload
      // We only need cleanup if we're specifically replacing images
      hasNewColorImages = false
      
      console.log(`[PRODUCT-EDIT] Color image upload completed:`)
      console.log(`  - Uploaded color images:`, uploadedColorImages)
      console.log(`  - Color cleanup disabled (upload handles its own cleanup)`)
      console.log(`  - Color images changed: ${hasNewColorImages}`)

      // Find the selected brand
      const selectedBrand = brands.find(
        (brand) => brand.id.toString() === formData.brand
      )
      const brandName = selectedBrand?.name || ''

      // Determine on-sale status based on price comparison
      const price = parseFloat(formData.price) || 0
      const comparePrice = parseFloat(formData.comparePrice) || 0
      const onSale = comparePrice > price

      // Generate combinations from options (same as add page)
      // Variables already declared earlier in the function
      // const allCombinations = generateCombinations(options)
      // const visibleCombinations = allCombinations.filter(
      //   (combination) =>
      //     !excludedCombinations.some((excluded) =>
      //       excluded.length === combination.length &&
      //       excluded.every((val, i) => val === combination[i])
      //     )
      // )

      // Prepare product data
      const productData = {
        styleId: parseInt(resolvedParams.styleId),
        name: formData.title,
        longDescription: formData.description,
        sellingPrice: parseFloat(formData.price) || 0,
        regularPrice: parseFloat(formData.comparePrice) || 0,
        sku: formData.sku,
        barcode: formData.barcode,
        type: formData.type,
        status: formData.status,
        visibility: formData.visibility,
        department: formData.category,
        brand: brandName,
        tags: formData.tags,
        of7: formData.featured,
        of12: formData.length,
        of13: formData.width,
        of15: formData.height,
        urlHandle: formData.seoUrl,
        quantityAvailable: parseInt(formData.quantity) || 0,
        trackInventory: formData.trackQuantity,
        continueSellingWhenOutOfStock: formData.continueSellingWhenOutOfStock,
        onSale: onSale,
        mainImage: finalImages.main?.large || null,
        mediumImage: finalImages.main?.medium || null,
        smallImage: finalImages.main?.small || null,
        alternateImages: finalImages.alternates,
        productAttributes: options.map((option) => {
          const attribute = attributes.find((attr) => attr.name === option.name)
          return {
            attributeId: attribute?.id || '',
            attributeValues: option.values.map((value) => {
              const attrValue = attribute?.values.find((v) => v.value === value)
              return {
                attributeValueId: attrValue?.id || '',
                value: value,
              }
            }),
          }
        }),
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
          } else {
            // Try to find by combination in variants array (shouldn't happen, but fallback)
            const fallbackVariant = variants.find(
              (v) =>
                v.combinations.length === combination.length &&
                v.combinations.every((val, i) => val === combination[i])
            )
            price = fallbackVariant && fallbackVariant.price !== undefined ? parseFloat(fallbackVariant.price) || 0 : 0
          }

          // Check if this is an existing variant (has numeric skuId) or new variant (has string id)
          const isExistingVariant =
            existingVariant && !existingVariant.id.startsWith('new-')
          const skuId = isExistingVariant
            ? parseInt(existingVariant.id)
            : Math.floor(Math.random() * 90000) + 10000

          // Get color and size values for this combination
          const colorValue =
            colorIdx !== -1 && combination.length > colorIdx
              ? combination[colorIdx]
              : ''
          const sizeValue =
            sizeIdx !== -1 && combination.length > sizeIdx
              ? combination[sizeIdx]
              : ''

          // Create variant attributes from combinations
          const variantAttributes = combination
            .map((value, index) => {
              const option = options[index]
              if (!option || !value) return null

              const attribute = attributes.find(
                (attr) => attr.name === option.name
              )
              const attrValue = attribute?.values.find((v) => v.value === value)

              return {
                attributeId: attribute?.id || '',
                attributeValueId: attrValue?.id || '',
                value: value,
              }
            })
            .filter(Boolean)

          // For Option 1: Get color image by color name only, not by color-size combination
          let colorImage = ''
          if (colorValue) {
            // First check if we have a new uploaded image for this color
            const uploadedImage = uploadedColorImages[colorValue]
            if (uploadedImage) {
              colorImage = uploadedImage // uploadedImage is already a string URL
              console.log(`[PRODUCT-EDIT] Using NEW color image for ${colorValue}: ${colorImage}`)
            } else {
              // Fall back to existing variant's color image if no new upload
              colorImage = existingVariant?.colorImage || ''
              console.log(`[PRODUCT-EDIT] Using EXISTING color image for ${colorValue}: ${colorImage}`)
            }
          }

          return {
            skuId: skuId,
            sku: existingVariant?.sku || '',
            barcode: existingVariant?.barcode || formData.barcode || '',
            quantity: existingVariant
              ? parseInt(existingVariant.inventory) || 0
              : 0,
            available: existingVariant
              ? existingVariant.available || false
              : false,
            price: price,
            colorImage: colorImage,
            variantAttributes: variantAttributes,
          }
        }),
      }

      console.log('💾 Saving product data:', productData)
      console.log('💾 Variants being saved:', productData.variations)
      console.log('💾 Options:', options)

      // Save the product using the server action with cleanup options
      console.log(`[PRODUCT-EDIT] Cleanup options - Main: ${hasNewMainImages}, Alternates: ${hasNewAlternateImages}, Colors: ${hasNewColorImages}`)
      
      const result = await updateProduct(resolvedParams.styleId, productData, {
        cleanupMainImages: hasNewMainImages,
        cleanupAlternateImages: hasNewAlternateImages,
        cleanupColorImages: hasNewColorImages
      })

      if (result.success) {
        router.push('/admin/catalog/products')
      } else {
        alert(result.message || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    } finally {
      setIsSaving(false)
    }
  }

  // Add this function to handle variant changes
  const handleVariantChange = (
    variantId: string,
    field: keyof ProductVariant,
    value: string
  ) => {
    setVariants((prevVariants) => {
      const newVariants = [...prevVariants]
      const variantIndex = newVariants.findIndex((v) => v.id === variantId)

      if (variantIndex >= 0) {
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          [field]: value,
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
          available: false,
          [field]: value,
        })
      }

      return newVariants
    })
  }

  // Add this function to handle option changes
  const handleOptionChange = (
    optionId: string,
    field: keyof ProductOption,
    value: string | string[]
  ) => {
    setOptions((prevOptions) => {
      const newOptions = [...prevOptions]
      const optionIndex = newOptions.findIndex((o) => o.id === optionId)

      if (optionIndex >= 0) {
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          [field]: value,
        }
      } else {
        newOptions.push({
          id: optionId,
          name: '',
          values: [],
          [field]: value,
        })
      }

      return newOptions
    })
  }

  // Add this function to handle variant image changes
  const handleVariantImageChange = (variantId: string, imageUrl: string) => {
    setVariants((prevVariants) => {
      const newVariants = [...prevVariants]
      const variantIndex = newVariants.findIndex((v) => v.id === variantId)

      if (variantIndex >= 0) {
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          colorImage: imageUrl,
        }
      }

      return newVariants
    })
  }

  // Handler for selecting a color image (no upload)
  const handleColorImageSelect = async (color: string, file: File) => {
    console.log(`[COLOR-SELECT] Selected new color image for ${color}:`, file.name)
    
    // SIMPLIFIED: Remove the deletion logic that might be causing issues
    // Just store the new image like the ADD page does
    setColorImages((prev) => {
      const updated = { ...prev, [color]: file }
      console.log(`[COLOR-SELECT] Updated colorImages state:`, updated)
      return updated
    })
    setColorImagePreviews((prev) => ({
      ...prev,
      [color]: URL.createObjectURL(file),
    }))
    
    console.log(`[COLOR-SELECT] ✅ Color image ${color} stored for upload on save`)
  }

  // Handler for removing a color image
  const handleColorImageRemove = async (color: string) => {
    const styleIdStr = resolvedParams.styleId.toString()
    const colorFilename = `${styleIdStr}_${color}.jpg`
    try {
      await deleteProductImagesByFilenames([colorFilename])
    } catch (err) {
      console.warn('Could not delete color image (may not exist or network error):', err)
    }

    setColorImages((prev) => ({ ...prev, [color]: null }))
    setColorImagePreviews((prev) => ({ ...prev, [color]: null }))

    // Also clear colorImage from all variants for this color
    setVariants((prevVariants) =>
      prevVariants.map((variant) => {
        const colorIdx = options.findIndex((opt) => opt.name.toLowerCase() === 'color')
        if (colorIdx !== -1 && variant.combinations[colorIdx] === color) {
          return { ...variant, colorImage: '' }
        }
        return variant
      })
    )
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

  // Add debugging for productImages state changes
  useEffect(() => {
    console.log('productImages state changed:', productImages)
  }, [productImages])

  // Function to assign existing color images to new variants
  const assignColorImagesToVariants = useCallback(
    (newVariants: ProductVariant[]) => {
      const colorIdx = options.findIndex(
        (opt) => opt.name.toLowerCase() === 'color'
      )
      if (colorIdx === -1) return newVariants

      return newVariants.map((variant) => {
        const colorValue = variant.combinations[colorIdx]
        if (colorValue && !variant.colorImage) {
          // Check if we have a color image for this color
          let existingImage = null

          // Check in colorImagePreviews first (newly uploaded)
          if (colorImagePreviews[colorValue]) {
            existingImage = colorImagePreviews[colorValue]
          }
          // Check in colorImages (File objects)
          else if (colorImages[colorValue]) {
            const file = colorImages[colorValue]
            if (file instanceof File) {
              existingImage = URL.createObjectURL(file)
            } else if (typeof file === 'string') {
              existingImage = file
            }
          }
          // Check in existing variants for this color (using ref to avoid circular dependency)
          else {
            const existingVariantWithColor = variantsRef.current.find((v) => {
              const variantColorValue = v.combinations[colorIdx]
              return variantColorValue === colorValue && v.colorImage
            })
            if (existingVariantWithColor?.colorImage) {
              existingImage = existingVariantWithColor.colorImage
            }
          }

          if (existingImage) {
            return {
              ...variant,
              colorImage: existingImage,
            }
          }
        }
        return variant
      })
    },
    [options, colorImages, colorImagePreviews]
  )

  // Regenerate variants with color images when options change
  useEffect(() => {
    if (options.length > 0) {
      const newCombinations = generateCombinations(options)
      const visibleCombinations = newCombinations.filter(
        (combination) =>
          !excludedCombinations.some(
            (excluded) =>
              excluded.length === combination.length &&
              excluded.every((val, i) => val === combination[i])
          )
      )

      setVariants((prevVariants) => {
        const newVariants = visibleCombinations.map((combination) => {
          // Try to find a matching variant from previous variants
          const existing = prevVariants.find(
            (v) =>
              v.combinations.length === combination.length &&
              v.combinations.every((val, i) => val === combination[i])
          )

          if (existing) {
            // Preserve existing variant with all its data including colorImage
            return existing
          } else {
            // Create new variant
            return {
              id: Date.now().toString() + Math.random(),
              title: combination[0],
              price: '',
              sku: '',
              inventory: '',
              combinations: combination,
              barcode: '',
              available: false,
              colorImage: '',
            }
          }
        })
        // Assign color images to new variants that don't have them
        return assignColorImagesToVariants(newVariants)
      })
    }
  }, [options, excludedCombinations, assignColorImagesToVariants])

  // Move this to before render/return and before any usage
  const handleVariantDelete = (variantId: string, combination: string[]) => {
    setVariants((prevVariants) => prevVariants.filter((v) => v.id !== variantId))
    setExcludedCombinations((prev) => {
      const newExcluded = [...prev, combination]
      // Compute visible combinations after this deletion
      const visibleCombinations = generateCombinations(options).filter(
        (comb) =>
          !newExcluded.some(
            (excluded) =>
              excluded.length === comb.length &&
              excluded.every((val, i) => val === comb[i])
          )
      )
      // For each option, keep only values that are present in any visible combination
      setOptions((prevOptions) => {
        const updatedOptions = prevOptions
          .map((option, idx) => {
            const usedValues = new Set(
              visibleCombinations.map((comb) => comb[idx]).filter(Boolean)
            )
            return {
              ...option,
              values: option.values.filter((val) => usedValues.has(val)),
            }
          })
          .filter((option) => option.values.length > 0)
        return updatedOptions
      })
      return newExcluded
    })
  }

  // Add this useEffect to ensure every visible combination has a variant object
  useEffect(() => {
    const visibleCombinations = generateCombinations(options).filter(
      (combination) =>
        !excludedCombinations.some(
          (excluded) =>
            excluded.length === combination.length &&
            excluded.every((val, i) => val === combination[i])
        )
    )
    setVariants((prevVariants) => {
      const newVariants = [...prevVariants]
      visibleCombinations.forEach((combination) => {
        const exists = newVariants.some(
          (v) =>
            v.combinations.length === combination.length &&
            v.combinations.every((val, i) => val === combination[i])
        )
        if (!exists) {
          newVariants.push({
            id: Date.now().toString() + Math.random(),
            title: combination[0],
            price: '',
            sku: '',
            inventory: '',
            combinations: combination,
            barcode: '',
            available: false,
            colorImage: '',
          })
        }
      })
      // Optionally, remove variants that are no longer visible
      const filteredVariants = newVariants.filter((v) =>
        visibleCombinations.some(
          (combination) =>
            v.combinations.length === combination.length &&
            v.combinations.every((val, i) => val === combination[i])
        )
      )
      return filteredVariants
    })
  }, [options, excludedCombinations])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
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
                  <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>Edit Product</h1>
                  <p className='text-lg font-medium text-gray-600 dark:text-gray-300'>Update product details</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-11 px-8 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/40 rounded-xl'
                  onClick={() => router.back()}
                >
                  <FiX className="h-4 w-4" />
                  Discard Changes
                </Button>
                <Button
                  size='sm'
                  disabled={isSaving}
                  className='h-11 px-10 text-sm font-medium bg-gradient-to-r from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl'
                  onClick={handleSubmit}
                >
                  {isSaving ? (
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

  {/* Main Content */}
      <div className='grid grid-cols-12 gap-6'>
        {/* Left Column - Main Product Details */}
        <div className='col-span-8 space-y-6'>
          {/* Product Title & Description */}
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
                    <p className="text-sm text-gray-600 dark:text-gray-300">Product title and description</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Product Title *
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter product title"
                      required
                      className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                      className="min-h-[180px] px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200 resize-y"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Media Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiImage className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Media</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Product images and media</p>
                  </div>
                </div>
                
                <ProductImageUpload
                  styleId={parseInt(resolvedParams.styleId)}
                  onImagesChange={setProductImages}
                  initialImages={productImages}
                  ref={imageUploadRef}
                />
              </div>
            </Card>
          </div>

          {/* Pricing Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiDollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pricing</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Set product pricing</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Price *
                      </label>
                      <Input
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Compare at Price
                        </label>
                        <div className="relative group">
                          <FiGlobe className="h-4 w-4 text-gray-400 cursor-help" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                              To display markdown, enter a value higher than your price. Often shown with a strikethrough
                              <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Input
                        name="comparePrice"
                        type="number"
                        value={formData.comparePrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Inventory Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiPackage className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Inventory</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Manage your products inventory and tracking settings</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Track quantity section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="trackQuantity"
                        name="trackQuantity"
                        checked={formData.trackQuantity}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            trackQuantity: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-[#00437f] focus:ring-[#00437f]"
                      />
                      <label
                        htmlFor="trackQuantity"
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Track quantity
                      </label>
                    </div>

                    {formData.trackQuantity && (
                      <div className="pl-7 space-y-4 border-l-2 border-[#00437f]/20 ml-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Quantity
                          </label>
                          <div className="flex-1 max-w-[200px]">
                            <Input
                              name="quantity"
                              type="number"
                              value={formData.quantity}
                              onChange={handleInputChange}
                              placeholder="0"
                              className="w-full h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="continueSellingWhenOutOfStock"
                            name="continueSellingWhenOutOfStock"
                            checked={formData.continueSellingWhenOutOfStock}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                continueSellingWhenOutOfStock: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-gray-300 text-[#00437f] focus:ring-[#00437f]"
                          />
                          <label
                            htmlFor="continueSellingWhenOutOfStock"
                            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                          >
                            Continue selling when out of stock
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SKU and Barcode section */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="hasSkuOrBarcode"
                        name="hasSkuOrBarcode"
                        checked={formData.hasSkuOrBarcode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hasSkuOrBarcode: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-[#00437f] focus:ring-[#00437f]"
                      />
                      <label
                        htmlFor="hasSkuOrBarcode"
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        This product has a SKU or barcode
                      </label>
                    </div>

                    {formData.hasSkuOrBarcode && (
                      <div className="pl-7 space-y-4 border-l-2 border-[#00437f]/20 ml-1.5">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              SKU (Stock Keeping Unit)
                            </label>
                            <Input
                              name="sku"
                              value={formData.sku}
                              onChange={handleInputChange}
                              placeholder="Enter SKU"
                              className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Barcode (ISBN, UPC, GTIN, etc.)
                            </label>
                            <Input
                              name="barcode"
                              value={formData.barcode}
                              onChange={handleInputChange}
                              placeholder="Enter barcode"
                              className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Shipping Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
            <Card className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiTruck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Shipping</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Product weight and dimensions</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Weight
                    </label>
                    <Input
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="0.0"
                      className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Dimensions
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        name="length"
                        value={formData.length}
                        onChange={handleInputChange}
                        placeholder="Length"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                      <Input
                        name="width"
                        value={formData.width}
                        onChange={handleInputChange}
                        placeholder="Width"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                      <Input
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        placeholder="Height"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Variants Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiTag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Variants</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Add options like size or color to create variants of this product</p>
                  </div>
                </div>

                {/* Option Form */}
                {isEditing && (
                  <div className="mb-6 p-6 border-2 border-[#00437f]/20 rounded-xl bg-white/50 dark:bg-gray-700/50 shadow-sm">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Option name *
                        </label>
                        <select
                          value={currentOption.name}
                          onChange={(e) => handleOptionNameChange(e.target.value)}
                          className="w-full h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                        >
                          <option value="">Select an attribute</option>
                          {attributes.map((attr) => (
                            <option key={attr.id} value={attr.id}>
                              {attr.display}
                            </option>
                          ))}
                        </select>
                      </div>

                      {currentOption.name && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Option values *
                          </label>
                          <div className="space-y-3">
                            {currentOption.values.map((value, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <Input
                                  value={value}
                                  onChange={(e) => {
                                    const newValues = [...currentOption.values]
                                    newValues[index] = e.target.value
                                    setCurrentOption({
                                      ...currentOption,
                                      values: newValues,
                                    })
                                  }}
                                  className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                                />
                                {currentOption.values.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setCurrentOption({
                                        ...currentOption,
                                        values: currentOption.values.filter(
                                          (_, i) => i !== index
                                        ),
                                      })
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentOption({
                                  ...currentOption,
                                  values: [...currentOption.values, ''],
                                })
                              }}
                              className="text-[#00437f] border-[#00437f]/30 hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/50 rounded-xl"
                            >
                              <FiPlus className="mr-2 h-4 w-4" />
                              Add Value
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                          className="text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveOption}
                          disabled={!currentOption.name}
                          className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white rounded-xl"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

            {/* Add Option Button */}
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
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-medium text-gray-900'>Current Options</h4>
                </div>
                <div className='space-y-2'>
                  {options.map((option, optionIdx) => (
                    <div
                      key={option.id}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'
                    >
                      <div>
                        <span className='font-medium text-gray-900'>
                          {option.name}
                        </span>
                        <span className='text-sm text-gray-500 ml-2'>
                          ({option.values.join(', ')})
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            console.log('=== EDIT BUTTON CLICKED ===')
                            console.log('Option being edited:', option)
                            console.log('Current options state:', options)

                            // Start editing this existing option
                            setCurrentOption({
                              id: option.id,
                              name: option.name,
                              values: [...option.values],
                            })
                            setIsEditing(true)

                            console.log('Set currentOption to:', {
                              id: option.id,
                              name: option.name,
                              values: [...option.values],
                            })
                          }}
                          className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                        >
                          <FiEdit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            const newOptions = options.filter(
                              (o) => o.id !== option.id
                            )
                            setOptions(newOptions)
                            // Recompute variants
                            const newCombinations =
                              generateCombinations(newOptions)
                            setVariants((prevVariants) => {
                              const newVariants = newCombinations.map(
                                (combination) => {
                                  // Try to find a matching variant from previous variants
                                  const existing = prevVariants.find(
                                    (v) =>
                                      v.combinations.length ===
                                        combination.length &&
                                      v.combinations.every(
                                        (val, i) => val === combination[i]
                                      )
                                  )
                                  return (
                                    existing || {
                                      id: Date.now().toString() + Math.random(),
                                      title: combination[0],
                                      price: '',
                                      sku: '',
                                      inventory: '',
                                      combinations: combination,
                                      barcode: '',
                                      available: false,
                                      colorImage: '',
                                    }
                                  )
                                }
                              )
                              // Assign color images to new variants
                              return assignColorImagesToVariants(newVariants)
                            })
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

            {/* Variants Table */}
            {options.length > 0 && (
              <div className='mt-8'>
                <div className='flex items-center justify-between mb-4'>
                  <h4 className='font-medium text-gray-900'>Variants</h4>
                  <div className='text-sm text-gray-500'>
                    {generateCombinations(options).length} variants
                  </div>
                </div>
                <div>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b'>
                        {options.map((option) => (
                          <th
                            key={option.id}
                            className='px-4 py-3 text-left text-sm font-medium text-gray-500'
                          >
                            {option.name}
                          </th>
                        ))}
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Price
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          SKU
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Inventory
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Available
                        </th>
                        <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateCombinations(options)
                        .filter(
                          (combination) =>
                            !excludedCombinations.some(
                              (excluded) =>
                                excluded.length === combination.length &&
                                excluded.every(
                                  (val, i) => val === combination[i]
                                )
                            )
                        )
                        .map((combination, index) => {
                          const existingVariant = variants.find(
                            (v) =>
                              v.combinations.length === combination.length &&
                              v.combinations.every(
                                (val, i) => val === combination[i]
                              )
                          )
                          const variant = existingVariant || {
                            id: Date.now().toString() + index,
                            title: combination[0],
                            price: '',
                            sku: '',
                            inventory: '',
                            combinations: combination,
                            barcode: '',
                            available: false,
                            colorImage: '',
                          }
                          return (
                            <tr
                              key={index}
                              className='border-b last:border-b-0 hover:bg-gray-50'
                            >
                              {combination.map((value, valueIndex) => (
                                <td
                                  key={valueIndex}
                                  className='px-4 py-3 text-sm text-gray-900'
                                >
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
                                        combinations: combination,
                                      }
                                    } else {
                                      newVariants.push({
                                        ...variant,
                                        price: e.target.value,
                                        combinations: combination,
                                      })
                                    }
                                    // Assign color images to new variants
                                    const variantsWithColorImages =
                                      assignColorImagesToVariants(newVariants)
                                    setVariants(variantsWithColorImages)
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
                                        combinations: combination,
                                      }
                                    } else {
                                      newVariants.push({
                                        ...variant,
                                        sku: e.target.value,
                                        combinations: combination,
                                      })
                                    }
                                    // Assign color images to new variants
                                    const variantsWithColorImages =
                                      assignColorImagesToVariants(newVariants)
                                    setVariants(variantsWithColorImages)
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
                                        combinations: combination,
                                      }
                                    } else {
                                      newVariants.push({
                                        ...variant,
                                        inventory: e.target.value,
                                        combinations: combination,
                                      })
                                    }
                                    // Assign color images to new variants
                                    const variantsWithColorImages =
                                      assignColorImagesToVariants(newVariants)
                                    setVariants(variantsWithColorImages)
                                  }}
                                  className='w-full'
                                />
                              </td>
                              <td className='px-4 py-3'>
                                <input
                                  type='checkbox'
                                  checked={variant.available}
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
                                    if (e.target.checked) {
                                      if (existingIndex === -1) {
                                        newVariants.push({
                                          ...variant,
                                          available: true,
                                          combinations: combination,
                                        })
                                      } else {
                                        newVariants[existingIndex] = {
                                          ...newVariants[existingIndex],
                                          available: true,
                                          combinations: combination,
                                        }
                                      }
                                    } else {
                                      if (existingIndex >= 0) {
                                        newVariants[existingIndex] = {
                                          ...newVariants[existingIndex],
                                          available: false,
                                          combinations: combination,
                                        }
                                      }
                                    }
                                    // Assign color images to new variants
                                    const variantsWithColorImages =
                                      assignColorImagesToVariants(newVariants)
                                    setVariants(variantsWithColorImages)
                                  }}
                                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                />
                              </td>
                              <td className='px-4 py-3'>
                                <Button
                                  variant='destructive'
                                  size='icon'
                                  onClick={() => {
                                    const variantToDelete = variants.find(
                                      (v) =>
                                        v.combinations.length ===
                                          combination.length &&
                                        v.combinations.every(
                                          (val, i) => val === combination[i]
                                        )
                                    )
                                    if (variantToDelete) {
                                      handleVariantDelete(variantToDelete.id, combination)
                                    }
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
              </div>
            )}

            {/* Color Images Section - Part of Variants */}
            {options.some((opt) => opt.name.toLowerCase() === 'color') && (
              <div className='mt-8 pt-6 border-t border-gray-200'>
                <div className='space-y-4'>
                  <div>
                    <h4 className='text-base font-medium text-gray-900'>
                      Color Images
                    </h4>
                    <p className='text-sm text-gray-500 mt-1'>
                      Upload one image per color. This image will be used for
                      all sizes of that color.
                    </p>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {(() => {
                      // Get unique colors from VISIBLE variants only (not all options)
                      const visibleCombinations = generateCombinations(
                        options
                      ).filter(
                        (combination) =>
                          !excludedCombinations.some(
                            (excluded) =>
                              excluded.length === combination.length &&
                              excluded.every((val, i) => val === combination[i])
                          )
                      )

                      const colorIdx = options.findIndex(
                        (opt) => opt.name.toLowerCase() === 'color'
                      )
                      if (colorIdx === -1) return null

                      // Get unique colors from visible combinations only
                      const usedColors = new Set<string>()
                      visibleCombinations.forEach((combination) => {
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
                            const sizeIdx = options.findIndex(
                              (opt) => opt.name.toLowerCase() === 'size'
                            )
                            return sizeIdx !== -1 ? combination[sizeIdx] : null
                          })
                          .filter((size): size is string => size !== null)
                          .filter(
                            (size: string, index: number, arr: string[]) =>
                              arr.indexOf(size) === index
                          ) // unique sizes

                        // Get existing image for this color (from any size)
                        const existingImage = variants.find((variant) => {
                          const colorIdx = options.findIndex(
                            (opt) => opt.name.toLowerCase() === 'color'
                          )
                          return (
                            variant.combinations[colorIdx] === colorValue &&
                            variant.colorImage
                          )
                        })?.colorImage

                        return (
                          <div key={colorValue} className='space-y-2'>
                            <div className='relative aspect-square w-full group'>
                              {colorImagePreviews[colorValue] ||
                              existingImage ? (
                                <Image
                                  src={
                                    colorImagePreviews[colorValue] ||
                                    existingImage ||
                                    ''
                                  }
                                  alt={`${colorValue} color image`}
                                  fill
                                  className='object-cover rounded-lg border'
                                  unoptimized
                                />
                              ) : (
                                <div className='w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center'>
                                  <FiImage className='h-8 w-8 text-gray-400 mb-2' />
                                  <span className='text-xs text-gray-500 text-center'>
                                    Upload {colorValue} image
                                  </span>
                                </div>
                              )}
                              <div className='absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded'>
                                {colorValue}
                              </div>
                              <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2'>
                                <div
                                  onClick={() => {
                                    const input =
                                      document.createElement('input')
                                    input.type = 'file'
                                    input.accept = 'image/*'
                                    input.onchange = (e) => {
                                      const file = (
                                        e.target as HTMLInputElement
                                      ).files?.[0]
                                      if (file) {
                                        handleColorImageSelect(colorValue, file)
                                      }
                                    }
                                    input.click()
                                  }}
                                >
                                  <Button
                                    variant='secondary'
                                    size='icon'
                                    className='h-8 w-8'
                                  >
                                    <FiEdit2 className='h-4 w-4' />
                                  </Button>
                                </div>
                                {(colorImagePreviews[colorValue] ||
                                  existingImage) && (
                                  <Button
                                    variant='destructive'
                                    size='icon'
                                    onClick={() =>
                                      handleColorImageRemove(colorValue)
                                    }
                                    className='h-8 w-8'
                                  >
                                    <FiX className='h-4 w-4' />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className='text-xs text-center text-muted-foreground'>
                              <div className='font-medium'>{colorValue}</div>
                              <div>
                                Used for: {sizesUsingThisColor.join(', ')}
                              </div>
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
            </Card>
          </div>

          {/* Search engine listing Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
            <Card className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiSearch className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Search Engine Listing</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">SEO settings for better visibility</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Page title
                    </label>
                    <Input
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      placeholder="Enter page title"
                      className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Meta description
                    </label>
                    <Textarea
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      placeholder="Enter meta description"
                      className="min-h-[100px] px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      URL and handle
                    </label>
                    <Input
                      name="seoUrl"
                      value={formData.seoUrl}
                      onChange={handleInputChange}
                      placeholder="Enter URL handle"
                      className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column - Settings & Organization */}
        <div className='col-span-4 space-y-6'>
          {/* Status Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiSettings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Status</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Product status and visibility</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Visibility
                    </label>
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    >
                      <option value="online">Online Store</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Featured
                    </label>
                    <select
                      name="featured"
                      value={formData.featured}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Organization Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiTag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Organization</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Category and brand assignment</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    >
                      <option value="">Select a category</option>
                      {renderCategoryOptions(taxonomyItems)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Brand
                    </label>
                    <select
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    >
                      <option value="">Select a brand</option>
                      {brands
                        .filter((brand) => brand.status === 'active')
                        .map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Tags Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiTag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tags</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Product tags for organization</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <Input
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Enter tags separated by commas"
                      className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
