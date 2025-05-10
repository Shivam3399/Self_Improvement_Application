"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import HeroGeometric from "@/components/kokonutui/hero-geometric"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  // Open login modal automatically when page loads
  useEffect(() => {
    setIsLoginModalOpen(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)

      if (success) {
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <HeroGeometric
      title1="Self Improvement"
      title2="Application"
      setIsLoginModalOpen={setIsLoginModalOpen}
      isLoginModalOpen={isLoginModalOpen}
    />
  )
}
