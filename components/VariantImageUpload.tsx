'use client'

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { FiUpload, FiX, FiEdit2 } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { deleteProductImagesByFilenames } from '@/lib/utils/blob-utils'
import { addCacheBuster } from '@/lib/utils/image-utils'

interface VariantImageUploadProps {
  variantId: string
  color: string
  initialImage?: string
  onImageChange: (variantId: string, imageOrFile: string | File) => void
  styleId: number
}

export function VariantImageUpload({ variantId, color, initialImage, onImageChange, styleId }: VariantImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    // Always update preview based on initialImage, even if it's empty
    setPreview(initialImage || null)
    // Clear file state when initialImage changes
    if (!initialImage) {
      setFile(null)
    }
  }, [initialImage])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return
      const file = acceptedFiles[0]
      setFile(file)
      const url = URL.createObjectURL(file)
      setPreview(url)
      // Always attempt to delete by filename before upload (handles same-name re-upload)
      // Variant images: products/{styleId}-{size}-{color}.jpg
      // We'll need to get size and color from props or context if available
      if (typeof window !== 'undefined' && file && color && styleId) {
        // Try to extract size from variantId if possible (or pass as prop in future)
        // For now, assume variantId is unique enough
        const variantFilename = `${styleId}-${variantId}.jpg`
        await deleteProductImagesByFilenames([variantFilename])
      }
      // Pass the file to parent with cache-busting info
      onImageChange(variantId, file)
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    disabled: false
  })

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    onImageChange(variantId, '')
  }

  return (
    <div className="relative aspect-square w-24 h-24 group">
      {preview ? (
        <>
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt={`${color} variant image`}
              fill
              className="object-cover rounded-lg"
              unoptimized
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
              >
                <FiEdit2 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8"
            >
              <FiX className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div
          {...getRootProps()}
          className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
        >
          <input {...getInputProps()} />
          <FiUpload className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </div>
  )
} 