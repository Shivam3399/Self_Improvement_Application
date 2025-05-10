"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentTimePeriod, type TimePeriod } from "../utils/time-utils"

interface TimeNotificationProps {
  isDark: boolean
}

// Define notifications for different time periods
const timeNotifications: Record<TimePeriod, { title: string; message: string }> = {
  morning: {
    title: "Morning Routine",
    message: "Start your day with meditation, hydration, and a healthy breakfast.",
  },
  afternoon: {
    title: "Midday Check-in",
    message: "Take a break, stretch, and stay hydrated throughout the afternoon.",
  },
  evening: {
    title: "Evening Activities",
    message: "Complete your daily exercise and prepare for a relaxing evening.",
  },
  night: {
    title: "Bedtime Routine",
    message: "Wind down with reading, set your alarm, and prepare for quality sleep.",
  },
}

export default function TimeNotification({ isDark }: TimeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(getCurrentTimePeriod())
  const [lastShownPeriod, setLastShownPeriod] = useState<TimePeriod | null>(null)

  useEffect(() => {
    // Check time period every minute
    const timer = setInterval(() => {
      const currentPeriod = getCurrentTimePeriod()
      setTimePeriod(currentPeriod)

      // Show notification when time period changes
      if (currentPeriod !== lastShownPeriod) {
        setIsVisible(true)
        setLastShownPeriod(currentPeriod)

        // Store in localStorage to persist across page refreshes
        localStorage.setItem("lastShownTimePeriod", currentPeriod)
      }
    }, 60000)

    // Check if we should show notification on initial load
    const storedLastShownPeriod = localStorage.getItem("lastShownTimePeriod") as TimePeriod | null
    const currentPeriod = getCurrentTimePeriod()

    if (currentPeriod !== storedLastShownPeriod) {
      setIsVisible(true)
      setLastShownPeriod(currentPeriod)
      localStorage.setItem("lastShownTimePeriod", currentPeriod)
    }

    return () => clearInterval(timer)
  }, [lastShownPeriod])

  if (!isVisible) return null

  const notification = timeNotifications[timePeriod]

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-slide-up">
      <div
        className={cn(
          "rounded-lg shadow-lg p-4 border",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-start">
          <div
            className={cn(
              "p-2 rounded-full mr-3 flex-shrink-0",
              isDark ? "bg-indigo-900/30 text-indigo-400" : "bg-indigo-100 text-indigo-600",
            )}
          >
            <Bell size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{notification.title}</h3>
              <button
                onClick={() => setIsVisible(false)}
                className={cn(
                  "p-1 rounded-full -mt-1 -mr-1",
                  isDark ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100",
                )}
              >
                <X size={16} />
              </button>
            </div>
            <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{notification.message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
