// Time periods for behavior suggestions
export type TimePeriod = "morning" | "afternoon" | "evening" | "night"

export function getCurrentTimePeriod(): TimePeriod {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return "morning"
  } else if (hour >= 12 && hour < 17) {
    return "afternoon"
  } else if (hour >= 17 && hour < 22) {
    return "evening"
  } else {
    return "night"
  }
}

// Format time for display (e.g., "7:30 AM")
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

// Get greeting based on time of day
export function getGreeting(timePeriod: TimePeriod): string {
  switch (timePeriod) {
    case "morning":
      return "Good morning"
    case "afternoon":
      return "Good afternoon"
    case "evening":
      return "Good evening"
    case "night":
      return "Good night"
  }
}
