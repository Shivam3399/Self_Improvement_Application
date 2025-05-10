"use client"

import { useState, useEffect } from "react"
import { Lightbulb, Plus, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Behaviour, PREDEFINED_SUGGESTIONS } from "../types/behavior-types"
import { generateBehaviorSuggestions } from "../utils/analytics-utils"

interface SmartSuggestionsProps {
  behaviours: Behaviour[]
  isDark: boolean
  onAddBehaviour: (behaviour: Behaviour) => void
}

export default function SmartSuggestions({ behaviours, isDark, onAddBehaviour }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Behaviour[]>([])

  useEffect(() => {
    // Generate suggestions based on user's behavior history
    const newSuggestions = generateBehaviorSuggestions(behaviours, PREDEFINED_SUGGESTIONS)
    setSuggestions(newSuggestions)
  }, [behaviours])

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
        <Lightbulb className={cn("mr-2", isDark ? "text-amber-400" : "text-amber-500")} size={20} />
        <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>Smart Suggestions</h2>
      </div>

      <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-500")}>
        Based on your behavior patterns, we think these might be helpful additions:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={cn(
              "p-4 rounded-lg border transition-all duration-300 hover:shadow-md",
              isDark ? "border-gray-700 hover:bg-gray-800/50" : "border-gray-200 hover:bg-gray-50",
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{suggestion.name}</h3>
              {suggestion.optimalTimePeriod && (
                <div
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs flex items-center",
                    isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700",
                  )}
                >
                  <Clock size={12} className="mr-1" />
                  <span className="capitalize">{suggestion.optimalTimePeriod}</span>
                </div>
              )}
            </div>

            <p className={cn("text-sm mb-3", isDark ? "text-gray-400" : "text-gray-500")}>{suggestion.description}</p>

            {suggestion.tags && suggestion.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {suggestion.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-700",
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => onAddBehaviour(suggestion)}
              className={cn(
                "w-full mt-2 flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isDark
                  ? "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
              )}
            >
              <Plus size={16} />
              <span>Add to My Behaviors</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
