"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import HeroGeometric from "@/components/kokonutui/hero-geometric"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  // Open register modal automatically when page loads
  useEffect(() => {
    setIsRegisterModalOpen(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await register(email, password)

      if (success) {
        router.push("/dashboard")
      } else {
        setError("Registration failed. Email may already be in use.")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <HeroGeometric
      title1="Self Improvement"
      title2="Application"
      setIsRegisterModalOpen={setIsRegisterModalOpen}
      isRegisterModalOpen={isRegisterModalOpen}
    />
  )
}
