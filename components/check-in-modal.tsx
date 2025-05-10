"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckInModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (completed: boolean, notes: string) => void
  behaviourName: string
  behaviourDescription: string
  isDark: boolean
}

export default function CheckInModal({
  isOpen,
  onClose,
  onSubmit,
  behaviourName,
  behaviourDescription,
  isDark,
}: CheckInModalProps) {
  const [notes, setNotes] = useState("")
  const [selected, setSelected] = useState<"completed" | "missed" | null>(null)

  const handleSubmit = () => {
    if (selected) {
      onSubmit(selected === "completed", notes)
      setNotes("")
      setSelected(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        isDark ? "bg-background/80" : "bg-background/80",
      )}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={cn(
          "w-full max-w-md rounded-lg border shadow-lg",
          isDark ? "bg-card border-border" : "bg-card border-border",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex justify-between items-center border-b">
          <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
            Check-in: {behaviourName}
          </h2>
          <button
            onClick={onClose}
            className={cn(
              "p-1 rounded-full",
              isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500",
            )}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-500")}>{behaviourDescription}</p>

          <div className="mb-4">
            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
              How did it go today?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelected("completed")}
                className={cn(
                  "p-4 rounded-lg border flex items-center gap-3 transition-all",
                  selected === "completed"
                    ? isDark
                      ? "bg-green-900/30 border-green-700 ring-2 ring-green-500/50"
                      : "bg-green-50 border-green-300 ring-2 ring-green-500/30"
                    : isDark
                      ? "border-gray-700 hover:bg-gray-800"
                      : "border-gray-200 hover:bg-gray-50",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    selected === "completed"
                      ? isDark
                        ? "bg-green-500 text-white"
                        : "bg-green-500 text-white"
                      : isDark
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-100 text-gray-500",
                  )}
                >
                  <Check size={24} />
                </div>
                <div className="text-left">
                  <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>Completed</p>
                  <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                    I completed this behavior today
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSelected("missed")}
                className={cn(
                  "p-4 rounded-lg border flex items-center gap-3 transition-all",
                  selected === "missed"
                    ? isDark
                      ? "bg-red-900/30 border-red-700 ring-2 ring-red-500/50"
                      : "bg-red-50 border-red-300 ring-2 ring-red-500/30"
                    : isDark
                      ? "border-gray-700 hover:bg-gray-800"
                      : "border-gray-200 hover:bg-gray-50",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    selected === "missed"
                      ? isDark
                        ? "bg-red-500 text-white"
                        : "bg-red-500 text-white"
                      : isDark
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-100 text-gray-500",
                  )}
                >
                  <X size={24} />
                </div>
                <div className="text-left">
                  <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>Missed</p>
                  <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                    I missed this behavior today
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="notes"
              className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}
            >
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about today's progress..."
              rows={3}
              className={cn(
                "w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors",
                isDark
                  ? "bg-background border-input text-foreground focus:ring-primary/50"
                  : "bg-background border-input text-foreground focus:ring-primary/30",
              )}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700",
              )}
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(true, notes)}
              className={cn(
                "px-4 py-2 rounded-md flex-1 flex items-center justify-center gap-1 transition-colors",
                isDark
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground",
              )}
            >
              <Check size={16} />
              <span>Completed</span>
            </button>

            <button
              onClick={() => onSubmit(false, notes)}
              className={cn(
                "px-4 py-2 rounded-md flex-1 flex items-center justify-center gap-1 transition-colors",
                isDark
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
              )}
            >
              <X size={16} />
              <span>Missed</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
