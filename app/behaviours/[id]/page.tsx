"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit2, Trash2, Check, X, AlertCircle, Calendar, Flame, Percent } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import StreakHistory from "@/components/streak-history"
import CheckInModal from "@/components/check-in-modal"

type ImprovementItem = {
  id: number
  text: string
  isEditing?: boolean
}

type Behaviour = {
  id: number
  name: string
  description: string
  streak: number
  lastCheckIn: string | null
  checkedInToday: boolean
  improvementItems: ImprovementItem[]
  history?: {
    date: string
    completed: boolean
    notes?: string
  }[]
}

export default function BehaviourDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const behaviourId = Number(params.id)

  const [isDark, setIsDark] = useState(false)
  const [behaviour, setBehaviour] = useState<Behaviour | null>(null)
  const [newItem, setNewItem] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"improvements" | "history">("improvements")
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false)
  const [checkInStatus, setCheckInStatus] = useState<{
    status: "success" | "error"
    message: string
  } | null>(null)

  // Check for dark mode on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "dark" | "light" | "system" | null
      if (savedTheme === "dark") {
        setIsDark(true)
      } else if (savedTheme === "system") {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
      }
    }

    // Load behaviours from localStorage
    if (typeof window !== "undefined") {
      const storedBehaviours = localStorage.getItem("behaviours")
      if (storedBehaviours) {
        try {
          const parsedBehaviours = JSON.parse(storedBehaviours)
          const foundBehaviour = parsedBehaviours.find((b: Behaviour) => b.id === behaviourId)
          if (foundBehaviour) {
            // Ensure improvementItems and history are always defined
            setBehaviour({
              ...foundBehaviour,
              improvementItems: foundBehaviour.improvementItems || [],
              history: foundBehaviour.history || [],
            })
            return
          }
        } catch (error) {
          console.error("Error parsing stored behaviours:", error)
        }
      }
    }

    // Fallback to mock data if not found in localStorage
    const mockBehaviours = [
      {
        id: 1,
        name: "Morning Meditation",
        description: "15 minutes of mindfulness to start the day",
        streak: 5,
        lastCheckIn: new Date(Date.now() - 86400000).toISOString(),
        checkedInToday: false,
        improvementItems: [
          { id: 1, text: "Try guided meditation for better focus" },
          { id: 2, text: "Meditate outdoors when weather permits" },
        ],
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
        lastCheckIn: new Date(Date.now() - 86400000).toISOString(),
        checkedInToday: false,
        improvementItems: [
          { id: 1, text: "Add strength training twice a week" },
          { id: 2, text: "Try HIIT workouts for efficiency" },
        ],
        history: [
          { date: new Date(Date.now() - 86400000).toISOString(), completed: true, notes: "Jogged for 35 minutes" },
          { date: new Date(Date.now() - 86400000 * 2).toISOString(), completed: true, notes: "HIIT workout" },
          { date: new Date(Date.now() - 86400000 * 3).toISOString(), completed: true },
          { date: new Date(Date.now() - 86400000 * 4).toISOString(), completed: true },
          { date: new Date(Date.now() - 86400000 * 5).toISOString(), completed: true },
        ],
      },
      // Add more mock behaviors if needed
    ]

    const foundBehaviour = mockBehaviours.find((b) => b.id === behaviourId)
    if (foundBehaviour) {
      setBehaviour(foundBehaviour)
    } else {
      // Redirect if behaviour not found
      router.push("/behaviours")
    }
  }, [behaviourId, router])

  // Reset check-in status message after 3 seconds
  useEffect(() => {
    if (checkInStatus) {
      const timer = setTimeout(() => {
        setCheckInStatus(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [checkInStatus])

  // Add a new improvement item
  const handleAddItem = () => {
    if (!newItem.trim()) {
      setError("Please enter an improvement item")
      return
    }

    setError("")
    if (behaviour) {
      const updatedBehaviour = {
        ...behaviour,
        improvementItems: [
          ...behaviour.improvementItems,
          {
            id: Date.now(),
            text: newItem.trim(),
          },
        ],
      }

      setBehaviour(updatedBehaviour)
      updateLocalStorage(updatedBehaviour)
      setNewItem("")
    }
  }

  // Delete an improvement item
  const handleDeleteItem = (itemId: number) => {
    if (behaviour) {
      const updatedBehaviour = {
        ...behaviour,
        improvementItems: behaviour.improvementItems.filter((item) => item.id !== itemId),
      }

      setBehaviour(updatedBehaviour)
      updateLocalStorage(updatedBehaviour)
    }
  }

  // Start editing an item
  const handleStartEdit = (itemId: number) => {
    if (behaviour) {
      setBehaviour({
        ...behaviour,
        improvementItems: behaviour.improvementItems.map((item) =>
          item.id === itemId ? { ...item, isEditing: true } : item,
        ),
      })
    }
  }

  // Save edited item
  const handleSaveEdit = (itemId: number, newText: string) => {
    if (!newText.trim()) {
      setError("Improvement item cannot be empty")
      return
    }

    setError("")
    if (behaviour) {
      const updatedBehaviour = {
        ...behaviour,
        improvementItems: behaviour.improvementItems.map((item) =>
          item.id === itemId ? { id: item.id, text: newText.trim() } : item,
        ),
      }

      setBehaviour(updatedBehaviour)
      updateLocalStorage(updatedBehaviour)
    }
  }

  // Cancel editing
  const handleCancelEdit = (itemId: number) => {
    if (behaviour) {
      setBehaviour({
        ...behaviour,
        improvementItems: behaviour.improvementItems.map((item) =>
          item.id === itemId ? { ...item, isEditing: false } : item,
        ),
      })
    }
  }

  // Handle check-in for a behavior
  const handleCheckIn = (completed: boolean, notes = "") => {
    if (!behaviour) return

    const today = new Date().toISOString().split("T")[0]

    // Check if already checked in today
    const todayCheckIn = behaviour.history?.find((entry) => new Date(entry.date).toISOString().split("T")[0] === today)

    if (todayCheckIn) {
      setCheckInStatus({
        status: "error",
        message: "Already checked in today",
      })
      return
    }

    // Calculate new streak
    let newStreak = behaviour.streak
    const lastCheckInDate = behaviour.lastCheckIn ? new Date(behaviour.lastCheckIn).toISOString().split("T")[0] : null
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
    }

    // Create new history entry
    const newHistory = behaviour.history ? [...behaviour.history] : []
    newHistory.unshift({
      date: new Date().toISOString(),
      completed,
      notes: notes.trim() || undefined,
    })

    // Update behavior
    const updatedBehaviour = {
      ...behaviour,
      streak: newStreak,
      lastCheckIn: new Date().toISOString(),
      checkedInToday: true,
      history: newHistory,
    }

    setBehaviour(updatedBehaviour)
    updateLocalStorage(updatedBehaviour)

    setCheckInStatus({
      status: "success",
      message: completed ? "Completed! Streak updated." : "Marked as missed.",
    })
  }

  // Update localStorage
  const updateLocalStorage = (updatedBehaviour: Behaviour) => {
    if (typeof window !== "undefined") {
      const storedBehaviours = localStorage.getItem("behaviours")
      if (storedBehaviours) {
        const parsedBehaviours = JSON.parse(storedBehaviours)
        const updatedBehaviours = parsedBehaviours.map((b: Behaviour) =>
          b.id === updatedBehaviour.id
            ? {
                ...updatedBehaviour,
                improvementItems: updatedBehaviour.improvementItems || [],
                history: updatedBehaviour.history || [],
              }
            : b,
        )
        localStorage.setItem("behaviours", JSON.stringify(updatedBehaviours))
      }
    }
  }

  // Calculate success rate
  const calculateSuccessRate = () => {
    if (!behaviour?.history || behaviour.history.length === 0) return 0

    const completedCount = behaviour.history.filter((entry) => entry.completed).length
    return Math.round((completedCount / behaviour.history.length) * 100)
  }

  if (!behaviour) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          isDark ? "bg-[#030303] text-white" : "bg-gray-50 text-gray-900",
        )}
      >
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  // Check if already checked in today
  const today = new Date().toISOString().split("T")[0]
  const todayCheckIn = behaviour.history?.find((entry) => new Date(entry.date).toISOString().split("T")[0] === today)
  const checkedInToday = !!todayCheckIn

  return (
    <div
      className={cn(
        "min-h-screen w-full p-4 md:p-8 transition-colors duration-500",
        isDark ? "bg-background text-foreground" : "bg-background text-foreground",
      )}
    >
      <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
        <div className="grid gap-8">
          {/* Header section with back button and title */}
          <header className="flex items-center">
            <Link
              href="/behaviours"
              className={cn(
                "mr-4 p-2 rounded-full transition-colors",
                isDark
                  ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700",
              )}
              aria-label="Back to behaviors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className={cn("text-2xl md:text-3xl font-bold", isDark ? "text-white" : "text-gray-900")}>
              {behaviour.name}
            </h1>
          </header>

          {/* Status message */}
          {checkInStatus && (
            <div
              className={cn(
                "p-4 rounded-lg flex items-center",
                checkInStatus.status === "success"
                  ? isDark
                    ? "bg-green-900/20 border border-green-800/30 text-green-400"
                    : "bg-green-100 border border-green-200 text-green-800"
                  : isDark
                    ? "bg-red-900/20 border border-red-800/30 text-red-400"
                    : "bg-red-100 border border-red-200 text-red-800",
              )}
            >
              {checkInStatus.status === "success" ? (
                <Check className="w-5 h-5 mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              )}
              <span className="font-medium">{checkInStatus.message}</span>
            </div>
          )}

          {/* Behavior summary card */}
          <section
            className={cn(
              "rounded-xl p-6 shadow-sm border",
              isDark ? "bg-card/50 border-border" : "bg-card border-border",
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <p className={cn("text-lg", isDark ? "text-gray-200" : "text-gray-700")}>{behaviour.description}</p>
                <div className="flex flex-wrap gap-3">
                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full",
                      isDark ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary",
                    )}
                  >
                    <Flame size={18} />
                    <span>Streak: {behaviour.streak} days</span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full",
                      isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600",
                    )}
                  >
                    <Percent size={18} />
                    <span>Success rate: {calculateSuccessRate()}%</span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full",
                      isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600",
                    )}
                  >
                    <Calendar size={18} />
                    <span>Days tracked: {behaviour.history?.length || 0}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsCheckInModalOpen(true)}
                disabled={checkedInToday}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
                  checkedInToday
                    ? isDark
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                    : isDark
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {checkedInToday ? (
                  <>
                    <Check size={18} />
                    <span>Checked in today</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Check-in today</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Tabs navigation */}
          <nav className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab("improvements")}
                className={cn(
                  "px-5 py-3 font-medium text-sm transition-colors relative",
                  activeTab === "improvements"
                    ? isDark
                      ? "text-primary border-b-2 border-primary"
                      : "text-primary border-b-2 border-primary"
                    : isDark
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                )}
              >
                Improvement Items
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "px-5 py-3 font-medium text-sm transition-colors relative",
                  activeTab === "history"
                    ? isDark
                      ? "text-primary border-b-2 border-primary"
                      : "text-primary border-b-2 border-primary"
                    : isDark
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                )}
              >
                Check-in History
              </button>
            </div>
          </nav>

          {/* Tab content */}
          <div className="pt-2">
            {activeTab === "improvements" ? (
              <div className="space-y-6">
                {/* Add new item form */}
                <section
                  className={cn("p-5 rounded-xl border", isDark ? "bg-card/50 border-border" : "bg-card border-border")}
                >
                  <h3 className={cn("text-base font-medium mb-4", isDark ? "text-foreground" : "text-foreground")}>
                    Add New Improvement Item
                  </h3>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="Enter a way to improve this behaviour..."
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-colors",
                        isDark
                          ? "bg-background border-input text-foreground focus:ring-primary/50"
                          : "bg-background border-input text-foreground focus:ring-primary/30",
                      )}
                    />
                    <button
                      onClick={handleAddItem}
                      className={cn(
                        "px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap",
                        isDark
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground",
                      )}
                    >
                      <Plus size={18} />
                      <span>Add</span>
                    </button>
                  </div>

                  {error && (
                    <div className="mt-3 text-destructive text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                </section>

                {/* Improvement items list */}
                {behaviour.improvementItems && behaviour.improvementItems.length > 0 ? (
                  <ul className="space-y-4">
                    {behaviour.improvementItems.map((item) => (
                      <li
                        key={item.id}
                        className={cn(
                          "p-5 rounded-xl border",
                          isDark ? "bg-card/50 border-border" : "bg-card border-border",
                        )}
                      >
                        {item.isEditing ? (
                          <div className="flex flex-col gap-3">
                            <input
                              type="text"
                              defaultValue={item.text}
                              id={`edit-item-${item.id}`}
                              className={cn(
                                "w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-colors",
                                isDark
                                  ? "bg-background border-input text-foreground focus:ring-primary/50"
                                  : "bg-background border-input text-foreground focus:ring-primary/30",
                              )}
                            />
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => handleCancelEdit(item.id)}
                                className={cn(
                                  "px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors",
                                  isDark
                                    ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
                                )}
                              >
                                <X size={16} />
                                <span>Cancel</span>
                              </button>
                              <button
                                onClick={() => {
                                  const input = document.getElementById(`edit-item-${item.id}`) as HTMLInputElement
                                  handleSaveEdit(item.id, input.value)
                                }}
                                className={cn(
                                  "px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors",
                                  isDark
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-green-500 hover:bg-green-600 text-white",
                                )}
                              >
                                <Check size={16} />
                                <span>Save</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <p className={cn("text-base", isDark ? "text-gray-200" : "text-gray-700")}>{item.text}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartEdit(item.id)}
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  isDark
                                    ? "text-gray-400 hover:bg-gray-700 hover:text-white"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
                                )}
                                aria-label="Edit item"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  isDark
                                    ? "text-gray-400 hover:bg-red-900/50 hover:text-red-300"
                                    : "text-gray-500 hover:bg-red-100 hover:text-red-600",
                                )}
                                aria-label="Delete item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={cn("text-center py-12 rounded-xl", isDark ? "bg-muted/50" : "bg-muted/50")}>
                    <p className={cn("text-lg", isDark ? "text-muted-foreground" : "text-muted-foreground")}>
                      No improvement items yet. Add your first one above!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <section
                  className={cn("p-5 rounded-xl border", isDark ? "bg-card/50 border-border" : "bg-card border-border")}
                >
                  <h3 className={cn("text-base font-medium mb-5", isDark ? "text-gray-200" : "text-gray-700")}>
                    Check-in History
                  </h3>

                  <StreakHistory history={behaviour.history || []} isDark={isDark} />
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onSubmit={handleCheckIn}
        behaviourName={behaviour.name}
        behaviourDescription={behaviour.description}
        isDark={isDark}
      />
    </div>
  )
}
