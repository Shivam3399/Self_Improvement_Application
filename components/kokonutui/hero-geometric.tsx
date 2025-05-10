"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Pacifico } from "next/font/google"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { X, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
// Add this import at the top of the file
import { useAuth } from "@/contexts/auth-context"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
  isDark = true,
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
  isDark?: boolean
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            isDark
              ? "backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
              : "backdrop-blur-[2px] border-2 border-black/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]",
            isDark
              ? "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
              : "after:bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05),transparent_70%)]",
            "after:absolute after:inset-0 after:rounded-full",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

// Update the RegistrationModal component to use our auth context
function RegistrationModal({
  isOpen,
  onClose,
  isDark,
  setIsLoginModalOpen,
}: {
  isOpen: boolean
  onClose: () => void
  isDark: boolean
  setIsLoginModalOpen?: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const router = useRouter()
  const { register } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setErrors({})
      setIsSubmitting(false)
      setIsSuccess(false)
    }
  }, [isOpen])

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate password
  const validatePassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: {
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)

    // If no errors, submit form
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true)

      try {
        const success = await register(email, password)

        if (success) {
          setIsSuccess(true)
          // Redirect to dashboard after successful registration
          router.push("/dashboard")
        } else {
          setErrors({
            email: "Registration failed. Email may already be in use.",
          })
          setIsSubmitting(false)
        }
      } catch (error) {
        console.error("Registration error:", error)
        setErrors({
          email: "An error occurred during registration",
        })
        setIsSubmitting(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className={cn(
          "w-full max-w-md p-6 rounded-xl shadow-2xl",
          isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>Create an account</h2>
          <button
            onClick={onClose}
            className={cn(
              "p-1 rounded-full transition-colors",
              isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500",
            )}
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          // Immediately redirect without showing success dialog
          <></>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className={cn("block text-sm font-medium mb-1", isDark ? "text-gray-300" : "text-gray-700")}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors",
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-500/50"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                    errors.email ? "border-red-500" : "",
                  )}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={cn("block text-sm font-medium mb-1", isDark ? "text-gray-300" : "text-gray-700")}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors",
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-500/50"
                        : "bg-white border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                      errors.password ? "border-red-500" : "",
                    )}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500",
                      isDark ? "hover:text-gray-300" : "hover:text-gray-700",
                    )}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className={cn("block text-sm font-medium mb-1", isDark ? "text-gray-300" : "text-gray-700")}
                >
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors",
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-500/50"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                    errors.confirmPassword ? "border-red-500" : "",
                  )}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="register-remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={cn(
                    "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500",
                    isDark ? "bg-gray-800 border-gray-700" : "",
                  )}
                />
                <label
                  htmlFor="register-remember-me"
                  className={cn("ml-2 block text-sm", isDark ? "text-gray-300" : "text-gray-700")}
                >
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full py-2.5 px-4 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                  "bg-gradient-to-r from-indigo-500 to-rose-500 text-white",
                  "hover:shadow-lg hover:from-indigo-600 hover:to-rose-600",
                  "disabled:opacity-70 disabled:cursor-not-allowed",
                  isDark ? "focus:ring-offset-gray-900" : "focus:ring-offset-white",
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            <p className={cn("mt-4 text-sm text-center", isDark ? "text-gray-400" : "text-gray-600")}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  setIsLoginModalOpen && setIsLoginModalOpen(true)
                }}
                className="text-indigo-500 hover:text-indigo-600 font-medium"
              >
                Log in
              </button>
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

