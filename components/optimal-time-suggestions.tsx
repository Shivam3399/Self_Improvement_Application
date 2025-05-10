"use client"

import { useState, useEffect } from "react"
import { Clock, Sun, Sunrise, Sunset, Moon, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Behaviour, TimePeriod } from "../types/behavior-types"
import { getOptimalTimePeriod } from "../utils/analytics-utils"

interface OptimalTimeSuggestionsProps {
  behaviours: Behaviour[]
  isDark: boolean
}

export default function OptimalTimeSuggestions({ behaviours, isDark }: OptimalTimeSuggestionsProps) {
  const [behavioursWithOptimalTimes, setBehavioursWithOptimalTimes] = useState<
    Array<{ behaviour: Behaviour; optimalTime: TimePeriod | null }>
  >([])

  useEffect(() => {
    // Analyze behaviors to find optimal times
    const analyzed = behaviours
      .map((behaviour) => ({
        behaviour,
        optimalTime: getOptimalTimePeriod(behaviour),
      }))
      .filter((item) => item.optimalTime !== null)
      .slice(0, 5) // Show top 5 behaviors with optimal times

    setBehavioursWithOptimalTimes(analyzed)
  }, [behaviours])

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

  if (behavioursWithOptimalTimes.length === 0) {
    return null
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
      <div className="flex items-center mb-4">
        <Clock className={cn("mr-2", isDark ? "text-blue-400" : "text-blue-500")} size={20} />
        <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
          Optimal Time Suggestions
        </h2>
      </div>

      <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-500")}>
        Based on your history, here are the best times to complete your behaviors:
      </p>

      <div className="space-y-3">
        {behavioursWithOptimalTimes.map(({ behaviour, optimalTime }) => {
          if (!optimalTime) return null
          const Icon = getTimePeriodIcon(optimalTime)

          return (
            <div
              key={behaviour.id}
              className={cn(
                "p-3 rounded-lg border flex items-center",
                isDark ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50",
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-full mr-3 flex-shrink-0",
                  isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600",
                )}
              >
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={cn("font-medium truncate", isDark ? "text-white" : "text-gray-900")}>
                  {behaviour.name}
                </h3>
                <div className="flex items-center">
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>Best time:</p>
                  <ArrowRight size={12} className={cn("mx-1", isDark ? "text-gray-500" : "text-gray-400")} />
                  <span className={cn("text-sm font-medium capitalize", isDark ? "text-blue-400" : "text-blue-600")}>
                    {optimalTime}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
