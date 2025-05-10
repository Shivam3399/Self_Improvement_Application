"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticatedInSession = sessionStorage.getItem("isAuthenticated") === "true"
      const userInSession = sessionStorage.getItem("user")
      const userInLocal = localStorage.getItem("user")

      const isUserAuthenticated = isAuthenticated || isAuthenticatedInSession || !!userInSession || !!userInLocal

      if (!isUserAuthenticated && pathname !== "/login" && pathname !== "/register") {
        console.log("ProtectedRoute - Not authenticated, redirecting to login")
        router.push("/login")
      }
    }

    if (!loading) {
      checkAuth()
    }
  }, [isAuthenticated, loading, router, pathname])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== "/login" && pathname !== "/register") {
    return null
  }

  return <>{children}</>
}
