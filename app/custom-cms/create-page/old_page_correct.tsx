'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiCheck, FiBold, FiItalic, FiUnderline, FiLink, FiList, FiImage, FiCode, FiTable, FiX, FiSave, FiEye } from 'react-icons/fi'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
}

export default function CreatePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [touched, setTouched] = useState<{ title?: boolean; slug?: boolean }>({})
  const [content, setContent] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Auto-fill slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!touched.slug) setSlug(slugify(val))
  }
  const handleSlugChange = (val: string) => {
    setSlug(val)
    setTouched(t => ({ ...t, slug: true }))
  }

  // Tiptap Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setContent(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[400px] px-6 py-4 bg-white dark:bg-gray-800 rounded-lg border-0 focus:outline-none text-gray-900 dark:text-white',
      },
    },
    immediatelyRender: false,
  })

  const isValid = title.trim() && slug.trim() && editor?.getText().trim()

  // Toolbar actions
  const addImage = () => {
    const url = window.prompt('Enter image URL')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Premium Header Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              onClick={() => router.back()}
              aria-label="Cancel"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Page</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              title="Preview"
            >
              <FiEye className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={!isValid}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <FiSave className="w-4 h-4" />
              Save Page
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Page Settings */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Page Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, title: true }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                placeholder="Enter page title..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">URL Slug <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, slug: true }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                placeholder="page-url-slug"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from title</p>
            </div>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {editor && (
            <div className="flex flex-col h-full">
              {/* Premium Toolbar */}
              <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('bold') ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`} title="Bold"><FiBold className="w-4 h-4" /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('italic') ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`} title="Italic"><FiItalic className="w-4 h-4" /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('underline') ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`} title="Underline"><FiUnderline className="w-4 h-4" /></button>
                </div>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`} title="Heading 1"><span className="font-bold text-sm">H1</span></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`} title="Heading 2"><span className="font-bold text-sm">H2</span></button>
                </div>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('bulletList') ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`} title="Bullet List"><FiList className="w-4 h-4" /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('orderedList') ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`} title="Numbered List"><FiList className="w-4 h-4" /></button>
                </div>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => editor.chain().focus().setLink({ href: window.prompt('Enter URL') || '' }).run()} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" title="Link"><FiLink className="w-4 h-4" /></button>
                  <button type="button" onClick={addImage} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" title="Image"><FiImage className="w-4 h-4" /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive('codeBlock') ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`} title="Code Block"><FiCode className="w-4 h-4" /></button>
                  <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" title="Table"><FiTable className="w-4 h-4" /></button>
                </div>
              </div>
              
              {/* Editor Content */}
              <div className="flex-1 overflow-auto">
                <EditorContent editor={editor} className="h-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Page Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 