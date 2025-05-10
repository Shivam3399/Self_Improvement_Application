"use client"

import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEFAULT_MISSED_REASONS } from "../types/behavior-types"

interface MissedReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, customReason?: string) => void
  behaviourName: string
  isDark: boolean
}

export default function MissedReasonModal({
  isOpen,
  onClose,
  onSubmit,
  behaviourName,
  isDark,
}: MissedReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [customReason, setCustomReason] = useState("")

  const handleSubmit = () => {
    if (selectedReason) {
      if (selectedReason === "other" && customReason.trim()) {
        onSubmit(selectedReason, customReason.trim())
      } else if (selectedReason !== "other") {
        onSubmit(selectedReason)
      }
      setSelectedReason(null)
      setCustomReason("")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-xl shadow-2xl",
          isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex justify-between items-center border-b">
          <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
            Why did you miss: {behaviourName}?
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
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className={cn(isDark ? "text-amber-400" : "text-amber-600")} size={20} />
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
              Understanding why you missed this behavior can help improve your habits.
            </p>
          </div>

          <div className="mb-4">
            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
              Select a reason:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_MISSED_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={cn(
                    "p-3 rounded-lg border flex items-center gap-2 transition-all text-left",
                    selectedReason === reason.id
                      ? isDark
                        ? "bg-amber-900/30 border-amber-700 ring-2 ring-amber-500/50"
                        : "bg-amber-50 border-amber-300 ring-2 ring-amber-500/30"
                      : isDark
                        ? "border-gray-700 hover:bg-gray-800"
                        : "border-gray-200 hover:bg-gray-50",
                  )}
                >
                  <span className={cn("text-sm", isDark ? "text-white" : "text-gray-900")}>{reason.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedReason === "other" && (
            <div className="mb-4">
              <label
                htmlFor="customReason"
                className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}
              >
                Please specify:
              </label>
              <input
                id="customReason"
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter your reason..."
                className={cn(
                  "w-full px-3 py-2 rounded-lg border focus:ring-2 outline-none transition-colors",
                  isDark
                    ? "bg-gray-800 border-gray-700 focus:ring-amber-500/50 text-white"
                    : "bg-white border-gray-300 focus:ring-amber-500/30 text-gray-900",
                )}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
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
              disabled={!selectedReason || (selectedReason === "other" && !customReason.trim())}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                selectedReason && (selectedReason !== "other" || customReason.trim())
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : isDark
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
              )}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
