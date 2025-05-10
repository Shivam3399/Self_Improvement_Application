"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CalendarDays, Check, X, Info } from "lucide-react"

interface CheckInHistory {
  date: string
  completed: boolean
  notes?: string
}

interface StreakHistoryProps {
  history: CheckInHistory[]
  isDark: boolean
}

export default function StreakHistory({ history, isDark }: StreakHistoryProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  // Group by month
  const groupedByMonth: Record<string, CheckInHistory[]> = {}

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Group entries by month
  sortedHistory.forEach((entry) => {
    const date = new Date(entry.date)
    const monthKey = date.toLocaleDateString("en-US", { year: "numeric", month: "long" })

    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = []
    }

    groupedByMonth[monthKey].push(entry)
  })

  if (history.length === 0) {
    return (
      <div className={cn("text-center py-6", isDark ? "text-gray-400" : "text-gray-500")}>
        <CalendarDays className="mx-auto mb-2 opacity-50" size={36} />
        <p>No history available yet.</p>
        <p className="text-sm mt-1">Start checking in to build your streak history.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedByMonth).map(([month, entries]) => (
        <div key={month}>
          <h3 className={cn("text-sm font-medium mb-3", isDark ? "text-gray-300" : "text-gray-700")}>{month}</h3>

          <div className="space-y-2">
            {entries.map((entry) => {
              const date = new Date(entry.date)
              const dateStr = date.toLocaleDateString()
              const isExpanded = expandedDay === dateStr

              return (
                <div
                  key={dateStr}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    entry.completed
                      ? isDark
                        ? "border-green-800/30 bg-green-900/10"
                        : "border-green-200 bg-green-50"
                      : isDark
                        ? "border-red-800/30 bg-red-900/10"
                        : "border-red-200 bg-red-50",
                    isExpanded && "ring-2",
                    isExpanded && entry.completed
                      ? isDark
                        ? "ring-green-500/30"
                        : "ring-green-300"
                      : isExpanded
                        ? isDark
                          ? "ring-red-500/30"
                          : "ring-red-300"
                        : "",
                  )}
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setExpandedDay(isExpanded ? null : dateStr)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          entry.completed
                            ? isDark
                              ? "bg-green-800/50 text-green-400"
                              : "bg-green-200 text-green-700"
                            : isDark
                              ? "bg-red-800/50 text-red-400"
                              : "bg-red-200 text-red-700",
                        )}
                      >
                        {entry.completed ? <Check size={16} /> : <X size={16} />}
                      </div>
                      <div>
                        <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{dateStr}</p>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className={cn("p-1 rounded-full", isDark ? "text-gray-400" : "text-gray-500")}>
                        <Info size={16} />
                      </div>
                    )}
                  </div>

                  {isExpanded && entry.notes && (
                    <div className={cn("mt-3 p-3 rounded-lg text-sm", isDark ? "bg-gray-800" : "bg-white")}>
                      {entry.notes}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
