'use client'

import React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiArrowDown,
  FiUpload,
  FiImage,
  FiType,
  FiLink,
  FiCalendar,
  FiEye,
  FiSmartphone,
  FiMonitor,
  FiSettings,
  FiCheck,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiCopy,
  FiDownload,
  FiGlobe,
  FiTarget,
  FiBarChart2,
  FiZap,
  FiDroplet,
  FiSave,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiMaximize2,
  FiMinimize2,
  FiLayers,
  FiGrid,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiBold,
  FiItalic,
  FiUnderline,
  FiMove,
  FiCrop,
  FiFilter,
  FiLayout,
  FiSquare,
  FiSliders,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
  FiCode,
  FiFileText,
  FiInfo,
} from 'react-icons/fi'
import {
  uploadCustomCmsBannerImage,
  getCustomCmsBannerImageUrl,
} from '@/lib/utils/custom-cms-banner-image'
import { Tooltip } from '@/components/ui/tooltip' // If you have a tooltip component, otherwise use a simple span
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import ReactDOM from 'react-dom'

// Add this helper at the top of the file or inside MainBannerCanvas:
function parseStyleString(styleStr: string): React.CSSProperties {
  const style: React.CSSProperties = {}
  styleStr.split(';').forEach((s) => {
    const [key, val] = s.split(':')
    if (key && val) {
      // Convert kebab-case to camelCase
      const camelKey = key
        .trim()
        .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      if (camelKey in style) {
        ;(style as any)[camelKey as keyof React.CSSProperties] = val.trim()
      }
    }
  })
  return style
}

