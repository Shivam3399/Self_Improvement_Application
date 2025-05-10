"use client"

import React from "react"

import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import {
  PlusCircle,
  X,
  Check,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Calendar,
  TrendingUp,
  Award,
  Moon,
  Sun,
  BarChart2,
  Settings,
  Menu,
  LayoutDashboard,
  ListTodo,
  LineChart,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import dynamic from "next/dynamic"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/page-transition"

// Dynamic import with loading fallback
const TimeBasedSuggestions = dynamic(() => import("../../components/time-based-suggestions"), {
  loading: () => (
    <div className="p-8 border rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800">
      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  ),
  ssr: false,
})

type Behaviour = {
  id: number
  name: string
  description: string
  streak: number
  lastCheckIn: string | null
  checkedInToday: boolean
  history?: {
    date: string
    completed: boolean
    notes?: string
  }[]
}

type Notification = {
  id: number
  title: string
  message: string
  date: string
  read: boolean
  archived?: boolean
  type: "streak" | "reminder" | "achievement" | "system"
}

// Generate initial notifications based on behaviors
const generateInitialNotifications = (behaviours: Behaviour[]): Notification[] => {
  const notifications: Notification[] = []

  // Add streak notifications
  behaviours.forEach((behaviour) => {
    if (behaviour.streak >= 5) {
      notifications.push({
        id: Date.now() + behaviour.id,
        title: "Streak Achievement",
        message: `You've maintained a ${behaviour.streak} day streak for "${behaviour.name}"!`,
        date: new Date().toISOString(),
        read: false,
        type: "streak",
      })
    }

    // Add reminder for behaviors not checked in recently
    const lastCheckIn = behaviour.lastCheckIn ? new Date(behaviour.lastCheckIn) : null
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000)

    if (lastCheckIn && lastCheckIn < twoDaysAgo && !behaviour.checkedInToday) {
      notifications.push({
        id: Date.now() + behaviour.id + 100,
        title: "Streak at Risk",
        message: `Don't forget to check in for "${behaviour.name}" to maintain your streak!`,
        date: new Date().toISOString(),
        read: false,
        type: "reminder",
      })
    }
  })

  // Add a welcome notification
  notifications.push({
    id: Date.now() + 1000,
    title: "Welcome to Habit Tracker",
    message: "Track your daily habits and build lasting streaks!",
    date: new Date().toISOString(),
    read: false,
    type: "system",
  })

  return notifications
}

// Motivational quotes for different streak milestones
const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements lead to stunning results.",
  "Consistency is the key to achieving and maintaining momentum.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The only bad workout is the one that didn't happen.",
  "Don't stop when you're tired. Stop when you're done.",
  "Your only limit is you.",
  "The difference between try and triumph is a little umph.",
  "Dream it. Believe it. Achieve it.",
  "You don't have to be great to start, but you have to start to be great.",
]

