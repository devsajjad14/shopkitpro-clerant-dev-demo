'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface PremiumTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  disabled?: boolean
  delayDuration?: number
  className?: string
  contentClassName?: string
}

export function PremiumTooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  disabled = false,
  delayDuration = 300,
  className,
  contentClassName,
  ...props
}: PremiumTooltipProps) {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild className={className}>
          {children}
        </TooltipPrimitive.Trigger>
        <AnimatePresence>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              side={side}
              align={align}
              className={cn(
                'z-50 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700',
                'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md',
                'px-4 py-3 text-sm shadow-2xl animate-in fade-in-0 zoom-in-95',
                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
                'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                'max-w-xs',
                contentClassName
              )}
              sideOffset={8}
              {...props}
            >
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {content}
              </motion.div>
              <TooltipPrimitive.Arrow className="fill-white dark:fill-gray-900" />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </AnimatePresence>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

// Specialized restriction tooltip component
interface RestrictionTooltipProps {
  children: React.ReactNode
  restriction: {
    reason: string
    suggestion: string
  }
  platformName: string
  className?: string
}

export function RestrictionTooltip({
  children,
  restriction,
  platformName,
  className
}: RestrictionTooltipProps) {
  const content = (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {platformName} Restriction
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
        {restriction.reason}
      </p>
      <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
        <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">
          💡 {restriction.suggestion}
        </p>
      </div>
    </div>
  )

  return (
    <PremiumTooltip
      content={content}
      side="bottom"
      align="center"
      delayDuration={200}
      className={className}
      contentClassName="border-amber-200 dark:border-amber-800"
    >
      {children}
    </PremiumTooltip>
  )
}