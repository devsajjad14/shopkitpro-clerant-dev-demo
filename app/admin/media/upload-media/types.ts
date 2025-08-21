export interface UploadFolder {
  id: string
  name: string
  path: string
  description: string
  icon: string
}

export interface SelectedFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export interface UploadStats {
  total: number
  pending: number
  uploading: number
  success: number
  failed: number
}