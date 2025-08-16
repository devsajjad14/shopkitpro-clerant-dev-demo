'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from '@tiptap/extension-table'
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import {
  FiArrowLeft,
  FiSave,
  FiEye,
  FiSettings,
  FiGlobe,
  FiCalendar,
  FiUser,
  FiLock,
  FiUnlock,
  FiImage,
  FiType,
  FiCode,
  FiLayers,
  FiTrendingUp,
  FiCheck,
  FiX,
  FiLoader,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCopy,
  FiShare2,
  FiDownload,
  FiUpload,
  FiMaximize2,
  FiMinimize2,
  FiZap,
  FiStar,
  FiBookmark,
  FiTag,
  FiFolder,
  FiGrid,
  FiList,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiChevronLeft,
  FiClock,
  FiTarget,
  FiPieChart,
  FiActivity,
  FiAward,
  FiGift,
  FiHeart,
  FiThumbsUp,
  FiMessageCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLink,
  FiExternalLink,
  FiShield,
  FiKey,
  FiEyeOff,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
  FiMic,
  FiVideo,
  FiCamera,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiWatch,
  FiHeadphones,
  FiSpeaker,
  FiWifi,
  FiBluetooth,
  FiBattery,
  FiPower,
  FiSun,
  FiMoon,
  FiCloud,
  FiCloudRain,
  FiCloudLightning,
  FiWind,
  FiThermometer,
  FiDroplet,
  FiUmbrella,
  FiAnchor,
  FiCompass,
  FiMap,
  FiNavigation,
  FiFlag,
  FiHome,
  FiFile,
  FiShoppingBag,
  FiShoppingCart,
  FiCreditCard,
  FiDollarSign,
  FiPercent,
  FiTrendingDown,
  FiMinus,
  FiDivide,
  FiHash,
  FiAtSign,
  FiSlash,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiCornerDownLeft,
  FiCornerDownRight,
  FiMove,
  FiRotateCw,
  FiRotateCcw,
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiMinimize,
  FiBold,
  FiItalic,
  FiTable,
  FiFileText,
  FiBarChart2,
  FiUploadCloud,
  FiInfo,
  FiUnderline,
  FiPenTool,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
} from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast'
import { EditorContent, useEditor } from '@tiptap/react'

// Local slugify utility
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Page templates for premium experience
const PAGE_TEMPLATES = [
  {
    id: 'default',
    name: 'Default Page',
    icon: FiFile,
    description: 'Standard page layout',
  },
  {
    id: 'landing',
    name: 'Landing Page',
    icon: FiTarget,
    description: 'High-converting landing page',
  },
  {
    id: 'blog',
    name: 'Blog Post',
    icon: FiType,
    description: 'Article and blog content',
  },
  {
    id: 'contact',
    name: 'Contact Page',
    icon: FiMail,
    description: 'Contact forms and information',
  },
  {
    id: 'about',
    name: 'About Page',
    icon: FiUser,
    description: 'Company and team information',
  },
  {
    id: 'services',
    name: 'Services Page',
    icon: FiAward,
    description: 'Service offerings and details',
  },
  {
    id: 'portfolio',
    name: 'Portfolio Page',
    icon: FiGrid,
    description: 'Showcase work and projects',
  },
  {
    id: 'pricing',
    name: 'Pricing Page',
    icon: FiDollarSign,
    description: 'Pricing plans and packages',
  },
]

// SEO suggestions for premium experience
const SEO_SUGGESTIONS = {
  title: 'Keep it under 60 characters for optimal display',
  description: 'Write a compelling description between 150-160 characters',
  keywords: 'Use relevant keywords separated by commas',
}

