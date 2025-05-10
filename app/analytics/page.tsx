"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowLeft, Sun, Moon, Check, X, Flame, Tag } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement,
  LineController,
  BarController,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import {
  type Behaviour as BehaviourType,
  type CheckInHistory as CheckInHistoryType,
  DEFAULT_MISSED_REASONS,
} from "../../types/behavior-types"
import SmartSuggestions from "../../components/smart-suggestions"
import OptimalTimeSuggestions from "../../components/optimal-time-suggestions"
import BehaviorInsightsDashboard from "../../components/behavior-insights-dashboard"
import MissedReasonModal from "../../components/missed-reason-modal"

// Register ChartJS components - this is critical for the charts to work
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  LineController,
  BarController,
)

type DateRange = "7days" | "30days" | "90days" | "6months" | "1year" | "custom"
type ChartType = "pie" | "progress"
type TrendView = "weekly" | "monthly"

interface CheckInHistory {
  date: string
  completed: boolean
  notes?: string
}

interface Behaviour {
  id: number
  name: string
  description: string
  streak: number
  lastCheckIn: string | null
  checkedInToday: boolean
  history?: CheckInHistory[]
  targetDays?: number
  targetFrequency?: string
  currentGoal?: string
}

export default function AnalyticsPage() {
  // Theme state management
  const [theme, setTheme] = useState<"dark" | "light" | "system">("system")
  const [isDark, setIsDark] = useState(false)
  const [dateRange, setDateRange] = useState<"7days" | "30days" | "90days" | "6months" | "1year" | "custom">("30days")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [behaviours, setBehaviours] = useState<BehaviourType[]>([])
  const [selectedBehaviours, setSelectedBehaviours] = useState<number[]>([])
  const [showBehaviourFilter, setShowBehaviourFilter] = useState(false)
  const [trendView, setTrendView] = useState<"weekly" | "monthly">("weekly")
  const [selectedTimeRange, setSelectedTimeRange] = useState<DateRange>("7days")
  const [checkInStatus, setCheckInStatus] = useState<{
    id: number
    status: "success" | "error"
    message: string
  } | null>(null)

  // Missed reason modal state
  const [showMissedReasonModal, setShowMissedReasonModal] = useState(false)
  const [selectedBehaviourForMissedReason, setSelectedBehaviourForMissedReason] = useState<BehaviourType | null>(null)

  // Create a memoized filtered behaviors list
  const filteredBehaviours = useMemo(() => {
    return behaviours.filter((b) => selectedBehaviours.length === 0 || selectedBehaviours.includes(b.id))
  }, [behaviours, selectedBehaviours])

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "dark" | "light" | "system" | null
      if (savedTheme) {
        setTheme(savedTheme)
      }

      // Set initial dark mode state
      if (savedTheme === "dark") {
        setIsDark(true)
      } else if (savedTheme === "light") {
        setIsDark(false)
      } else {
        // For system theme, check system preference
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
      }

      // Add event listener for system theme changes
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

  // Load behaviors from localStorage
  useEffect(() => {
    const loadBehaviours = () => {
      // Try to load behaviours from localStorage
      const storedBehaviours = localStorage.getItem("behaviours")
      const today = new Date().toISOString().split("T")[0]

      if (storedBehaviours) {
        try {
          const parsedBehaviours = JSON.parse(storedBehaviours)

          // Process behaviors and check if already checked in today
          const enhancedBehaviours = parsedBehaviours.map((b: BehaviourType) => {
            // Ensure history exists
            const history = b.history || []

            // Check if there's a check-in for today
            const todayCheckIn = history.find(
              (entry: CheckInHistoryType) => new Date(entry.date).toISOString().split("T")[0] === today,
            )

            return {
              ...b,
              targetDays: b.targetDays || 30,
              targetFrequency: b.targetFrequency || "daily",
              currentGoal: b.currentGoal || `${b.description || "Complete"} daily`,
              history: history,
              checkedInToday: !!todayCheckIn,
              category: b.category || "other",
              tags: b.tags || [],
            }
          })

          console.log("Loaded behaviors:", enhancedBehaviours)
          setBehaviours(enhancedBehaviours)

          // Select first behavior by default if none selected
          if (selectedBehaviours.length === 0 && enhancedBehaviours.length > 0) {
            setSelectedBehaviours([enhancedBehaviours[0].id])
          }

          return enhancedBehaviours
        } catch (error) {
          console.error("Error parsing stored behaviours:", error)
        }
      }

      // Use mock data if no behaviours found in localStorage
      const mockBehaviours = generateMockBehaviours()
      console.log("Using mock behaviors:", mockBehaviours)
      setBehaviours(mockBehaviours)

      // Select first behavior by default if none selected
      if (selectedBehaviours.length === 0 && mockBehaviours.length > 0) {
        setSelectedBehaviours([mockBehaviours[0].id])
      }

      return mockBehaviours
    }

    // Set default custom date range (last 30 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    setCustomEndDate(endDate.toISOString().split("T")[0])
    setCustomStartDate(startDate.toISOString().split("T")[0])

    loadBehaviours()
  }, [])

  // Generate mock behaviors data if needed
  const generateMockBehaviours = () => {
    // Generate simulated history
    const generateHistory = (daysBack: number, consistency: number): CheckInHistoryType[] => {
      const history: CheckInHistoryType[] = []
      const today = new Date()

      for (let i = daysBack; i > 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        // Simulate random completion with a bias toward consistency
        const isCompleted = Math.random() < consistency

        // Add completedAt time for completed entries
        let completedAt = undefined
        if (isCompleted) {
          const completionDate = new Date(date)
          // Random hour between 6am and 10pm
          completionDate.setHours(6 + Math.floor(Math.random() * 16), Math.floor(Math.random() * 60))
          completedAt = completionDate.toISOString()
        }

        // Add missed reason for non-completed entries
        let missedReason = undefined
        if (!isCompleted && Math.random() > 0.3) {
          const reasonIndex = Math.floor(Math.random() * DEFAULT_MISSED_REASONS.length)
          missedReason = DEFAULT_MISSED_REASONS[reasonIndex].id
        }

        history.push({
          date: date.toISOString(),
          completed: isCompleted,
          completedAt,
          missedReason,
          notes: isCompleted
            ? ["Completed successfully", "Good session", "Felt great today"][Math.floor(Math.random() * 3)]
            : undefined,
        })
      }

      return history
    }

    const today = new Date().toISOString().split("T")[0]
    const mockBehaviours = [
      {
        id: 1,
        name: "Morning Meditation",
        description: "15 minutes of mindfulness to start the day",
        category: "mindfulness",
        tags: ["wellness", "mental health"],
        streak: 5,
        lastCheckIn: new Date(Date.now() - 86400000).toISOString(),
        checkedInToday: false,
        targetDays: 30,
        targetFrequency: "daily",
        currentGoal: "15 minutes daily",
        history: generateHistory(30, 0.7),
      },
      {
        id: 2,
        name: "Daily Exercise",
        description: "30 minutes of physical activity",
        category: "health",
        tags: ["fitness", "wellness"],
        streak: 12,
        lastCheckIn: new Date(Date.now() - 86400000).toISOString(),
        checkedInToday: false,
        targetDays: 60,
        targetFrequency: "daily",
        currentGoal: "30 minutes daily",
        history: generateHistory(30, 0.8),
      },
      {
        id: 3,
        name: "Daily Reading",
        description: "Read a book for 30 minutes",
        category: "learning",
        tags: ["education", "personal development"],
        streak: 8,
        lastCheckIn: new Date(Date.now() - 86400000).toISOString(),
        checkedInToday: false,
        targetDays: 45,
        targetFrequency: "daily",
        currentGoal: "30 minutes daily",
        history: generateHistory(30, 0.65),
      },
      {
        id: 4,
        name: "Evening Journaling",
        description: "Write daily reflections before bed",
        category: "mindfulness",
        tags: ["wellness", "mental health"],
        streak: 15,
        lastCheckIn: new Date(Date.now() - 86400000).toISOString(),
        checkedInToday: false,
        targetDays: 90,
        targetFrequency: "daily",
        currentGoal: "10 minutes daily",
        history: generateHistory(30, 0.9),
      },
      {
        id: 5,
        name: "Healthy Nutrition",
        description: "Eat at least 5 servings of vegetables daily",
        category: "health",
        tags: ["nutrition", "wellness"],
        streak: 3,
        lastCheckIn: new Date(Date.now() - 86400000).toISOString(),
        checkedInToday: false,
        targetDays: 21,
        targetFrequency: "daily",
        currentGoal: "5 servings daily",
        history: generateHistory(30, 0.6),
      },
    ]

    // Check if any of the mock behaviors have a check-in for today
    return mockBehaviours.map((behaviour) => {
      const history = behaviour.history || []
      const todayCheckIn = history.find((entry) => new Date(entry.date).toISOString().split("T")[0] === today)

      return {
        ...behaviour,
        checkedInToday: !!todayCheckIn,
      }
    })
  }

  // Handle check-in for a behavior
  const handleCheckIn = (id: number, completed: boolean, notes = "") => {
    const today = new Date().toISOString().split("T")[0]

    setBehaviours((prevBehaviours) => {
      const updatedBehaviours = prevBehaviours.map((behaviour) => {
        if (behaviour.id === id) {
          // Check if already checked in today
          const todayCheckIn = behaviour.history?.find(
            (entry) => new Date(entry.date).toISOString().split("T")[0] === today,
          )

          if (todayCheckIn) {
            setCheckInStatus({
              id,
              status: "error",
              message: "Already checked in today",
            })
            return behaviour
          }

          // Calculate new streak
          let newStreak = behaviour.streak
          const lastCheckInDate = behaviour.lastCheckIn
            ? new Date(behaviour.lastCheckIn).toISOString().split("T")[0]
            : null
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

          if (completed) {
            if (!lastCheckInDate || lastCheckInDate === yesterday) {
              // If first check-in or checked in yesterday, increment streak
              newStreak += 1
            } else if (lastCheckInDate !== today) {
              // If missed a day, reset streak
              newStreak = 1
            }
          } else {
            // Reset streak for missed days
            newStreak = 0

            // Show missed reason modal
            setSelectedBehaviourForMissedReason(behaviour)
            setShowMissedReasonModal(true)
          }

          setCheckInStatus({
            id,
            status: "success",
            message: completed ? "Completed! Streak updated." : "Marked as missed.",
          })

          // Create new history entry with current time for completed behaviors
          const newHistoryEntry: CheckInHistoryType = {
            date: new Date().toISOString(),
            completed,
            notes: notes.trim() || undefined,
          }

          // Add completion time for completed behaviors
          if (completed) {
            newHistoryEntry.completedAt = new Date().toISOString()
          }

          const newHistory = behaviour.history ? [...behaviour.history] : []
          newHistory.unshift(newHistoryEntry)

          // Update behavior
          return {
            ...behaviour,
            streak: newStreak,
            lastCheckIn: new Date().toISOString(),
            checkedInToday: true,
            history: newHistory,
          }
        }
        return behaviour
      })

      // Update localStorage directly here
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("behaviours", JSON.stringify(updatedBehaviours))
        } catch (error) {
          console.error("Error updating behaviours in localStorage:", error)
        }
      }

      return updatedBehaviours
    })
  }

  // Handle missed reason submission
  const handleMissedReasonSubmit = (reason: string, customReason?: string) => {
    if (!selectedBehaviourForMissedReason) return

    setBehaviours((prevBehaviours) => {
      const updatedBehaviours = prevBehaviours.map((behaviour) => {
        if (behaviour.id === selectedBehaviourForMissedReason.id) {
          // Find the most recent history entry (which should be the missed one)
          const history = [...(behaviour.history || [])]
          if (history.length > 0 && !history[0].completed) {
            history[0].missedReason = reason === "other" && customReason ? customReason : reason
          }

          return {
            ...behaviour,
            history,
          }
        }
        return behaviour
      })

      // Update localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("behaviours", JSON.stringify(updatedBehaviours))
        } catch (error) {
          console.error("Error updating behaviours in localStorage:", error)
        }
      }

      return updatedBehaviours
    })

    setSelectedBehaviourForMissedReason(null)
    setShowMissedReasonModal(false)
  }

  // Handle adding a suggested behavior
  const handleAddSuggestedBehaviour = (behaviour: BehaviourType) => {
    // Check if behavior with this name already exists
    const isDuplicate = behaviours.some((b) => b.name.toLowerCase() === behaviour.name.toLowerCase())

    if (isDuplicate) {
      alert("This behavior is already in your list.")
      return
    }

    // Generate a new ID for the behavior
    const newId = Math.max(0, ...behaviours.map((b) => b.id)) + 1

    // Add the new behavior to the list
    const newBehaviour: BehaviourType = {
      ...behaviour,
      id: newId,
      streak: 0,
      lastCheckIn: null,
      checkedInToday: false,
      history: [],
    }

    setBehaviours((prev) => [...prev, newBehaviour])

    // Update localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("behaviours", JSON.stringify([...behaviours, newBehaviour]))
      } catch (error) {
        console.error("Error updating behaviours in localStorage:", error)
      }
    }
  }

  // Calculate success rate for a behavior
  const calculateSuccessRate = (behaviour: BehaviourType) => {
    if (!behaviour.history || behaviour.history.length === 0) return 0

    const completedCount = behaviour.history.filter((entry) => entry.completed).length
    return Math.round((completedCount / behaviour.history.length) * 100)
  }

  // Find most improved behavior
  const getMostImprovedBehavior = () => {
    if (behaviours.length === 0) return null

    const improvementScores = behaviours.map((behaviour) => {
      const history = behaviour.history || []
      if (history.length < 7) return { id: behaviour.id, score: 0 }

      // Compare recent 7 days to previous 7 days
      const recent = history.slice(0, 7).filter((entry) => entry.completed).length
      const previous = history.slice(7, 14).filter((entry) => entry.completed).length

      // Calculate improvement score
      const improvement = recent - previous

      return { id: behaviour.id, score: improvement }
    })

    // Sort by score descending and get the highest
    improvementScores.sort((a, b) => b.score - a.score)
    return behaviours.find((b) => b.id === improvementScores[0].id)
  }

  // Find most skipped behavior
  const getMostSkippedBehavior = () => {
    if (behaviours.length === 0) return null

    const skipScores = behaviours.map((behaviour) => {
      const history = behaviour.history || []
      if (history.length < 7) return { id: behaviour.id, score: 0 }

      // Count misses in recent 7 days
      const missedCount = history.slice(0, 7).filter((entry) => !entry.completed).length

      return { id: behaviour.id, score: missedCount }
    })

    // Sort by score descending and get the highest
    skipScores.sort((a, b) => b.score - a.score)
    return behaviours.find((b) => b.id === skipScores[0].id)
  }

  // Generate trend data
  const generateTrendData = (days = 7) => {
    if (selectedBehaviours.length === 0) return null

    // Generate dates
    const dates = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(
        date.toLocaleDateString("en-US", {
          weekday: days <= 7 ? "short" : undefined,
          month: "short",
          day: "numeric",
        }),
      )
    }

    // Generate datasets
    const datasets = filteredBehaviours.map((behaviour, index) => {
      const colors = [
        "#8b5cf6", // Purple
        "#f97316", // Orange
        "#06b6d4", // Cyan
        "#ec4899", // Pink
        "#10b981", // Emerald
      ]

      const data = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const formattedDate = date.toISOString().split("T")[0]

        // Find check-in for this date
        const checkIn = behaviour.history?.find(
          (entry) => new Date(entry.date).toISOString().split("T")[0] === formattedDate,
        )

        data.push(checkIn?.completed ? 1 : 0)
      }

      return {
        label: behaviour.name,
        data,
        backgroundColor: `${colors[index % colors.length]}`,
      }
    })

    return {
      labels: dates,
      datasets,
    }
  }

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: (value: any) => (value === 1 ? "Completed" : "Missed"),
          color: isDark ? "#e5e7eb" : "#1f2937",
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        ticks: {
          color: isDark ? "#e5e7eb" : "#1f2937",
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: isDark ? "#e5e7eb" : "#1f2937",
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
        titleColor: isDark ? "#e5e7eb" : "#1f2937",
        bodyColor: isDark ? "#e5e7eb" : "#1f2937",
        callbacks: {
          label: (context: any) => (context.raw === 1 ? "Completed" : "Missed"),
        },
      },
    },
  }

  // Generate check-in data for today
  const getTodayCheckIns = () => {
    const today = new Date().toISOString().split("T")[0]
    return behaviours.map((behaviour) => {
      const todayCheckIn = behaviour.history?.find(
        (entry) => new Date(entry.date).toISOString().split("T")[0] === today,
      )

      return {
        id: behaviour.id,
        name: behaviour.name,
        checkedIn: !!todayCheckIn,
        completed: todayCheckIn?.completed || false,
        notes: todayCheckIn?.notes || "",
      }
    })
  }

  const toggleBehaviour = (id: number) => {
    setSelectedBehaviours((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Generate chart data based on streaks
  const generateChartData = () => {
    const days = selectedTimeRange === "7days" ? 7 : 30
    const labels = []

    // Generate dates for x-axis
    const today = new Date()

    // For 30 days, group into 4 weeks instead of daily data points
    if (selectedTimeRange === "30days") {
      // Create 4 week labels
      for (let i = 0; i < 4; i++) {
        const weekEnd = new Date(today)
        weekEnd.setDate(today.getDate() - i * 7)
        const weekStart = new Date(weekEnd)
        weekStart.setDate(weekEnd.getDate() - 6)

        labels.unshift(
          `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        )
      }

      // If no behaviors are selected, show a message
      if (filteredBehaviours.length === 0) {
        return {
          labels,
          datasets: [],
        }
      }

      // Generate datasets for each selected behavior
      const datasets = filteredBehaviours.map((behaviour, index) => {
        const colors = [
          "#8b5cf6", // Purple
          "#f97316", // Orange
          "#06b6d4", // Cyan
          "#ec4899", // Pink
          "#10b981", // Emerald
        ]

        // For streak data in weekly view, we'll take the max streak in each week
        const data = []

        for (let week = 0; week < 4; week++) {
          let maxStreakInWeek = 0
          let currentStreak = 0

          // Process each day in the week
          for (let day = 0; day < 7; day++) {
            const dayIndex = week * 7 + day
            const date = new Date(today)
            date.setDate(date.getDate() - (29 - dayIndex)) // Start from 30 days ago
            const formattedDate = date.toISOString().split("T")[0]

            // Find check-in for this date
            const checkIn = behaviour.history?.find(
              (entry) => new Date(entry.date).toISOString().split("T")[0] === formattedDate,
            )

            // If completed, increment streak, otherwise reset to 0
            if (checkIn?.completed) {
              currentStreak++
              maxStreakInWeek = Math.max(maxStreakInWeek, currentStreak)
            } else {
              currentStreak = 0
            }
          }

          data.unshift(maxStreakInWeek)
        }

        return {
          label: behaviour.name,
          data,
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
          fill: false,
          tension: 0.1,
          type: "line",
        }
      })

      return {
        labels,
        datasets,
      }
    } else {
      // Original 7-day view with daily data points
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        labels.push(
          date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        )
      }

      // If no behaviors are selected, show a message
      if (filteredBehaviours.length === 0) {
        return {
          labels,
          datasets: [],
        }
      }

      // Generate datasets for each selected behavior
      const datasets = filteredBehaviours.map((behaviour, index) => {
        const colors = [
          "#8b5cf6", // Purple
          "#f97316", // Orange
          "#06b6d4", // Cyan
          "#ec4899", // Pink
          "#10b981", // Emerald
        ]

        // For streak data, we'll create an array showing the streak growth over time
        const data = []
        let currentStreak = 0

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const formattedDate = date.toISOString().split("T")[0]

          // Find check-in for this date
          const checkIn = behaviour.history?.find(
            (entry) => new Date(entry.date).toISOString().split("T")[0] === formattedDate,
          )

          // If completed, increment streak, otherwise reset to 0
          if (checkIn?.completed) {
            currentStreak++
          } else {
            currentStreak = 0
          }

          data.push(currentStreak)
        }

        return {
          label: behaviour.name,
          data,
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
          fill: false,
          tension: 0.1,
          type: "line",
        }
      })

      return {
        labels,
        datasets,
      }
    }
  }

  // Chart options for streak data
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Current Streak",
          color: isDark ? "#e5e7eb" : "#1f2937",
        },
        ticks: {
          stepSize: 1,
          color: isDark ? "#e5e7eb" : "#1f2937",
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        ticks: {
          color: isDark ? "#e5e7eb" : "#1f2937",
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: isDark ? "#e5e7eb" : "#1f2937",
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
        titleColor: isDark ? "#e5e7eb" : "#1f2937",
        bodyColor: isDark ? "#e5e7eb" : "#1f2937",
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw} day streak`
          },
        },
      },
    },
  }

  return (
    <div
      className={cn(
        "min-h-screen w-full p-4 md:p-8 transition-colors duration-500",
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
      <div className="max-w-6xl mx-auto relative">
        {/* Header with navigation and title */}
        <div className="flex items-center mb-8">
          <div className="flex items-center">
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
            <div>
              <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>Behaviour Analytics</h1>
              <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                Track, analyze, and optimize your behaviour patterns over time
              </p>
            </div>
          </div>
        </div>

        {/* Daily Check-in Section */}
        <div className="mb-8">
          <div
            className={cn(
              "rounded-xl p-6 shadow-lg transition-all duration-300",
              isDark
                ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50"
                : "bg-white border border-gray-200",
            )}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h2 className={cn("text-xl font-semibold mb-1", isDark ? "text-white" : "text-gray-900")}>
                  Daily Check-in
                </h2>
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                  Track your progress for today ({new Date().toLocaleDateString()})
                </p>
              </div>
              <div className="mt-2 md:mt-0 flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-700")}>Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                    <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-700")}>Missed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-gray-300"></span>
                    <span className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-700")}>Not checked in</span>
                  </div>
                </div>
              </div>
            </div>

            {behaviours.length === 0 ? (
              <div className="text-center py-6">
                <p className={cn(isDark ? "text-gray-400" : "text-gray-500")}>
                  No behaviours found. Add behaviours to start tracking.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {behaviours.map((behaviour) => {
                  // Check if already checked in today
                  const today = new Date().toISOString().split("T")[0]
                  const todayCheckIn = behaviour.history?.find(
                    (entry) => new Date(entry.date).toISOString().split("T")[0] === today,
                  )

                  return (
                    <div
                      key={behaviour.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all duration-300",
                        todayCheckIn?.completed
                          ? isDark
                            ? "border-green-600/30 bg-green-900/10"
                            : "border-green-200 bg-green-50"
                          : todayCheckIn
                            ? isDark
                              ? "border-red-600/30 bg-red-900/10"
                              : "border-red-200 bg-red-50"
                            : isDark
                              ? "border-gray-700 bg-gray-800/30"
                              : "border-gray-200 bg-white",
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                            {behaviour.name}
                          </h3>
                          <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                            {behaviour.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            <Flame className={cn("w-4 h-4 mr-1", isDark ? "text-amber-400" : "text-amber-500")} />
                            <span className={cn("text-sm font-medium", isDark ? "text-amber-400" : "text-amber-600")}>
                              {behaviour.streak}
                            </span>
                          </div>
                        </div>
                      </div>

                      {todayCheckIn ? (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium flex items-center",
                                todayCheckIn.completed
                                  ? isDark
                                    ? "bg-green-900/30 text-green-400"
                                    : "bg-green-100 text-green-700"
                                  : isDark
                                    ? "bg-red-900/30 text-red-400"
                                    : "bg-red-100 text-red-700",
                              )}
                            >
                              {todayCheckIn.completed ? (
                                <>
                                  <Check size={12} className="mr-1" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <X size={12} className="mr-1" />
                                  Missed
                                </>
                              )}
                            </div>
                            <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                              {new Date(todayCheckIn.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {todayCheckIn.notes && (
                            <p className={cn("text-sm mt-1 p-2 rounded", isDark ? "bg-gray-800" : "bg-gray-50")}>
                              {todayCheckIn.notes}
                            </p>
                          )}
                          {todayCheckIn.missedReason && !todayCheckIn.completed && (
                            <div
                              className={cn(
                                "mt-1 p-2 rounded flex items-center gap-2",
                                isDark ? "bg-gray-800" : "bg-gray-50",
                              )}
                            >
                              <span className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                                Reason:
                              </span>
                              <span className={cn("text-sm", isDark ? "text-amber-400" : "text-amber-600")}>
                                {todayCheckIn.missedReason}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCheckIn(behaviour.id, true)}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-sm font-medium flex items-center",
                              isDark
                                ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                                : "bg-green-100 text-green-700 hover:bg-green-200",
                            )}
                          >
                            <Check size={16} className="mr-1.5" />
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleCheckIn(behaviour.id, false)}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-sm font-medium flex items-center",
                              isDark
                                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                : "bg-red-100 text-red-700 hover:bg-red-200",
                            )}
                          >
                            <X size={16} className="mr-1.5" />
                            Mark Missed
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Smart Suggestions */}
        <div className="mb-8">
          <SmartSuggestions behaviours={behaviours} isDark={isDark} onAddBehaviour={handleAddSuggestedBehaviour} />
        </div>

        {/* Optimal Time Suggestions */}
        <div className="mb-8">
          <OptimalTimeSuggestions behaviours={behaviours} isDark={isDark} />
        </div>

        {/* Behavior Insights Dashboard */}
        <div className="mb-8">
          <BehaviorInsightsDashboard behaviours={behaviours} isDark={isDark} />
        </div>

        {/* Chart Section */}
        <div
          className={cn(
            "rounded-xl p-6 shadow-lg transition-all duration-300",
            isDark
              ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50"
              : "bg-white border border-gray-200",
          )}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h3 className={cn("text-lg font-medium mb-3", isDark ? "text-white" : "text-gray-900")}>
                Behavior Streak Progression
              </h3>
              <p className={cn("text-sm mb-3", isDark ? "text-gray-400" : "text-gray-500")}>
                Track how your streaks have developed over time
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Time range filter */}
              <div className="flex items-center">
                <label htmlFor="timeRange" className={cn("mr-2 text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                  Time Range:
                </label>
                <select
                  id="timeRange"
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as DateRange)}
                  className={cn(
                    "text-sm rounded-md border px-2 py-1",
                    isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900",
                  )}
                >
                  <option value="7days">7 Days</option>
                  <option value="30days">30 Days</option>
                </select>
              </div>

              {/* Behavior selection filter */}
              <div className="flex items-center">
                <Tag size={16} className={cn("mr-1", isDark ? "text-gray-400" : "text-gray-500")} />
                <select
                  value={selectedBehaviours.length === 1 ? selectedBehaviours[0].toString() : ""}
                  onChange={(e) => {
                    const id = Number.parseInt(e.target.value)
                    if (id) {
                      setSelectedBehaviours([id])
                    }
                  }}
                  className={cn(
                    "text-sm rounded-md border px-2 py-1",
                    isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900",
                  )}
                >
                  <option value="">Select Behavior</option>
                  {behaviours.map((behaviour) => (
                    <option key={behaviour.id} value={behaviour.id}>
                      {behaviour.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[400px] relative">
            {behaviours.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                  No behaviours found. Add behaviours to start tracking.
                </p>
              </div>
            ) : filteredBehaviours.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                  Please select a behavior to view streak data
                </p>
              </div>
            ) : (
              <div className="relative z-10 p-4 h-full">
                <Bar options={chartOptions} data={generateChartData()} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t flex justify-between items-center">
          <div className="flex items-center gap-2">
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
                    : "bg-white text-gray-900"
                  : isDark
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-800",
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
                    : "bg-white text-gray-900"
                  : isDark
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-800",
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
                    : "bg-white text-gray-900"
                  : isDark
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-800",
              )}
              aria-label="Dark theme"
            >
              <Moon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Missed Reason Modal */}
      {selectedBehaviourForMissedReason && (
        <MissedReasonModal
          isOpen={showMissedReasonModal}
          onClose={() => setShowMissedReasonModal(false)}
          onSubmit={handleMissedReasonSubmit}
          behaviourName={selectedBehaviourForMissedReason.name}
          isDark={isDark}
        />
      )}
    </div>
  )
}

// Custom Bar component for the chart
function ChartJSBar({ data, options }: { data: any; options: any }) {
  return <Bar data={data} options={options} />
}
