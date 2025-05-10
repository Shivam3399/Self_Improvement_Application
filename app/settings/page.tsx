"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LogOut,
  Trash2,
  KeyRound,
  Save,
  Loader2,
  Menu,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, ListTodo, LineChart, Settings, X } from "lucide-react"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [isDark, setIsDark] = useState(false)
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light" | "system">("system")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const fromRegistration = searchParams.get("fromRegistration") === "true"
  const { toast } = useToast()

  // Navigation items
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", current: pathname === "/dashboard" },
    { name: "Behaviours", icon: ListTodo, href: "/behaviours", current: pathname === "/behaviours" },
    { name: "Analytics", icon: LineChart, href: "/analytics", current: pathname === "/analytics" },
    { name: "Settings", icon: Settings, href: "/settings", current: pathname === "/settings" },
  ]

  // Add this near the top of the component, after the useState declarations
  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticatedInSession = sessionStorage.getItem("isAuthenticated") === "true"
    const userInSession = sessionStorage.getItem("user")
    const userInLocal = localStorage.getItem("user")

    if (!isAuthenticatedInSession && !userInSession && !userInLocal) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    if (fromRegistration) {
      toast({
        title: "Account created successfully!",
        description: "Welcome to the app. You can now customize your settings.",
      })
    }
  }, [fromRegistration, toast])

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "dark" | "light" | "system" | null
      if (savedTheme) {
        setTheme(savedTheme)
      }

      // Add event listener for system theme changes if using system theme
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => {
        if (theme === "system") {
          setIsDark(mediaQuery.matches)
        }
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  // Set dark mode based on theme
  useEffect(() => {
    // This code only runs on the client
    if (typeof window !== "undefined") {
      if (theme === "system") {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
      } else {
        setIsDark(theme === "dark")
      }
    }
  }, [theme])

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleSaveSettings = () => {
    setIsSaving(true)

    try {
      // Get existing users
      const usersStr = localStorage.getItem("users")
      if (!usersStr) {
        toast({
          title: "Error",
          description: "Could not find user data",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const users = JSON.parse(usersStr)
      const userIndex = users.findIndex((u: any) => u.email === user?.email)

      if (userIndex === -1) {
        toast({
          title: "Error",
          description: "Could not find your account",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // Update user
      users[userIndex].username = username
      localStorage.setItem("users", JSON.stringify(users))

      // Update current user in storage
      const updatedUser = {
        ...user,
        username,
        profileImage,
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      sessionStorage.setItem("user", JSON.stringify(updatedUser))

      toast({
        title: "Settings saved",
        description: "Your profile settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = () => {
    setPasswordError("")
    setIsChangingPassword(true)

    try {
      // Validate inputs
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        setPasswordError("All password fields are required")
        setIsChangingPassword(false)
        return
      }

      if (newPassword !== confirmNewPassword) {
        setPasswordError("New passwords don't match")
        setIsChangingPassword(false)
        return
      }

      if (newPassword.length < 8) {
        setPasswordError("New password must be at least 8 characters")
        setIsChangingPassword(false)
        return
      }

      // Get users
      const usersStr = localStorage.getItem("users")
      if (!usersStr) {
        setPasswordError("Could not find user data")
        setIsChangingPassword(false)
        return
      }

      const users = JSON.parse(usersStr)
      const userIndex = users.findIndex((u: any) => u.email === user?.email)

      if (userIndex === -1) {
        setPasswordError("Could not find your account")
        setIsChangingPassword(false)
        return
      }

      // Verify current password
      if (users[userIndex].password !== currentPassword) {
        setPasswordError("Current password is incorrect")
        setIsChangingPassword(false)
        return
      }

      // Update password
      users[userIndex].password = newPassword
      localStorage.setItem("users", JSON.stringify(users))

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully. Please log in again with your new password.",
      })

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setShowChangePassword(false)

      // Log out after password change
      setTimeout(() => {
        logout()
      }, 1500)
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordError("An error occurred. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      // Get users
      const usersStr = localStorage.getItem("users")
      if (!usersStr) {
        toast({
          title: "Error",
          description: "Could not find user data",
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      const users = JSON.parse(usersStr)
      const updatedUsers = users.filter((u: any) => u.email !== user?.email)
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      })

      // Log out after account deletion
      setTimeout(() => {
        logout()
      }, 1500)
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileImage(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <ProtectedRoute>
      <div
        className={cn(
          "min-h-screen w-full transition-colors duration-500",
          isDark ? "bg-[#030303] text-white" : "bg-gray-50 text-gray-900",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 -z-10 transition-colors duration-500",
            isDark
              ? "bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-rose-500/[0.03]"
              : "bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-rose-500/[0.02]",
          )}
        />

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Mobile sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            isDark ? "bg-gray-900 border-r border-gray-800" : "bg-white border-r border-gray-200",
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <span className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                Habit Tracker
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "rounded-md p-2",
                isDark
                  ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
              )}
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-4 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                  item.current
                    ? isDark
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-900"
                    : isDark
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="border-t pt-4">
              <div className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setTheme("system")
                      localStorage.setItem("theme", "system")
                    }}
                    className={cn(
                      "p-2 rounded-full transition-colors duration-300",
                      theme === "system"
                        ? isDark
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-gray-900"
                        : isDark
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
                    )}
                    aria-label="System theme"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setTheme("light")
                      localStorage.setItem("theme", "light")
                    }}
                    className={cn(
                      "p-2 rounded-full transition-colors duration-300",
                      theme === "light"
                        ? isDark
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-gray-900"
                        : isDark
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
                    )}
                    aria-label="Light theme"
                  >
                    <Sun size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setTheme("dark")
                      localStorage.setItem("theme", "dark")
                    }}
                    className={cn(
                      "p-2 rounded-full transition-colors duration-300",
                      theme === "dark"
                        ? isDark
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-gray-900"
                        : isDark
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
                    )}
                    aria-label="Dark theme"
                  >
                    <Moon size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-30 hidden md:block transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-20",
            isDark ? "bg-gray-900 border-r border-gray-800" : "bg-white border-r border-gray-200",
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <div className={cn("flex items-center", !sidebarOpen && "justify-center w-full")}>
              {sidebarOpen ? (
                <span className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                  Habit Tracker
                </span>
              ) : (
                <span className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>HT</span>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "rounded-md p-2",
                  isDark
                    ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
                )}
              >
                <ChevronUp className="rotate-90" size={20} />
              </button>
            )}
          </div>
          <div className="mt-4 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                  !sidebarOpen && "justify-center",
                  item.current
                    ? isDark
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-900"
                    : isDark
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className={cn("h-5 w-5", sidebarOpen && "mr-3")} />
                {sidebarOpen && item.name}
              </Link>
            ))}
          </div>
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className={cn(
                "absolute top-20 -right-3 rounded-full p-1 shadow-md",
                isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900",
              )}
            >
              <ChevronDown className="-rotate-90" size={16} />
            </button>
          )}
          {sidebarOpen && (
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="border-t pt-4">
                <div className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setTheme("system")
                        localStorage.setItem("theme", "system")
                      }}
                      className={cn(
                        "p-2 rounded-full transition-colors duration-300",
                        theme === "system"
                          ? isDark
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-gray-900"
                          : isDark
                            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
                      )}
                      aria-label="System theme"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setTheme("light")
                        localStorage.setItem("theme", "light")
                      }}
                      className={cn(
                        "p-2 rounded-full transition-colors duration-300",
                        theme === "light"
                          ? isDark
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-gray-900"
                          : isDark
                            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
                      )}
                      aria-label="Light theme"
                    >
                      <Sun size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setTheme("dark")
                        localStorage.setItem("theme", "dark")
                      }}
                      className={cn(
                        "p-2 rounded-full transition-colors duration-300",
                        theme === "dark"
                          ? isDark
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-gray-900"
                          : isDark
                            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
                      )}
                      aria-label="Dark theme"
                    >
                      <Moon size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div
          className={cn("transition-all duration-300 ease-in-out", "md:pl-64", sidebarOpen ? "md:pl-64" : "md:pl-20")}
        >
          {/* Top navigation */}
          <div
            className={cn(
              "sticky top-0 z-20 flex h-16 items-center justify-between px-4 shadow-sm",
              isDark
                ? "bg-gray-900/80 backdrop-blur-sm border-b border-gray-800"
                : "bg-white/80 backdrop-blur-sm border-b border-gray-200",
            )}
          >
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={cn(
                  "rounded-md p-2 md:hidden",
                  isDark
                    ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
                )}
              >
                <Menu size={20} />
              </button>
              <div className="ml-4 md:ml-0">
                <h1 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Settings</h1>
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>Manage your account</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Settings content */}
          <main className="p-4 md:p-6">
            <div className="container mx-auto p-4">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <label
                          className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}
                        >
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-300",
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white border focus:ring-indigo-500/50"
                              : "bg-white border border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                          )}
                        />
                      </div>

                      <div className="flex-1">
                        <label
                          className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          disabled
                          className={cn(
                            "w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-300",
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white border focus:ring-indigo-500/50 opacity-70"
                              : "bg-white border border-gray-300 text-gray-900 focus:ring-indigo-500/30 opacity-70",
                          )}
                        />
                        <p className="text-xs mt-1 text-gray-500">Email cannot be changed</p>
                      </div>
                    </div>

                    <div>
                      <label
                        className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}
                      >
                        Profile Image
                      </label>
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-16 h-16 rounded-full overflow-hidden border",
                            isDark ? "border-gray-700" : "border-gray-300",
                          )}
                        >
                          {profileImage ? (
                            <img
                              src={profileImage || "/placeholder.svg"}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className={cn(
                                "w-full h-full flex items-center justify-center",
                                isDark ? "bg-gray-700" : "bg-gray-100",
                              )}
                            >
                              <span
                                className={cn("text-2xl font-semibold", isDark ? "text-gray-400" : "text-gray-500")}
                              >
                                {username ? username[0].toUpperCase() : "U"}
                              </span>
                            </div>
                          )}
                        </div>

                        <label
                          className={cn(
                            "px-4 py-2 rounded-md cursor-pointer transition-colors",
                            isDark
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                          )}
                        >
                          Change Image
                          <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                        </label>

                        {profileImage && (
                          <button
                            onClick={() => setProfileImage(null)}
                            className={cn(
                              "px-4 py-2 rounded-md transition-colors",
                              isDark
                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                            )}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className={cn(
                          "flex items-center gap-2",
                          "bg-gradient-to-r from-indigo-500 to-rose-500 text-white",
                          "hover:shadow-lg hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed",
                        )}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Security</CardTitle>
                    <Button
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      variant="outline"
                      className={cn(
                        "flex items-center gap-2",
                        isDark
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                      )}
                    >
                      <KeyRound size={18} />
                      <span>{showChangePassword ? "Cancel" : "Change Password"}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showChangePassword && (
                    <div className="mt-6 space-y-4">
                      {passwordError && (
                        <div className="p-3 rounded-md bg-red-900/50 border border-red-800 text-red-200 text-sm">
                          {passwordError}
                        </div>
                      )}

                      <div className="relative">
                        <label
                          className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}
                        >
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={cn(
                              "w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-300",
                              isDark
                                ? "bg-gray-700 border-gray-600 text-white border focus:ring-indigo-500/50"
                                : "bg-white border border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className={cn(
                              "absolute right-3 top-1/2 -translate-y-1/2",
                              isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700",
                            )}
                            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <label
                          className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={cn(
                              "w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-300",
                              isDark
                                ? "bg-gray-700 border-gray-600 text-white border focus:ring-indigo-500/50"
                                : "bg-white border border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className={cn(
                              "absolute right-3 top-1/2 -translate-y-1/2",
                              isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700",
                            )}
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <label
                          className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}
                        >
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className={cn(
                              "w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-300",
                              isDark
                                ? "bg-gray-700 border-gray-600 text-white border focus:ring-indigo-500/50"
                                : "bg-white border border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={cn(
                              "absolute right-3 top-1/2 -translate-y-1/2",
                              isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700",
                            )}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={handleChangePassword}
                          disabled={isChangingPassword}
                          className={cn(
                            "flex items-center gap-2",
                            "bg-gradient-to-r from-indigo-500 to-rose-500 text-white",
                            "hover:shadow-lg hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed",
                          )}
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <KeyRound size={18} />
                              <span>Update Password</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className={cn("text-lg font-medium", isDark ? "text-white" : "text-gray-900")}>
                          Account Actions
                        </h3>
                        <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                          Manage your account status
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={logout}
                          variant="outline"
                          className={cn(
                            "flex items-center justify-center gap-2",
                            isDark
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700",
                          )}
                        >
                          <LogOut size={18} />
                          <span>Log Out</span>
                        </Button>

                        <Button
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          variant="destructive"
                          className="flex items-center justify-center gap-2"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 size={18} />
                              <span>Delete Account</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
