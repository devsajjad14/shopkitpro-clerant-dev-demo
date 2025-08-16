'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiEye,
  FiTrash2,
  FiUser,
  FiCheck,
  FiXCircle,
  FiEyeOff,
  FiUpload,
  FiUsers,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiActivity,
  FiList,
  FiGrid,
  FiMoreVertical,
} from 'react-icons/fi'
import { toast } from 'sonner'
import Image from 'next/image'
import { PremiumPagination } from '@/components/ui/premium-pagination'

interface User {
  id: string
  name: string
  email: string
  password?: string
  image: string | null
  profile?: {
    firstName: string
    lastName: string
    phone: string
    avatarUrl: string | null
  }
  role: string
  status: string
  address: string
  createdAt?: string
  updatedAt?: string
}

interface UserFormData {
  name: string
  email: string
  password: string
  confirmPassword?: string
  phoneNumber: string
  image: string | File | null
  role: string
  status: string
  address: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [tempProfileImage, setTempProfileImage] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    image: null,
    role: 'user',
    status: 'active',
    address: '',
  })
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})
  const [tempEditProfileImage, setTempEditProfileImage] = useState<File | null>(null)
  
  // Premium features state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(false)
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    image: null,
    role: 'user',
    status: 'active',
    address: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    console.log('[USERS] Component mounted - fetching users...')
    fetchUsers()
  }, [])



  const fetchUsers = async () => {
    try {
      console.log('[USERS] Fetching users from API...')
      setIsLoading(true) // Ensure loading state is set
      const response = await fetch('/api/admin/users', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      console.log('[USERS] Fetched users from API:', data.length, 'users')
      console.log('[USERS] First few users:', data.slice(0, 3).map(u => ({ id: u.id, name: u.name, email: u.email, image: u.image })))
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.profile?.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.address && user.address.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'email-asc':
          return a.email.localeCompare(b.email)
        case 'email-desc':
          return b.email.localeCompare(a.email)
        case 'role-asc':
          return a.role.localeCompare(b.role)
        case 'role-desc':
          return b.role.localeCompare(a.role)
        default:
          return 0
      }
    })


  const hasActiveFilters = searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'newest'

  const clearFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
    setSortBy('newest')
  }

  const handleView = (user: User) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    // Populate edit form with current user data
    setEditFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password for security
      confirmPassword: '',
      phoneNumber: user.profile?.phone || '',
      image: user.image, // Keep current image URL
      role: user.role,
      status: user.status,
      address: user.address || '',
    })
    setEditFormErrors({})
    setTempEditProfileImage(null)
    setShowEditModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete user')
      }

      setUsers(prevUsers => prevUsers.filter(user => user.id !== id))
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setIsDeleting(null)
    }
  }

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAndSortedUsers.slice(startIndex, endIndex)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-7xl mx-auto p-6 space-y-6'>
        {/* Premium Header */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <div className='relative flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                  <FiUsers className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    User Management
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    {filteredAndSortedUsers.length} of {users.length} users
                  </p>
                </div>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowForm(true)}
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Premium Search & Filters */}
        <div className='space-y-4'>
          {/* Main Search Bar */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative p-4 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
              <div className='flex items-center gap-3'>
                <div className='relative flex-grow'>
                  <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00437f]' />
                  <Input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10 h-10 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300'
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex items-center gap-2 h-10 px-4 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-xl'
                >
                  <FiFilter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs bg-[#00437f] text-white">
                      {[searchQuery, roleFilter, statusFilter, sortBy].filter(f => f !== 'all' && f !== 'newest' && f !== '').length}
                    </Badge>
                  )}
                </Button>
                <div className='flex items-center gap-2'>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-10 w-10 p-0 rounded-xl ${
                      viewMode === 'list' 
                        ? 'bg-[#00437f] text-white hover:bg-[#003366]' 
                        : 'border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366]'
                    } transition-all duration-200`}
                  >
                    <FiList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-10 w-10 p-0 rounded-xl ${
                      viewMode === 'grid' 
                        ? 'bg-[#00437f] text-white hover:bg-[#003366]' 
                        : 'border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366]'
                    } transition-all duration-200`}
                  >
                    <FiGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative p-6 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Advanced Filters</h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className='text-gray-500 hover:text-[#00437f] hover:bg-[#00437f]/10 transition-all duration-200 rounded-xl'
                      >
                        <FiX className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {/* Sort By */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className='h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="name-asc">Name A-Z</SelectItem>
                          <SelectItem value="name-desc">Name Z-A</SelectItem>
                          <SelectItem value="email-asc">Email A-Z</SelectItem>
                          <SelectItem value="email-desc">Email Z-A</SelectItem>
                          <SelectItem value="role-asc">Role A-Z</SelectItem>
                          <SelectItem value="role-desc">Role Z-A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Role Filter */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Role</label>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className='h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-900 dark:text-white'>Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className='h-10 bg-white/50 dark:bg-gray-700/50 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Premium Users Table */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                    <FiUsers className='w-4 h-4 text-white' />
                  </div>
                  <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                    System Users
                  </h2>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/20 via-transparent to-[#003366]/20 rounded-3xl blur-2xl"></div>
                      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl">
                        <div className="flex flex-col items-center gap-6">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-600 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#00437f] rounded-full animate-spin"></div>
                            <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-[#003366] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loading Users</h3>
                            <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch the user data...</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#00437f] rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-[#00437f] rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                            <div className="w-2 h-2 bg-[#00437f] rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : viewMode === 'grid' ? (
                  // Grid View Layout
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentItems.map((user, index) => (
                      <div key={user.id} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                        <Card className="relative p-6 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                          <div className="space-y-4">
                            {/* Profile Image */}
                            <div className="flex justify-center">
                              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-[#00437f]/20 shadow-lg">
                                {user.image ? (
                                  <Image
                                    src={encodeURI(user.image)}
                                    alt={user.name}
                                    fill
                                    className="object-cover"
                                    key={`user-${user.id}-${user.image}`} // Force re-render when URL changes
                                    unoptimized // Disable Next.js optimization for user uploads
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#00437f]">
                                    <FiUser className="h-10 w-10" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* User Info */}
                            <div className="text-center space-y-3">
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                  {user.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                  {user.email}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                  <FiPhone className="h-4 w-4 text-[#00437f]" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {user.profile?.phone || 'Not set'}
                                  </span>
                                </div>

                                {user.address && (
                                  <div className="flex items-center justify-center gap-2">
                                    <FiMapPin className="h-4 w-4 text-[#00437f]" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                      {user.address}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Role & Status */}
                              <div className="flex items-center justify-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.role === 'admin' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : user.role === 'manager'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  <FiShield className="mr-1 h-3 w-3" />
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                                
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.status === 'active' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                }`}>
                                  {user.status === 'active' ? (
                                    <>
                                      <FiCheck className="mr-1 h-3 w-3" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <FiXCircle className="mr-1 h-3 w-3" />
                                      Inactive
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-center gap-2 pt-4 border-t border-[#00437f]/20">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(user)}
                                className="h-9 w-9 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-xl"
                              >
                                <FiEye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(user)}
                                className="h-9 w-9 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-xl"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                                disabled={isDeleting === user.id}
                                className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all duration-200 rounded-xl"
                              >
                                {isDeleting === user.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                                ) : (
                                  <FiTrash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  // List View Layout (Table)
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#00437f]/20 dark:border-[#00437f]/30">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Profile
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`border-b border-[#00437f]/10 dark:border-[#00437f]/20 hover:bg-gradient-to-r hover:from-[#00437f]/5 hover:to-[#003366]/5 transition-all duration-300 group relative ${
                            index % 2 === 0 ? 'bg-white/40' : 'bg-gray-50/20'
                          }`}
                        >
                          <td className='py-4 px-6'>
                            <div className='flex items-center'>
                              <div className='relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 shadow-md'>
                                {user.image ? (
                                  <Image
                                    src={encodeURI(user.image)}
                                    alt={user.name}
                                    fill
                                    className='object-cover'
                                    key={`user-${user.id}-${user.image}`} // Force re-render when URL changes
                                    unoptimized // Disable Next.js optimization for user uploads
                                  />
                                ) : (
                                  <div className='w-full h-full flex items-center justify-center text-[#00437f]'>
                                    <FiUser className='h-6 w-6' />
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className='py-4 px-6'>
                            <span className='font-semibold text-gray-900 dark:text-white'>
                              {user.name}
                            </span>
                          </td>
                          <td className='py-4 px-6'>
                            <span className='text-gray-700 dark:text-gray-300'>
                              {user.email}
                            </span>
                          </td>
                          <td className='py-4 px-6'>
                            <span className='text-gray-700 dark:text-gray-300'>
                              {user.profile?.phone || 'Not set'}
                            </span>
                          </td>
                          <td className='py-4 px-6'>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : user.role === 'manager'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className='py-4 px-6'>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {user.status === 'active' ? (
                                <>
                                  <FiCheck className='mr-1 h-3 w-3' />
                                  Active
                                </>
                              ) : (
                                <>
                                  <FiXCircle className='mr-1 h-3 w-3' />
                                  Inactive
                                </>
                              )}
                            </span>
                          </td>
                          <td className='py-4 px-6'>
                            <div className='flex items-center justify-end gap-2'>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleView(user)}
                                className='h-8 w-8 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-lg'
                              >
                                <FiEye className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleEdit(user)}
                                className='h-8 w-8 p-0 text-[#00437f] hover:text-[#003366] hover:bg-[#00437f]/10 transition-all duration-200 rounded-lg'
                              >
                                <FiEdit2 className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleDelete(user.id)}
                                disabled={isDeleting === user.id}
                                className='h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all duration-200 rounded-lg'
                              >
                                {isDeleting === user.id ? (
                                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-500'></div>
                                ) : (
                                  <FiTrash2 className='h-4 w-4' />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Premium Pagination */}
              {!isLoading && filteredAndSortedUsers.length > itemsPerPage && (
                <div className="mt-6 pt-6 border-t-2 border-[#00437f]/20 dark:border-[#00437f]/30">
                  <PremiumPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={paginate}
                    totalItems={filteredAndSortedUsers.length}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center">
                      <FiPlus className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowForm(false)}
                    className="h-10 w-10 rounded-xl"
                  >
                    <FiX className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {formErrors.password && (
                      <p className="text-red-500 text-xs">{formErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-red-500 text-xs">{formErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Role *
                    </Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Status *
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-900 dark:text-white">
                    Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl"
                  />
                </div>

                {/* Profile Image Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Profile Image
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-[#00437f]/20">
                      {tempProfileImage ? (
                        <Image
                          src={URL.createObjectURL(tempProfileImage)}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#00437f]">
                          <FiUser className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setTempProfileImage(file)
                          setFormData(prev => ({ ...prev, image: file }))
                        }}
                        className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a profile image (JPG, PNG, GIF)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      phoneNumber: '',
                      image: null,
                      role: 'user',
                      status: 'active',
                      address: '',
                    })
                    setFormErrors({})
                    setTempProfileImage(null)
                  }}
                  disabled={isAdding}
                  className="h-10 px-6 border-2 border-gray-300 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setIsAdding(true)
                    try {
                      // Basic validation
                      const errors: Record<string, string> = {}
                      if (!formData.name) errors.name = 'Name is required'
                      if (!formData.email) errors.email = 'Email is required'
                      if (!formData.password) errors.password = 'Password is required'
                      if (formData.password !== formData.confirmPassword) {
                        errors.confirmPassword = 'Passwords do not match'
                      }

                      setFormErrors(errors)

                      if (Object.keys(errors).length > 0) {
                        setIsAdding(false)
                        return
                      }

                      // Upload image if selected
                      let profileImageUrl = null
                      if (formData.image && formData.image instanceof File) {
                        console.log('Uploading profile image...')
                        try {
                          const { uploadAsset } = await import('@/lib/services/platform-upload-service')
                          const uploadResult = await uploadAsset(formData.image, 'user')
                          if (uploadResult.success && uploadResult.url) {
                            profileImageUrl = uploadResult.url
                            console.log('Image uploaded successfully:', profileImageUrl)
                          } else {
                            throw new Error(uploadResult.error || 'Failed to upload image')
                          }
                        } catch (uploadError) {
                          console.error('Image upload failed:', uploadError)
                          toast.error('Failed to upload profile image')
                          setIsAdding(false)
                          return
                        }
                      }

                      // Create FormData for API call
                      const apiFormData = new FormData()
                      apiFormData.append('name', formData.name)
                      apiFormData.append('email', formData.email)
                      apiFormData.append('password', formData.password)
                      apiFormData.append('phoneNumber', formData.phoneNumber)
                      apiFormData.append('role', formData.role)
                      apiFormData.append('status', formData.status)
                      apiFormData.append('address', formData.address)
                      if (profileImageUrl) {
                        apiFormData.append('image', profileImageUrl)
                      }

                      // Call API to create user
                      console.log('Creating user with data:', Object.fromEntries(apiFormData))
                      const response = await fetch('/api/admin/users', {
                        method: 'POST',
                        body: apiFormData,
                      })

                      if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.error || 'Failed to create user')
                      }

                      const newUser = await response.json()
                      console.log('User created successfully:', newUser)
                      
                      toast.success('User created successfully')
                      
                      // Add the new user to the beginning of the list (newest first)
                      setUsers(prevUsers => [newUser, ...prevUsers])
                      
                      // Reset form and close modal
                      setShowForm(false)
                      setFormData({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        phoneNumber: '',
                        image: null,
                        role: 'user',
                        status: 'active',
                        address: '',
                      })
                      setFormErrors({})
                      setTempProfileImage(null)
                    } catch (error) {
                      console.error('Error creating user:', error)
                      toast.error('Failed to create user')
                    } finally {
                      setIsAdding(false)
                    }
                  }}
                  disabled={isAdding}
                  className="h-10 px-6 bg-gradient-to-r from-[#00437f] to-[#003366] text-white rounded-xl"
                >
                  {isAdding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center">
                      <FiEdit2 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedUser(null)
                      setEditFormData({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        phoneNumber: '',
                        image: null,
                        role: 'user',
                        status: 'active',
                        address: '',
                      })
                      setEditFormErrors({})
                      setTempEditProfileImage(null)
                      setIsEditing(false)
                    }}
                    className="h-10 w-10 rounded-xl"
                  >
                    <FiX className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="editName" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Full Name *
                    </Label>
                    <Input
                      id="editName"
                      type="text"
                      placeholder="Enter full name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl"
                    />
                    {editFormErrors.name && (
                      <p className="text-red-500 text-xs">{editFormErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="editEmail" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Email Address *
                    </Label>
                    <Input
                      id="editEmail"
                      type="email"
                      placeholder="Enter email address"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl"
                    />
                    {editFormErrors.email && (
                      <p className="text-red-500 text-xs">{editFormErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="editPhoneNumber" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Phone Number
                    </Label>
                    <Input
                      id="editPhoneNumber"
                      type="tel"
                      placeholder="Enter phone number"
                      value={editFormData.phoneNumber}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label htmlFor="editRole" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Role *
                    </Label>
                    <Select value={editFormData.role} onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="editStatus" className="text-sm font-semibold text-gray-900 dark:text-white">
                      Status *
                    </Label>
                    <Select value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="editAddress" className="text-sm font-semibold text-gray-900 dark:text-white">
                    Address
                  </Label>
                  <Input
                    id="editAddress"
                    type="text"
                    placeholder="Enter address"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl"
                  />
                </div>

                {/* Profile Image Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Profile Image
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-[#00437f]/20">
                      {tempEditProfileImage ? (
                        <Image
                          src={URL.createObjectURL(tempEditProfileImage)}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : selectedUser?.image ? (
                        <Image
                          src={selectedUser.image}
                          alt="Current"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#00437f]">
                          <FiUser className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setTempEditProfileImage(file)
                          setEditFormData(prev => ({ ...prev, image: file }))
                        }}
                        className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a new profile image (JPG, PNG, GIF) or keep current
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password Update Section */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Update Password (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editPassword" className="text-sm font-semibold text-gray-900 dark:text-white">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="editPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password (leave blank to keep current)"
                          value={editFormData.password}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {editFormErrors.password && (
                        <p className="text-red-500 text-xs">{editFormErrors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editConfirmPassword" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="editConfirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={editFormData.confirmPassword}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="h-10 border-2 border-[#00437f]/20 focus:border-[#00437f] rounded-xl pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {editFormErrors.confirmPassword && (
                        <p className="text-red-500 text-xs">{editFormErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedUser(null)
                    setEditFormData({
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      phoneNumber: '',
                      image: null,
                      role: 'user',
                      status: 'active',
                      address: '',
                    })
                    setEditFormErrors({})
                    setTempEditProfileImage(null)
                    setIsEditing(false)
                  }}
                  disabled={isEditing}
                  className="h-10 px-6 border-2 border-gray-300 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedUser) return
                    
                    setIsEditing(true)
                    try {
                      // Basic validation
                      const errors: Record<string, string> = {}
                      if (!editFormData.name) errors.name = 'Name is required'
                      if (!editFormData.email) errors.email = 'Email is required'
                      if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
                        errors.confirmPassword = 'Passwords do not match'
                      }

                      setEditFormErrors(errors)

                      if (Object.keys(errors).length > 0) {
                        setIsEditing(false)
                        return
                      }

                      // Upload new image if selected
                      let profileImageUrl = editFormData.image
                      if (editFormData.image && editFormData.image instanceof File) {
                        console.log('Uploading new profile image...')
                        try {
                          const { uploadAsset } = await import('@/lib/services/platform-upload-service')
                          const uploadResult = await uploadAsset(editFormData.image, 'user')
                          if (uploadResult.success && uploadResult.url) {
                            profileImageUrl = uploadResult.url
                            console.log('New image uploaded successfully:', profileImageUrl)
                          } else {
                            throw new Error(uploadResult.error || 'Failed to upload image')
                          }
                        } catch (uploadError) {
                          console.error('Image upload failed:', uploadError)
                          toast.error('Failed to upload profile image')
                          setIsEditing(false)
                          return
                        }
                      }

                      // Create FormData for API call
                      const apiFormData = new FormData()
                      apiFormData.append('id', selectedUser.id)
                      apiFormData.append('name', editFormData.name)
                      apiFormData.append('email', editFormData.email)
                      apiFormData.append('phoneNumber', editFormData.phoneNumber)
                      apiFormData.append('role', editFormData.role)
                      apiFormData.append('status', editFormData.status)
                      apiFormData.append('address', editFormData.address)
                      if (profileImageUrl && typeof profileImageUrl === 'string') {
                        apiFormData.append('image', profileImageUrl)
                      }
                      // Only send password if it's being updated
                      if (editFormData.password) {
                        apiFormData.append('password', editFormData.password)
                      }

                      // Call API to update user
                      console.log('Updating user with data:', Object.fromEntries(apiFormData))
                      const response = await fetch('/api/admin/users', {
                        method: 'PUT',
                        body: apiFormData,
                      })

                      if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.error || 'Failed to update user')
                      }

                      const updatedUser = await response.json()
                      console.log('[USERS] User updated successfully:', updatedUser)
                      console.log('[USERS] Updated user image URL:', updatedUser.image)
                      
                      toast.success('User updated successfully')
                      
                      // Close modal and reset form FIRST
                      setShowEditModal(false)
                      setSelectedUser(null)
                      setEditFormData({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        phoneNumber: '',
                        image: null,
                        role: 'user',
                        status: 'active',
                        address: '',
                      })
                      setEditFormErrors({})
                      setTempEditProfileImage(null)
                      
                      // Update the user in the existing list instead of refetching
                      setUsers(prevUsers => 
                        prevUsers.map(user => 
                          user.id === selectedUser.id ? updatedUser : user
                        )
                      )
                    } catch (error) {
                      console.error('Error updating user:', error)
                      toast.error('Failed to update user')
                    } finally {
                      setIsEditing(false)
                    }
                  }}
                  disabled={isEditing}
                  className="h-10 px-6 bg-gradient-to-r from-[#00437f] to-[#003366] text-white rounded-xl"
                >
                  {isEditing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 