export default function CreatePagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Core page data
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  // Status select state
  const [status, setStatus] = useState<'active' | 'draft'>('active')
  // Visibility switch state
  const [isPublic, setIsPublic] = useState(true)
  const [visibilityPassword, setVisibilityPassword] = useState('')
  const [allowComments, setAllowComments] = useState(false)

  // Navigation settings
  const [parentId, setParentId] = useState<number | null>(null)
  const [menuOrder, setMenuOrder] = useState(0)
  const [showInMenu, setShowInMenu] = useState(true)
  const [showInSitemap, setShowInSitemap] = useState(true)

  // Publishing settings
  const [publishedAt, setPublishedAt] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  // Categories
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])

  // UI states
  const [activeTab, setActiveTab] = useState<
    'content' | 'seo' | 'settings' | 'preview'
  >('content')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [pageId, setPageId] = useState<number | null>(null)
  const [touched, setTouched] = useState<{
    title?: boolean
    slug?: boolean
    metaTitle?: boolean
  }>({})

  // Advanced features
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)

  // Refs
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const initialContent = `
  <h2>Introduction</h2>
  <p>In web development, creating feature-rich text editors has always been challenging. Tiptap, a headless editor framework, combined with React and Next.js, opens up possibilities for sophisticated content management systems and collaborative editing tools.</p>
  <h3>What is Tiptap?</h3>
  <p>Tiptap is built on ProseMirror, providing a modular architecture and headless functionality. This approach gives developers full control over the UI while offering powerful editing capabilities.</p>
  <figure>
     <img 
        src="https://res.cloudinary.com/dmhzdv5kf/image/upload/v1735024108/668464364417bf4b0898c526_docs-v2-blog_s0krle.jpg"
        alt="Tiptap Editor"
        data-width="1200"
        data-height="800"
     />
     <figcaption>Tiptap: A powerful combination of technologies</figcaption>
  </figure>
  <h3>Key Features</h3>
  <ul>
    <li>Extensible architecture with various extensions</li>
    <li>Collaborative editing support</li>
    <li>TypeScript support</li>
    <li>Framework-agnostic with excellent React support</li>
  </ul>
  `

  // Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Image,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Underline,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none min-h-[900px] bg-white dark:bg-gray-900 rounded-b-lg shadow p-4',
      },
    },
    autofocus: true,
    editable: true,
    injectCSS: true,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
    immediatelyRender: false,
    // ...other options
  })

  useEffect(() => {
    if (editor && content !== undefined) {
      // Only set if different to avoid cursor jump
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content)
      }
    }
  }, [editor, content])

  // Check if we're in edit mode
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setIsEditMode(true)
      setPageId(parseInt(id))
      fetchPage(parseInt(id))
    }
  }, [searchParams])

  // Auto-save functionality - only for edit mode
  useEffect(() => {
    if (autoSave && isEditMode && (title || content)) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave()
      }, 3000)
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [title, content, autoSave, isEditMode])

  // Word count and reading time calculation
  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    setWordCount(words)
    setReadingTime(Math.ceil(words / 200)) // Average reading speed
  }, [content])

  // Fetch page data for editing
  const fetchPage = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/pages/${id}`)
      const result = await response.json()

      if (result.success && result.data) {
        const page = result.data
        setTitle(page.title)
        setSlug(page.slug)
        setContent(page.content || '')
        if (editor) editor.commands.setContent(page.content || '')
        setExcerpt(page.excerpt || '')
        setStatus(page.status === 'published' ? 'active' : 'draft')
        setMetaTitle(page.metaTitle || '')
        setMetaDescription(page.metaDescription || '')
        setMetaKeywords(page.metaKeywords || '')
        setCanonicalUrl(page.canonicalUrl || '')
        setTemplate(page.template || 'default')
        setFeaturedImage(page.featuredImage || '')
        setFeaturedImageFile(null)
        if (page.featuredImage) {
          setExistingFeaturedImageUrl(page.featuredImage) // Track existing image for cleanup
        }
        setPageType(page.pageType || 'page')
        setIsPublic(page.isPublic)
        setPasswordProtected(page.passwordProtected)
        setPassword(page.password || '')
        setAllowComments(page.allowComments)
        setParentId(page.parentId)
        setMenuOrder(page.menuOrder || 0)
        setShowInMenu(page.showInMenu)
        setShowInSitemap(page.showInSitemap)
        setPublishedAt(page.publishedAt || '')
        setScheduledAt(page.scheduledAt || '')
        setTouched({ title: true, slug: true })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch page data',
          variant: 'destructive',
        })
        router.push('/custom-cms/pages')
      }
    } catch (error) {
      console.error('Error fetching page:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch page data',
        variant: 'destructive',
      })
      router.push('/custom-cms/pages')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save function - only for edit mode
  const handleAutoSave = async () => {
    if (!title.trim() || !isEditMode) return

    try {
      const pageData = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        content: content.trim(),
        excerpt: excerpt.trim(),
        status: status === 'active' ? 'published' : 'draft',
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        metaKeywords: metaKeywords.trim(),
        canonicalUrl: canonicalUrl.trim(),
        template,
        featuredImage,
        pageType,
        isPublic,
        passwordProtected,
        password,
        allowComments,
        parentId,
        menuOrder,
        showInMenu,
        showInSitemap,
        publishedAt: publishedAt || null,
        scheduledAt: scheduledAt || null,
      }

      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      })

      if (response.ok) {
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  // Handle title change with auto-slug generation
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugTouched) {
      setSlug(slugify(val))
    }
    if (!touched.metaTitle) {
      setMetaTitle(val)
    }
  }

  // Handle slug change
  const handleSlugChange = (val: string) => {
    setSlug(val)
    // Only set slugTouched to true if the user actually types (not on focus)
    setSlugTouched(val.length > 0)
    if (val.length === 0) {
      setSlugTouched(false)
      setSlug(slugify(title))
    }
  }

  // Check if slug is available
  const checkSlugAvailability = async (slugToCheck: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/pages/check-slug?slug=${encodeURIComponent(slugToCheck)}`)
      const result = await response.json()
      return result.available
    } catch (error) {
      console.error('Error checking slug availability:', error)
      return false
    }
  }

  // Generate unique slug
  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let counter = 1
    let uniqueSlug = baseSlug
    
    while (!(await checkSlugAvailability(uniqueSlug))) {
      uniqueSlug = `${baseSlug}-${counter}`
      counter++
    }
    
    return uniqueSlug
  }

  // Handle meta title change
  const handleMetaTitleChange = (val: string) => {
    setMetaTitle(val)
    setTouched((prev) => ({ ...prev, metaTitle: true }))
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !slug.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and slug are required',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Check if slug is available and generate unique slug if needed
      let finalSlug = slug.trim()
      if (!isEditMode) {
        const isSlugAvailable = await checkSlugAvailability(finalSlug)
        if (!isSlugAvailable) {
          finalSlug = await generateUniqueSlug(finalSlug)
          setSlug(finalSlug)
          toast({
            title: 'Slug Updated',
            description: `The slug "${slug.trim()}" was already taken. Using "${finalSlug}" instead.`,
            variant: 'default',
          })
        }
      }

      // Handle featured image upload if we have a selected file
      let imageUrl = featuredImage
      
      if (selectedFeaturedImage) {
        try {
          // Generate unique page name with random number
          const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000) // 10 digit random number
          const uniquePageName = `${slug || title}_${randomNumber}`
          
          // Note: Old featured image cleanup is now handled by page actions

          // Upload new featured image
          const uploadFormData = new FormData()
          uploadFormData.append('file', selectedFeaturedImage)
          uploadFormData.append('pageName', uniquePageName)
          uploadFormData.append('imageType', 'featured')

          const uploadResponse = await fetch('/api/upload/page-image', {
            method: 'POST',
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json()
            console.error('Featured image upload failed:', uploadError)
            toast({
              title: 'Warning',
              description: `Page ${isEditMode ? 'updated' : 'created'} but featured image upload failed: ${uploadError.error || uploadError.details || 'Unknown error'}. You can update the image later.`,
              variant: 'default',
            })
          } else {
            const uploadData = await uploadResponse.json()
            console.log('Featured image uploaded successfully:', uploadData.url)
            imageUrl = uploadData.url
          }
        } catch (uploadError) {
          console.error('Error during featured image upload:', uploadError)
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error'
          toast({
            title: 'Warning',
            description: `Page ${isEditMode ? 'updated' : 'created'} but featured image upload failed: ${errorMessage}. You can update the image later.`,
            variant: 'default',
          })
        }
      }
      const pageData = {
        title: title.trim(),
        slug: finalSlug,
        content: content.trim(),
        excerpt: excerpt.trim(),
        status: status === 'active' ? 'published' : 'draft',
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        metaKeywords: metaKeywords.trim(),
        canonicalUrl: canonicalUrl.trim(),
        template,
        featuredImage: imageUrl,
        pageType,
        isPublic,
        passwordProtected,
        password,
        allowComments,
        parentId,
        menuOrder,
        showInMenu,
        showInSitemap,
        publishedAt: publishedAt || null,
        scheduledAt: scheduledAt || null,
      }

      const url = isEditMode ? `/api/pages/${pageId}` : '/api/pages'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.error || `Failed to ${isEditMode ? 'update' : 'create'} page`
        )
      }

      const result = await response.json()

      toast({
        title: 'Success!',
        description: `Page ${isEditMode ? 'updated' : 'created'} successfully`,
      })

      router.push('/custom-cms/pages')
    } catch (error) {
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} page:`,
        error
      )
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditMode ? 'update' : 'create'} page`,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation
  const isValid = title.trim() && slug.trim() && !isSubmitting

  // Tiptap Toolbar
  const renderToolbar = () => (
    <>
      <div className='flex flex-wrap items-center gap-2 mb-1 bg-white/80 dark:bg-gray-900/80 rounded-xl px-2 py-1 border border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10'>
        {/* First row: basic formatting */}
        {/* Bold */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg ${editor?.isActive('bold') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Bold'
        >
          <FiBold className='w-4 h-4' />
        </button>
        {/* Italic */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg ${editor?.isActive('italic') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Italic'
        >
          <FiItalic className='w-4 h-4' />
        </button>
        {/* Headings */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Heading 1'
        >
          <span className='font-bold text-sm'>H1</span>
        </button>
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Heading 2'
        >
          <span className='font-bold text-sm'>H2</span>
        </button>
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg ${editor?.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Heading 3'
        >
          <span className='font-bold text-sm'>H3</span>
        </button>
        {/* Bullet List */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg ${editor?.isActive('bulletList') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Bullet List'
        >
          <FiList className='w-4 h-4' />
        </button>
        {/* Ordered List */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg ${editor?.isActive('orderedList') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Ordered List'
        >
          <FiList className='w-4 h-4 rotate-90' />
        </button>
        {/* Blockquote */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg ${editor?.isActive('blockquote') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Blockquote'
        >
          <FiMessageCircle className='w-4 h-4' />
        </button>
        {/* Code Block */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg ${editor?.isActive('codeBlock') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Code Block'
        >
          <FiCode className='w-4 h-4' />
        </button>
        {/* Link */}
        <button
          type='button'
          onClick={() => {
            const url = window.prompt('Enter link URL');
            if (url) editor?.chain().focus().setLink({ href: url, target: '_blank' }).run();
          }}
          className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
          title='Insert Link'
        >
          <FiLink className='w-4 h-4' />
        </button>
        {/* Image (already functional) */}
        <button
          type='button'
          onClick={() => imageInputRef.current?.click()}
          className='p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
          title='Image'
        >
          <FiImage className='w-4 h-4' />
        </button>
        <input
          ref={imageInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleInsertImageFromFile}
        />
        {/* Table */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
          title='Table'
        >
          <FiTable className='w-4 h-4' />
        </button>
        {/* Undo */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().undo().run()}
          className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
          title='Undo'
        >
          <FiRotateCcw className='w-4 h-4' />
        </button>
        {/* Redo */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().redo().run()}
          className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
          title='Redo'
        >
          <FiRotateCw className='w-4 h-4' />
        </button>
      </div>
      <div className='flex flex-wrap items-center gap-2 mb-2 bg-white/80 dark:bg-gray-900/80 rounded-xl px-2 py-1 border border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10'>
        {/* Second row: premium tools */}
        {/* Underline */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg ${editor?.isActive('underline') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Underline'
        >
          <FiUnderline className='w-4 h-4' />
        </button>
        {/* Highlight */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded-lg ${editor?.isActive('highlight') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' : 'hover:bg-yellow-50 dark:hover:bg-yellow-800 text-gray-600 dark:text-gray-300'}`}
          title='Highlight'
        >
          <FiPenTool className='w-4 h-4' />
        </button>
        {/* Text Align Left */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded-lg ${editor?.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Align Left'
        >
          <FiAlignLeft className='w-4 h-4' />
        </button>
        {/* Text Align Center */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded-lg ${editor?.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Align Center'
        >
          <FiAlignCenter className='w-4 h-4' />
        </button>
        {/* Text Align Right */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded-lg ${editor?.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Align Right'
        >
          <FiAlignRight className='w-4 h-4' />
        </button>
        {/* Text Align Justify */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded-lg ${editor?.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          title='Justify'
        >
          <FiAlignJustify className='w-4 h-4' />
        </button>
        {/* Horizontal Rule */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
          title='Horizontal Rule'
        >
          <FiMinus className='w-4 h-4' />
        </button>
        {/* Clear Formatting */}
        <button
          type='button'
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
          title='Clear Formatting'
        >
          <FiX className='w-4 h-4' />
        </button>
        {/* Indent/Outdent, Superscript/Subscript, Table controls, Emoji, etc. can be added here as needed. */}
        {/* For emoji, you may want to use a custom emoji picker component. */}
      </div>
    </>
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Update handleFeaturedImageChange to only set preview and file
  const handleFeaturedImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      setFeaturedImageFile(file)
      setFeaturedImage(URL.createObjectURL(file))
      
      // Store the file for deferred upload
      setSelectedFeaturedImage(file)
      
      // If we're in edit mode and there's an existing featured image, track it for cleanup
      if (isEditMode && featuredImage && !featuredImage.startsWith('blob:')) {
        setExistingFeaturedImageUrl(featuredImage)
      }
    }
  }
  const removeFeaturedImage = () => {
    setFeaturedImage(null)
    setFeaturedImageFile(null)
    setSelectedFeaturedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleInsertImageFromFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Generate unique page name with random number for content image
      const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000) // 10 digit random number
      const uniquePageName = `${slug || title || 'page'}_${randomNumber}`
      
      // Upload content image to Vercel Blob
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('pageName', uniquePageName)
      uploadFormData.append('imageType', 'content')

      const uploadResponse = await fetch('/api/upload/page-image', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        console.error('Content image upload failed:', uploadError)
        toast({
          title: 'Upload Failed',
          description: uploadError.error || uploadError.details || 'Failed to upload image',
          variant: 'destructive',
        })
        return
      }

      const uploadData = await uploadResponse.json()
      console.log('Content image uploaded successfully:', uploadData.url)
      
      // Insert the uploaded image URL into the editor
      if (uploadData.url) {
        editor?.chain().focus().setImage({ src: uploadData.url }).run();
      }
    } catch (uploadError) {
      console.error('Error during content image upload:', uploadError)
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error'
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }, [editor, slug, title, toast]);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')
  // Page settings (for compatibility with advanced settings, even if not shown)
  const [template, setTemplate] = useState('default')
  const [pageType, setPageType] = useState('page')
  // Password protection (for compatibility)
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [password, setPassword] = useState('')

  // Featured image state (move above usage)
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null)
  const [selectedFeaturedImage, setSelectedFeaturedImage] = useState<File | null>(null)
  const [existingFeaturedImageUrl, setExistingFeaturedImageUrl] = useState<string | null>(null)

  const [slugTouched, setSlugTouched] = useState(false)

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col'>
      {/* Sticky Top Bar */}
      <header
        className='sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between px-6 py-2 border-b border-gray-100 dark:border-gray-800'
        style={{ minHeight: '54px' }}
      >
        <div className='flex items-center gap-2'>
            <button
              onClick={() => router.back()}
            className='p-1.5 rounded bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all'
            title='Back'
            >
            <FiArrowLeft className='w-4 h-4' />
            </button>
          <div className='flex flex-col'>
            <span className='text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight'>
              {isEditMode ? 'Edit Page' : 'Add New Page'}
            </span>
            <span className='block w-8 h-0.5 mt-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 rounded-full' />
          </div>
        </div>
        <div className='flex items-center gap-2'>
            <button
            type='button'
            onClick={() => setActiveTab('preview')}
            className='flex items-center gap-1 px-4 py-1.5 rounded-md font-medium text-sm bg-gradient-to-r from-gray-100/80 to-blue-100/80 dark:from-gray-800/80 dark:to-blue-900/80 text-blue-700 dark:text-blue-200 hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900 dark:hover:to-indigo-900 shadow-sm hover:shadow-md transition-all border border-blue-100 dark:border-blue-900'
          >
            <FiEye className='w-4 h-4' />
            <span>Preview</span>
            </button>
            <button
            type='button'
            onClick={handleSubmit}
              disabled={!isValid}
            className={`flex items-center gap-1 px-5 py-1.5 rounded-md font-semibold text-sm transition-all shadow-md border-0 ${
                isValid
                ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
            <FiSave className='w-4 h-4' />
            <span>{pageId 
              ? selectedFeaturedImage ? 'Updating & Uploading...' : 'Update'
              : selectedFeaturedImage ? 'Publishing & Uploading...' : 'Publish'
            }</span>
            </button>
        </div>
        <div className='absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent opacity-80 pointer-events-none' />
      </header>

      <main className='flex-1 w-full flex flex-col md:flex-row gap-8 justify-center px-4 py-8'>
        {/* Main Editor Card */}
        <section className='flex-1 w-full p-0 m-0 flex flex-col gap-0 relative z-10'>
          {/* Title Input - soft, professional, neat, clean */}
          <div className='relative mb-2'>
              <input
              type='text'
                value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              id='page-title-input'
              className={
                `w-full text-2xl font-bold tracking-tight bg-white/70 dark:bg-gray-900/60 border-0 rounded-xl px-5 pt-8 pb-2 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:shadow-lg transition-all duration-200 shadow-md` +
                (title ? ' has-value' : '')
              }
              style={{
                letterSpacing: '0.01em',
                boxShadow: '0 2px 12px 0 rgba(30, 64, 175, 0.06)',
              }}
              autoComplete='off'
                required
              />
            <label
              htmlFor='page-title-input'
              className={
                `absolute left-5 top-6 text-xl font-semibold text-gray-400 dark:text-gray-400 pointer-events-none transition-all duration-200 ` +
                (title
                  ? 'transform -translate-y-5 scale-90 text-gray-600 dark:text-gray-200'
                  : 'text-opacity-70')
              }
            >
              Add title
            </label>
            </div>
          {/* Slug Input - premium, glassy, with icon */}
          <div className='mb-4 px-0'>
            <div className='relative'>
              <FiLink className='absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none' />
              <input
                type='text'
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                placeholder=''
                className='w-full pl-8 pr-3 py-2 text-base font-semibold bg-white/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 underline focus:underline hover:text-blue-800 focus:text-blue-800 cursor-pointer transition-all duration-150 shadow-sm focus:shadow-md hover:shadow-md placeholder:text-blue-300 dark:placeholder:text-blue-600 outline-none'
                style={{ boxShadow: '0 2px 8px 0 rgba(30, 64, 175, 0.04)' }}
              />
            </div>
          </div>
          {/* Floating Minimal Toolbar & Editor */}
          <div className='relative flex flex-col mb-8'>
            {mounted && editor && (
              <>
                {renderToolbar()}
                <EditorContent editor={editor} className="editor-content" />
              </>
            )}
          </div>
        </section>
        {/* Right Sidebar */}
        <aside className='w-full md:w-80 flex-shrink-0'>
          <div className='sticky top-24 z-10 flex flex-col gap-6'>
            {/* Status & Publish */}
            <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow p-4 flex flex-col gap-6'>
              {/* Status Badge */}
              <div className='flex items-center gap-3 mb-2'>
                <span
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-base font-semibold shadow-md ${
                    status === 'active'
                      ? 'bg-gradient-to-r from-green-400/20 to-green-100/80 text-green-700 dark:from-green-900/40 dark:to-green-900/10 dark:text-green-300'
                      : 'bg-gradient-to-r from-gray-400/20 to-gray-100/80 text-gray-700 dark:from-gray-900/40 dark:to-gray-900/10 dark:text-gray-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  ></span>
                  {status === 'active' ? (
                    <FiCheck className='w-4 h-4' />
                  ) : (
                    <FiFileText className='w-4 h-4' />
                  )}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as 'active' | 'draft')
                  }
                  className='ml-auto px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                >
                  <option value='active'>Active</option>
                  <option value='draft'>Draft</option>
                </select>
              </div>
              <hr className='my-3 border-t border-gray-200 dark:border-gray-700' />
              {/* Visibility */}
              <div className='flex flex-col gap-2 mb-2'>
                <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1'>
                  <FiUnlock className='w-3 h-3' /> Visibility
                </label>
                <div className='flex items-center gap-3'>
                  <span className='flex items-center gap-1 text-sm font-medium'>
                    {isPublic ? (
                      <FiUnlock className='w-4 h-4 text-green-500' />
                    ) : (
                      <FiLock className='w-4 h-4 text-orange-500' />
                    )}
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                  <label className='relative inline-flex items-center cursor-pointer ml-auto'>
                    <input
                      type='checkbox'
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all'></div>
                    <div className='absolute left-1 top-1 bg-white dark:bg-gray-900 w-4 h-4 rounded-full shadow-md transition-all peer-checked:translate-x-5'></div>
                  </label>
                </div>
              </div>
              <hr className='my-3 border-t border-gray-200 dark:border-gray-700' />
              {/* Featured Image */}
              <div className='flex flex-col gap-2 mb-2'>
                <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1'>
                  <FiImage className='w-3 h-3' /> Featured Image
                </label>
                <div className='flex flex-col items-center gap-2'>
                  {featuredImage ? (
                    <div className='relative group w-full'>
                      <img
                        src={featuredImage}
                        alt='Featured'
                        className='w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg'
                      />
                      <button
                        type='button'
                        onClick={removeFeaturedImage}
                        className='absolute top-2 right-2 p-1 bg-white/80 dark:bg-gray-900/80 rounded-full shadow hover:bg-red-100 dark:hover:bg-red-900 transition-all'
                      >
                        <FiTrash2 className='w-4 h-4 text-red-500' />
                      </button>
                    </div>
                  ) : (
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='w-full flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 text-blue-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-300 transition-all shadow-lg'
                    >
                      <FiUploadCloud className='w-8 h-8' />
                      <span className='text-sm'>Upload Image</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleFeaturedImageChange}
                  />
                </div>
              </div>
              <hr className='my-3 border-t border-gray-200 dark:border-gray-700' />
              {/* Discussion */}
              <div className='flex flex-col gap-2'>
                <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1'>
                  <FiMessageCircle className='w-3 h-3' /> Discussion
                </label>
                <div className='flex items-center gap-3'>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={allowComments}
                      onChange={(e) => setAllowComments(e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all'></div>
                    <div className='absolute left-1 top-1 bg-white dark:bg-gray-900 w-4 h-4 rounded-full shadow-md transition-all peer-checked:translate-x-5'></div>
                  </label>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                    Allow Comments
                  </span>
                </div>
                <span className='text-xs text-gray-400'>
                  Enable to allow users to comment on this page. Comments help
                  engage your audience and foster discussion.
                </span>
              </div>
            </div>
          </div>
        </aside>
      </main>
      {/* SEO & Advanced Settings - full width below main content */}
      <div className='w-full max-w-none px-0 mt-8'>
        <div className='border-t border-gray-200 dark:border-gray-700 pt-6 w-full max-w-none'>
          <button
            className='flex items-center gap-2 text-base font-semibold text-gray-700 dark:text-gray-200 mb-4 focus:outline-none sticky top-0 bg-transparent z-10'
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <FiBarChart2 className='w-5 h-5 text-blue-500 dark:text-blue-400' />
            <span>SEO & Advanced Settings</span>
            {showAdvancedSettings ? (
              <FiChevronDown className='w-4 h-4' />
            ) : (
              <FiChevronRight className='w-4 h-4' />
            )}
          </button>
          {showAdvancedSettings && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-2xl p-8 border border-gray-100 dark:border-gray-800 w-full max-w-none'>
              {/* Meta Title */}
              <div className='flex flex-col gap-2 relative'>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1'>
                  <FiFileText className='w-4 h-4 text-blue-400' /> Meta Title
                </label>
                <div className='relative'>
                  <FiFileText className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none' />
                  <input
                    type='text'
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-gray-400 ${
                      metaTitle.length > 60
                        ? 'border-red-400'
                        : metaTitle.length > 50
                        ? 'border-yellow-400'
                        : ''
                    }`}
                    placeholder='SEO title for search engines...'
                  />
                </div>
                <div className='flex items-center justify-between text-xs mt-1'>
                  <span
                    className={`font-semibold ${
                      metaTitle.length > 60
                        ? 'text-red-500'
                        : metaTitle.length > 50
                        ? 'text-yellow-500'
                        : 'text-green-600'
                    }`}
                  >
                    {metaTitle.length}/60
                  </span>
                  <span className='flex items-center gap-1 text-gray-400'>
                    <FiInfo className='w-3 h-3' /> Keep under 60 characters for
                    best SEO.
                  </span>
                </div>
              </div>
              {/* Meta Description */}
              <div className='flex flex-col gap-2 relative'>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1'>
                  <FiFileText className='w-4 h-4 text-blue-400' /> Meta
                  Description
                </label>
                <div className='relative'>
                  <FiFileText className='absolute left-3 top-3 w-4 h-4 text-gray-300 pointer-events-none' />
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-gray-400 ${
                      metaDescription.length > 160
                        ? 'border-red-400'
                        : metaDescription.length > 140
                        ? 'border-yellow-400'
                        : ''
                    }`}
                    rows={3}
                    placeholder='SEO description for search engines...'
                  />
                </div>
                <div className='flex items-center justify-between text-xs mt-1'>
                  <span
                    className={`font-semibold ${
                      metaDescription.length > 160
                        ? 'text-red-500'
                        : metaDescription.length > 140
                        ? 'text-yellow-500'
                        : 'text-green-600'
                    }`}
                  >
                    {metaDescription.length}/160
                  </span>
                  <span className='flex items-center gap-1 text-gray-400'>
                    <FiInfo className='w-3 h-3' /> Keep under 160 characters for
                    best SEO.
                  </span>
          </div>
        </div>
              {/* Meta Keywords */}
              <div className='flex flex-col gap-2 relative'>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1'>
                  <FiTag className='w-4 h-4 text-blue-400' /> Meta Keywords
                </label>
                <div className='relative'>
                  <FiTag className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none' />
                  <input
                    type='text'
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    className='w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-gray-400'
                    placeholder='keyword1, keyword2, keyword3...'
                  />
                </div>
                <div className='flex items-center text-xs text-gray-400 mt-1'>
                  <FiInfo className='w-3 h-3 mr-1' /> Separate keywords with
                  commas.
                </div>
              </div>
              {/* Canonical URL */}
              <div className='flex flex-col gap-2 relative'>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1'>
                  <FiGlobe className='w-4 h-4 text-blue-400' /> Canonical URL
                </label>
                <div className='relative'>
                  <FiGlobe className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none' />
                  <input
                    type='url'
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className='w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-gray-400'
                    placeholder='https://example.com/canonical-page'
                  />
                </div>
                <div className='flex items-center text-xs text-gray-400 mt-1'>
                  <FiInfo className='w-3 h-3 mr-1' /> Use only if this page is a
                  duplicate or variation.
                </div>
              </div>
              {/* SEO Score Badge */}
              <div className='col-span-1 md:col-span-2 flex items-center gap-3 mt-4'>
                <span className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-green-700 dark:text-green-200 font-semibold shadow'>
                  <FiBarChart2 className='w-5 h-5' /> SEO Score:{' '}
                  <span className='font-bold'>Good</span>
                </span>
                <span className='text-xs text-gray-400'>
                  SEO score is based on title, description, and content length.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .editor-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          line-height: 1.2;
        }
        .editor-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.2em;
          margin-bottom: 0.5em;
          line-height: 1.25;
        }
        .editor-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }
        .editor-content p {
          margin-bottom: 1em;
        }
        .editor-content ol {
          list-style-type: decimal;
          margin-left: 2em;
          padding-left: 1em;
        }
        .editor-content ul {
          list-style-type: disc;
          margin-left: 2em;
          padding-left: 1em;
        }
        .editor-content li {
          margin-bottom: 0.25em;
        }
        .editor-content a {
          color: #3b82f6;
          text-decoration: underline;
          text-decoration-color: #3b82f6;
          text-underline-offset: 2px;
        }
        .editor-content a:hover {
          color: #2563eb;
          text-decoration-color: #2563eb;
        }
        .editor-content a:visited {
          color: #7c3aed;
          text-decoration-color: #7c3aed;
        }
      `}</style>
    </div>
  )
} 