// Update the LoginModal component to use our auth context
function LoginModal({
  isOpen,
  onClose,
  isDark,
  setIsRegisterModalOpen,
}: {
  isOpen: boolean
  onClose: () => void
  isDark: boolean
  setIsRegisterModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("")
      setPassword("")
      setErrors({})
      setIsSubmitting(false)
      setIsSuccess(false)
    }
  }, [isOpen])

  // Check for remembered user when modal opens
  useEffect(() => {
    if (isOpen) {
      const rememberedUser = localStorage.getItem("rememberedUser")
      if (rememberedUser) {
        const { email: rememberedEmail } = JSON.parse(rememberedUser)
        setEmail(rememberedEmail)
        setRememberMe(true)
      }
    }
  }, [isOpen])

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: {
      email?: string
      password?: string
      general?: string
    } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)

    // If no errors, submit form
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true)

      try {
        const success = await login(email, password)

        if (success) {
          // If remember me is checked, store the login info in localStorage
          if (rememberMe) {
            localStorage.setItem("rememberedUser", JSON.stringify({ email }))
          } else {
            localStorage.removeItem("rememberedUser")
          }

          setIsSuccess(true)
          // Redirect to dashboard after successful login
          router.push("/dashboard")
        } else {
          setErrors({
            general: "Invalid email or password.",
          })
          setIsSubmitting(false)
        }
      } catch (error) {
        console.error("Login error:", error)
        setErrors({
          general: "An error occurred during login",
        })
        setIsSubmitting(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className={cn(
          "w-full max-w-md p-6 rounded-xl shadow-2xl",
          isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>Welcome back</h2>
          <button
            onClick={onClose}
            className={cn(
              "p-1 rounded-full transition-colors",
              isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500",
            )}
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          // Immediately redirect without showing success dialog
          <></>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 rounded-lg bg-red-100 text-red-800 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                className={cn("block text-sm font-medium mb-1", isDark ? "text-gray-300" : "text-gray-700")}
              >
                Email
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors",
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-500/50"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                  errors.email ? "border-red-500" : "",
                )}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className={cn("block text-sm font-medium mb-1", isDark ? "text-gray-300" : "text-gray-700")}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors",
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white focus:ring-indigo-500/50"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                    errors.password ? "border-red-500" : "",
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500",
                    isDark ? "hover:text-gray-300" : "hover:text-gray-700",
                  )}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={cn(
                    "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500",
                    isDark ? "bg-gray-800 border-gray-700" : "",
                  )}
                />
                <label
                  htmlFor="remember-me"
                  className={cn("ml-2 block text-sm", isDark ? "text-gray-300" : "text-gray-700")}
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700",
                )}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full py-2.5 px-4 mt-6 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                "bg-gradient-to-r from-indigo-500 to-rose-500 text-white",
                "hover:shadow-lg hover:from-indigo-600 hover:to-rose-600",
                "disabled:opacity-70 disabled:cursor-not-allowed",
                isDark ? "focus:ring-offset-gray-900" : "focus:ring-offset-white",
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Log In"
              )}
            </button>

            <p className={cn("mt-4 text-sm text-center", isDark ? "text-gray-400" : "text-gray-600")}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  onClose()
                  setIsRegisterModalOpen(true)
                }}
                className="text-indigo-500 hover:text-indigo-600 font-medium"
              >
                Sign up
              </button>
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

