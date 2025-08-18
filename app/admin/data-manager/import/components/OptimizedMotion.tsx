'use client'

// Minimal motion wrapper to reduce bundle size
import { motion } from 'framer-motion'

interface OptimizedMotionProps {
  children: React.ReactNode
  className?: string
  initial?: any
  animate?: any
  transition?: any
  onClick?: () => void
}

export function OptimizedMotion({ 
  children, 
  className, 
  initial, 
  animate, 
  transition,
  onClick 
}: OptimizedMotionProps) {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// Lightweight fade-in animation
export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

// Lightweight slide-in animations
export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 }
}

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 }
}