"use client"

import { useState, useEffect } from "react"
import { Clock, Sun, Sunrise, Sunset, Moon, ChevronRight, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentTimePeriod, formatTime, getGreeting, type TimePeriod } from "../utils/time-utils"

// Define suggested behaviours for each time period
const timePeriodBehaviours = {
  morning: [
    { id: "m1", name: "Morning Meditation", description: "Start your day with 10 minutes of mindfulness", icon: Sun },
    { id: "m2", name: "Drink Water", description: "Hydrate with a glass of water after waking up", icon: Sun },
    { id: "m3", name: "Morning Exercise", description: "Energize with a quick 15-minute workout", icon: Sun },
    { id: "m4", name: "Healthy Breakfast", description: "Fuel your day with a nutritious breakfast", icon: Sun },
  ],
  afternoon: [
    { id: "a1", name: "Midday Walk", description: "Take a short walk to refresh your mind", icon: Sun },
    { id: "a2", name: "Healthy Lunch", description: "Enjoy a balanced meal for sustained energy", icon: Sun },
    { id: "a3", name: "Water Break", description: "Stay hydrated throughout the day", icon: Sun },
    { id: "a4", name: "Posture Check", description: "Adjust your posture if you've been sitting", icon: Sun },
  ],
  evening: [
    { id: "e1", name: "Evening Exercise", description: "Complete your daily physical activity goal", icon: Sunset },
    { id: "e2", name: "Dinner Preparation", description: "Prepare a nutritious evening meal", icon: Sunset },
    { id: "e3", name: "Review Goals", description: "Check your progress on today's goals", icon: Sunset },
    { id: "e4", name: "Family Time", description: "Connect with loved ones", icon: Sunset },
  ],
  night: [
    { id: "n1", name: "Reading Time", description: "Read for 30 minutes before bed", icon: Moon },
    { id: "n2", name: "Set Alarm", description: "Prepare your alarm for tomorrow", icon: Moon },
    { id: "n3", name: "Sleep Routine", description: "Aim for 7-8 hours of quality sleep", icon: Moon },
    { id: "n4", name: "Digital Detox", description: "Put away screens 30 minutes before bed", icon: Moon },
  ],
}

interface TimeBasedSuggestionsProps {
  isDark: boolean
  onAddBehaviour: (name: string, description: string) => void
}

export default function TimeBasedSuggestions({ isDark, onAddBehaviour }: TimeBasedSuggestionsProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(getCurrentTimePeriod())
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | null>(null)

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      setTimePeriod(getCurrentTimePeriod())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Set the current time period as selected by default
  useEffect(() => {
    if (!selectedPeriod) {
      setSelectedPeriod(timePeriod)
    }
  }, [timePeriod, selectedPeriod])

  const getTimePeriodIcon = (period: TimePeriod) => {
    switch (period) {
      case "morning":
        return Sunrise
      case "afternoon":
        return Sun
      case "evening":
        return Sunset
      case "night":
        return Moon
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl p-6 shadow-lg transition-all duration-300",
        isDark
          ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50"
          : "bg-white border border-gray-200",
      )}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <Clock className={isDark ? "text-indigo-400" : "text-indigo-600"} size={20} />
            <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
              Time-Based Suggestions
            </h2>
          </div>
          <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
            {getGreeting(timePeriod)}, it's {formatTime(currentTime)}
          </p>
        </div>

        <div className="flex space-x-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
          {(["morning", "afternoon", "evening", "night"] as TimePeriod[]).map((period) => {
            const Icon = getTimePeriodIcon(period)
            return (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors",
                  selectedPeriod === period
                    ? isDark
                      ? "bg-gray-700 text-white"
                      : "bg-white shadow-sm text-gray-900"
                    : isDark
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-600 hover:text-gray-900",
                )}
              >
                <Icon size={14} />
                <span className="capitalize">{period}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedPeriod &&
          timePeriodBehaviours[selectedPeriod].map((behaviour) => (
            <div
              key={behaviour.id}
              className={cn(
                "p-4 rounded-lg border flex items-start gap-3 group hover:shadow-md transition-all",
                isDark ? "border-gray-700 hover:bg-gray-800/50" : "border-gray-200 hover:bg-gray-50",
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-full",
                  isDark ? "bg-indigo-900/30 text-indigo-400" : "bg-indigo-100 text-indigo-600",
                )}
              >
                <behaviour.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{behaviour.name}</h3>
                <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                  {behaviour.description}
                </p>
              </div>
              <button
                onClick={() => onAddBehaviour(behaviour.name, behaviour.description)}
                className={cn(
                  "self-center p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                  isDark ? "text-indigo-400 hover:bg-gray-700" : "text-indigo-600 hover:bg-gray-200",
                )}
                aria-label={`Add ${behaviour.name} to your behaviours`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
      </div>

      {timePeriod === "night" && (
        <div
          className={cn(
            "mt-6 p-4 rounded-lg border flex items-center gap-3",
            isDark ? "border-amber-800/30 bg-amber-900/10" : "border-amber-200 bg-amber-50",
          )}
        >
          <div
            className={cn(
              "p-2 rounded-full flex-shrink-0",
              isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-600",
            )}
          >
            <Bell size={20} />
          </div>
          <div>
            <h3 className={cn("font-medium", isDark ? "text-amber-300" : "text-amber-800")}>Prepare for tomorrow</h3>
            <p className={cn("text-sm mt-1", isDark ? "text-amber-400/70" : "text-amber-700/70")}>
              Set your alarm, prepare your clothes, and plan your morning routine for a productive start.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
