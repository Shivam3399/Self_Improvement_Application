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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={cn(
          "w-full max-w-md rounded-xl shadow-2xl",
          isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200",
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
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about today's check-in..."
              className={cn(
                "w-full h-24 px-3 py-2 rounded-lg border focus:ring-2 outline-none transition-colors",
                isDark
                  ? "bg-gray-800 border-gray-700 focus:ring-indigo-500/50 text-white"
                  : "bg-white border-gray-300 focus:ring-indigo-500/30 text-gray-900",
              )}
            ></textarea>
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
              onClick={handleSubmit}
              disabled={!selected}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                selected === "completed"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : selected === "missed"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : isDark
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-200 text-gray-500",
                !selected && "cursor-not-allowed",
              )}
            >
              Submit Check-in
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