function BannerContent({
  bannerData,
  devicePreview,
  isInDeviceFrame = false,
}: {
  bannerData: any
  devicePreview: 'desktop' | 'mobile'
  isInDeviceFrame?: boolean
}) {
  // Sizes for mini banner - more compact scaling
  const mobileScale = devicePreview === 'mobile' && !isInDeviceFrame ? 0.7 : 1
  const mobileWidth = 320
  const mobileHeight = 220

  // --- FIX: Use ref to manage blob URL lifecycle ---
  const blobUrlRef = React.useRef<string | null>(null)
  const [imageSrc, setImageSrc] = React.useState<string | null>(null)

  React.useEffect(() => {
    // If a new file is selected, create a new blob URL
    if (bannerData.bannerImage) {
      // Revoke previous blob URL if exists
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
      const newBlobUrl = URL.createObjectURL(bannerData.bannerImage)
      blobUrlRef.current = newBlobUrl
      setImageSrc(newBlobUrl)
    } else if (bannerData.bannerImageUrl) {
      // If using a remote image URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
      setImageSrc(bannerData.bannerImageUrl)
    } else {
      // No image
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
      setImageSrc(null)
    }
    // Cleanup on unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [bannerData.bannerImage, bannerData.bannerImageUrl])

  const hasValidImageSrc =
    imageSrc && (imageSrc.startsWith('blob:') || imageSrc.startsWith('http'))

  return (
    <>
      {hasValidImageSrc ? (
        <img
          src={imageSrc!}
          alt='Banner preview'
          className='w-full h-full object-cover'
          onError={(e) => {
            console.error('Banner content image failed to load:', e)
            console.error('Failed image src:', imageSrc)
            console.error('Banner data:', bannerData)
            console.error('Image element:', e.target)
            console.error('Error details:', {
              src: imageSrc,
              type: typeof imageSrc,
              length: imageSrc?.length,
              startsWithBlob: imageSrc?.startsWith('blob:'),
              startsWithHttp: imageSrc?.startsWith('http'),
            })
          }}
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center'>
          <div className='text-center'>
            <FiImage className='w-16 h-16 text-gray-400 mx-auto mb-4' />
          </div>
        </div>
      )}
      {/* Text Overlay */}
      <div
        className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent'
        style={{ opacity: bannerData.overlayOpacity }}
      >
        {/* Title */}
        {bannerData.showTitle && (
          <div
            className='absolute w-full px-4 sm:px-6 md:px-8 transition-all duration-200 flex flex-col items-center justify-start'
            style={{
              top: `${bannerData.titlePosition?.y ?? 20}%`,
              left: `${bannerData.titlePosition?.x ?? 50}%`,
              transform: 'translate(-50%, -50%)',
              marginTop: `${bannerData.titleMarginTop || 0}px`,
              marginRight: `${bannerData.titleMarginRight || 0}px`,
              marginBottom: `${bannerData.titleMarginBottom || 0}px`,
              marginLeft: `${bannerData.titleMarginLeft || 0}px`,
              paddingTop: `${bannerData.titlePaddingTop || 0}px`,
              paddingRight: `${bannerData.titlePaddingRight || 0}px`,
              paddingBottom: `${bannerData.titlePaddingBottom || 0}px`,
              paddingLeft: `${bannerData.titlePaddingLeft || 0}px`,
            }}
          >
            <h3
              className={`${
                bannerData.titleBold ? 'font-bold' : 'font-normal'
              } ${bannerData.titleItalic ? 'italic' : 'not-italic'} ${
                bannerData.titleUnderline ? 'underline' : 'no-underline'
              } text-center w-full max-w-full leading-tight break-words hyphens-auto ${
                !bannerData.title ? 'opacity-50 italic' : ''
              }`}
              style={{
                fontSize: bannerData.titleCustomFontSize
                  ? devicePreview === 'mobile'
                    ? `${Math.max(
                        parseInt(bannerData.titleCustomFontSize) * 0.6,
                        14
                      )}px`
                    : `${bannerData.titleCustomFontSize}px`
                  : `${(bannerData.titleFontSize || 72) * mobileScale}px`,
                color: bannerData.titleColor || '#EF4444',
              }}
            >
              {bannerData.title || 'Your Banner Title'}
            </h3>
          </div>
        )}

        {/* Subtitle */}
        {bannerData.showSubtitle && (
          <div
            className='absolute w-full px-3 sm:px-4 md:px-6 transition-all duration-200 flex flex-col items-center justify-start'
            style={{
              top: `${bannerData.subtitlePosition?.y ?? 40}%`,
              left: `${bannerData.subtitlePosition?.x ?? 50}%`,
              transform: 'translate(-50%, -50%)',
              marginTop: `${bannerData.subtitleMarginTop || 0}px`,
              marginRight: `${bannerData.subtitleMarginRight || 0}px`,
              marginBottom: `${bannerData.subtitleMarginBottom || 0}px`,
              marginLeft: `${bannerData.subtitleMarginLeft || 0}px`,
              paddingTop: `${bannerData.subtitlePaddingTop || 0}px`,
              paddingRight: `${bannerData.subtitlePaddingRight || 0}px`,
              paddingBottom: `${bannerData.subtitlePaddingBottom || 0}px`,
              paddingLeft: `${bannerData.subtitlePaddingLeft || 0}px`,
            }}
          >
            <p
              className={`opacity-90 ${
                bannerData.subtitleBold ? 'font-bold' : 'font-normal'
              } ${bannerData.subtitleItalic ? 'italic' : 'not-italic'} ${
                bannerData.subtitleUnderline ? 'underline' : 'no-underline'
              } text-center w-full max-w-full leading-tight break-words hyphens-auto ${
                !bannerData.subtitle ? 'opacity-50 italic' : ''
              }`}
              style={{
                fontSize: bannerData.subtitleCustomFontSize
                  ? devicePreview === 'mobile'
                    ? `${Math.max(
                        parseInt(bannerData.subtitleCustomFontSize) * 0.6,
                        12
                      )}px`
                    : `${bannerData.subtitleCustomFontSize}px`
                  : `${(bannerData.subtitleFontSize || 52) * mobileScale}px`,
                color: bannerData.subtitleColor || '#3B82F6',
              }}
            >
              {bannerData.subtitle || 'Your banner subtitle'}
            </p>
          </div>
        )}

        {/* CTA Button */}
        {console.log(
          '[Button Debug] showButton:',
          bannerData.showButton,
          'ctaPosition:',
          bannerData.ctaPosition
        )}
        {bannerData.showButton && (
          <div
            className='absolute w-full px-4 sm:px-6 md:px-8 transition-all duration-200 flex flex-col items-center justify-start'
            style={{
              top: `${bannerData.ctaPosition?.y ?? 65}%`,
              left: `${bannerData.ctaPosition?.x ?? 50}%`,
              transform: 'translate(-50%, -50%)',
              marginTop: `${bannerData.buttonMarginTop || 0}px`,
              marginRight: `${bannerData.buttonMarginRight || 0}px`,
              marginBottom: `${bannerData.buttonMarginBottom || 0}px`,
              marginLeft: `${bannerData.buttonMarginLeft || 0}px`,
              paddingTop: `${bannerData.buttonPaddingTop || 0}px`,
              paddingRight: `${bannerData.buttonPaddingRight || 0}px`,
              paddingBottom: `${bannerData.buttonPaddingBottom || 0}px`,
              paddingLeft: `${bannerData.buttonPaddingLeft || 0}px`,
            }}
          >
            <button
              className='font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2.5 text-center leading-none'
              style={{
                backgroundColor: bannerData.ctaBgColor || '#FFFFFF',
                color: bannerData.ctaColor || '#000000',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textDecoration: 'none',
                fontSize: `${(bannerData.ctaFontSize || 18) * mobileScale}px`,
              }}
            >
              {bannerData.ctaText || 'Shop Now'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function MainBannerCanvas({
  devicePreview,
  bannerData,
  fileInputRef,
  isFullScreen,
}: {
  devicePreview: 'desktop' | 'mobile'
  bannerData: any
  fileInputRef: any
  isFullScreen?: boolean
}) {
  // Sizes for mini banner - more compact than main banners
  const mobileWidth = isFullScreen ? 400 : 320
  const mobileHeight = isFullScreen ? 600 : 220
  const desktopWidth = isFullScreen ? 600 : 400
  const desktopHeight = isFullScreen ? 400 : 250

  // --- FIX: Use ref to manage blob URL lifecycle ---
  const blobUrlRef = React.useRef<string | null>(null)
  const [imageSrc, setImageSrc] = React.useState<string | null>(null)

  React.useEffect(() => {
    // If a new file is selected, create a new blob URL
    if (bannerData.bannerImage) {
      // Revoke previous blob URL if exists
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
      const newBlobUrl = URL.createObjectURL(bannerData.bannerImage)
      blobUrlRef.current = newBlobUrl
      setImageSrc(newBlobUrl)
    } else if (bannerData.bannerImageUrl) {
      // If using a remote image URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
      setImageSrc(bannerData.bannerImageUrl)
    } else {
      // No image
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
      setImageSrc(null)
    }
    // Cleanup on unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [bannerData.bannerImage, bannerData.bannerImageUrl])

  const hasValidImageSrc =
    imageSrc && (imageSrc.startsWith('blob:') || imageSrc.startsWith('http'))

  // Debug log for image state

  return (
    <>
      {/* Mobile Device Frame */}
      {devicePreview === 'mobile' && (
        <div
          className='relative mx-auto'
          style={{ maxWidth: `${mobileWidth}px` }}
        >
          <div
            className='relative mx-auto bg-gray-900 rounded-3xl p-2 shadow-2xl'
            style={{ width: `${mobileWidth}px` }}
          >
            {/* Status Bar */}
            <div className='flex items-center justify-between px-6 py-2 bg-gray-900 rounded-t-2xl'>
              <div className='flex items-center gap-1'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                <div className='w-2 h-2 bg-red-500 rounded-full'></div>
              </div>
              <div className='text-white text-xs font-medium'>9:41</div>
              <div className='flex items-center gap-1'>
                <div className='w-4 h-3 border border-white rounded-sm'></div>
                <div className='w-6 h-2 bg-white rounded-sm'></div>
              </div>
            </div>
            {/* Mobile Screen */}
            <div className='bg-white rounded-b-2xl overflow-hidden'>
              <div className='relative' style={{ height: `${mobileHeight}px` }}>
                {hasValidImageSrc ? (
                  <img
                    src={imageSrc!}
                    alt='Banner preview'
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      console.error('Mobile canvas image failed to load:', e)
                      console.error('Failed image src:', imageSrc)
                      console.error('Banner data:', bannerData)
                      console.error('Image element:', e.target)
                      console.error('Error details:', {
                        src: imageSrc,
                        type: typeof imageSrc,
                        length: imageSrc?.length,
                        startsWithBlob: imageSrc?.startsWith('blob:'),
                        startsWithHttp: imageSrc?.startsWith('http'),
                      })
                    }}
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <div className='text-center'>
                      <FiImage className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                    </div>
                  </div>
                )}
                {/* Text Overlay */}
                <div
                  className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent'
                  style={{ opacity: bannerData.overlayOpacity }}
                >
                  {/* Title */}
                  <div
                    className='absolute w-full px-4 sm:px-6 md:px-8 transition-all duration-200 flex flex-col items-center justify-start'
                    style={{
                      top: `${bannerData.titlePosition?.y ?? 10}%`,
                      left: `${bannerData.titlePosition?.x ?? 50}%`,
                      transform: 'translate(-50%, -50%)',
                      marginTop: `${bannerData.titleMarginTop || 0}px`,
                      marginRight: `${bannerData.titleMarginRight || 0}px`,
                      marginBottom: `${bannerData.titleMarginBottom || 0}px`,
                      marginLeft: `${bannerData.titleMarginLeft || 0}px`,
                      paddingTop: `${bannerData.titlePaddingTop || 0}px`,
                      paddingRight: `${bannerData.titlePaddingRight || 0}px`,
                      paddingBottom: `${bannerData.titlePaddingBottom || 0}px`,
                      paddingLeft: `${bannerData.titlePaddingLeft || 0}px`,
                    }}
                  >
                    <h3
                      className={`${
                        bannerData.titleBold ? 'font-bold' : 'font-normal'
                      } ${bannerData.titleItalic ? 'italic' : 'not-italic'} ${
                        bannerData.titleUnderline ? 'underline' : 'no-underline'
                      } text-center w-full max-w-full leading-tight break-words hyphens-auto ${
                        !bannerData.titleCustomFontSize
                          ? bannerData.titleFontSize
                          : ''
                      }`}
                      style={{
                        fontSize: bannerData.titleCustomFontSize
                          ? devicePreview === 'mobile'
                            ? `${Math.max(
                                parseInt(bannerData.titleCustomFontSize) * 0.6,
                                14
                              )}px`
                            : `${bannerData.titleCustomFontSize}px`
                          : undefined,
                        color: bannerData.titleColor,
                      }}
                    >
                      {bannerData.title || 'Your Banner Title'}
                    </h3>
                  </div>
                  {/* Subtitle */}
                  <div
                    className='absolute w-full px-3 sm:px-4 md:px-6 transition-all duration-200 flex flex-col items-center justify-start'
                    style={{
                      top: `${bannerData.subtitlePosition?.y ?? 25}%`,
                      left: `${bannerData.subtitlePosition?.x ?? 50}%`,
                      transform: 'translate(-50%, -50%)',
                      marginTop: `${bannerData.subtitleMarginTop || 0}px`,
                      marginRight: `${bannerData.subtitleMarginRight || 0}px`,
                      marginBottom: `${bannerData.subtitleMarginBottom || 0}px`,
                      marginLeft: `${bannerData.subtitleMarginLeft || 0}px`,
                      paddingTop: `${bannerData.subtitlePaddingTop || 0}px`,
                      paddingRight: `${bannerData.subtitlePaddingRight || 0}px`,
                      paddingBottom: `${
                        bannerData.subtitlePaddingBottom || 0
                      }px`,
                      paddingLeft: `${bannerData.subtitlePaddingLeft || 0}px`,
                    }}
                  >
                    <p
                      className={`opacity-90 ${
                        bannerData.subtitleBold ? 'font-bold' : 'font-normal'
                      } ${
                        bannerData.subtitleItalic ? 'italic' : 'not-italic'
                      } ${
                        bannerData.subtitleUnderline
                          ? 'underline'
                          : 'no-underline'
                      } text-center w-full max-w-full leading-tight break-words hyphens-auto ${
                        !bannerData.subtitleCustomFontSize
                          ? bannerData.subtitleFontSize
                          : ''
                      }`}
                      style={{
                        fontSize: bannerData.subtitleCustomFontSize
                          ? devicePreview === 'mobile'
                            ? `${Math.max(
                                parseInt(bannerData.subtitleCustomFontSize) *
                                  0.6,
                                12
                              )}px`
                            : `${bannerData.subtitleCustomFontSize}px`
                          : undefined,
                        color: bannerData.subtitleColor,
                      }}
                    >
                      {bannerData.subtitle || 'Your banner subtitle'}
                    </p>
                  </div>
                  {/* CTA Button */}
                  <div
                    className='absolute w-full px-4 sm:px-6 md:px-8 transition-all duration-200 flex flex-col items-center justify-start'
                    style={{
                      top: `${bannerData.ctaPosition?.y ?? 45}%`,
                      left: `${bannerData.ctaPosition?.x ?? 50}%`,
                      transform: 'translate(-50%, -50%)',
                      marginTop: `${bannerData.buttonMarginTop || 0}px`,
                      marginRight: `${bannerData.buttonMarginRight || 0}px`,
                      marginBottom: `${bannerData.buttonMarginBottom || 0}px`,
                      marginLeft: `${bannerData.buttonMarginLeft || 0}px`,
                      paddingTop: `${bannerData.buttonPaddingTop || 0}px`,
                      paddingRight: `${bannerData.buttonPaddingRight || 0}px`,
                      paddingBottom: `${bannerData.buttonPaddingBottom || 0}px`,
                      paddingLeft: `${bannerData.buttonPaddingLeft || 0}px`,
                    }}
                  >
                    <button
                      className={`font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2.5 text-center leading-none`}
                      style={{
                        backgroundColor:
                          bannerData.ctaBgColor &&
                          bannerData.ctaBgColor !== 'undefined' &&
                          bannerData.ctaBgColor !== ''
                            ? bannerData.ctaBgColor
                            : '#FFFFFF',
                        color:
                          bannerData.ctaColor &&
                          bannerData.ctaColor !== 'undefined' &&
                          bannerData.ctaColor !== ''
                            ? bannerData.ctaColor
                            : '#000000',
                        fontWeight: bannerData.ctaBold ? 'bold' : 'normal',
                        fontStyle: bannerData.ctaItalic ? 'italic' : 'normal',
                        textDecoration: bannerData.ctaUnderline
                          ? 'underline'
                          : 'none',
                        fontSize:
                          devicePreview === 'mobile'
                            ? `${Math.max(
                                parseInt(bannerData.ctaCustomFontSize || '18') *
                                  0.6,
                                10
                              )}px`
                            : `${bannerData.ctaCustomFontSize || 18}px`,
                      }}
                    >
                      {bannerData.ctaText || 'Shop Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Desktop Preview */}
      {devicePreview === 'desktop' && (
        <div
          className='relative mx-auto'
          style={{ width: desktopWidth, height: `${desktopHeight}px` }}
        >
          {hasValidImageSrc ? (
            <img
              src={imageSrc}
              alt='Banner preview'
              className='w-full h-full object-cover'
              onError={(e) => {
                console.error('Desktop canvas image failed to load:', e)
                console.error('Failed image src:', imageSrc)
                console.error('Banner data:', bannerData)
                console.error('Image element:', e.target)
                console.error('Error details:', {
                  src: imageSrc,
                  type: typeof imageSrc,
                  length: imageSrc?.length,
                  startsWithBlob: imageSrc?.startsWith('blob:'),
                  startsWithHttp: imageSrc?.startsWith('http'),
                })
              }}
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <div className='text-center'>
                <FiImage className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              </div>
            </div>
          )}
          {/* Text Overlay */}
          <div
            className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent'
            style={{ opacity: bannerData.overlayOpacity }}
          >
            {/* Title */}
            <div
              className='absolute w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 transition-all duration-200 flex flex-col items-center justify-start'
              style={{
                top: `${bannerData.titlePosition?.y ?? 10}%`,
                left: `${bannerData.titlePosition?.x ?? 50}%`,
                transform: 'translate(-50%, -50%)',
                marginTop: `${bannerData.titleMarginTop || 0}px`,
                marginRight: `${bannerData.titleMarginRight || 0}px`,
                marginBottom: `${bannerData.titleMarginBottom || 0}px`,
                marginLeft: `${bannerData.titleMarginLeft || 0}px`,
                paddingTop: `${bannerData.titlePaddingTop || 0}px`,
                paddingRight: `${bannerData.titlePaddingRight || 0}px`,
                paddingBottom: `${bannerData.titlePaddingBottom || 0}px`,
                paddingLeft: `${bannerData.titlePaddingLeft || 0}px`,
              }}
            >
              <h3
                className={`font-bold not-italic no-underline ${
                  bannerData.titleBold ? 'font-bold' : 'font-normal'
                } ${bannerData.titleItalic ? 'italic' : 'not-italic'} ${
                  bannerData.titleUnderline ? 'underline' : 'no-underline'
                } text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl leading-tight sm:leading-snug md:leading-normal lg:leading-relaxed xl:leading-loose break-words hyphens-auto ${
                  !bannerData.titleCustomFontSize
                    ? bannerData.titleFontSize
                    : ''
                }`}
                style={{
                  fontSize: bannerData.titleCustomFontSize
                    ? `${bannerData.titleCustomFontSize}px`
                    : undefined,
                  color: bannerData.titleColor,
                }}
              >
                {bannerData.title || 'Your Banner Title'}
              </h3>
            </div>
            {/* Subtitle */}
            <div
              className='absolute w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 transition-all duration-200 flex flex-col items-center justify-start'
              style={{
                top: `${bannerData.subtitlePosition?.y ?? 25}%`,
                left: `${bannerData.subtitlePosition?.x ?? 50}%`,
                transform: 'translate(-50%, -50%)',
                marginTop: `${bannerData.subtitleMarginTop || 0}px`,
                marginRight: `${bannerData.subtitleMarginRight || 0}px`,
                marginBottom: `${bannerData.subtitleMarginBottom || 0}px`,
                marginLeft: `${bannerData.subtitleMarginLeft || 0}px`,
                paddingTop: `${bannerData.subtitlePaddingTop || 0}px`,
                paddingRight: `${bannerData.subtitlePaddingRight || 0}px`,
                paddingBottom: `${bannerData.subtitlePaddingBottom || 0}px`,
                paddingLeft: `${bannerData.subtitlePaddingLeft || 0}px`,
              }}
            >
              <p
                className={`opacity-90 ${
                  bannerData.subtitleBold ? 'font-bold' : 'font-normal'
                } ${bannerData.subtitleItalic ? 'italic' : 'not-italic'} ${
                  bannerData.subtitleUnderline ? 'underline' : 'no-underline'
                } text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-tight sm:leading-snug md:leading-normal break-words hyphens-auto max-w-xl mx-auto ${
                  !bannerData.subtitleCustomFontSize
                    ? bannerData.subtitleFontSize
                    : ''
                }`}
                style={{
                  fontSize: bannerData.subtitleCustomFontSize
                    ? `${bannerData.subtitleCustomFontSize}px`
                    : undefined,
                  color: bannerData.subtitleColor,
                }}
              >
                {bannerData.subtitle || 'Your banner subtitle'}
              </p>
            </div>
            {/* CTA Button */}
            <div
              className='absolute w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 transition-all duration-200 flex flex-col items-center justify-start'
              style={{
                top: `${bannerData.ctaPosition?.y ?? 45}%`,
                left: `${bannerData.ctaPosition?.x ?? 50}%`,
                transform: 'translate(-50%, -50%)',
                marginTop: `${bannerData.buttonMarginTop || 0}px`,
                marginRight: `${bannerData.buttonMarginRight || 0}px`,
                marginBottom: `${bannerData.buttonMarginBottom || 0}px`,
                marginLeft: `${bannerData.buttonMarginLeft || 0}px`,
                paddingTop: `${bannerData.buttonPaddingTop || 0}px`,
                paddingRight: `${bannerData.buttonPaddingRight || 0}px`,
                paddingBottom: `${bannerData.buttonPaddingBottom || 0}px`,
                paddingLeft: `${bannerData.buttonPaddingLeft || 0}px`,
              }}
            >
              <button
                className={`${
                  bannerData.ctaBold ? 'font-bold' : 'font-medium'
                } ${bannerData.ctaItalic ? 'italic' : 'not-italic'} ${
                  bannerData.ctaUnderline ? 'underline' : 'no-underline'
                } rounded-md transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-102 active:scale-98 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm md:text-base leading-none sm:leading-tight md:leading-snug`}
                style={{
                  backgroundColor: bannerData.ctaBgColor,
                  color: bannerData.ctaColor,
                  fontSize: bannerData.ctaCustomFontSize
                    ? `${bannerData.ctaCustomFontSize}px`
                    : undefined,
                }}
              >
                {bannerData.ctaText || 'Shop Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Replace DraggablePanel with improved version at the top (after imports)
function DraggablePanel({
  children,
  initialPosition,
}: {
  children: React.ReactNode
  initialPosition?: { x: number; y: number }
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<{
    x: number
    y: number
  } | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })

  // Center or use initialPosition on first mount
  React.useEffect(() => {
    if (position === null && typeof window !== 'undefined') {
      const width = 400
      const height = 600
      if (initialPosition) {
        setPosition(initialPosition)
      } else {
        setPosition({
          x: window.innerWidth / 2 - width / 2 + window.scrollX,
          y: window.innerHeight / 2 - height / 2 + window.scrollY,
        })
      }
    }
  }, [position, initialPosition])

  React.useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging) return
      setPosition((pos) => ({
        x: Math.max(
          0,
          Math.min(e.pageX - offset.x, window.innerWidth - 420 + window.scrollX)
        ),
        y: Math.max(
          0,
          Math.min(
            e.pageY - offset.y,
            window.innerHeight - 100 + window.scrollY
          )
        ),
      }))
    }
    function handleMouseUp() {
      setDragging(false)
    }
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, offset])

  function handleMouseDown(e: React.MouseEvent) {
    if (panelRef.current && position) {
      setOffset({ x: e.pageX - position.x, y: e.pageY - position.y })
      setDragging(true)
    }
  }

  React.useEffect(() => {
    function handleResize() {
      setPosition((pos) =>
        pos
          ? {
              x: Math.min(pos.x, window.innerWidth - 420),
              y: Math.min(pos.y, window.innerHeight - 100),
            }
          : pos
      )
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (position === null) return null

  const panel = (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 10000,
        minWidth: 290,
        maxWidth: 430,
        width: 'auto',
        minHeight: 480,
        maxHeight: 480,
        height: 480,
        pointerEvents: 'auto',
        boxShadow: '0 8px 32px 0 rgba(31,41,55,0.18)',
        borderRadius: 24,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(180,180,255,0.18)',
        transition: 'box-shadow 0.2s',
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: dragging ? 'none' : 'auto',
        overflow: 'hidden',
      }}
      className='premium-draggable-panel dark:bg-gray-900/90 dark:border-gray-700/60'
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          cursor: 'grab',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '14px 20px 8px 20px',
          background:
            'linear-gradient(90deg, rgba(59,130,246,0.13) 0%, rgba(139,92,246,0.13) 100%)',
          fontWeight: 700,
          color: '#222',
          letterSpacing: 0.2,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: dragging
            ? '0 4px 16px 0 rgba(59,130,246,0.10)'
            : undefined,
        }}
        className='select-none dark:bg-gradient-to-r dark:from-blue-900/50 dark:to-purple-900/50'
      >
        <span style={{ fontSize: 20, color: '#2563eb', marginRight: 8 }}>
          &#x2630;
        </span>
        <span style={{ fontSize: 16 }}>Drag Panel</span>
      </div>
      <div
        style={{
          padding: 0,
          borderRadius: 24,
          background: 'none',
          height: 'calc(100% - 46px)',
          overflowY: 'auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  )
  if (typeof window !== 'undefined') {
    return ReactDOM.createPortal(panel, document.body)
  }
  return null
}

export default function CreateBannerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [activePreset, setActivePreset] = useState<
    'standard' | 'spacious' | 'compact' | 'minimal'
  >('standard')
  const [originalBannerData, setOriginalBannerData] = useState<any>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [bannerData, setBannerData] = useState({
    name: '',
    title: '',
    subtitle: '',
    description: '',
    ctaText: 'Shop Now',
    ctaColor: '#000000',
    ctaBgColor: '#FFFFFF',
    titleColor: '#EF4444',
    subtitleColor: '#3B82F6',
    descriptionColor: '#D1D5DB',
    url: '',
    buttonUrl: '',
    priority: 1,
    status: 'draft',
    startDate: '',
    endDate: '',
    bannerImage: null as File | null,
    bannerImageUrl: '',
    bannerImageFilename: '',
    targetAudience: 'all',
    deviceTargeting: 'all',
    geoTargeting: 'all',
    scheduleType: 'immediate',
    analytics: true,
    aBTesting: false,
    overlayOpacity: 0.5,
    textAlignment: 'left',
    fontSize: 'large',
    // Advanced typography properties
    titleBold: true,
    titleItalic: false,
    titleUnderline: false,
    titleFontSize: 'text-xl',
    subtitleBold: true,
    subtitleItalic: false,
    subtitleUnderline: false,
    subtitleFontSize: 'text-base',
    // Position properties for draggable elements - more compact for mini banners
    titlePosition: { x: 50, y: 25 },
    subtitlePosition: { x: 50, y: 45 },
    descriptionPosition: { x: 50, y: 65 },
    ctaPosition: { x: 50, y: 75 },
    titleMarginBottom: 8,
    subtitleMarginBottom: 12,
    // Custom font size properties - smaller for mini banners
    titleCustomFontSize: '28',
    subtitleCustomFontSize: '18',
    ctaCustomFontSize: '14',
    // CTA typography properties
    ctaBold: false,
    ctaItalic: false,
    ctaUnderline: false,
    // Spacing properties
    titleMargin: 0,
    titlePadding: 0,
    subtitleMargin: 0,
    subtitlePadding: 0,
    buttonMargin: 0,
    buttonPadding: 0,
    // Four-directional spacing properties
    titleMarginTop: 0,
    titleMarginRight: 0,
    titleMarginBottom: 0,
    titleMarginLeft: 0,
    titlePaddingTop: 0,
    titlePaddingRight: 0,
    titlePaddingBottom: 0,
    titlePaddingLeft: 0,
    subtitleMarginTop: 0,
    subtitleMarginRight: 0,
    subtitleMarginBottom: 0,
    subtitleMarginLeft: 0,
    subtitlePaddingTop: 0,
    subtitlePaddingRight: 0,
    subtitlePaddingBottom: 0,
    subtitlePaddingLeft: 0,
    buttonMarginTop: 0,
    buttonMarginRight: 0,
    buttonMarginBottom: 0,
    buttonMarginLeft: 0,
    buttonPaddingTop: 6,
    buttonPaddingRight: 12,
    buttonPaddingBottom: 6,
    buttonPaddingLeft: 12,
    titleContainerStyle: '',
    subtitleContainerStyle: '',
    ctaContainerStyle: '',
    dbContent: '',
    // Toggle properties for content visibility
    showTitle: true,
    showSubtitle: true,
    showButton: true,
  })
  const [isLoadingBanner, setIsLoadingBanner] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loadedBannerId, setLoadedBannerId] = useState<string | null>(null)

  // Debug: Log banner data changes and image file
  useEffect(() => {}, [bannerData])

  // Track changes compared to original data
  useEffect(() => {
    if (originalBannerData) {
      const hasChangesMade =
        JSON.stringify(bannerData) !== JSON.stringify(originalBannerData)
      setHasChanges(hasChangesMade)
    }
  }, [bannerData, originalBannerData])

  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(400)
  const [panelDocked, setPanelDocked] = useState<'right' | 'left' | null>(null)
  const [activePanelTab, setActivePanelTab] = useState<
    | 'links'
    | 'content'
    | 'advanced'
    | 'title-style'
    | 'subtitle-style'
    | 'button-style'
    | 'title-layout'
    | 'subtitle-layout'
    | 'button-layout'
  >('content')
  const [activePanelType, setActivePanelType] = useState<
    'content' | 'style' | 'layout'
  >('content')
  const [isResizing, setIsResizing] = useState(false)
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>(
    'desktop'
  )
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showHtmlPreview, setShowHtmlPreview] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showUpdateTooltip, setShowUpdateTooltip] = useState(false)
  // Add at the top of CreateBannerPage:
  const [hasUserEdited, setHasUserEdited] = useState(false)
  const [panelInitialPosition, setPanelInitialPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined)
  const [selectedBannerImage, setSelectedBannerImage] = useState<File | null>(null)
  const [existingBannerImageUrl, setExistingBannerImageUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      id: 1,
      title: 'Design Canvas',
      icon: FiImage,
      description: 'Visual banner builder',
    },
    {
      id: 2,
      title: 'Content & Links',
      icon: FiType,
      description: 'Text and URL management',
    },
    {
      id: 3,
      title: 'Advanced Settings',
      icon: FiSettings,
      description: 'Targeting and analytics',
    },
    {
      id: 4,
      title: 'Publish',
      icon: FiCheck,
      description: 'Review and go live',
    },
  ]

  const presetColors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#8B5CF6',
    '#F59E0B',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#6366F1',
    '#14B8A6',
    '#F43F5E',
  ]

  const fontSizes = [
    { name: 'Small', value: 'small', class: 'text-sm' },
    { name: 'Medium', value: 'medium', class: 'text-base' },
    { name: 'Large', value: 'large', class: 'text-lg' },
    { name: 'Extra Large', value: 'xl', class: 'text-xl' },
    { name: 'Huge', value: '2xl', class: 'text-2xl' },
  ]

  // Helper to update bannerData and always preserve bannerImage unless explicitly set to null
  function updateBannerData(updater: (prev: any) => any) {
    setHasUserEdited(true)
    setBannerData((prev) => {
      const next = updater(prev)
      if (typeof next.bannerImage === 'undefined') {
        next.bannerImage = prev.bannerImage
      }
      // Always preserve positions when editing other properties (both create and edit mode)
      if ((loadedBannerId && editId) || !editId) {
        // Preserve positions - use strict equality to check if they exist
        if (
          prev.titlePosition &&
          (!next.titlePosition ||
            (next.titlePosition.x === undefined &&
              next.titlePosition.y === undefined))
        ) {
          next.titlePosition = prev.titlePosition
        }
        if (
          prev.subtitlePosition &&
          (!next.subtitlePosition ||
            (next.subtitlePosition.x === undefined &&
              next.subtitlePosition.y === undefined))
        ) {
          next.subtitlePosition = prev.subtitlePosition
        }
        if (
          prev.ctaPosition &&
          (!next.ctaPosition ||
            (next.ctaPosition.x === undefined &&
              next.ctaPosition.y === undefined))
        ) {
          next.ctaPosition = prev.ctaPosition
        }

        // Preserve margins, paddings, and font sizes - only if they exist in prev and not explicitly set in next
        const preserveProps = [
          'titleMarginTop',
          'titleMarginRight',
          'titleMarginBottom',
          'titleMarginLeft',
          'titlePaddingTop',
          'titlePaddingRight',
          'titlePaddingBottom',
          'titlePaddingLeft',
          'subtitleMarginTop',
          'subtitleMarginRight',
          'subtitleMarginBottom',
          'subtitleMarginLeft',
          'subtitlePaddingTop',
          'subtitlePaddingRight',
          'subtitlePaddingBottom',
          'subtitlePaddingLeft',
          'buttonMarginTop',
          'buttonMarginRight',
          'buttonMarginBottom',
          'buttonMarginLeft',
          'buttonPaddingTop',
          'buttonPaddingRight',
          'buttonPaddingBottom',
          'buttonPaddingLeft',
          // Font size properties to preserve
          'titleCustomFontSize',
          'subtitleCustomFontSize',
          'ctaCustomFontSize',
        ]

        preserveProps.forEach((prop) => {
          if (
            (prev as any)[prop] !== undefined &&
            (next as any)[prop] === undefined
          ) {
            ;(next as any)[prop] = (prev as any)[prop]
          }
        })
      }

      // EXPERT-LEVEL: Smart position and font preservation logic
      // When toggles are turned OFF, preserve custom positions and fonts in hidden properties
      // When toggles are turned ON, restore preserved values or use defaults

      console.log('[Expert Logic] Toggle changes:', {
        title: { from: prev.showTitle, to: next.showTitle },
        subtitle: { from: prev.showSubtitle, to: next.showSubtitle },
        button: { from: prev.showButton, to: next.showButton },
      })

      // Title preservation logic - NEVER reset custom values when toggle is turned ON
      if (prev.showTitle && !next.showTitle) {
        // Turning OFF title - keep all custom values as they are
        console.log('[Preservation] Title turned OFF - keeping custom values')
      } else if (!prev.showTitle && next.showTitle) {
        // Turning ON title - use existing custom values or defaults
        if (!next.titlePosition) {
          next.titlePosition = { x: 50, y: 25 }
          console.log('[Preservation] Title turned ON - using default position')
        } else {
          console.log(
            '[Preservation] Title turned ON - using existing position:',
            next.titlePosition
          )
        }
        if (!next.titleCustomFontSize) {
          next.titleCustomFontSize = 72
          console.log(
            '[Preservation] Title turned ON - using default font size'
          )
        } else {
          console.log(
            '[Preservation] Title turned ON - using existing font size:',
            next.titleCustomFontSize
          )
        }
      }

      // Subtitle preservation logic - NEVER reset custom values when toggle is turned ON
      if (prev.showSubtitle && !next.showSubtitle) {
        // Turning OFF subtitle - keep all custom values as they are
        console.log(
          '[Preservation] Subtitle turned OFF - keeping custom values'
        )
      } else if (!prev.showSubtitle && next.showSubtitle) {
        // Turning ON subtitle - use existing custom values or defaults
        if (!next.subtitlePosition) {
          next.subtitlePosition = { x: 50, y: 45 }
          console.log(
            '[Preservation] Subtitle turned ON - using default position'
          )
        } else {
          console.log(
            '[Preservation] Subtitle turned ON - using existing position:',
            next.subtitlePosition
          )
        }
        if (!next.subtitleCustomFontSize) {
          next.subtitleCustomFontSize = 52
          console.log(
            '[Preservation] Subtitle turned ON - using default font size'
          )
        } else {
          console.log(
            '[Preservation] Subtitle turned ON - using existing font size:',
            next.subtitleCustomFontSize
          )
        }
      }

      // Button preservation logic - NEVER reset custom values when toggle is turned ON
      if (prev.showButton && !next.showButton) {
        // Turning OFF button - keep all custom values as they are
        console.log('[Preservation] Button turned OFF - keeping custom values')
      } else if (!prev.showButton && next.showButton) {
        // Turning ON button - use existing custom values or defaults
        if (!next.ctaPosition) {
          next.ctaPosition = { x: 50, y: 75 }
          console.log(
            '[Preservation] Button turned ON - using default position'
          )
        } else {
          console.log(
            '[Preservation] Button turned ON - using existing position:',
            next.ctaPosition
          )
        }
        if (!next.ctaCustomFontSize) {
          next.ctaCustomFontSize = 18
          console.log(
            '[Preservation] Button turned ON - using default font size'
          )
        } else {
          console.log(
            '[Preservation] Button turned ON - using existing font size:',
            next.ctaCustomFontSize
          )
        }
      }

      // Handle toggle ON scenarios - provide default positions if missing (fallback)
      if (
        next.showTitle &&
        (!next.titlePosition ||
          (next.titlePosition.x === undefined &&
            next.titlePosition.y === undefined))
      ) {
        next.titlePosition = { x: 50, y: 25 }
      }
      if (
        next.showSubtitle &&
        (!next.subtitlePosition ||
          (next.subtitlePosition.x === undefined &&
            next.subtitlePosition.y === undefined))
      ) {
        next.subtitlePosition = { x: 50, y: 45 }
      }
      if (
        next.showButton &&
        (!next.ctaPosition ||
          (next.ctaPosition.x === undefined &&
            next.ctaPosition.y === undefined))
      ) {
        next.ctaPosition = { x: 50, y: 75 }
      }

      // Provide default margins when toggles are turned ON but margins are missing
      if (next.showTitle) {
        if (next.titleMarginTop === undefined) next.titleMarginTop = 0
        if (next.titleMarginRight === undefined) next.titleMarginRight = 0
        if (next.titleMarginBottom === undefined) next.titleMarginBottom = 0
        if (next.titleMarginLeft === undefined) next.titleMarginLeft = 0
        if (next.titlePaddingTop === undefined) next.titlePaddingTop = 0
        if (next.titlePaddingRight === undefined) next.titlePaddingRight = 0
        if (next.titlePaddingBottom === undefined) next.titlePaddingBottom = 0
        if (next.titlePaddingLeft === undefined) next.titlePaddingLeft = 0
      }
      if (next.showSubtitle) {
        if (next.subtitleMarginTop === undefined) next.subtitleMarginTop = 0
        if (next.subtitleMarginRight === undefined) next.subtitleMarginRight = 0
        if (next.subtitleMarginBottom === undefined)
          next.subtitleMarginBottom = 0
        if (next.subtitleMarginLeft === undefined) next.subtitleMarginLeft = 0
        if (next.subtitlePaddingTop === undefined) next.subtitlePaddingTop = 0
        if (next.subtitlePaddingRight === undefined)
          next.subtitlePaddingRight = 0
        if (next.subtitlePaddingBottom === undefined)
          next.subtitlePaddingBottom = 0
        if (next.subtitlePaddingLeft === undefined) next.subtitlePaddingLeft = 0
      }
      if (next.showButton) {
        if (next.buttonMarginTop === undefined) next.buttonMarginTop = 0
        if (next.buttonMarginRight === undefined) next.buttonMarginRight = 0
        if (next.buttonMarginBottom === undefined) next.buttonMarginBottom = 0
        if (next.buttonMarginLeft === undefined) next.buttonMarginLeft = 0
        if (next.buttonPaddingTop === undefined) next.buttonPaddingTop = 0
        if (next.buttonPaddingRight === undefined) next.buttonPaddingRight = 0
        if (next.buttonPaddingBottom === undefined) next.buttonPaddingBottom = 0
        if (next.buttonPaddingLeft === undefined) next.buttonPaddingLeft = 0
      }

      return next
    })
  }

  // Use updateBannerData everywhere instead of setBannerData
  const handleImageUpload = (file: File) => {
    // Store the file in state for deferred upload
    setSelectedBannerImage(file)
    
    // If we're in edit mode and there's an existing image, track it for cleanup
    if (bannerData.bannerImageUrl || bannerData.image_url || bannerData.imageUrl) {
      setExistingBannerImageUrl(bannerData.bannerImageUrl || bannerData.image_url || bannerData.imageUrl)
    }
    
    updateBannerData((prev) => ({
      ...prev,
      bannerImage: file,
      bannerImageUrl: '', // Clear existing URL as we'll upload new image
    }))
  }

  const handleBannerNameChange = (name: string) => {
    updateBannerData((prev) => ({ ...prev, name }))
  }



  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Premium Panel Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close panel
      if (e.key === 'Escape' && sidePanelOpen) {
        setSidePanelOpen(false)
      }
      // Ctrl/Cmd + P to toggle panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setSidePanelOpen(!sidePanelOpen)
      }
      // Ctrl/Cmd + Shift + P to open panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setSidePanelOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidePanelOpen])

  // Focus management for panel
  useEffect(() => {
    if (sidePanelOpen && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0) {
        ;(focusableElements[0] as HTMLElement).focus()
      }
    }
  }, [sidePanelOpen, activePanelTab])

  // Panel resize functionality
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= 300 && newWidth <= 800) {
        setPanelWidth(newWidth)
      }
    }

    const handleResizeEnd = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [isResizing])

  // Panel docking functionality
  const handleDockPanel = (position: 'right' | 'left') => {
    setPanelDocked(panelDocked === position ? null : position)
  }

  // Add reset handler
  const handleReset = () => {
    if (originalBannerData && hasChanges) {
      setBannerData(originalBannerData)
      setHasChanges(false)
    }
    setShowResetConfirm(false)
  }

  // Full screen keyboard support
  useEffect(() => {
    if (!isFullScreen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullScreen])

  // Premium HTML Generation Function
  const generateBannerHtml = (
    devicePreview: 'desktop' | 'mobile' = 'desktop'
  ): string => {
    console.log('[generateBannerHtml] All states:', {
      showTitle: bannerData.showTitle,
      showSubtitle: bannerData.showSubtitle,
      showButton: bannerData.showButton,
      titlePosition: bannerData.titlePosition,
      subtitlePosition: bannerData.subtitlePosition,
      ctaPosition: bannerData.ctaPosition,
      titleFontSize: bannerData.titleCustomFontSize,
      subtitleFontSize: bannerData.subtitleCustomFontSize,
      ctaFontSize: bannerData.ctaCustomFontSize,
    })
    console.log('[generateBannerHtml] Raw bannerData:', bannerData)
    const imageUrl =
      bannerData.bannerImageUrl || bannerData.image_url || bannerData.imageUrl ||
      (bannerData.bannerImage
        ? URL.createObjectURL(bannerData.bannerImage)
        : '')

    // Use default values if empty
    const title = bannerData.title || 'Your Banner Title'
    const subtitle = bannerData.subtitle || 'Your banner subtitle'

    // Smart position handling: preserve custom positions, use defaults only when not set
    const titlePositionStyle = bannerData.showTitle
      ? bannerData.titlePosition
        ? `top: ${bannerData.titlePosition.y}%; left: ${bannerData.titlePosition.x}%; transform: translate(-50%, -50%);`
        : 'top: 20%; left: 50%; transform: translate(-50%, -50%);'
      : ''

    const subtitlePositionStyle = bannerData.showSubtitle
      ? bannerData.subtitlePosition
        ? `top: ${bannerData.subtitlePosition.y}%; left: ${bannerData.subtitlePosition.x}%; transform: translate(-50%, -50%);`
        : 'top: 40%; left: 50%; transform: translate(-50%, -50%);'
      : ''

    const descriptionPositionStyle = bannerData.descriptionPosition
      ? `top: ${bannerData.descriptionPosition.y}%; left: ${bannerData.descriptionPosition.x}%; transform: translate(-50%, -50%);`
      : ''

    const ctaPositionStyle = bannerData.showButton
      ? bannerData.ctaPosition
        ? `top: ${bannerData.ctaPosition.y}%; left: ${bannerData.ctaPosition.x}%; transform: translate(-50%, -50%);`
        : 'top: 65%; left: 50%; transform: translate(-50%, -50%);'
      : ''

    console.log('[generateBannerHtml] Position styles:', {
      titlePositionStyle,
      subtitlePositionStyle,
      ctaPositionStyle,
    })

    // Smart font size handling: use smaller sizes for mini banners
    const titleFontSize = bannerData.showTitle
      ? bannerData.titleCustomFontSize || 28
      : 28
    const subtitleFontSize = bannerData.showSubtitle
      ? bannerData.subtitleCustomFontSize || 18
      : 18
    const ctaFontSize = bannerData.showButton
      ? bannerData.ctaCustomFontSize || 14
      : 14

    console.log('[generateBannerHtml] Font sizes being used:', {
      titleFontSize,
      subtitleFontSize,
      ctaFontSize,
      titleCustomFontSize: bannerData.titleCustomFontSize,
      subtitleCustomFontSize: bannerData.subtitleCustomFontSize,
      ctaCustomFontSize: bannerData.ctaCustomFontSize,
    })

    const titleStyles = `
      position: absolute;
      ${titlePositionStyle}
      font-weight: ${bannerData.titleBold ? 'bold' : 'normal'};
      font-style: ${bannerData.titleItalic ? 'italic' : 'normal'};
      text-decoration: ${bannerData.titleUnderline ? 'underline' : 'none'};
      color: ${bannerData.titleColor};
      font-size: ${titleFontSize}px;
      margin: ${bannerData.titleMarginTop}px ${bannerData.titleMarginRight}px ${
      bannerData.titleMarginBottom
    }px ${bannerData.titleMarginLeft}px;
      padding: ${bannerData.titlePaddingTop}px ${
      bannerData.titlePaddingRight
    }px ${bannerData.titlePaddingBottom}px ${bannerData.titlePaddingLeft}px;
      width: 100%;
      text-align: center;
      z-index: 2;
    `

    const subtitleStyles = `
      position: absolute;
      ${subtitlePositionStyle}
      font-weight: ${bannerData.subtitleBold ? 'bold' : 'normal'};
      font-style: ${bannerData.subtitleItalic ? 'italic' : 'normal'};
      text-decoration: ${bannerData.subtitleUnderline ? 'underline' : 'none'};
      color: ${bannerData.subtitleColor};
      font-size: ${subtitleFontSize}px;
      margin: ${bannerData.subtitleMarginTop}px ${
      bannerData.subtitleMarginRight
    }px ${bannerData.subtitleMarginBottom}px ${bannerData.subtitleMarginLeft}px;
      padding: ${bannerData.subtitlePaddingTop}px ${
      bannerData.subtitlePaddingRight
    }px ${bannerData.subtitlePaddingBottom}px ${
      bannerData.subtitlePaddingLeft
    }px;
      width: 100%;
      text-align: center;
      z-index: 2;
    `

    const buttonStyles = `
      position: absolute !important;
      ${ctaPositionStyle}
      font-weight: ${bannerData.ctaBold ? 'bold' : 'normal'};
      font-style: ${bannerData.ctaItalic ? 'italic' : 'normal'};
      text-decoration: ${bannerData.ctaUnderline ? 'underline' : 'none'};
      background-color: ${
        bannerData.ctaBgColor && bannerData.ctaBgColor !== 'undefined'
          ? bannerData.ctaBgColor
          : '#FFFFFF'
      };
      color: ${
        bannerData.ctaColor && bannerData.ctaColor !== 'undefined'
          ? bannerData.ctaColor
          : '#000000'
      };
      font-size: ${ctaFontSize}px;
      margin: ${bannerData.buttonMarginTop || 0}px ${
      bannerData.buttonMarginRight || 0
    }px ${bannerData.buttonMarginBottom || 0}px ${
      bannerData.buttonMarginLeft || 0
    }px;
      padding: ${bannerData.buttonPaddingTop || 6}px ${
      bannerData.buttonPaddingRight || 12
    }px ${bannerData.buttonPaddingBottom || 6}px ${
      bannerData.buttonPaddingLeft || 12
    }px;
      border: none !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
      min-width: 80px !important;
      min-height: 32px !important;
      display: inline-block !important;
      overflow: visible !important;
      z-index: 2 !important;
      text-align: center !important;
      line-height: 1.2 !important;
      font-family: inherit !important;
    `

    const html = `
<div class="banner-container" style="position: relative; width: 100%; height: 250px; overflow: hidden; border-radius: 12px;">
  ${
    imageUrl
      ? `<img src="${imageUrl}" alt="Banner" style="width: 100%; height: 100%; object-fit: cover;" />`
      : ''
  }
  
  <div class="banner-overlay" style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,${
    bannerData.overlayOpacity
  }), transparent);">
    <div class="banner-content" style="position: relative; height: 100%; width: 100%;">
      ${
        bannerData.showTitle
          ? `<h3 class="banner-title" style="${titleStyles}">
        ${title}
      </h3>`
          : ''
      }
      ${
        bannerData.showSubtitle
          ? `<p class="banner-subtitle" style="${subtitleStyles}">
        ${subtitle}
      </p>`
          : ''
      }
      ${
        bannerData.showButton
          ? `
        <button class="banner-cta" style="${buttonStyles}" ${
              bannerData.buttonUrl
                ? `onclick=\"window.open('${bannerData.buttonUrl}', '_blank')\"`
                : ''
            }>
          ${bannerData.ctaText || 'Shop Now'}
        </button>
      `
          : ''
      }
    </div>
  </div>
  ${
    bannerData.url
      ? `<a href=\"${bannerData.url}\" style=\"position: absolute; inset: 0; z-index: 10;\" aria-label=\"Banner link\"></a>`
      : ''
  }
</div>

<style>
/* Hover effect without transform to prevent movement */
.banner-cta:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
  filter: brightness(1.05) !important;
}

@media (max-width: 768px) {
  .banner-title {
    font-size: ${Math.max(
      parseInt(bannerData.titleCustomFontSize) * 0.8,
      14
    )}px !important;
  }
  .banner-subtitle {
    font-size: ${Math.max(
      parseInt(bannerData.subtitleCustomFontSize) * 0.8,
      10
    )}px !important;
  }
  .banner-cta {
    font-size: ${Math.max(
      parseInt(bannerData.ctaCustomFontSize) * 0.8,
      8
    )}px !important;
  }
}
</style>
    `

    return html.trim()
  }

  // Premium Save Draft Function
  const handleSaveDraft = async () => {
    if (!bannerData.name.trim()) {
      toast({
        title: 'Banner name required',
        description: 'Please enter a banner name',
        variant: 'destructive',
      })
      return
    }
    // Only require image in create mode
    if (!isEditMode && !bannerData.bannerImage) {
      toast({
        title: 'Banner image required',
        description: 'Please upload a banner image',
        variant: 'destructive',
      })
      return
    }
    // In edit mode, allow if either a new image or an existing image URL is present
    if (isEditMode && !bannerData.bannerImage && !bannerData.bannerImageUrl && !bannerData.image_url && !bannerData.imageUrl) {
      toast({
        title: 'Banner image required',
        description: 'Please upload a banner image or keep the existing one',
        variant: 'destructive',
      })
      return
    }
    setIsSavingDraft(true)
    try {
      const html = generateBannerHtml('desktop')
      setGeneratedHtml(html)
      const bannerDataToSave = {
        name: bannerData.name,
        content: html,
        status: 'draft',
        priority: bannerData.priority,
        startDate: bannerData.startDate ? new Date(bannerData.startDate) : null,
        endDate: bannerData.endDate ? new Date(bannerData.endDate) : null,
        imageUrl: bannerData.bannerImageUrl || bannerData.image_url || bannerData.imageUrl || '',
        // Save ALL position and styling data to preserve custom values
        titlePosition: bannerData.titlePosition,
        subtitlePosition: bannerData.subtitlePosition,
        ctaPosition: bannerData.ctaPosition,
        titleCustomFontSize: bannerData.titleCustomFontSize,
        subtitleCustomFontSize: bannerData.subtitleCustomFontSize,
        ctaCustomFontSize: bannerData.ctaCustomFontSize,
        // Save all margin and padding data
        titleMarginTop: bannerData.titleMarginTop,
        titleMarginRight: bannerData.titleMarginRight,
        titleMarginBottom: bannerData.titleMarginBottom,
        titleMarginLeft: bannerData.titleMarginLeft,
        titlePaddingTop: bannerData.titlePaddingTop,
        titlePaddingRight: bannerData.titlePaddingRight,
        titlePaddingBottom: bannerData.titlePaddingBottom,
        titlePaddingLeft: bannerData.titlePaddingLeft,
        subtitleMarginTop: bannerData.subtitleMarginTop,
        subtitleMarginRight: bannerData.subtitleMarginRight,
        subtitleMarginBottom: bannerData.subtitleMarginBottom,
        subtitleMarginLeft: bannerData.subtitleMarginLeft,
        subtitlePaddingTop: bannerData.subtitlePaddingTop,
        subtitlePaddingRight: bannerData.subtitlePaddingRight,
        subtitlePaddingBottom: bannerData.subtitlePaddingBottom,
        subtitlePaddingLeft: bannerData.subtitlePaddingLeft,
        buttonMarginTop: bannerData.buttonMarginTop,
        buttonMarginRight: bannerData.buttonMarginRight,
        buttonMarginBottom: bannerData.buttonMarginBottom,
        buttonMarginLeft: bannerData.buttonMarginLeft,
        buttonPaddingTop: bannerData.buttonPaddingTop,
        buttonPaddingRight: bannerData.buttonPaddingRight,
        buttonPaddingBottom: bannerData.buttonPaddingBottom,
        buttonPaddingLeft: bannerData.buttonPaddingLeft,
        // Toggle states
        showTitle: bannerData.showTitle,
        showSubtitle: bannerData.showSubtitle,
        showButton: bannerData.showButton,
      }
      let response
      if (isEditMode && editId) {
        response = await fetch(`/api/mini-banners/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerDataToSave),
        })
      } else {
        response = await fetch('/api/mini-banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerDataToSave),
        })
      }
      const result = await response.json()
      if (result.success) {
        toast({
          title: 'Draft Saved',
          description: 'Mini banner saved as draft successfully!',
        })
        router.push('/custom-cms/mini-banners')
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save mini banner',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving mini banner:', error)
      toast({
        title: 'Error',
        description: 'Failed to save mini banner',
        variant: 'destructive',
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  // Premium Publish Banner Function
  const handlePublishBanner = async () => {
    if (!bannerData.name.trim()) {
      toast({
        title: 'Banner name required',
        description: 'Please enter a banner name',
        variant: 'destructive',
      })
      return
    }
    // Only require image in create mode
    if (!isEditMode && !bannerData.bannerImage) {
      toast({
        title: 'Banner image required',
        description: 'Please upload a banner image',
        variant: 'destructive',
      })
      return
    }
    // In edit mode, allow if either a new image or an existing image URL is present
    if (isEditMode && !bannerData.bannerImage && !bannerData.bannerImageUrl && !bannerData.image_url && !bannerData.imageUrl) {
      toast({
        title: 'Banner image required',
        description: 'Please upload a banner image or keep the existing one',
        variant: 'destructive',
      })
      return
    }
    setIsPublishing(true)
    try {
      const html = generateBannerHtml('desktop')
      setGeneratedHtml(html)
      
      // Handle image upload if we have a selected file
      let finalImageUrl = bannerData.bannerImageUrl || bannerData.image_url || bannerData.imageUrl || ''
      
      if (selectedBannerImage) {
        try {
          // Generate unique banner name with random number
          const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000) // 10 digit random number
          const uniqueBannerName = `${bannerData.name}_${randomNumber}`
          
          // Delete existing image if it exists
          if (existingBannerImageUrl) {
            try {
              await fetch(`/api/upload/mini-banner?url=${encodeURIComponent(existingBannerImageUrl)}`, {
                method: 'DELETE',
              })
              console.log('Deleted existing mini banner image:', existingBannerImageUrl)
            } catch (deleteError) {
              console.error('Error deleting existing mini banner image:', deleteError)
            }
          }

          // Upload new image
          const uploadFormData = new FormData()
          uploadFormData.append('file', selectedBannerImage)
          uploadFormData.append('bannerName', uniqueBannerName)

          const uploadResponse = await fetch('/api/upload/mini-banner', {
            method: 'POST',
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json()
            console.error('Mini banner image upload failed:', uploadError)
            console.error('Upload response status:', uploadResponse.status)
            console.error('Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()))
            toast({
              title: 'Warning',
              description: `Mini banner published but image upload failed: ${uploadError.error || uploadError.details || 'Unknown error'}. You can update the image later.`,
              variant: 'default',
            })
          } else {
            const uploadData = await uploadResponse.json()
            console.log('Mini banner image uploaded successfully:', uploadData.url)
            finalImageUrl = uploadData.url
          }
        } catch (uploadError) {
          console.error('Error during mini banner image upload:', uploadError)
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error'
          toast({
            title: 'Warning',
            description: `Mini banner published but image upload failed: ${errorMessage}. You can update the image later.`,
            variant: 'default',
          })
        }
      }
      
      const bannerDataToSave = {
        name: bannerData.name,
        content: html,
        status: isEditMode ? bannerData.status : 'active', // Preserve status in edit mode
        priority: bannerData.priority,
        startDate: bannerData.startDate ? new Date(bannerData.startDate) : null,
        endDate: bannerData.endDate ? new Date(bannerData.endDate) : null,
        imageUrl: finalImageUrl,
        // Save ALL position and styling data to preserve custom values
        titlePosition: bannerData.titlePosition,
        subtitlePosition: bannerData.subtitlePosition,
        ctaPosition: bannerData.ctaPosition,
        titleCustomFontSize: bannerData.titleCustomFontSize,
        subtitleCustomFontSize: bannerData.subtitleCustomFontSize,
        ctaCustomFontSize: bannerData.ctaCustomFontSize,
        // Save all margin and padding data
        titleMarginTop: bannerData.titleMarginTop,
        titleMarginRight: bannerData.titleMarginRight,
        titleMarginBottom: bannerData.titleMarginBottom,
        titleMarginLeft: bannerData.titleMarginLeft,
        titlePaddingTop: bannerData.titlePaddingTop,
        titlePaddingRight: bannerData.titlePaddingRight,
        titlePaddingBottom: bannerData.titlePaddingBottom,
        titlePaddingLeft: bannerData.titlePaddingLeft,
        subtitleMarginTop: bannerData.subtitleMarginTop,
        subtitleMarginRight: bannerData.subtitleMarginRight,
        subtitleMarginBottom: bannerData.subtitleMarginBottom,
        subtitleMarginLeft: bannerData.subtitleMarginLeft,
        subtitlePaddingTop: bannerData.subtitlePaddingTop,
        subtitlePaddingRight: bannerData.subtitlePaddingRight,
        subtitlePaddingBottom: bannerData.subtitlePaddingBottom,
        subtitlePaddingLeft: bannerData.subtitlePaddingLeft,
        buttonMarginTop: bannerData.buttonMarginTop,
        buttonMarginRight: bannerData.buttonMarginRight,
        buttonMarginBottom: bannerData.buttonMarginBottom,
        buttonMarginLeft: bannerData.buttonMarginLeft,
        buttonPaddingTop: bannerData.buttonPaddingTop,
        buttonPaddingRight: bannerData.buttonPaddingRight,
        buttonPaddingBottom: bannerData.buttonPaddingBottom,
        buttonPaddingLeft: bannerData.buttonPaddingLeft,
        // Toggle states
        showTitle: bannerData.showTitle,
        showSubtitle: bannerData.showSubtitle,
        showButton: bannerData.showButton,
      }
      let response
      if (isEditMode && editId) {
        response = await fetch(`/api/mini-banners/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerDataToSave),
        })
      } else {
        response = await fetch('/api/mini-banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerDataToSave),
        })
      }
      const result = await response.json()
      if (result.success) {
        toast({
          title: isEditMode ? 'Mini Banner Updated' : 'Mini Banner Published',
          description: isEditMode
            ? 'Mini banner updated successfully!'
            : 'Mini banner published successfully!',
        })
        router.push('/custom-cms/mini-banners')
      } else {
        toast({
          title: 'Error',
          description:
            result.error ||
            (isEditMode
              ? 'Failed to update mini banner'
              : 'Failed to publish mini banner'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error(
        isEditMode ? 'Error updating mini banner:' : 'Error publishing mini banner:',
        error
      )
      toast({
        title: 'Error',
        description: isEditMode
          ? 'Failed to update mini banner'
          : 'Failed to publish mini banner',
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  // Premium Copy HTML Function
  const copyHtmlToClipboard = async () => {
    const html = generateBannerHtml('desktop')
    try {
      await navigator.clipboard.writeText(html)
      alert('HTML copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy HTML:', err)
      alert('Failed to copy HTML to clipboard')
    }
  }

  // Add this function inside CreateBannerPage, before the return:
  function handleRemoveImage() {
    // Clear selected image state
    setSelectedBannerImage(null)
    
    updateBannerData((prev) => ({
      ...prev,
      bannerImage: null,
      bannerImageUrl: '',
    }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    const id = searchParams.get('id')
    if (!id || loadedBannerId === id) return
    setEditId(id)
    setIsLoadingBanner(true)
    fetch(`/api/mini-banners/${id}`)
      .then((res) => res.json())
      .then((result) => {
        if (!result.success || !result.data) throw new Error('Not found')
        const banner = result.data
        // Try to parse content HTML for fields
        const parser = new DOMParser()
        const doc = parser.parseFromString(banner.content, 'text/html')
        // Extract image
        const img = doc.querySelector('.banner-container img')
        // Extract container divs for title, subtitle, cta
        const titleContainer = doc.querySelector('.banner-title')?.parentElement
        const subtitleContainer =
          doc.querySelector('.banner-subtitle')?.parentElement
        const ctaContainer = doc.querySelector('.banner-cta')?.parentElement
        // Extract elements
        const titleEl = doc.querySelector('.banner-title')
        const subtitleEl = doc.querySelector('.banner-subtitle')
        const ctaEl = doc.querySelector('.banner-cta')
        let imgUrl = img?.getAttribute('src') || ''
        if (imgUrl && imgUrl.startsWith('/')) {
          imgUrl = window.location.origin + imgUrl
        }
        // Helper to extract style properties from style string
        function extractStyles(styleStr: string) {
          const style: Record<string, string> = {}
          styleStr.split(';').forEach((s) => {
            const [key, val] = s.split(':')
            if (key && val) style[key.trim()] = val.trim()
          })
          return style
        }
        // Helper to parse margin/padding shorthand
        function parseBoxShorthand(str: string) {
          const parts = (str || '').split(' ').map((v) => parseFloat(v))
          return {
            top: parts[0] ?? 0,
            right: parts[1] ?? parts[0] ?? 0,
            bottom: parts[2] ?? parts[0] ?? 0,
            left: parts[3] ?? parts[1] ?? parts[0] ?? 0,
          }
        }
        // Extract styles
        const titleStyle = titleEl
          ? extractStyles(titleEl.getAttribute('style') || '')
          : {}
        const subtitleStyle = subtitleEl
          ? extractStyles(subtitleEl.getAttribute('style') || '')
          : {}
        const ctaStyle = ctaEl
          ? extractStyles(ctaEl.getAttribute('style') || '')
          : {}
        // Extract container styles as string
        const titleContainerStyle = titleContainer?.getAttribute('style') || ''
        const subtitleContainerStyle =
          subtitleContainer?.getAttribute('style') || ''
        const ctaContainerStyle = ctaContainer?.getAttribute('style') || ''
        // After extracting container styles, extract position properties
        function extractPosition(styleStr: string) {
          const style = extractStyles(styleStr)
          // Handle different position formats from saved HTML
          let x = 50
          let y = 30

          // Extract x position
          if (style.left && style.left.endsWith('%')) {
            x = parseFloat(style.left)
          } else if (style.left && style.left.includes('50%')) {
            x = 50
          }

          // Extract y position - handle various formats
          if (style.top && style.top.endsWith('%')) {
            y = parseFloat(style.top)
          } else if (style.top && style.top.includes('30%')) {
            y = 30
          } else if (style.top && style.top.includes('45%')) {
            y = 45
          } else if (style.top && style.top.includes('66.666667%')) {
            y = 66.67
          } else if (style.top && style.top.includes('5%')) {
            y = 5
          } else if (style.top && style.top.includes('25%')) {
            y = 25
          }

          return { x, y }
        }

        // Extract margin and padding values from container styles
        function extractMarginPadding(styleStr: string) {
          const style = extractStyles(styleStr)
          const result = {
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0,
          }

          // Handle individual margin properties
          if (style.marginTop) result.marginTop = parseFloat(style.marginTop)
          if (style.marginRight)
            result.marginRight = parseFloat(style.marginRight)
          if (style.marginBottom)
            result.marginBottom = parseFloat(style.marginBottom)
          if (style.marginLeft) result.marginLeft = parseFloat(style.marginLeft)

          // If individual margins are not set, but shorthand 'margin' is, use it
          if (
            style.margin &&
            Object.values(result)
              .slice(0, 4)
              .every((val) => val === 0)
          ) {
            const parsed = parseBoxShorthand(style.margin)
            result.marginTop = parsed.top
            result.marginRight = parsed.right
            result.marginBottom = parsed.bottom
            result.marginLeft = parsed.left
          }

          // Handle individual padding properties
          if (style.paddingTop) result.paddingTop = parseFloat(style.paddingTop)
          if (style.paddingRight)
            result.paddingRight = parseFloat(style.paddingRight)
          if (style.paddingBottom)
            result.paddingBottom = parseFloat(style.paddingBottom)
          if (style.paddingLeft)
            result.paddingLeft = parseFloat(style.paddingLeft)

          // If individual paddings are not set, but shorthand 'padding' is, use it
          if (
            style.padding &&
            Object.values(result)
              .slice(4, 8)
              .every((val) => val === 0)
          ) {
            const parsed = parseBoxShorthand(style.padding)
            result.paddingTop = parsed.top
            result.paddingRight = parsed.right
            result.paddingBottom = parsed.bottom
            result.paddingLeft = parsed.left
          }

          return result
        }

        // Try to extract from element styles first, then container styles as fallback
        const titlePosition =
          extractPosition(titleEl?.getAttribute('style') || '') ||
          extractPosition(titleContainerStyle)
        // For subtitle and button, if element doesn't exist (was OFF during creation), use null
        const subtitlePosition = subtitleEl
          ? extractPosition(subtitleEl.getAttribute('style') || '') ||
            extractPosition(subtitleContainerStyle)
          : null
        const ctaPosition = ctaEl
          ? extractPosition(ctaEl.getAttribute('style') || '') ||
            extractPosition(ctaContainerStyle)
          : null

        console.log('[Position Extraction] Extracted positions:', {
          titlePosition,
          subtitlePosition,
          ctaPosition,
          titleContainerStyle: titleContainerStyle.substring(0, 100),
          subtitleContainerStyle: subtitleContainerStyle.substring(0, 100),
          ctaContainerStyle: ctaContainerStyle.substring(0, 100),
        })

        console.log('[Font Extraction] Extracted font sizes:', {
          titleStyle: titleStyle,
          subtitleStyle: subtitleStyle,
          ctaStyle: ctaStyle,
          titleFontSize: titleStyle['font-size'],
          subtitleFontSize: subtitleStyle['font-size'],
          ctaFontSize: ctaStyle['font-size'],
        })

        // Debug logging

        const titleMarginPadding = extractMarginPadding(
          titleEl?.getAttribute('style') || ''
        )
        // For subtitle and button, if element doesn't exist (was OFF during creation), use empty margins
        const subtitleMarginPadding = subtitleEl
          ? extractMarginPadding(subtitleEl.getAttribute('style') || '')
          : {
              marginTop: 0,
              marginRight: 0,
              marginBottom: 0,
              marginLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingLeft: 0,
            }
        const ctaMarginPadding = ctaEl
          ? extractMarginPadding(ctaEl.getAttribute('style') || '')
          : {
              marginTop: 0,
              marginRight: 0,
              marginBottom: 0,
              marginLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingLeft: 0,
            }
        setBannerData((prev) => ({
          ...prev,
          name: banner.name || '',
          title: titleEl?.textContent?.trim() || '',
          subtitle: subtitleEl?.textContent?.trim() || '',
          ctaText: ctaEl?.textContent?.trim() || '',
          bannerImage: null,
          bannerImageUrl: banner.image_url || banner.imageUrl || imgUrl,
          status: banner.status || 'draft',
          priority: banner.priority || 1,
          startDate: banner.startDate || '',
          endDate: banner.endDate || '',
          titleContainerStyle,
          subtitleContainerStyle,
          ctaContainerStyle,
          dbContent: banner.content || '',
          // Use saved position data from database, fallback to extracted from HTML
          titlePosition: banner.titlePosition ||
            titlePosition || { x: 50, y: 25 },
          subtitlePosition: banner.subtitlePosition ||
            subtitlePosition || { x: 50, y: 45 },
          ctaPosition: banner.ctaPosition || ctaPosition || { x: 50, y: 75 },
          // Use saved margin and padding data from database, fallback to extracted from HTML
          titleMarginTop: banner.titleMarginTop ?? titleMarginPadding.marginTop,
          titleMarginRight:
            banner.titleMarginRight ?? titleMarginPadding.marginRight,
          titleMarginBottom:
            banner.titleMarginBottom ?? titleMarginPadding.marginBottom,
          titleMarginLeft:
            banner.titleMarginLeft ?? titleMarginPadding.marginLeft,
          titlePaddingTop:
            banner.titlePaddingTop ?? titleMarginPadding.paddingTop,
          titlePaddingRight:
            banner.titlePaddingRight ?? titleMarginPadding.paddingRight,
          titlePaddingBottom:
            banner.titlePaddingBottom ?? titleMarginPadding.paddingBottom,
          titlePaddingLeft:
            banner.titlePaddingLeft ?? titleMarginPadding.paddingLeft,
          subtitleMarginTop:
            banner.subtitleMarginTop ?? subtitleMarginPadding.marginTop,
          subtitleMarginRight:
            banner.subtitleMarginRight ?? subtitleMarginPadding.marginRight,
          subtitleMarginBottom:
            banner.subtitleMarginBottom ?? subtitleMarginPadding.marginBottom,
          subtitleMarginLeft:
            banner.subtitleMarginLeft ?? subtitleMarginPadding.marginLeft,
          subtitlePaddingTop:
            banner.subtitlePaddingTop ?? subtitleMarginPadding.paddingTop,
          subtitlePaddingRight:
            banner.subtitlePaddingRight ?? subtitleMarginPadding.paddingRight,
          subtitlePaddingBottom:
            banner.subtitlePaddingBottom ?? subtitleMarginPadding.paddingBottom,
          subtitlePaddingLeft:
            banner.subtitlePaddingLeft ?? subtitleMarginPadding.paddingLeft,
          buttonMarginTop: banner.buttonMarginTop ?? ctaMarginPadding.marginTop,
          buttonMarginRight:
            banner.buttonMarginRight ?? ctaMarginPadding.marginRight,
          buttonMarginBottom:
            banner.buttonMarginBottom ?? ctaMarginPadding.marginBottom,
          buttonMarginLeft:
            banner.buttonMarginLeft ?? ctaMarginPadding.marginLeft,
          buttonPaddingTop:
            banner.buttonPaddingTop ?? ctaMarginPadding.paddingTop,
          buttonPaddingRight:
            banner.buttonPaddingRight ?? ctaMarginPadding.paddingRight,
          buttonPaddingBottom:
            banner.buttonPaddingBottom ?? ctaMarginPadding.paddingBottom,
          buttonPaddingLeft:
            banner.buttonPaddingLeft ?? ctaMarginPadding.paddingLeft,
          // Use saved font sizes from database, fallback to extracted from HTML
          titleCustomFontSize:
            banner.titleCustomFontSize ??
            (titleStyle['font-size']
              ? titleStyle['font-size'].replace('px', '')
              : prev.titleCustomFontSize),
          subtitleCustomFontSize:
            banner.subtitleCustomFontSize ??
            (subtitleStyle['font-size']
              ? subtitleStyle['font-size'].replace('px', '')
              : prev.subtitleCustomFontSize),
          ctaCustomFontSize:
            banner.ctaCustomFontSize ??
            (ctaStyle['font-size']
              ? ctaStyle['font-size'].replace('px', '')
              : prev.ctaCustomFontSize),
          // Extract and set color properties from inline style if present, else preserve previous
          titleColor: titleStyle['color'] || prev.titleColor,
          subtitleColor: subtitleStyle['color'] || prev.subtitleColor,
          ctaColor: ctaStyle['color'] || prev.ctaColor,
          ctaBgColor: ctaStyle['background-color'] || prev.ctaBgColor,
          // Load toggle properties from database
          showTitle: banner.showTitle ?? true,
          showSubtitle: banner.showSubtitle ?? true,
          showButton: banner.showButton ?? true,
        }))

        // Store the original banner data for reset functionality
        const originalData = {
          ...bannerData,
          name: banner.name || '',
          title: titleEl?.textContent?.trim() || '',
          subtitle: subtitleEl?.textContent?.trim() || '',
          ctaText: ctaEl?.textContent?.trim() || '',
          bannerImage: null,
          bannerImageUrl: banner.image_url || banner.imageUrl || imgUrl,
          status: banner.status || 'draft',
          priority: banner.priority || 1,
          startDate: banner.startDate || '',
          endDate: banner.endDate || '',
          titleContainerStyle,
          subtitleContainerStyle,
          ctaContainerStyle,
          dbContent: banner.content || '',
          // Use saved position data from database, fallback to extracted from HTML
          titlePosition: banner.titlePosition ||
            titlePosition || { x: 50, y: 25 },
          subtitlePosition: banner.subtitlePosition ||
            subtitlePosition || { x: 50, y: 45 },
          ctaPosition: banner.ctaPosition || ctaPosition || { x: 50, y: 75 },
          // Use saved margin and padding data from database, fallback to extracted from HTML
          titleMarginTop: banner.titleMarginTop ?? titleMarginPadding.marginTop,
          titleMarginRight:
            banner.titleMarginRight ?? titleMarginPadding.marginRight,
          titleMarginBottom:
            banner.titleMarginBottom ?? titleMarginPadding.marginBottom,
          titleMarginLeft:
            banner.titleMarginLeft ?? titleMarginPadding.marginLeft,
          titlePaddingTop:
            banner.titlePaddingTop ?? titleMarginPadding.paddingTop,
          titlePaddingRight:
            banner.titlePaddingRight ?? titleMarginPadding.paddingRight,
          titlePaddingBottom:
            banner.titlePaddingBottom ?? titleMarginPadding.paddingBottom,
          titlePaddingLeft:
            banner.titlePaddingLeft ?? titleMarginPadding.paddingLeft,
          subtitleMarginTop:
            banner.subtitleMarginTop ?? subtitleMarginPadding.marginTop,
          subtitleMarginRight:
            banner.subtitleMarginRight ?? subtitleMarginPadding.marginRight,
          subtitleMarginBottom:
            banner.subtitleMarginBottom ?? subtitleMarginPadding.marginBottom,
          subtitleMarginLeft:
            banner.subtitleMarginLeft ?? subtitleMarginPadding.marginLeft,
          subtitlePaddingTop:
            banner.subtitlePaddingTop ?? subtitleMarginPadding.paddingTop,
          subtitlePaddingRight:
            banner.subtitlePaddingRight ?? subtitleMarginPadding.paddingRight,
          subtitlePaddingBottom:
            banner.subtitlePaddingBottom ?? subtitleMarginPadding.paddingBottom,
          subtitlePaddingLeft:
            banner.subtitlePaddingLeft ?? subtitleMarginPadding.paddingLeft,
          buttonMarginTop: banner.buttonMarginTop ?? ctaMarginPadding.marginTop,
          buttonMarginRight:
            banner.buttonMarginRight ?? ctaMarginPadding.marginRight,
          buttonMarginBottom:
            banner.buttonMarginBottom ?? ctaMarginPadding.marginBottom,
          buttonMarginLeft:
            banner.buttonMarginLeft ?? ctaMarginPadding.marginLeft,
          buttonPaddingTop:
            banner.buttonPaddingTop ?? ctaMarginPadding.paddingTop,
          buttonPaddingRight:
            banner.buttonPaddingRight ?? ctaMarginPadding.paddingRight,
          buttonPaddingBottom:
            banner.buttonPaddingBottom ?? ctaMarginPadding.paddingBottom,
          buttonPaddingLeft:
            banner.buttonPaddingLeft ?? ctaMarginPadding.paddingLeft,
          // Use saved font sizes from database, fallback to extracted from HTML
          titleCustomFontSize:
            banner.titleCustomFontSize ??
            (titleStyle['font-size']
              ? titleStyle['font-size'].replace('px', '')
              : bannerData.titleCustomFontSize),
          subtitleCustomFontSize: subtitleStyle['font-size']
            ? subtitleStyle['font-size'].replace('px', '')
            : bannerData.subtitleCustomFontSize,
          ctaCustomFontSize: ctaStyle['font-size']
            ? ctaStyle['font-size'].replace('px', '')
            : bannerData.ctaCustomFontSize,
          titleColor: titleStyle['color'] || bannerData.titleColor,
          subtitleColor: subtitleStyle['color'] || bannerData.subtitleColor,
          ctaColor: ctaStyle['color'] || bannerData.ctaColor,
          ctaBgColor: ctaStyle['background-color'] || bannerData.ctaBgColor,
          // Load toggle properties from database
          showTitle: banner.showTitle ?? true,
          showSubtitle: banner.showSubtitle ?? true,
          showButton: banner.showButton ?? true,
        }
        setOriginalBannerData(originalData)
        setLoadedBannerId(id)
        
        // Track existing image URL for cleanup during edit
        if (banner.image_url || banner.imageUrl || imgUrl) {
          setExistingBannerImageUrl(banner.image_url || banner.imageUrl || imgUrl)
        }
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to load banner for editing',
          variant: 'destructive',
        })
      })
      .finally(() => setIsLoadingBanner(false))
  }, [searchParams, loadedBannerId])

  const isEditMode = !!editId

  // Loader Component (copied from main-banners)
  const SimpleLoader = () => (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-4 text-gray-600 dark:text-gray-400'>
          Loading banners...
        </p>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative'>
      {/* Loader for Edit Mode (same as main-banners) */}
      {isLoadingBanner && <SimpleLoader />}
      {/* Premium Banner Name Input Section */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pb-4'>
        <div className='max-w-4xl mx-auto px-6 pt-8'>
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => router.push('/custom-cms/main-banners')}
              className='p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400'
              aria-label='Back to banners'
            >
              <FiArrowLeft className='w-5 h-5' />
            </button>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          {isEditMode ? 'Edit Mini Banner' : 'Create New Mini Banner'}
            </h1>
          </div>
          <p className='text-base text-gray-500 dark:text-gray-400 mb-6'>
            {isEditMode
              ? 'Update your banner details'
              : 'Design a stunning banner for your storefront'}
          </p>
          {/* Banner Name Input */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className='flex items-center gap-2 mb-4'>
              <input
                type='text'
                value={bannerData.name}
                onChange={(e) => handleBannerNameChange(e.target.value)}
                placeholder='Banner name (e.g., Summer Sale 2024)'
                className='w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-base font-medium transition-all duration-200'
                aria-label='Banner name'
              />
              {/* Custom tooltip for info */}
              <div className='relative group ml-1 text-gray-400 cursor-pointer'>
                <FiInfo className='w-5 h-5' />
                <span className='absolute left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap transition-opacity'>
                  Give your banner a descriptive name for easy identification
                </span>
              </div>
            </div>
            {/* Main Actions Bar */}
            <div className='flex flex-wrap gap-3 justify-end mt-2'>
              {!isEditMode && (
                <div className='relative group'>
                  <button
                    onClick={handleSaveDraft}
                    disabled={
                      isSavingDraft ||
                      isPublishing ||
                      !bannerData.name.trim() ||
                      !bannerData.bannerImage
                    }
                    className={`px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSavingDraft
                        ? 'bg-blue-400 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isSavingDraft ? (
                      <span className='flex items-center gap-2'>
                        <svg
                          className='animate-spin h-4 w-4 text-white'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                            fill='none'
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                          />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      'Save Draft'
                    )}
                  </button>
                  {(isSavingDraft ||
                    isPublishing ||
                    !bannerData.name.trim() ||
                    !bannerData.bannerImage) && (
                    <span className='pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20'>
                      Banner name and banner image are required.
                    </span>
                  )}
                </div>
              )}
              <div className='relative group'>
                <div className='relative'>
                  <Button
                    onClick={
                      isEditMode ? handlePublishBanner : handlePublishBanner
                    }
                    variant='default'
                    size='lg'
                    disabled={
                      isEditMode
                        ? false
                        : isPublishing ||
                          !bannerData.name.trim() ||
                          !bannerData.bannerImage
                    }
                    className='rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all duration-200 px-6 py-2 min-w-[120px] flex items-center gap-2 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed'
                    aria-label={isEditMode ? 'Update Draft' : 'Publish Banner'}
                    tabIndex={0}
                    style={{
                      boxShadow:
                        '0 4px 24px 0 rgba(59,130,246,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.08)',
                    }}
                  >
                    {isPublishing ? (
                      <svg
                        className='animate-spin h-5 w-5 text-white'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                          fill='none'
                        />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                        />
                      </svg>
                    ) : (
                      <FiCheck className='w-5 h-5 text-white' />
                    )}
                    {isPublishing
                      ? isEditMode
                        ? selectedBannerImage ? 'Updating & Uploading...' : 'Updating...'
                        : selectedBannerImage ? 'Publishing & Uploading...' : 'Publishing...'
                      : isEditMode
                      ? 'Update Banner'
                      : 'Publish Banner'}
                  </Button>
                  {(isPublishing ||
                    !bannerData.name.trim() ||
                    (!selectedBannerImage && !bannerData.bannerImageUrl)) && (
                    <span className='pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20'>
                      {!bannerData.name.trim() ? 'Banner name is required.' : 'Banner image is required.'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Page Header */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  Create Banner
                </h1>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Design your perfect banner
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center'>
                <div
                  className={`flex items-center gap-3 ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <FiCheck className='w-5 h-5' />
                    ) : (
                      <step.icon className='w-5 h-5' />
                    )}
                  </div>
                  <div>
                    <p className='text-sm font-medium'>{step.title}</p>
                    <p className='text-xs text-gray-500'>{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-6 ${
                      currentStep > step.id
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Dynamic Width */}
      <motion.div className='px-6 py-8 w-full'>
        {/* Design Canvas - Dynamic Width */}
        <div className='w-full'>
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Design Canvas
              </h3>
              <div className='flex items-center gap-2'>
                <button
                  className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                  aria-label='Reset Banner'
                  title='Reset Banner'
                  onClick={() => {
                    if (originalBannerData && hasChanges) {
                      setShowResetConfirm(true)
                    } else {
                      // No changes to reset, show a message or do nothing
                    }
                  }}
                >
                  <FiRotateCcw className='w-4 h-4' />
                </button>
              </div>
            </div>

            {/* Responsive Banner Preview */}
            {editId && bannerData.dbContent ? (
              devicePreview === 'mobile' ? (
                <div className='relative mx-auto' style={{ maxWidth: '375px' }}>
                  <div
                    className='relative mx-auto bg-gray-900 rounded-3xl p-2 shadow-2xl'
                    style={{ width: '375px' }}
                  >
                    {/* Status Bar */}
                    <div className='flex items-center justify-between px-6 py-2 bg-gray-900 rounded-t-2xl'>
                      <div className='flex items-center gap-1'>
                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                        <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                      </div>
                      <div className='text-white text-xs font-medium'>9:41</div>
                      <div className='flex items-center gap-1'>
                        <div className='w-4 h-3 border border-white rounded-sm'></div>
                        <div className='w-6 h-2 bg-white rounded-sm'></div>
                      </div>
                    </div>
                    {/* Mobile Screen */}
                    <div className='bg-white rounded-b-2xl overflow-hidden'>
                      <div className='relative' style={{ height: '320px' }}>
                        <BannerContent
                          bannerData={bannerData}
                          devicePreview='mobile'
                          isInDeviceFrame={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className='mx-auto'
                  style={{ width: '400px', maxWidth: '100%' }}
                  dangerouslySetInnerHTML={{
                    __html: generateBannerHtml('desktop'),
                  }}
                />
              )
            ) : (
              <MainBannerCanvas
                devicePreview={devicePreview}
                bannerData={bannerData}
                fileInputRef={fileInputRef}
                isFullScreen={isFullScreen}
              />
            )}

            {/* Device Toggle */}
            <div className='flex items-center justify-center mt-4'>
              <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
                <button
                  onClick={() => setDevicePreview('desktop')}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    devicePreview === 'desktop'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiMonitor className='w-4 h-4' />
                </button>
                <button
                  onClick={() => setDevicePreview('mobile')}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    devicePreview === 'mobile'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiSmartphone className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Floating Panel Handles - Artistic Design */}
      {!sidePanelOpen && (
        <div className='fixed top-1/2 right-4 z-50 flex flex-col items-center gap-3'>
          {/* Content Panel Toggle - Premium Glassmorphism */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className='group relative flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:bg-white/90 dark:hover:bg-gray-700/90'
            style={{
              transform: 'translateY(-50%)',
              boxShadow:
                '0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            onClick={() => {
              setActivePanelType('content')
              setActivePanelTab('advanced')
              setSidePanelOpen(true)
              setPanelInitialPosition({
                x: window.innerWidth / 2 - 200 + window.scrollX,
                y: window.innerHeight / 2 - 300 + window.scrollY,
              })
            }}
            aria-label='Open content panel'
            title='Content Settings (Ctrl+P)'
            whileHover={{
              scale: 1.1,
              boxShadow:
                '0 12px 40px rgba(59, 130, 246, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <FiImage className='w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors relative z-10' />
            <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </motion.button>

          {/* Style Panel Toggle - Premium Glassmorphism */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className='group relative flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:bg-white/90 dark:hover:bg-gray-700/90'
            style={{
              transform: 'translateY(-50%)',
              boxShadow:
                '0 8px 32px rgba(147, 51, 234, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            onClick={() => {
              setActivePanelType('style')
              setActivePanelTab('title-style')
              setSidePanelOpen(true)
              setPanelInitialPosition({
                x: window.innerWidth / 2 - 200 + window.scrollX,
                y: window.innerHeight / 2 - 300 + window.scrollY,
              })
            }}
            aria-label='Open style panel'
            title='Style Settings'
            whileHover={{
              scale: 1.1,
              boxShadow:
                '0 12px 40px rgba(147, 51, 234, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <FiType className='w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors relative z-10' />
            <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </motion.button>

          {/* Layout Panel Toggle - Premium Glassmorphism */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className='group relative flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:bg-white/90 dark:hover:bg-gray-700/90'
            style={{
              transform: 'translateY(-50%)',
              boxShadow:
                '0 8px 32px rgba(34, 197, 94, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            onClick={() => {
              setActivePanelType('layout')
              setActivePanelTab('title-layout')
              setSidePanelOpen(true)
              setPanelInitialPosition({
                x: window.innerWidth / 2 - 200 + window.scrollX,
                y: window.innerHeight / 2 - 300 + window.scrollY,
              })
            }}
            aria-label='Open layout panel'
            title='Layout Settings'
            whileHover={{
              scale: 1.1,
              boxShadow:
                '0 12px 40px rgba(34, 197, 94, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className='absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <FiLayout className='w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors relative z-10' />
            <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </motion.button>

          {/* Floating Indicator Line */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className='w-0.5 h-8 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-green-500/50 rounded-full'
            style={{ transform: 'translateY(-50%)' }}
          />
        </div>
      )}

      {/* Premium Sliding Side Panel with Advanced Features */}
      <AnimatePresence>
        {sidePanelOpen && (
          <DraggablePanel initialPosition={panelInitialPosition}>
            <div
              style={{
                width: `${panelWidth}px`,
                maxWidth: '90vw',
                minHeight: 400,
                minWidth: 360,
              }}
            >
              {/* Resize Handle */}
              <div
                ref={resizeHandleRef}
                onMouseDown={handleResizeStart}
                className='absolute left-0 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-600 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-col-resize transition-colors'
              />

              {/* Panel Header */}
              <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-3'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    {activePanelType === 'content'
                      ? 'Content Settings'
                      : activePanelType === 'style'
                      ? 'Style Settings'
                      : 'Layout Settings'}
                  </h3>
                  <div className='flex items-center gap-1'>
                    <button
                      onClick={() => setSidePanelOpen(false)}
                      className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                      title='Close Panel (Esc)'
                    >
                      <FiX className='w-5 h-5' />
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel Tabs */}
              <div className='flex border-b border-gray-200 dark:border-gray-700'>
                {activePanelType === 'content' ? (
                  <>
                    <button
                      onClick={() => setActivePanelTab('advanced')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'advanced'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiImage className='w-4 h-4' />
                      Banner Image
                    </button>
                    <button
                      onClick={() => setActivePanelTab('content')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'content'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiType className='w-4 h-4' />
                      Content
                    </button>
                    <button
                      onClick={() => setActivePanelTab('links')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'links'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiLink className='w-4 h-4' />
                      Links
                    </button>
                  </>
                ) : activePanelType === 'style' ? (
                  <>
                    <button
                      onClick={() => setActivePanelTab('title-style')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'title-style'
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiType className='w-4 h-4' />
                      Title Style
                    </button>
                    <button
                      onClick={() => setActivePanelTab('subtitle-style')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'subtitle-style'
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiType className='w-4 h-4' />
                      Subtitle Style
                    </button>
                    <button
                      onClick={() => setActivePanelTab('button-style')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'button-style'
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiType className='w-4 h-4' />
                      Button Style
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActivePanelTab('title-layout')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'title-layout'
                          ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiLayout className='w-4 h-4' />
                      Title Layout
                    </button>
                    <button
                      onClick={() => setActivePanelTab('subtitle-layout')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'subtitle-layout'
                          ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiLayout className='w-4 h-4' />
                      Subtitle Layout
                    </button>
                    <button
                      onClick={() => setActivePanelTab('button-layout')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'button-layout'
                          ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiLayout className='w-4 h-4' />
                      Button Layout
                    </button>
                  </>
                )}
              </div>

              {/* Panel Content */}
              <div className='flex-1 overflow-y-auto p-6'>
                <AnimatePresence mode='wait'>
                  {activePanelType === 'content' && (
                    <>
                      {activePanelTab === 'links' && (
                        <motion.div
                          key='links-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiLink className='w-5 h-5 text-blue-400' />
                              Banner Links
                            </h4>
                            <div className='space-y-4'>
                              <div className='w-full mb-4'>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                  Banner Link (Entire Banner)
                                </label>
                                <input
                                  type='url'
                                  value={bannerData.url}
                                  onChange={(e) =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      url: e.target.value,
                                    }))
                                  }
                                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                  placeholder='https://example.com'
                                />
                              </div>
                              <div className='w-full mb-4'>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                  Button Link
                                </label>
                                <input
                                  type='url'
                                  value={bannerData.buttonUrl}
                                  onChange={(e) =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      buttonUrl: e.target.value,
                                    }))
                                  }
                                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                  placeholder='https://example.com/product'
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'content' && (
                        <motion.div
                          key='content-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiType className='w-5 h-5 text-blue-400' />
                              Banner Content
                            </h4>

                            {/* Content Toggle Switches */}
                            <div className='space-y-3 mb-6'>
                              <h5 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2'>
                                <FiEye className='w-4 h-4' />
                                Content Visibility
                              </h5>

                              <div className='space-y-3'>
                                {/* Title Toggle */}
                                <div className='flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30'>
                                  <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center'>
                                      <FiType className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                                    </div>
                                    <div>
                                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                        Show Title
                                      </span>
                                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                                        Display banner title on preview
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      updateBannerData((prev) => ({
                                        ...prev,
                                        showTitle: !prev.showTitle,
                                      }))
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                      bannerData.showTitle
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                        bannerData.showTitle
                                          ? 'translate-x-6'
                                          : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </div>

                                {/* Subtitle Toggle */}
                                <div className='flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30'>
                                  <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center'>
                                      <FiFileText className='w-4 h-4 text-purple-600 dark:text-purple-400' />
                                    </div>
                                    <div>
                                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                        Show Subtitle
                                      </span>
                                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                                        Display banner subtitle on preview
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      updateBannerData((prev) => ({
                                        ...prev,
                                        showSubtitle: !prev.showSubtitle,
                                      }))
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                      bannerData.showSubtitle
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                        bannerData.showSubtitle
                                          ? 'translate-x-6'
                                          : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </div>

                                {/* Button Toggle */}
                                <div className='flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800/30'>
                                  <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-lg bg-green-100 dark:bg-green-800/50 flex items-center justify-center'>
                                      <FiTarget className='w-4 h-4 text-green-600 dark:text-green-400' />
                                    </div>
                                    <div>
                                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                        Show Button
                                      </span>
                                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                                        Display CTA button on preview
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      updateBannerData((prev) => ({
                                        ...prev,
                                        showButton: !prev.showButton,
                                      }))
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                      bannerData.showButton
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                        bannerData.showButton
                                          ? 'translate-x-6'
                                          : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className='space-y-4'>
                              {/* Title Section */}
                              <div className='w-full mb-4'>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                  Banner Title
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-0.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Typography
                                    </span>
                                    <div className='flex items-center space-x-1'>
                                      <button
                                        onClick={() =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            titleBold: !prev.titleBold,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.titleBold
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Bold'
                                      >
                                        <FiBold className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            titleItalic: !prev.titleItalic,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.titleItalic
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Italic'
                                      >
                                        <FiItalic className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            titleUnderline:
                                              !prev.titleUnderline,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.titleUnderline
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Underline'
                                      >
                                        <FiUnderline className='w-3 h-3' />
                                      </button>
                                    </div>
                                  </div>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-1.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Font Size
                                    </span>
                                    <div className='flex items-center gap-1 bg-white rounded border border-gray-200 p-0.5'>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            updateBannerData((prev) => {
                                              const currentSize =
                                                parseInt(
                                                  prev.titleCustomFontSize
                                                ) || 48
                                              const newSize = Math.max(
                                                8,
                                                currentSize - 2
                                              )
                                              return {
                                                ...prev,
                                                titleCustomFontSize:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiMinus className='w-2.5 h-2.5' />
                                      </button>
                                      <span className='text-xs font-mono text-gray-700 px-1.5 min-w-[1.75rem] text-center'>
                                        {bannerData.titleCustomFontSize || '48'}
                                      </span>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            updateBannerData((prev) => {
                                              const currentSize =
                                                parseInt(
                                                  prev.titleCustomFontSize
                                                ) || 48
                                              const newSize = Math.min(
                                                120,
                                                currentSize + 2
                                              )
                                              return {
                                                ...prev,
                                                titleCustomFontSize:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiPlus className='w-2.5 h-2.5' />
                                      </button>
                                    </div>
                                  </div>
                                  <textarea
                                    value={bannerData.title}
                                    onChange={(e) =>
                                      updateBannerData((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                      }))
                                    }
                                    rows={2}
                                    className='w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 resize-none placeholder:text-xs placeholder:text-gray-400'
                                    style={{ fontSize: '12px' }}
                                    placeholder='Your Banner Title'
                                  />
                                </div>
                              </div>

                              {/* Subtitle Section */}
                              <div className='w-full mb-4'>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                  Banner Subtitle
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-0.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Typography
                                    </span>
                                    <div className='flex items-center space-x-1'>
                                      <button
                                        onClick={() =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            subtitleBold: !prev.subtitleBold,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.subtitleBold
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Bold'
                                      >
                                        <FiBold className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            subtitleItalic:
                                              !prev.subtitleItalic,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.subtitleItalic
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Italic'
                                      >
                                        <FiItalic className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            subtitleUnderline:
                                              !prev.subtitleUnderline,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.subtitleUnderline
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Underline'
                                      >
                                        <FiUnderline className='w-3 h-3' />
                                      </button>
                                    </div>
                                  </div>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-1.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Font Size
                                    </span>
                                    <div className='flex items-center gap-1 bg-white rounded border border-gray-200 p-0.5'>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            updateBannerData((prev) => {
                                              const currentSize =
                                                devicePreview === 'mobile'
                                                  ? parseInt(
                                                      prev.subtitleCustomFontSize
                                                    ) || 24
                                                  : parseInt(
                                                      prev.subtitleCustomFontSize
                                                    ) || 24
                                              const newSize = Math.max(
                                                8,
                                                currentSize - 2
                                              )
                                              return {
                                                ...prev,
                                                [devicePreview === 'mobile'
                                                  ? 'subtitleCustomFontSize'
                                                  : 'subtitleCustomFontSize']:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiMinus className='w-2.5 h-2.5' />
                                      </button>
                                      <span className='text-xs font-mono text-gray-700 px-1.5 min-w-[1.75rem] text-center'>
                                        {devicePreview === 'mobile'
                                          ? bannerData.subtitleCustomFontSize ||
                                            '24'
                                          : bannerData.subtitleCustomFontSize ||
                                            '24'}
                                      </span>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            updateBannerData((prev) => {
                                              const currentSize =
                                                devicePreview === 'mobile'
                                                  ? parseInt(
                                                      prev.subtitleCustomFontSize
                                                    ) || 24
                                                  : parseInt(
                                                      prev.subtitleCustomFontSize
                                                    ) || 24
                                              const newSize = Math.min(
                                                120,
                                                currentSize + 2
                                              )
                                              return {
                                                ...prev,
                                                [devicePreview === 'mobile'
                                                  ? 'subtitleCustomFontSize'
                                                  : 'subtitleCustomFontSize']:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiPlus className='w-2.5 h-2.5' />
                                      </button>
                                    </div>
                                  </div>
                                  <textarea
                                    value={bannerData.subtitle}
                                    onChange={(e) =>
                                      updateBannerData((prev) => ({
                                        ...prev,
                                        subtitle: e.target.value,
                                      }))
                                    }
                                    rows={2}
                                    className='w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 resize-none placeholder:text-xs placeholder:text-gray-400'
                                    style={{ fontSize: '12px' }}
                                    placeholder='Your banner subtitle'
                                  />
                                </div>
                              </div>

                              {/* CTA Section */}
                              <div className='w-full mb-4'>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                  CTA Button Text
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-0.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Typography
                                    </span>
                                    <div className='flex items-center space-x-1'>
                                      <button
                                        onClick={() =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            ctaBold: !prev.ctaBold,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.ctaBold
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Bold'
                                      >
                                        <FiBold className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            ctaItalic: !prev.ctaItalic,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.ctaItalic
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Italic'
                                      >
                                        <FiItalic className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            ctaUnderline: !prev.ctaUnderline,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.ctaUnderline
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Underline'
                                      >
                                        <FiUnderline className='w-3 h-3' />
                                      </button>
                                    </div>
                                  </div>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-1.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Font Size
                                    </span>
                                    <div className='flex items-center gap-1 bg-white rounded border border-gray-200 p-0.5'>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            updateBannerData((prev) => {
                                              const currentSize =
                                                devicePreview === 'mobile'
                                                  ? parseInt(
                                                      prev.ctaCustomFontSize
                                                    ) || 18
                                                  : parseInt(
                                                      prev.ctaCustomFontSize
                                                    ) || 18
                                              const newSize = Math.max(
                                                8,
                                                currentSize - 2
                                              )
                                              return {
                                                ...prev,
                                                [devicePreview === 'mobile'
                                                  ? 'ctaCustomFontSize'
                                                  : 'ctaCustomFontSize']:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiMinus className='w-2.5 h-2.5' />
                                      </button>
                                      <span className='text-xs font-mono text-gray-700 px-1.5 min-w-[1.75rem] text-center'>
                                        {devicePreview === 'mobile'
                                          ? bannerData.ctaCustomFontSize || '18'
                                          : bannerData.ctaCustomFontSize ||
                                            '18'}
                                      </span>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            updateBannerData((prev) => {
                                              const currentSize =
                                                devicePreview === 'mobile'
                                                  ? parseInt(
                                                      prev.ctaCustomFontSize
                                                    ) || 18
                                                  : parseInt(
                                                      prev.ctaCustomFontSize
                                                    ) || 18
                                              const newSize = Math.min(
                                                120,
                                                currentSize + 2
                                              )
                                              return {
                                                ...prev,
                                                [devicePreview === 'mobile'
                                                  ? 'ctaCustomFontSize'
                                                  : 'ctaCustomFontSize']:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiPlus className='w-2.5 h-2.5' />
                                      </button>
                                    </div>
                                  </div>
                                  <input
                                    type='text'
                                    value={bannerData.ctaText}
                                    onChange={(e) =>
                                      updateBannerData((prev) => ({
                                        ...prev,
                                        ctaText: e.target.value,
                                      }))
                                    }
                                    className='w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 placeholder:text-xs placeholder:text-gray-400'
                                    style={{
                                      fontSize: '12px',
                                    }}
                                    placeholder='Enter CTA button text...'
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'advanced' && (
                        <motion.div
                          key='advanced-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiImage className='w-5 h-5 text-purple-400' />
                              Banner Image
                            </h4>
                            <div className='space-y-4'>
                              {/* Banner Image Upload */}
                              <div>
                                <div
                                  onClick={() => fileInputRef.current?.click()}
                                  className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer'
                                >
                                  {bannerData.bannerImage ? (
                                    <div className='space-y-3'>
                                      <img
                                        src={
                                          bannerData.bannerImageUrl ||
                                          (bannerData.bannerImage
                                            ? URL.createObjectURL(
                                                bannerData.bannerImage
                                              )
                                            : '')
                                        }
                                        alt='Banner preview'
                                        className='w-full h-24 object-cover rounded'
                                        onError={(e) => {
                                          console.error(
                                            'Banner image tab preview failed to load:',
                                            e
                                          )
                                          console.error(
                                            'Failed image src:',
                                            bannerData.bannerImageUrl ||
                                              (bannerData.bannerImage
                                                ? URL.createObjectURL(
                                                    bannerData.bannerImage
                                                  )
                                                : '')
                                          )
                                        }}
                                      />
                                      <p className='text-xs text-gray-600 dark:text-gray-400'>
                                        {bannerData.bannerImage?.name}
                                      </p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleRemoveImage()
                                        }}
                                        className='px-2 py-1 text-red-600 hover:text-red-700 text-xs'
                                      >
                                        Remove Image
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <FiUpload className='w-8 h-8 text-gray-400 mx-auto mb-3' />
                                      <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                                        Upload Banner Image
                                      </p>
                                      <p className='text-xs text-gray-600 dark:text-gray-400'>
                                        Click to upload or drag and drop
                                      </p>
                                      <p className='text-xs text-gray-500 mt-1'>
                                        JPG, PNG, WebP up to 2MB
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <input
                                  ref={fileInputRef}
                                  type='file'
                                  accept='image/*'
                                  onChange={(e) =>
                                    e.target.files?.[0] &&
                                    handleImageUpload(e.target.files[0])
                                  }
                                  className='hidden'
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {activePanelType === 'style' && (
                    <>
                      {activePanelTab === 'title-style' && (
                        <motion.div
                          key='title-style-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiType className='w-5 h-5 text-purple-400' />
                              Title Style Settings
                            </h4>
                            <div className='space-y-4'>
                              <div className='w-full mb-4'>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                                  Title Color
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                                        Custom:
                                      </span>
                                      <input
                                        type='color'
                                        value={bannerData.titleColor}
                                        onChange={(e) =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            titleColor: e.target.value,
                                          }))
                                        }
                                        className='w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform shadow-sm'
                                      />
                                      <span className='text-xs font-mono text-gray-600 dark:text-gray-400'>
                                        {bannerData.titleColor}
                                      </span>
                                    </div>
                                  </div>
                                  <div className='w-full mb-4'>
                                    <span className='text-xs text-gray-500 dark:text-gray-400 mb-2 block'>
                                      Preset Colors:
                                    </span>
                                    <div className='flex gap-1 flex-wrap'>
                                      {presetColors.map((color) => (
                                        <button
                                          key={color}
                                          onClick={() =>
                                            updateBannerData((prev) => ({
                                              ...prev,
                                              titleColor: color,
                                            }))
                                          }
                                          className='w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform shadow-sm'
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'subtitle-style' && (
                        <motion.div
                          key='subtitle-style-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiType className='w-5 h-5 text-purple-400' />
                              Subtitle Style Settings
                            </h4>
                            <div className='space-y-4'>
                              <div className='w-full mb-4'>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                                  Subtitle Color
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                                        Custom:
                                      </span>
                                      <input
                                        type='color'
                                        value={bannerData.subtitleColor}
                                        onChange={(e) =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            subtitleColor: e.target.value,
                                          }))
                                        }
                                        className='w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform shadow-sm'
                                      />
                                      <span className='text-xs font-mono text-gray-600 dark:text-gray-400'>
                                        {bannerData.subtitleColor}
                                      </span>
                                    </div>
                                  </div>
                                  <div className='w-full mb-4'>
                                    <span className='text-xs text-gray-500 dark:text-gray-400 mb-2 block'>
                                      Preset Colors:
                                    </span>
                                    <div className='flex gap-1 flex-wrap'>
                                      {presetColors.map((color) => (
                                        <button
                                          key={color}
                                          onClick={() =>
                                            updateBannerData((prev) => ({
                                              ...prev,
                                              subtitleColor: color,
                                            }))
                                          }
                                          className='w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform shadow-sm'
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'button-style' && (
                        <motion.div
                          key='button-style-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiType className='w-5 h-5 text-purple-400' />
                              Button Style Settings
                            </h4>
                            <div className='space-y-6'>
                              <div className='w-full mb-4'>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                                  Button Background
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                                        Custom:
                                      </span>
                                      <input
                                        type='color'
                                        value={bannerData.ctaBgColor}
                                        onChange={(e) =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            ctaBgColor: e.target.value,
                                          }))
                                        }
                                        className='w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform shadow-sm'
                                      />
                                      <span className='text-xs font-mono text-gray-600 dark:text-gray-400'>
                                        {bannerData.ctaBgColor}
                                      </span>
                                    </div>
                                  </div>
                                  <div className='w-full mb-4'>
                                    <span className='text-xs text-gray-500 dark:text-gray-400 mb-2 block'>
                                      Preset Colors:
                                    </span>
                                    <div className='flex gap-1 flex-wrap'>
                                      {presetColors.map((color) => (
                                        <button
                                          key={color}
                                          onClick={() =>
                                            updateBannerData((prev) => ({
                                              ...prev,
                                              ctaBgColor: color,
                                            }))
                                          }
                                          className='w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform shadow-sm'
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className='w-full mb-4'>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                                  Button Text Color
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                                        Custom:
                                      </span>
                                      <input
                                        type='color'
                                        value={bannerData.ctaColor}
                                        onChange={(e) =>
                                          updateBannerData((prev) => ({
                                            ...prev,
                                            ctaColor: e.target.value,
                                          }))
                                        }
                                        className='w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform shadow-sm'
                                      />
                                      <span className='text-xs font-mono text-gray-600 dark:text-gray-400'>
                                        {bannerData.ctaColor}
                                      </span>
                                    </div>
                                  </div>
                                  <div className='w-full mb-4'>
                                    <span className='text-xs text-gray-500 dark:text-gray-400 mb-2 block'>
                                      Preset Colors:
                                    </span>
                                    <div className='flex gap-1 flex-wrap'>
                                      {presetColors.map((color) => (
                                        <button
                                          key={color}
                                          onClick={() =>
                                            updateBannerData((prev) => ({
                                              ...prev,
                                              ctaColor: color,
                                            }))
                                          }
                                          className='w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform shadow-sm'
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {activePanelType === 'layout' && (
                    <>
                      {activePanelTab === 'title-layout' && (
                        <motion.div
                          key='title-layout-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-4'
                        >
                          {/* Title Margin Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Title Margin
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.titleMarginTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.titleMarginRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.titleMarginBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.titleMarginLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.titleMarginTop ?? 0
                                          const newValue = currentValue - 5
                                          return {
                                            ...prev,
                                            titleMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.titleMarginLeft ?? 0
                                        const newValue = currentValue - 5
                                        return {
                                          ...prev,
                                          titleMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded border border-gray-400 dark:border-gray-500'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.titleMarginLeft ?? 0
                                        const newValue = currentValue + 5
                                        return {
                                          ...prev,
                                          titleMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.titleMarginTop ?? 0
                                          const newValue = currentValue + 5
                                          return {
                                            ...prev,
                                            titleMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      titleMarginTop: 20,
                                      titleMarginRight: 20,
                                      titleMarginBottom: 20,
                                      titleMarginLeft: 20,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-600 transition-colors'
                                >
                                  All 20px
                                </button>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      titleMarginTop: 0,
                                      titleMarginRight: 0,
                                      titleMarginBottom: 0,
                                      titleMarginLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Title Padding Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Title Padding
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.titlePaddingTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.titlePaddingRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.titlePaddingBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.titlePaddingLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.titlePaddingTop ?? 0
                                          const newValue = Math.max(
                                            currentValue - 3,
                                            -20
                                          )
                                          return {
                                            ...prev,
                                            titlePaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.titlePaddingLeft ?? 0
                                        const newValue = Math.max(
                                          currentValue - 3,
                                          -20
                                        )
                                        return {
                                          ...prev,
                                          titlePaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-blue-400 dark:bg-blue-500 rounded border border-blue-500 dark:border-blue-400'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.titlePaddingLeft ?? 0
                                        const newValue = Math.min(
                                          currentValue + 3,
                                          50
                                        )
                                        return {
                                          ...prev,
                                          titlePaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.titlePaddingTop ?? 0
                                          const newValue = Math.min(
                                            currentValue + 3,
                                            50
                                          )
                                          return {
                                            ...prev,
                                            titlePaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      titlePaddingTop: 10,
                                      titlePaddingRight: 10,
                                      titlePaddingBottom: 10,
                                      titlePaddingLeft: 10,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors'
                                >
                                  All 10px
                                </button>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      titlePaddingTop: 0,
                                      titlePaddingRight: 0,
                                      titlePaddingBottom: 0,
                                      titlePaddingLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Title Position Controls */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mt-4'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Title Position (X%, Y%)
                            </label>
                            <div className='flex items-center gap-2'>
                              <span className='text-xs text-gray-500'>X:</span>
                              <button
                                onClick={() =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    titlePosition: {
                                      ...prev.titlePosition,
                                      x: Math.max(0, prev.titlePosition.x - 1),
                                    },
                                  }))
                                }
                                className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                              >
                                <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                              </button>
                              <input
                                type='number'
                                min={0}
                                max={100}
                                value={bannerData.titlePosition.x}
                                onChange={(e) =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    titlePosition: {
                                      ...prev.titlePosition,
                                      x: Math.max(
                                        0,
                                        Math.min(100, Number(e.target.value))
                                      ),
                                    },
                                  }))
                                }
                                className='w-14 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs'
                              />
                              <button
                                onClick={() =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    titlePosition: {
                                      ...prev.titlePosition,
                                      x: Math.min(
                                        100,
                                        prev.titlePosition.x + 1
                                      ),
                                    },
                                  }))
                                }
                                className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                              >
                                <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                              </button>
                              <span className='text-xs text-gray-500 ml-2'>
                                Y:
                              </span>
                              <button
                                onClick={() =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    titlePosition: {
                                      ...prev.titlePosition,
                                      y: Math.max(0, prev.titlePosition.y - 1),
                                    },
                                  }))
                                }
                                className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                              >
                                <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                              </button>
                              <input
                                type='number'
                                min={0}
                                max={100}
                                value={bannerData.titlePosition.y}
                                onChange={(e) =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    titlePosition: {
                                      ...prev.titlePosition,
                                      y: Math.max(
                                        0,
                                        Math.min(100, Number(e.target.value))
                                      ),
                                    },
                                  }))
                                }
                                className='w-14 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs'
                              />
                              <button
                                onClick={() =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    titlePosition: {
                                      ...prev.titlePosition,
                                      y: Math.min(
                                        100,
                                        prev.titlePosition.y + 1
                                      ),
                                    },
                                  }))
                                }
                                className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                              >
                                <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'subtitle-layout' && (
                        <motion.div
                          key='subtitle-layout-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-4'
                        >
                          {/* Subtitle Margin Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Subtitle Margin
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.subtitleMarginTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.subtitleMarginRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.subtitleMarginBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.subtitleMarginLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.subtitleMarginTop ?? 0
                                          const newValue = currentValue - 5
                                          return {
                                            ...prev,
                                            subtitleMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.subtitleMarginLeft ?? 0
                                        const newValue = currentValue - 5
                                        return {
                                          ...prev,
                                          subtitleMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded border border-gray-400 dark:border-gray-500'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.subtitleMarginLeft ?? 0
                                        const newValue = currentValue + 5
                                        return {
                                          ...prev,
                                          subtitleMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.subtitleMarginTop ?? 0
                                          const newValue = currentValue + 5
                                          return {
                                            ...prev,
                                            subtitleMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      subtitleMarginTop: 20,
                                      subtitleMarginRight: 20,
                                      subtitleMarginBottom: 20,
                                      subtitleMarginLeft: 20,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-purple-100 dark:bg-purple-700 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-600 transition-colors'
                                >
                                  All 20px
                                </button>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      subtitleMarginTop: 0,
                                      subtitleMarginRight: 0,
                                      subtitleMarginBottom: 0,
                                      subtitleMarginLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Subtitle Padding Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Subtitle Padding
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.subtitlePaddingTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.subtitlePaddingRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.subtitlePaddingBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.subtitlePaddingLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.subtitlePaddingTop ?? 0
                                          const newValue = Math.max(
                                            currentValue - 3,
                                            -20
                                          )
                                          return {
                                            ...prev,
                                            subtitlePaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-orange-50 dark:hover:bg-orange-600/20 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.subtitlePaddingLeft ?? 0
                                        const newValue = Math.max(
                                          currentValue - 3,
                                          -20
                                        )
                                        return {
                                          ...prev,
                                          subtitlePaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-orange-50 dark:hover:bg-orange-600/20 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-orange-400 dark:bg-orange-500 rounded border border-orange-500 dark:border-orange-400'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.subtitlePaddingLeft ?? 0
                                        const newValue = Math.min(
                                          currentValue + 3,
                                          50
                                        )
                                        return {
                                          ...prev,
                                          subtitlePaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-orange-50 dark:hover:bg-orange-600/20 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.subtitlePaddingTop ?? 0
                                          const newValue = Math.min(
                                            currentValue + 3,
                                            50
                                          )
                                          return {
                                            ...prev,
                                            subtitlePaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-orange-50 dark:hover:bg-orange-600/20 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      subtitlePaddingTop: 10,
                                      subtitlePaddingRight: 10,
                                      subtitlePaddingBottom: 10,
                                      subtitlePaddingLeft: 10,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-orange-100 dark:bg-orange-700 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-600 transition-colors'
                                >
                                  All 10px
                                </button>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      subtitlePaddingTop: 0,
                                      subtitlePaddingRight: 0,
                                      subtitlePaddingBottom: 0,
                                      subtitlePaddingLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Subtitle Position Controls */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mt-4'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Subtitle Position (X%, Y%)
                            </label>
                            <div className='flex items-center gap-2'>
                              <span className='text-xs text-gray-500'>X:</span>
                              <button
                                onClick={() =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    subtitlePosition: {
                                      ...prev.subtitlePosition,
                                      x: Math.max(
                                        0,
                                        prev.subtitlePosition.x - 1
                                      ),
                                    },
                                  }))
                                }
                                className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                              >
                                <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                              </button>
                              <input
                                type='number'
                                min={0}
                                max={100}
                                value={bannerData.subtitlePosition.x}
                                onChange={(e) =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    subtitlePosition: {
                                      ...prev.subtitlePosition,
                                      x: Math.max(
                                        0,
                                        Math.min(100, Number(e.target.value))
                                      ),
                                    },
                                  }))
                                }
                                className='w-14 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs'
                              />
                              <button
                                onClick={() =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    subtitlePosition: {
                                      ...prev.subtitlePosition,
                                      x: Math.min(
                                        100,
                                        prev.subtitlePosition.x + 1
                                      ),
                                    },
                                  }))
                                }
                                className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                              >
                                <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                              </button>
                              <span className='text-xs text-gray-500 ml-2'>
                                Y:
                              </span>
                              <button
                                onClick={() =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    subtitlePosition: {
                                      ...prev.subtitlePosition,
                                      y: Math.max(
                                        0,
                                        prev.subtitlePosition.y - 1
                                      ),
                                    },
                                  }))
                                }
                                className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                              >
                                <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                              </button>
                              <input
                                type='number'
                                min={0}
                                max={100}
                                value={bannerData.subtitlePosition.y}
                                onChange={(e) =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    subtitlePosition: {
                                      ...prev.subtitlePosition,
                                      y: Math.max(
                                        0,
                                        Math.min(100, Number(e.target.value))
                                      ),
                                    },
                                  }))
                                }
                                className='w-14 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs'
                              />
                              <button
                                onClick={() =>
                                  updateBannerData((prev) => ({
                                    ...prev,
                                    subtitlePosition: {
                                      ...prev.subtitlePosition,
                                      y: Math.min(
                                        100,
                                        prev.subtitlePosition.y + 1
                                      ),
                                    },
                                  }))
                                }
                                className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                              >
                                <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'button-layout' && (
                        <motion.div
                          key='button-layout-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-4'
                        >
                          {/* Button Margin Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Button Margin
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.buttonMarginTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.buttonMarginRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.buttonMarginBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.buttonMarginLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.buttonMarginTop ?? 0
                                          const newValue = currentValue - 5
                                          return {
                                            ...prev,
                                            buttonMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.buttonMarginLeft ?? 0
                                        const newValue = currentValue - 5
                                        return {
                                          ...prev,
                                          buttonMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded border border-gray-400 dark:border-gray-500'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.buttonMarginLeft ?? 0
                                        const newValue = currentValue + 5
                                        return {
                                          ...prev,
                                          buttonMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.buttonMarginTop ?? 0
                                          const newValue = currentValue + 5
                                          return {
                                            ...prev,
                                            buttonMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      buttonMarginTop: 20,
                                      buttonMarginRight: 20,
                                      buttonMarginBottom: 20,
                                      buttonMarginLeft: 20,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-600 transition-colors'
                                >
                                  All 20px
                                </button>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      buttonMarginTop: 0,
                                      buttonMarginRight: 0,
                                      buttonMarginBottom: 0,
                                      buttonMarginLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Button Padding Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Button Padding
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.buttonPaddingTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.buttonPaddingRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.buttonPaddingBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.buttonPaddingLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.buttonPaddingTop ?? 0
                                          const newValue = Math.max(
                                            currentValue - 3,
                                            -20
                                          )
                                          return {
                                            ...prev,
                                            buttonPaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-teal-50 dark:hover:bg-teal-600/20 hover:border-teal-300 dark:hover:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.buttonPaddingLeft ?? 0
                                        const newValue = Math.max(
                                          currentValue - 3,
                                          -20
                                        )
                                        return {
                                          ...prev,
                                          buttonPaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-teal-50 dark:hover:bg-teal-600/20 hover:border-teal-300 dark:hover:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-teal-400 dark:bg-teal-500 rounded border border-teal-500 dark:border-teal-400'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      updateBannerData((prev) => {
                                        const currentValue =
                                          prev.buttonPaddingLeft ?? 0
                                        const newValue = Math.min(
                                          currentValue + 3,
                                          50
                                        )
                                        return {
                                          ...prev,
                                          buttonPaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-teal-50 dark:hover:bg-teal-600/20 hover:border-teal-300 dark:hover:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        updateBannerData((prev) => {
                                          const currentValue =
                                            prev.buttonPaddingTop ?? 0
                                          const newValue = Math.min(
                                            currentValue + 3,
                                            50
                                          )
                                          return {
                                            ...prev,
                                            buttonPaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-teal-50 dark:hover:bg-teal-600/20 hover:border-teal-300 dark:hover:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      buttonPaddingTop: 10,
                                      buttonPaddingRight: 10,
                                      buttonPaddingBottom: 10,
                                      buttonPaddingLeft: 10,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-teal-100 dark:bg-teal-700 text-teal-700 dark:text-teal-300 rounded hover:bg-teal-200 dark:hover:bg-teal-600 transition-colors'
                                >
                                  All 10px
                                </button>
                                <button
                                  onClick={() =>
                                    updateBannerData((prev) => ({
                                      ...prev,
                                      buttonPaddingTop: 0,
                                      buttonPaddingRight: 0,
                                      buttonPaddingBottom: 0,
                                      buttonPaddingLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Panel Footer */}
              <div className='p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Panel Width: {panelWidth}px</span>
                  <span>Press Esc to close</span>
                </div>
              </div>
            </div>
          </DraggablePanel>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-4xl w-full flex flex-col items-center'
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className='absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10'
                aria-label='Exit Full Screen'
                onClick={() => setIsFullScreen(false)}
              >
                <FiX className='w-5 h-5' />
              </button>
              <div className='w-full flex justify-center items-center'>
                <MainBannerCanvas
                  devicePreview={devicePreview}
                  bannerData={bannerData}
                  fileInputRef={fileInputRef}
                  isFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className='bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center'
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiRotateCcw className='w-8 h-8 text-blue-500 mb-4' />
              <h2 className='text-lg font-bold mb-2 text-gray-900 dark:text-white'>
                Reset Banner?
              </h2>
              <p className='text-gray-600 dark:text-gray-300 mb-6 text-center'>
                Are you sure you want to reset the banner to its default state?
                This cannot be undone.
              </p>
              <div className='flex gap-4'>
                <button
                  className='px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold'
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className='px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold'
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Premium HTML Preview Modal */}
      <AnimatePresence>
        {showHtmlPreview && (
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col'
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Modal Header */}
              <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                    <FiCode className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div>
                    <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
                      Banner Preview & Code
                    </h2>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      See your live banner and copy the HTML code
                    </p>
                  </div>
                </div>
                <button
                  className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                  onClick={() => setShowHtmlPreview(false)}
                >
                  <FiX className='w-5 h-5' />
                </button>
              </div>
              {/* Modal Content */}
              <div className='flex-1 overflow-y-auto p-6 flex flex-col gap-8'>
                {/* Live Preview Desktop */}
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <FiEye className='w-5 h-5 text-blue-500' />
                    <span className='text-base font-semibold text-gray-800 dark:text-gray-100'>
                      Live Preview
                    </span>
                    <span className='ml-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
                      Desktop
                    </span>
                  </div>
                  <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6'>
                    <div
                      className='w-full'
                      dangerouslySetInnerHTML={{
                        __html: generateBannerHtml('desktop'),
                      }}
                    />
                  </div>
                </div>
                {/* HTML Code Section */}
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <FiFileText className='w-5 h-5 text-purple-500' />
                    <span className='text-base font-semibold text-gray-800 dark:text-gray-100'>
                      HTML Code
                    </span>
                    <span className='ml-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
                      {generateBannerHtml('desktop').length} characters
                    </span>
                    <button
                      onClick={copyHtmlToClipboard}
                      className='flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-md border border-blue-200 hover:bg-blue-100 hover:shadow transition-colors text-sm ml-auto focus:outline-none focus:ring-2 focus:ring-blue-400'
                    >
                      <FiCopy className='w-4 h-4' />
                      Copy Code
                    </button>
                  </div>
                  <div className='relative'>
                    <pre className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs overflow-auto max-h-[40vh] border border-gray-200 dark:border-gray-700'>
                      <code className='text-gray-800 dark:text-gray-200'>
                        {generateBannerHtml('desktop')}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
              {/* Modal Footer */}
              <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400'>
                  <FiInfo className='w-4 h-4' />
                  <span>
                    This HTML includes responsive design and hover effects
                  </span>
                </div>
                <button
                  onClick={() => setShowHtmlPreview(false)}
                  className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors'
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