// Memoized components for better performance
const BehaviourCard = React.memo(
  ({
    behaviour,
    isDark,
    checkInStatus,
    activeDetailsId,
    toggleDetails,
    handleCheckIn,
    getCompletionRate,
    getNextMilestone,
    getMotivationalQuote,
  }: {
    behaviour: Behaviour
    isDark: boolean
    checkInStatus: { id: number; status: "success" | "error"; message: string } | null
    activeDetailsId: number | null
    toggleDetails: (id: number) => void
    handleCheckIn: (id: number) => void
    getCompletionRate: (history?: { date: string; completed: boolean }[]) => number
    getNextMilestone: (streak: number) => number
    getMotivationalQuote: (streak: number) => string
  }) => {
    return (
      <div
        key={behaviour.id}
        className={cn(
          "rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 relative border",
          isDark ? "bg-gray-800/70 border-gray-700/70 backdrop-blur-sm" : "bg-white border-gray-200",
        )}
      >
        {checkInStatus && checkInStatus.id === behaviour.id && (
          <div
            className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
              checkInStatus.status === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300"
            }`}
          >
            {checkInStatus.status === "success" ? <Check size={12} /> : <AlertCircle size={12} />}
            {checkInStatus.message}
          </div>
        )}
        <div className="flex justify-between items-start">
          <div>
            <h3 className={cn("font-medium text-lg", isDark ? "text-white" : "text-gray-900")}>{behaviour.name}</h3>
            <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{behaviour.description}</p>
          </div>
          <div
            className={cn(
              "bg-gradient-to-r from-indigo-500/20 to-rose-500/20 text-xs font-medium px-2.5 py-1 rounded-full",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {behaviour.streak} day streak
          </div>
        </div>
        <div className={cn("mt-4 pt-4 border-t flex justify-between", isDark ? "border-gray-700" : "border-gray-100")}>
          <button
            onClick={() => handleCheckIn(behaviour.id)}
            className={cn(
              "text-sm px-4 py-2 rounded-md transition-all duration-300",
              behaviour.checkedInToday
                ? "bg-green-500/20 text-green-300 cursor-default flex items-center gap-1"
                : isDark
                  ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
            )}
            disabled={behaviour.checkedInToday}
          >
            {behaviour.checkedInToday ? (
              <>
                <Check size={14} />
                <span>Checked In</span>
              </>
            ) : (
              "Check-in"
            )}
          </button>
          <button
            onClick={() => toggleDetails(behaviour.id)}
            className={cn(
              "text-sm px-4 py-2 rounded-md flex items-center gap-1 transition-colors duration-300",
              isDark
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            Details
            {activeDetailsId === behaviour.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {behaviour.lastCheckIn && (
          <div className={cn("mt-2 text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
            Last check-in: {new Date(behaviour.lastCheckIn).toLocaleDateString()}
          </div>
        )}

        {/* Details Section */}
        {activeDetailsId === behaviour.id && (
          <div className={cn("mt-4 pt-4 border-t animate-fadeIn", isDark ? "border-gray-700" : "border-gray-100")}>
            {/* Motivational Quote */}
            <div
              className={cn(
                "p-3 rounded-lg mb-4",
                isDark
                  ? "bg-gradient-to-r from-indigo-900/30 to-purple-900/30"
                  : "bg-gradient-to-r from-indigo-50 to-purple-50",
              )}
            >
              <p className={cn("text-sm italic", isDark ? "text-indigo-300" : "text-indigo-800")}>
                "{getMotivationalQuote(behaviour.streak)}"
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className={cn("p-2 rounded text-center", isDark ? "bg-gray-800" : "bg-gray-50")}>
                <div
                  className={cn(
                    "text-xs mb-1 flex items-center justify-center gap-1",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  <Calendar size={12} />
                  <span>Completion</span>
                </div>
                <div className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                  {getCompletionRate(behaviour.history)}%
                </div>
              </div>
              <div className={cn("p-2 rounded text-center", isDark ? "bg-gray-800" : "bg-gray-50")}>
                <div
                  className={cn(
                    "text-xs mb-1 flex items-center justify-center gap-1",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  <TrendingUp size={12} />
                  <span>Current</span>
                </div>
                <div className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                  {behaviour.streak} days
                </div>
              </div>
              <div className={cn("p-2 rounded text-center", isDark ? "bg-gray-800" : "bg-gray-50")}>
                <div
                  className={cn(
                    "text-xs mb-1 flex items-center justify-center gap-1",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  <Award size={12} />
                  <span>Next Goal</span>
                </div>
                <div className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                  {getNextMilestone(behaviour.streak)} days
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <h4 className={cn("text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
              Recent Activity
            </h4>
            <div className={cn("max-h-40 overflow-y-auto rounded-md p-2", isDark ? "bg-gray-800/50" : "bg-gray-50")}>
              {behaviour.history && behaviour.history.length > 0 ? (
                <div className="space-y-2">
                  {behaviour.history.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full ${entry.completed ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <span
                            className={`text-xs ${
                              entry.completed
                                ? isDark
                                  ? "text-green-400"
                                  : "text-green-600"
                                : isDark
                                  ? "text-red-400"
                                  : "text-red-600"
                            }`}
                          >
                            {entry.completed ? "Completed" : "Missed"}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className={cn("text-xs mt-0.5", isDark ? "text-gray-400" : "text-gray-500")}>
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>No activity recorded yet.</p>
              )}
            </div>

            {/* Progress to Next Milestone */}
            <div className="mt-4">
              <div className={cn("flex justify-between text-xs mb-1", isDark ? "text-gray-400" : "text-gray-500")}>
                <span>Progress to {getNextMilestone(behaviour.streak)} day milestone</span>
                <span>
                  {behaviour.streak}/{getNextMilestone(behaviour.streak)} days
                </span>
              </div>
              <div className={cn("w-full rounded-full h-2", isDark ? "bg-gray-700" : "bg-gray-200")}>
                <div
                  className="bg-gradient-to-r from-indigo-500 to-rose-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (behaviour.streak / getNextMilestone(behaviour.streak)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  },
)

// Memoized component for the navbar
const Navbar = React.memo(
  ({
    isDark,
    theme,
    setTheme,
    setSidebarOpen,
    sidebarOpen,
    navItems,
    pathname,
  }: {
    isDark: boolean
    theme: "dark" | "light" | "system"
    setTheme: (theme: "dark" | "light" | "system") => void
    setSidebarOpen: (open: boolean) => void
    sidebarOpen: boolean
    navItems: any[]
    pathname: string
  }) => {
    return (
      <>
        {/* Desktop sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-30 hidden md:block transition-all duration-300 ease-in-out will-change-transform",
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
                prefetch={true}
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
      </>
    )
  },
)

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [isDark, setIsDark] = useState(false)

  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  const pathname = usePathname()
  const [theme, setTheme] = useState<"dark" | "light" | "system">("system")
  const [isCreatingBehaviour, setIsCreatingBehaviour] = useState(false)
  const [newBehaviourName, setNewBehaviourName] = useState("")
  const [newBehaviourDescription, setNewBehaviourDescription] = useState("")
  const [activeDetailsId, setActiveDetailsId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [behaviours, setBehaviours] = useState<Behaviour[]>([
    {
      id: 1,
      name: "Morning Meditation",
      description: "15 minutes of mindfulness to start the day",
      streak: 5,
      lastCheckIn: new Date(Date.now() - 86400000).toISOString(), // yesterday
      checkedInToday: false,
      history: [
        { date: new Date(Date.now() - 86400000).toISOString(), completed: true, notes: "Felt very peaceful today" },
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 3).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 4).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 5).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 7).toISOString(), completed: false },
      ],
    },
    {
      id: 2,
      name: "Daily Exercise",
      description: "30 minutes of physical activity",
      streak: 12,
      lastCheckIn: new Date(Date.now() - 86400000).toISOString(), // yesterday
      checkedInToday: false,
      history: [
        { date: new Date(Date.now() - 86400000).toISOString(), completed: true, notes: "Jogged for 35 minutes" },
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), completed: true, notes: "HIIT workout" },
        { date: new Date(Date.now() - 86400000 * 3).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 4).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 5).toISOString(), completed: true },
      ],
    },
    {
      id: 3,
      name: "Daily Reading",
      description: "Read a book for 30 minutes",
      streak: 8,
      lastCheckIn: new Date(Date.now() - 86400000).toISOString(), // yesterday
      checkedInToday: false,
      history: [
        { date: new Date(Date.now() - 86400000).toISOString(), completed: true, notes: "Read 'Atomic Habits'" },
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 3).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 4).toISOString(), completed: false },
        { date: new Date(Date.now() - 86400000 * 5).toISOString(), completed: true },
      ],
    },
    {
      id: 4,
      name: "Evening Journaling",
      description: "Write daily reflections before bed",
      streak: 15,
      lastCheckIn: new Date(Date.now() - 86400000).toISOString(), // yesterday
      checkedInToday: false,
      history: [
        { date: new Date(Date.now() - 86400000).toISOString(), completed: true, notes: "Reflected on goals" },
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 3).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 4).toISOString(), completed: true },
      ],
    },
    {
      id: 5,
      name: "Healthy Nutrition",
      description: "Eat at least 5 servings of vegetables daily",
      streak: 3,
      lastCheckIn: new Date(Date.now() - 86400000).toISOString(), // yesterday
      checkedInToday: false,
      history: [
        {
          date: new Date(Date.now() - 86400000).toISOString(),
          completed: true,
          notes: "Added vegetables to every meal",
        },
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 3).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 5).toISOString(), completed: false },
      ],
    },
    {
      id: 6,
      name: "Gratitude Practice",
      description: "List 3 things you're grateful for each day",
      streak: 21,
      lastCheckIn: new Date(Date.now() - 86400000).toISOString(), // yesterday
      checkedInToday: false,
      history: [
        {
          date: new Date(Date.now() - 86400000).toISOString(),
          completed: true,
          notes: "Family, health, opportunities",
        },
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 3).toISOString(), completed: true },
      ],
    },
    {
      id: 7,
      name: "Water Intake",
      description: "Drink 8 glasses of water daily",
      streak: 6,
      lastCheckIn: new Date(Date.now() - 86400000).toISOString(), // yesterday
      checkedInToday: false,
      history: [
        { date: new Date(Date.now() - 86400000).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 3).toISOString(), completed: true },
        { date: new Date(Date.now() - 86400000 * 4).toISOString(), completed: true },
      ],
    },
  ])
  const [checkInStatus, setCheckInStatus] = useState<{
    id: number
    status: "success" | "error"
    message: string
  } | null>(null)

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Delete a notification
  const deleteNotification = (id: number, e: React.MouseEvent) => {
    // Completely stop event propagation
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log("Deleting notification:", id)

    // Create a new array without the deleted notification
    const updatedNotifications = notifications.filter((notification) => notification.id !== id)
    setNotifications(updatedNotifications)

    // Close dropdown if no more notifications
    if (updatedNotifications.filter((n) => !n.archived).length === 0) {
      setTimeout(() => setShowNotifications(false), 300)
    }
  }

  // Archive a notification
  const archiveNotification = (id: number, e: React.MouseEvent) => {
    // Completely stop event propagation
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log("Archiving notification:", id)

    // Create a new array with the archived notification
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, archived: true, read: true } : notification,
    )
    setNotifications(updatedNotifications)

    // Close dropdown if no more notifications
    if (updatedNotifications.filter((n) => !n.archived).length === 0) {
      setTimeout(() => setShowNotifications(false), 300)
    }
  }

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

  // Reset check-in status message after 3 seconds
  useEffect(() => {
    if (checkInStatus) {
      const timer = setTimeout(() => {
        setCheckInStatus(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [checkInStatus])

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

  // Load user data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUserData = localStorage.getItem("userData")
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData)
          if (parsedData.username) setUsername(parsedData.username)
          if (parsedData.profileImage) setProfileImage(parsedData.profileImage)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }
  }, [])

  // Initialize notifications - memoizing for performance
  useEffect(() => {
    setNotifications(generateInitialNotifications(behaviours))

    // Check for new streak achievements when behaviors change
    const checkForNewAchievements = () => {
      const newNotifications: Notification[] = []

      behaviours.forEach((behaviour) => {
        // New streak milestones (5, 10, 15, etc.)
        if (behaviour.streak > 0 && behaviour.streak % 5 === 0) {
          // Check if we already have this notification
          const existingNotification = notifications.find(
            (n) =>
              n.type === "streak" &&
              n.message.includes(`${behaviour.streak} day streak`) &&
              n.message.includes(behaviour.name),
          )

          if (!existingNotification) {
            newNotifications.push({
              id: Date.now() + behaviour.id,
              title: "Streak Achievement",
              message: `Congratulations! You've reached a ${behaviour.streak} day streak for "${behaviour.name}"!`,
              date: new Date().toISOString(),
              read: false,
              type: "streak",
            })
          }
        }
      })

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...newNotifications, ...prev])
      }
    }

    checkForNewAchievements()
  }, [behaviours])

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCreateBehaviour = (e: React.FormEvent) => {
    e.preventDefault()
    if (newBehaviourName.trim()) {
      // Check if a behaviour with this name already exists
      const isDuplicate = behaviours.some(
        (behaviour) => behaviour.name.toLowerCase() === newBehaviourName.trim().toLowerCase(),
      )

      if (isDuplicate) {
        // Alert the user or handle the duplicate case
        alert("A behaviour with this name already exists. Please use a different name.")
        return
      }

      setBehaviours([
        ...behaviours,
        {
          id: Date.now(),
          name: newBehaviourName,
          description: newBehaviourDescription,
          streak: 0,
          lastCheckIn: null,
          checkedInToday: false,
          history: [],
        },
      ])
      setNewBehaviourName("")
      setNewBehaviourDescription("")
      setIsCreatingBehaviour(false)
    }
  }

  const handleAddSuggestedBehaviour = (name: string, description: string) => {
    // Check if a behaviour with this name already exists
    const isDuplicate = behaviours.some((behaviour) => behaviour.name.toLowerCase() === name.toLowerCase())

    if (isDuplicate) {
      alert("This behaviour is already in your list.")
      return
    }

    setBehaviours([
      ...behaviours,
      {
        id: Date.now(),
        name,
        description,
        streak: 0,
        lastCheckIn: null,
        checkedInToday: false,
        history: [],
      },
    ])
  }

  const handleCheckIn = (id: number) => {
    const today = new Date().toISOString().split("T")[0]

    setBehaviours((prevBehaviours) =>
      prevBehaviours.map((behaviour) => {
        if (behaviour.id === id) {
          // If already checked in today
          if (behaviour.checkedInToday) {
            setCheckInStatus({
              id,
              status: "error",
              message: "Already checked in today",
            })
            return behaviour
          }

          // Check if last check-in was yesterday to maintain streak
          let newStreak = behaviour.streak
          const lastCheckInDate = behaviour.lastCheckIn
            ? new Date(behaviour.lastCheckIn).toISOString().split("T")[0]
            : null
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

          if (!lastCheckInDate || lastCheckInDate === yesterday) {
            // If first check-in or checked in yesterday, increment streak
            newStreak += 1

            // Add notification for streak milestones
            if (newStreak > 0 && newStreak % 5 === 0) {
              const newNotification: Notification = {
                id: Date.now(),
                title: "Streak Achievement",
                message: `Congratulations! You've reached a ${newStreak} day streak for "${behaviour.name}"!`,
                date: new Date().toISOString(),
                read: false,
                type: "streak",
              }
              setNotifications((prev) => [newNotification, ...prev])
            }
          } else if (lastCheckInDate !== today) {
            // If missed a day, reset streak
            newStreak = 1
          }

          setCheckInStatus({
            id,
            status: "success",
            message: "Check-in successful!",
          })

          // Add to history
          const newHistory = behaviour.history ? [...behaviour.history] : []
          newHistory.unshift({
            date: new Date().toISOString(),
            completed: true,
          })

          return {
            ...behaviour,
            streak: newStreak,
            lastCheckIn: new Date().toISOString(),
            checkedInToday: true,
            history: newHistory,
          }
        }
        return behaviour
      }),
    )
  }

  const toggleDetails = (id: number) => {
    setActiveDetailsId(activeDetailsId === id ? null : id)
  }

  // Get a motivational quote based on streak count
  const getMotivationalQuote = (streak: number) => {
    // Use different quotes for different streak ranges
    if (streak === 0) return motivationalQuotes[0]
    if (streak < 5) return motivationalQuotes[1]
    if (streak < 10) return motivationalQuotes[2]
    if (streak < 15) return motivationalQuotes[3]
    if (streak < 20) return motivationalQuotes[4]
    if (streak < 30) return motivationalQuotes[5]
    if (streak < 50) return motivationalQuotes[6]
    if (streak < 75) return motivationalQuotes[7]
    if (streak < 100) return motivationalQuotes[8]
    return motivationalQuotes[9]
  }

  // Calculate completion rate
  const getCompletionRate = (history?: { date: string; completed: boolean }[]) => {
    if (!history || history.length === 0) return 0
    const completedDays = history.filter((day) => day.completed).length
    return Math.round((completedDays / history.length) * 100)
  }

  // Get next milestone
  const getNextMilestone = (streak: number) => {
    const milestones = [1, 3, 5, 7, 10, 14, 21, 30, 50, 100]
    for (const milestone of milestones) {
      if (streak < milestone) return milestone
    }
    return Math.ceil(streak / 100) * 100 // Next hundred
  }

  // Get total check-ins
  const getTotalCheckIns = useMemo(() => {
    return behaviours.reduce((total, behaviour) => {
      return total + (behaviour.history?.filter((day) => day.completed).length || 0)
    }, 0)
  }, [behaviours])

  // Get longest streak
  const getLongestStreak = useMemo(() => {
    return Math.max(...behaviours.map((behaviour) => behaviour.streak))
  }, [behaviours])

  // Get total behaviours
  const getTotalBehaviours = useMemo(() => {
    return behaviours.length
  }, [behaviours])

  // Get completion rate for all behaviours
  const getOverallCompletionRate = useMemo(() => {
    const allHistory = behaviours.flatMap((behaviour) => behaviour.history || [])
    if (allHistory.length === 0) return 0
    const completedDays = allHistory.filter((day) => day.completed).length
    return Math.round((completedDays / allHistory.length) * 100)
  }, [behaviours])

  // Get today's date in a readable format
  const getTodayDate = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date().toLocaleDateString("en-US", options)
  }, [])

  // Get unread notification count
  const getUnreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read && !notification.archived).length
  }, [notifications])

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  // Mark a single notification as read
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Format notification date
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Navigation items
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", current: pathname === "/dashboard" },
    { name: "Behaviours", icon: ListTodo, href: "/behaviours", current: pathname === "/behaviours" },
    { name: "Analytics", icon: LineChart, href: "/analytics", current: pathname === "/analytics" },
    { name: "Settings", icon: Settings, href: "/settings", current: pathname === "/settings" },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
        <h2 className="mt-4 text-xl font-semibold">Loading dashboard...</h2>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
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
            "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden will-change-transform",
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
                prefetch={true}
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
        <Navbar
          isDark={isDark}
          theme={theme}
          setTheme={setTheme}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          navItems={navItems}
          pathname={pathname}
        />

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
                <h1 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Dashboard</h1>
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{getTodayDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/settings"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                prefetch={true}
              >
                Settings
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Dashboard content */}
          <main className="p-4 md:p-6">
            <PageTransition>
              <div className="container mx-auto p-4 space-y-6">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Welcome, {user?.name || "User"}!</CardTitle>
                    <CardDescription>This is your personal dashboard</CardDescription>
                  </CardHeader>
                  <CardContent></CardContent>
                </Card>

                {/* Stats overview */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  <div
                    className={cn(
                      "rounded-lg p-4 shadow-sm transform transition-all duration-300 hover:scale-105",
                      isDark ? "bg-gray-800/70 border border-gray-700/70" : "bg-white border border-gray-200",
                    )}
                  >
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "flex-shrink-0 rounded-md p-3",
                          isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600",
                        )}
                      >
                        <ListTodo size={24} />
                      </div>
                      <div className="ml-4">
                        <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                          Total Behaviours
                        </p>
                        <p className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {getTotalBehaviours}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg p-4 shadow-sm transform transition-all duration-300 hover:scale-105",
                      isDark ? "bg-gray-800/70 border border-gray-700/70" : "bg-white border border-gray-200",
                    )}
                  >
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "flex-shrink-0 rounded-md p-3",
                          isDark ? "bg-rose-500/20 text-rose-300" : "bg-rose-100 text-rose-600",
                        )}
                      >
                        <Check size={24} />
                      </div>
                      <div className="ml-4">
                        <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                          Total Check-ins
                        </p>
                        <p className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {getTotalCheckIns}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg p-4 shadow-sm transform transition-all duration-300 hover:scale-105",
                      isDark ? "bg-gray-800/70 border border-gray-700/70" : "bg-white border border-gray-200",
                    )}
                  >
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "flex-shrink-0 rounded-md p-3",
                          isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-600",
                        )}
                      >
                        <Award size={24} />
                      </div>
                      <div className="ml-4">
                        <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                          Longest Streak
                        </p>
                        <p className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {getLongestStreak} days
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg p-4 shadow-sm transform transition-all duration-300 hover:scale-105",
                      isDark ? "bg-gray-800/70 border border-gray-700/70" : "bg-white border border-gray-200",
                    )}
                  >
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "flex-shrink-0 rounded-md p-3",
                          isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-600",
                        )}
                      >
                        <BarChart2 size={24} />
                      </div>
                      <div className="ml-4">
                        <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                          Completion Rate
                        </p>
                        <p className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {getOverallCompletionRate}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Motivational quote */}
                <div
                  className={cn(
                    "mb-6 p-6 rounded-lg shadow-sm text-center transform transition-all duration-500 hover:shadow-lg will-change-transform",
                    isDark
                      ? "bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-800/30"
                      : "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100",
                  )}
                >
                  <p className={cn("text-lg italic", isDark ? "text-indigo-300" : "text-indigo-800")}>
                    "{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}"
                  </p>
                </div>

                {/* Time-based suggestions */}
                <div className="mb-6">
                  <Suspense
                    fallback={
                      <div className="p-8 border rounded-xl animate-pulse bg-gray-100 dark:bg-gray-800">
                        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    }
                  >
                    <TimeBasedSuggestions isDark={isDark} onAddBehaviour={handleAddSuggestedBehaviour} />
                  </Suspense>
                </div>

                {/* Add behaviour button */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                    Your Behaviours
                  </h2>
                  <button
                    onClick={() => setIsCreatingBehaviour(true)}
                    className={cn(
                      "flex items-center justify-center gap-3 px-5 py-2.5 rounded-lg transition-all duration-300",
                      "bg-gradient-to-r from-indigo-500 to-rose-500 text-white",
                      "hover:shadow-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2",
                      "focus:ring-indigo-500 focus:outline-none mt-2 transform hover:scale-105",
                      isDark ? "focus:ring-offset-gray-900" : "focus:ring-offset-white",
                    )}
                  >
                    <PlusCircle size={18} className="flex-shrink-0" />
                    <span className="font-medium">New Behaviour</span>
                  </button>
                </div>

                {/* Create behaviour form */}
                {isCreatingBehaviour && (
                  <div
                    className={cn(
                      "mb-6 p-6 rounded-lg border shadow-sm transition-colors duration-500",
                      isDark ? "bg-gray-800/50 border-gray-700" : "bg-indigo-50 border-indigo-100",
                    )}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-indigo-900")}>
                        Create New Behaviour
                      </h2>
                      <button
                        onClick={() => setIsCreatingBehaviour(false)}
                        className={cn(
                          "transition-colors duration-300 rounded-full p-1",
                          isDark
                            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
                        )}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={handleCreateBehaviour}>
                      <div className="grid gap-4 mb-4 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="behaviourName"
                            className={cn("block text-sm font-medium mb-1", isDark ? "text-gray-300" : "text-gray-700")}
                          >
                            Behaviour Name
                          </label>
                          <input
                            type="text"
                            id="behaviourName"
                            value={newBehaviourName}
                            onChange={(e) => setNewBehaviourName(e.target.value)}
                            className={cn(
                              "w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-300",
                              isDark
                                ? "bg-gray-800 border-gray-700 text-white border focus:ring-indigo-500/50"
                                : "bg-white border border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                            )}
                            placeholder="e.g., Daily Reading"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="behaviourDescription"
                            className={cn("block text-sm font-medium mb-1", isDark ? "text-gray-300" : "text-gray-700")}
                          >
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            id="behaviourDescription"
                            value={newBehaviourDescription}
                            onChange={(e) => setNewBehaviourDescription(e.target.value)}
                            className={cn(
                              "w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-300",
                              isDark
                                ? "bg-gray-800 border-gray-700 text-white border focus:ring-indigo-500/50"
                                : "bg-white border border-gray-300 text-gray-900 focus:ring-indigo-500/30",
                            )}
                            placeholder="e.g., Read for 20 minutes each day"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsCreatingBehaviour(false)}
                          className={cn(
                            "px-4 py-2 rounded-md mr-2 transition-colors duration-300",
                            isDark
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-md hover:opacity-90 transition-opacity duration-300"
                        >
                          Create Behaviour
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Behaviours grid - using windowing for better performance with many behaviors */}
                {behaviours.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {behaviours.map((behaviour) => (
                      <BehaviourCard
                        key={behaviour.id}
                        behaviour={behaviour}
                        isDark={isDark}
                        checkInStatus={checkInStatus}
                        activeDetailsId={activeDetailsId}
                        toggleDetails={toggleDetails}
                        handleCheckIn={handleCheckIn}
                        getCompletionRate={getCompletionRate}
                        getNextMilestone={getNextMilestone}
                        getMotivationalQuote={getMotivationalQuote}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={cn("text-center py-8 rounded-lg", isDark ? "bg-gray-800/50" : "bg-gray-50")}>
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                      You haven't created any behaviours yet.
                    </p>
                    <button
                      onClick={() => setIsCreatingBehaviour(true)}
                      className={cn(
                        "mt-2 transition-colors duration-300",
                        isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-800",
                      )}
                    >
                      Create your first behaviour
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-6 border-t flex justify-center items-center">
                  <div className="w-8"></div>
                </div>
              </div>
            </PageTransition>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
