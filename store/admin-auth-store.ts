import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: string
}

interface AdminAuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: AdminUser) => void
  setLoading: (loading: boolean) => void
  setHydrated: (hydrated: boolean) => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          const response = await fetch('/api/admin/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            console.error('Login failed:', errorData.error)
            set({ isLoading: false })
            return false
          }
          
          const user = await response.json()
          
          set({ 
            user, 
            isAuthenticated: true,
            isLoading: false 
          })
          return true
        } catch (error) {
          console.error('Login error:', error)
          set({ isLoading: false })
          return false
        }
      },
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      })
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true)
        }
      }
    }
  )
) 