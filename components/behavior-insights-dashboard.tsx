"use client"

import { useState } from "react"
import { BarChart2, Filter, TrendingUp, AlertTriangle, Calendar, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Behaviour, BehaviorCategory } from "../types/behavior-types"
import {
  calculateSuccessRate,
  getMostImprovedBehavior,
  getMostSkippedBehavior,
  getTopMissedReasons,
} from "../utils/analytics-utils"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
} from "chart.js"
import { Bar } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend, BarController)

interface BehaviorInsightsDashboardProps {
  behaviours: Behaviour[]
  isDark: boolean
}

export default function BehaviorInsightsDashboard({ behaviours, isDark }: BehaviorInsightsDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<BehaviorCategory | "all">("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState<"7days" | "30days">("30days")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Get all unique tags from behaviors
  const allTags = Array.from(new Set(behaviours.flatMap((b) => b.tags || []).filter(Boolean)))

  // Get all unique categories from behaviors
  const allCategories = Array.from(new Set(behaviours.map((b) => b.category).filter(Boolean) as BehaviorCategory[]))

  // Filter behaviors based on selected filters
  const filteredBehaviours = behaviours.filter((behaviour) => {
    if (selectedCategory !== "all" && behaviour.category !== selectedCategory) {
      return false
    }

    if (selectedTag && (!behaviour.tags || !behaviour.tags.includes(selectedTag))) {
      return false
    }

    return true
  })

  // Get top missed reasons
  const topMissedReasons = getTopMissedReasons(filteredBehaviours)

  // Generate chart data
  const generateChartData = () => {
    const days = selectedTimeRange === "7days" ? 7 : 30
    const labels = []
    const datasets = []

    // For 30 days view, we'll group by weeks instead of showing every day
    const groupByWeeks = selectedTimeRange === "30days"

    if (groupByWeeks) {
      // Generate 4 week labels for the x-axis
      const today = new Date()
      for (let i = 4; i > 0; i--) {
        const endDate = new Date(today)
        endDate.setDate(today.getDate() - (i - 1) * 7)

        const startDate = new Date(endDate)
        startDate.setDate(endDate.getDate() - 6)

        labels.push(
          `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        )
      }

      // Generate completion data for each behavior grouped by weeks
      const completionData = filteredBehaviours.map((behaviour) => {
        const data = []

        for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
          let completedCount = 0
          let totalDaysInWeek = 0

          // Calculate for each day in the week
          for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const dayIndex = weekIndex * 7 + dayOffset
            if (dayIndex < 30) {
              // Ensure we don't go beyond 30 days
              const date = new Date(today)
              date.setDate(date.getDate() - (29 - dayIndex)) // Count from 29 days ago to today
              const formattedDate = date.toISOString().split("T")[0]

              // Find check-in for this date
              const checkIn = behaviour.history?.find(
                (entry) => new Date(entry.date).toISOString().split("T")[0] === formattedDate,
              )

              if (checkIn) {
                if (checkIn.completed) completedCount++
                totalDaysInWeek++
              } else if (dayIndex <= today.getDate() - 1) {
                // Only count past days
                totalDaysInWeek++
              }
            }
          }

          // Calculate completion rate for the week (or 0 if no data)
          const weeklyRate = totalDaysInWeek > 0 ? completedCount / totalDaysInWeek : 0
          data.push(Number.parseFloat(weeklyRate.toFixed(2)))
        }

        return {
          label: behaviour.name,
          data,
          backgroundColor: getRandomColor(behaviour.id),
        }
      })

      return {
        labels,
        datasets: completionData,
      }
    } else {
      // Original code for 7 days and 90 days views
      // Generate dates for x-axis
      const today = new Date()
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

      // Generate completion data for each behavior
      const completionData = filteredBehaviours.map((behaviour) => {
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
          backgroundColor: getRandomColor(behaviour.id),
        }
      })

      return {
        labels,
        datasets: completionData,
      }
    }
  }

  // Generate a random color based on behavior ID
  const getRandomColor = (id: number) => {
    const colors = [
      "#8b5cf6", // Purple
      "#f97316", // Orange
      "#06b6d4", // Cyan
      "#ec4899", // Pink
      "#10b981", // Emerald
      "#ef4444", // Red
      "#3b82f6", // Blue
      "#f59e0b", // Amber
    ]

    return colors[id % colors.length]
  }

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: selectedTimeRange === "30days" ? 1 : 1,
        ticks: {
          stepSize: selectedTimeRange === "30days" ? 0.2 : 1,
          callback: (value: any) => {
            if (selectedTimeRange === "30days") {
              return Math.round(value * 100) + "%"
            } else {
              return value === 1 ? "Completed" : "Missed"
            }
          },
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
          label: (context: any) => {
            if (selectedTimeRange === "30days") {
              return `${context.dataset.label}: ${Math.round(context.raw * 100)}% completion rate`
            } else {
              return context.raw === 1 ? "Completed" : "Missed"
            }
          },
        },
      },
    },
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
          <div className="flex items-center">
            <BarChart2 className={cn("mr-2", isDark ? "text-indigo-400" : "text-indigo-600")} size={20} />
            <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
              Behavior Insights Dashboard
            </h2>
          </div>
          <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
            Analyze your behavior patterns and identify areas for improvement
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Time range filter */}
          <div className="flex items-center">
            <Calendar size={16} className={cn("mr-1", isDark ? "text-gray-400" : "text-gray-500")} />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className={cn(
                "text-sm rounded-md border px-2 py-1",
                isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900",
              )}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>
          </div>

          {/* Category filter */}
          {allCategories.length > 0 && (
            <div className="flex items-center">
              <Filter size={16} className={cn("mr-1", isDark ? "text-gray-400" : "text-gray-500")} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className={cn(
                  "text-sm rounded-md border px-2 py-1",
                  isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900",
                )}
              >
                <option value="all">All Categories</option>
                {allCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex items-center">
              <Tag size={16} className={cn("mr-1", isDark ? "text-gray-400" : "text-gray-500")} />
              <select
                value={selectedTag || ""}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className={cn(
                  "text-sm rounded-md border px-2 py-1",
                  isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900",
                )}
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Behavior completion chart */}
      <div className="mb-6">
        <h3 className={cn("text-lg font-medium mb-3", isDark ? "text-white" : "text-gray-900")}>
          Behavior Completion Chart
        </h3>

        <div className="h-80 relative">
          <div
            className={cn(
              "absolute inset-0 rounded-lg",
              isDark
                ? "bg-gradient-to-b from-gray-800/50 to-gray-900/50"
                : "bg-gradient-to-b from-gray-50/50 to-white/50",
            )}
          ></div>

          {filteredBehaviours.length > 0 ? (
            <div className="relative z-10 p-4 h-full">
              <Bar options={chartOptions} data={generateChartData()} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                No behaviors match the selected filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success rates */}
      <div className="mb-6">
        <h3 className={cn("text-lg font-medium mb-3", isDark ? "text-white" : "text-gray-900")}>Success Rates</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBehaviours.map((behaviour) => {
            const successRate = calculateSuccessRate(behaviour)

            return (
              <div
                key={behaviour.id}
                className={cn(
                  "p-4 rounded-lg border",
                  isDark ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50",
                )}
              >
                <h4 className={cn("font-medium mb-2 truncate", isDark ? "text-white" : "text-gray-900")}>
                  {behaviour.name}
                </h4>

                <div className="flex justify-between items-center mb-2">
                  <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>Success Rate</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      successRate >= 70
                        ? isDark
                          ? "text-green-400"
                          : "text-green-600"
                        : successRate >= 40
                          ? isDark
                            ? "text-amber-400"
                            : "text-amber-600"
                          : isDark
                            ? "text-red-400"
                            : "text-red-600",
                    )}
                  >
                    {successRate}%
                  </span>
                </div>

                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      successRate >= 70 ? "bg-green-500" : successRate >= 40 ? "bg-amber-500" : "bg-red-500",
                    )}
                    style={{ width: `${successRate}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Most improved and most skipped */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className={cn("text-lg font-medium mb-3", isDark ? "text-white" : "text-gray-900")}>
            Most Improved Behavior
          </h3>

          {getMostImprovedBehavior(filteredBehaviours) ? (
            <div
              className={cn(
                "p-4 rounded-lg border",
                isDark ? "bg-green-900/10 border-green-800/30" : "bg-green-50 border-green-200",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-600",
                  )}
                >
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {getMostImprovedBehavior(filteredBehaviours)?.name}
                  </h4>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    Showing the most improvement in the recent period
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
              No improvement data available yet.
            </div>
          )}
        </div>

        <div>
          <h3 className={cn("text-lg font-medium mb-3", isDark ? "text-white" : "text-gray-900")}>
            Most Skipped Behavior
          </h3>

          {getMostSkippedBehavior(filteredBehaviours) ? (
            <div
              className={cn(
                "p-4 rounded-lg border",
                isDark ? "bg-amber-900/10 border-amber-800/30" : "bg-amber-50 border-amber-200",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-600",
                  )}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {getMostSkippedBehavior(filteredBehaviours)?.name}
                  </h4>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    Needs attention - most frequently missed
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
              No missed behavior data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Common missed reasons */}
      {topMissedReasons.length > 0 && (
        <div>
          <h3 className={cn("text-lg font-medium mb-3", isDark ? "text-white" : "text-gray-900")}>
            Common Missed Reasons
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topMissedReasons.map(({ reason, count }) => (
              <div
                key={reason}
                className={cn(
                  "p-4 rounded-lg border",
                  isDark ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50",
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{reason}</h4>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700",
                    )}
                  >
                    {count} times
                  </span>
                </div>

                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                  This is one of your most common reasons for missing behaviors
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