// Update the HeroGeometric component to accept isLoginModalOpen and isRegisterModalOpen props
export default function HeroGeometric({
  badge = "Kokonut UI",
  title1 = "Transform Intent",
  title2 = "into Action",
  isLoginModalOpen = false,
  isRegisterModalOpen = false,
  setIsLoginModalOpen,
  setIsRegisterModalOpen,
}: {
  badge?: string
  title1?: string
  title2?: string
  isLoginModalOpen?: boolean
  isRegisterModalOpen?: boolean
  setIsLoginModalOpen?: React.Dispatch<React.SetStateAction<boolean>>
  setIsRegisterModalOpen?: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [_isRegisterModalOpen, _setIsRegisterModalOpen] = useState(false)
  const [_isLoginModalOpen, _setIsLoginModalOpen] = useState(false)

  // Use the provided state if available, otherwise use internal state
  const actualIsRegisterModalOpen = setIsRegisterModalOpen ? isRegisterModalOpen : _isRegisterModalOpen
  const actualIsLoginModalOpen = setIsLoginModalOpen ? isLoginModalOpen : _isLoginModalOpen
  const actualSetIsRegisterModalOpen = setIsRegisterModalOpen || _setIsRegisterModalOpen
  const actualSetIsLoginModalOpen = setIsLoginModalOpen || _setIsLoginModalOpen

  useEffect(() => {
    // Initialize theme from localStorage or default to dark
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const isDark = theme === "dark"

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  return (
    <div
      className={cn(
        "relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-500",
        isDark ? "bg-[#030303]" : "bg-gray-50",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 blur-3xl transition-colors duration-500",
          isDark
            ? "bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05]"
            : "bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-rose-500/[0.03]",
        )}
      />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient={isDark ? "from-indigo-500/[0.15]" : "from-indigo-500/[0.1]"}
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
          isDark={isDark}
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient={isDark ? "from-rose-500/[0.15]" : "from-rose-500/[0.1]"}
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
          isDark={isDark}
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient={isDark ? "from-violet-500/[0.15]" : "from-violet-500/[0.1]"}
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
          isDark={isDark}
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient={isDark ? "from-amber-500/[0.15]" : "from-amber-500/[0.1]"}
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
          isDark={isDark}
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient={isDark ? "from-cyan-500/[0.15]" : "from-cyan-500/[0.1]"}
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
          isDark={isDark}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
              <span className="text-white">Transform Intent</span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent",
                  "bg-gradient-to-r from-blue-300 to-pink-300",
                  pacifico.className,
                )}
              >
                into Action
              </span>
            </h1>
          </motion.div>

          <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
            <p
              className={cn(
                "text-base sm:text-lg md:text-xl mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4 transition-colors duration-500",
                isDark ? "text-white/40" : "text-gray-600",
              )}
            >
              Driven by elegant design and cutting-edge innovation
            </p>
          </motion.div>

          <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible" className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
                <button
                  onClick={() => actualSetIsRegisterModalOpen(true)}
                  className="relative px-8 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-medium tracking-wide transition-all duration-300 focus:ring-2 focus:ring-white/20 focus:outline-none inline-flex items-center"
                >
                  <span>Register</span>
                  <motion.span
                    initial={{ x: 0, opacity: 0.5 }}
                    animate={{ x: [0, 4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
                    className="ml-2"
                  >
                    →
                  </motion.span>
                </button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="relative">
                <button
                  onClick={() => actualSetIsLoginModalOpen(true)}
                  className={cn(
                    "px-8 py-3 rounded-full font-medium tracking-wide transition-all duration-300 focus:ring-2 focus:outline-none backdrop-blur-sm",
                    isDark
                      ? "bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/30 focus:ring-white/20"
                      : "bg-transparent border border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400 focus:ring-gray-300",
                  )}
                >
                  Log In
                </button>
              </motion.div>
            </div>

            <motion.div
              className="absolute -z-10 w-full h-32 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div
                className={cn(
                  "absolute w-40 h-40 rounded-full blur-3xl -top-10 -left-10 transition-colors duration-500",
                  isDark ? "bg-indigo-500/10" : "bg-indigo-500/5",
                )}
              ></div>
              <div
                className={cn(
                  "absolute w-40 h-40 rounded-full blur-3xl -bottom-10 -right-10 transition-colors duration-500",
                  isDark ? "bg-rose-500/10" : "bg-rose-500/5",
                )}
              ></div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-colors duration-500",
          isDark
            ? "bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80"
            : "bg-gradient-to-t from-gray-50 via-transparent to-gray-50/80",
        )}
      />

      <RegistrationModal
        isOpen={actualIsRegisterModalOpen}
        onClose={() => actualSetIsRegisterModalOpen(false)}
        isDark={isDark}
        setIsLoginModalOpen={actualSetIsLoginModalOpen}
      />
      <LoginModal
        isOpen={actualIsLoginModalOpen}
        onClose={() => actualSetIsLoginModalOpen(false)}
        isDark={isDark}
        setIsRegisterModalOpen={actualSetIsRegisterModalOpen}
      />
    </div>
  )
}
