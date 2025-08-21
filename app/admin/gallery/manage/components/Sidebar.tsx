'use client'

import { motion } from 'framer-motion'
import { FiShield, FiMonitor } from 'react-icons/fi'
import { Card } from '@/components/ui/card'
import type { SelectedFile } from '../types'

interface SidebarProps {
  files: SelectedFile[]
}

export default function Sidebar({ files }: SidebarProps) {
  return null // Sidebar removed per user request
}