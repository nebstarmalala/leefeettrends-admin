import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if auth cookie exists on initial load
    return document.cookie.includes('auth=true')
  })

  useEffect(() => {
    // Sync with cookie changes
    const checkAuth = () => {
      setIsAuthenticated(document.cookie.includes('auth=true'))
    }

    // Check periodically (for logout in other tabs)
    const interval = setInterval(checkAuth, 1000)
    return () => clearInterval(interval)
  }, [])

  const login = useCallback(() => {
    document.cookie = 'auth=true; path=/; max-age=86400'
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    document.cookie = 'auth=; path=/; max-age=0'
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
