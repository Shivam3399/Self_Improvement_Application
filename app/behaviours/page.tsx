"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ListTodo, Moon, Sun, Menu, X, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export default function BehavioursPage() {
  const pathname = usePathname()
  const [theme, setTheme] = useState<"dark" | "light" | "system">("system")
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [behaviours, setBehaviours] = useState([
    {
      id: 1,
      name: "Morning Meditation",
      description: "15 minutes of mindfulness to start the day",
      streak: 5,
    },
    {
      id: 2,
      name: "Daily Exercise",
      description: "30 minutes of physical activity",
      streak: 12,
    },
    {
      id: 3,
      name: "Daily Reading",
      description: "Read a book for 30 minutes",
      streak: 8,
    },
    {
      id: 4,
      name: "Evening Journaling",
      description: "Write daily reflections before bed",
      streak: 15,
    },
    {
      id: 5,
      name: "Healthy Nutrition",
      description: "Eat at least 5 servings of vegetables daily",
      streak: 3,
    },
    {
      id: 6,
      name: "Gratitude Practice",
      description: "List 3 things you're grateful for each day",
      streak: 21,
    },
    {
      id: 7,
      name: "Water Intake",
      description: "Drink 8 glasses of water daily",
      streak: 6,
    },
  ])

  // Add this useEffect to load behaviours from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedBehaviours = localStorage.getItem("behaviours")
      if (storedBehaviours) {
        const parsedBehaviours = JSON.parse(storedBehaviours)
        // Ensure each behaviour has improvementItems property
        const validatedBehaviours = parsedBehaviours.map((behaviour: any) => ({
          ...behaviour,
          improvementItems: behaviour.improvementItems || [],
        }))
        setBehaviours(validatedBehaviours)
        // Update localStorage with validated behaviours
        localStorage.setItem("behaviours", JSON.stringify(validatedBehaviours))
      } else {
        // Initialize localStorage with default behaviours if not already set
        const defaultBehavioursWithItems = behaviours.map((behaviour) => ({
          ...behaviour,
          improvementItems: [],
        }))
        localStorage.setItem("behaviours", JSON.stringify(defaultBehavioursWithItems))
      }
    }
  }, [])

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

  // Navigation items
  const navItems = [
    { name: "Dashboard", icon: "LayoutDashboard", href: "/dashboard", current: pathname === "/dashboard" },
    { name: "Behaviours", icon: "ListTodo", href: "/behaviours", current: pathname === "/behaviours" },
    { name: "Analytics", icon: "LineChart", href: "/analytics", current: pathname === "/analytics" },
    { name: "Settings", icon: "Settings", href: "/settings", current: pathname === "/settings" },
  ]

  // Get icon component by name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "LayoutDashboard":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
        )
      case "ListTodo":
        return <ListTodo className="h-5 w-5" />
      case "LineChart":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        )
      case "Settings":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
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
            <span className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>Habit Tracker</span>
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
              {getIcon(item.icon)}
              <span className="ml-3">{item.name}</span>
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
              {getIcon(item.icon)}
              {sidebarOpen && <span className="ml-3">{item.name}</span>}
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
      <div className={cn("transition-all duration-300 ease-in-out", "md:pl-64", sidebarOpen ? "md:pl-64" : "md:pl-20")}>
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={cn(
                "rounded-md p-2 md:hidden mr-2",
                isDark
                  ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
              )}
            >
              <Menu size={20} />
            </button>
            <Link
              href="/dashboard"
              className={cn(
                "mr-4 p-2 rounded-full transition-colors",
                isDark
                  ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700",
              )}
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>Your Behaviours</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {behaviours.map((behaviour) => (
              <Link
                key={behaviour.id}
                href={`/behaviours/${behaviour.id}`}
                className={cn(
                  "block rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 border",
                  isDark ? "bg-gray-800/70 border-gray-700/70" : "bg-white border-gray-200",
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      {behaviour.name}
                    </h2>
                    <p className={cn("mt-1 text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                      {behaviour.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full",
                      isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600",
                    )}
                  >
                    <ListTodo size={20} />
                  </div>
                </div>
                <div
                  className={cn(
                    "mt-4 pt-4 border-t flex justify-between items-center",
                    isDark ? "border-gray-700" : "border-gray-100",
                  )}
                >
                  <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>Current streak</span>
                  <span
                    className={cn(
                      "font-medium text-sm px-2.5 py-1 rounded-full",
                      isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600",
                    )}
                  >
                    {behaviour.streak} days
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
