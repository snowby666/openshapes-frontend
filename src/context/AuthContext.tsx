import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import { useRouter } from 'next/router'

// Define User type
export interface User {
  id: string
  username: string
  discriminator?: string
  avatar?: string
  bot_credits: number
  is_admin: boolean
}

// Define AuthContext interface
interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: () => void
  logout: () => void
  fetchUser: () => Promise<void>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: () => {},
  logout: () => {},
  fetchUser: async () => {},
})

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Function to trigger Discord OAuth login
  const login = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/discord`
  }

  // Function to log out
  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      })

      // Remove cookie on client side
      deleteCookie('access_token')
      
      // Clear user state
      setUser(null)
      
      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      setError('Failed to log out')
    }
  }

  // Function to fetch current user
  const fetchUser = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = getCookie('access_token')
      
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }

      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error('Error fetching user:', error)
      setError('Failed to fetch user data')
      setUser(null)
      
      // Clear invalid token
      if (getCookie('access_token')) {
        deleteCookie('access_token')
      }
    } finally {
      setLoading(false)
    }
  }

  // Check for token and fetch user on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie('access_token')
      
      if (token) {
        fetchUser()
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Create context value
  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    fetchUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)

export default AuthContext