"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = {
  email: string
  username: string
  profileImage?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user from sessionStorage first (for persistence across page refreshes)
        const sessionUser = sessionStorage.getItem("user")
        if (sessionUser) {
          setUser(JSON.parse(sessionUser))
          setIsLoading(false)
          return
        }

        // If no user in sessionStorage, try localStorage (for persistence across browser sessions)
        const localUser = localStorage.getItem("user")
        if (localUser) {
          const parsedUser = JSON.parse(localUser)
          setUser(parsedUser)
          // Also save to sessionStorage for quicker access
          sessionStorage.setItem("user", JSON.stringify(parsedUser))
          setIsLoading(false)
          return
        }

        // No user found
        setUser(null)
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking authentication:", error)
        setUser(null)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const usersStr = localStorage.getItem("users")
      if (!usersStr) {
        console.error("No users found")
        return false
      }

      const users = JSON.parse(usersStr)
      const user = users.find((u: any) => u.email === email && u.password === password)

      if (!user) {
        console.error("Invalid credentials")
        return false
      }

      // Create user object without password
      const userObj = {
        email: user.email,
        username: user.username || email.split("@")[0],
      }

      // Save user to state and storage
      setUser(userObj)
      sessionStorage.setItem("user", JSON.stringify(userObj))
      localStorage.setItem("user", JSON.stringify(userObj))

      // Set authentication flag
      sessionStorage.setItem("isAuthenticated", "true")

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get existing users or create empty array
      const usersStr = localStorage.getItem("users")
      const users = usersStr ? JSON.parse(usersStr) : []

      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        console.error("User already exists")
        return false
      }

      // Create new user
      const newUser = {
        email,
        password,
        username: email.split("@")[0],
        createdAt: new Date().toISOString(),
      }

      // Add to users array
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Create user object without password
      const userObj = {
        email: newUser.email,
        username: newUser.username,
      }

      // Save user to state and storage
      setUser(userObj)
      sessionStorage.setItem("user", JSON.stringify(userObj))
      localStorage.setItem("user", JSON.stringify(userObj))

      // Set authentication flag
      sessionStorage.setItem("isAuthenticated", "true")

      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem("user")
    localStorage.removeItem("user")
    sessionStorage.removeItem("isAuthenticated")
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
