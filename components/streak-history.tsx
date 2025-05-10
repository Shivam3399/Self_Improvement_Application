"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

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
      <div className="text-center py-8">
        <p className={isDark ? "text-muted-foreground" : "text-muted-foreground"}>No check-in history yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedByMonth).map(([month, entries], index) => (
        <div key={month}>
          <h3 className={cn("text-sm font-medium mb-3", isDark ? "text-gray-300" : "text-gray-700")}>{month}</h3>

          <div className="space-y-2">
            {entries.map((entry, index) => {
              const date = new Date(entry.date)
              const dateStr = date.toLocaleDateString()
              const isExpanded = expandedDay === dateStr

              return (
                <div
                  key={index}
                  className={cn(
                    "w-10 h-10 rounded-md flex items-center justify-center text-sm relative",
                    entry.completed
                      ? isDark
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-primary/20 text-primary border border-primary/30"
                      : isDark
                        ? "bg-destructive/20 text-destructive border border-destructive/30"
                        : "bg-destructive/20 text-destructive border border-destructive/30",
                    !entry.completed && "opacity-80",
                  )}
                >
                  <div
                    className={cn(
                      "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap z-10",
                      isDark ? "bg-popover text-popover-foreground" : "bg-popover text-popover-foreground",
                      "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                    )}
                  >
                    {dateStr}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
