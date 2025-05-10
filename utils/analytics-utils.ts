import type { Behaviour, TimePeriod } from "../types/behavior-types"

// Determine the time period of a check-in
export function getTimePeriodFromDate(date: Date): TimePeriod {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  if (hour >= 17 && hour < 22) return "evening"
  return "night"
}

// Get success rate for a behavior
export function calculateSuccessRate(behaviour: Behaviour): number {
  if (!behaviour.history || behaviour.history.length === 0) return 0
  const completedCount = behaviour.history.filter((entry) => entry.completed).length
  return Math.round((completedCount / behaviour.history.length) * 100)
}

// Find most improved behavior
export function getMostImprovedBehavior(behaviours: Behaviour[]): Behaviour | null {
  if (behaviours.length === 0) return null

  const improvementScores = behaviours.map((behaviour) => {
    const history = behaviour.history || []
    if (history.length < 7) return { id: behaviour.id, score: 0 }

    // Compare recent 7 days to previous 7 days
    const recent = history.slice(0, 7).filter((entry) => entry.completed).length
    const previous = history.slice(7, 14).filter((entry) => entry.completed).length

    // Calculate improvement score
    const improvement = recent - previous
    return { id: behaviour.id, score: improvement }
  })

  // Sort by score descending and get the highest
  improvementScores.sort((a, b) => b.score - a.score)
  return behaviours.find((b) => b.id === improvementScores[0].id) || null
}

// Find most skipped behavior
export function getMostSkippedBehavior(behaviours: Behaviour[]): Behaviour | null {
  if (behaviours.length === 0) return null

  const skipScores = behaviours.map((behaviour) => {
    const history = behaviour.history || []
    if (history.length < 7) return { id: behaviour.id, score: 0 }

    // Count misses in recent 7 days
    const missedCount = history.slice(0, 7).filter((entry) => !entry.completed).length
    return { id: behaviour.id, score: missedCount }
  })

  // Sort by score descending and get the highest
  skipScores.sort((a, b) => b.score - a.score)
  return behaviours.find((b) => b.id === skipScores[0].id) || null
}

// Get optimal time period for a behavior based on history
export function getOptimalTimePeriod(behaviour: Behaviour): TimePeriod | null {
  if (!behaviour.history || behaviour.history.length === 0) return null

  const completedEntries = behaviour.history.filter((entry) => entry.completed && entry.completedAt)
  if (completedEntries.length === 0) return null

  // Count completions by time period
  const timePeriodCounts: Record<TimePeriod, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  }

  completedEntries.forEach((entry) => {
    if (entry.completedAt) {
      const date = new Date(entry.completedAt)
      const period = getTimePeriodFromDate(date)
      timePeriodCounts[period]++
    }
  })

  // Find the time period with the most completions
  let maxCount = 0
  let optimalPeriod: TimePeriod | null = null
  ;(Object.keys(timePeriodCounts) as TimePeriod[]).forEach((period) => {
    if (timePeriodCounts[period] > maxCount) {
      maxCount = timePeriodCounts[period]
      optimalPeriod = period
    }
  })

  return optimalPeriod
}

// Generate behavior suggestions based on user history
export function generateBehaviorSuggestions(behaviours: Behaviour[], predefinedSuggestions: Behaviour[]): Behaviour[] {
  if (behaviours.length === 0) return predefinedSuggestions.slice(0, 3)

  // Extract categories from existing behaviors
  const userCategories = new Set<string>()
  behaviours.forEach((b) => {
    if (b.category) userCategories.add(b.category)
  })

  // Filter suggestions by categories the user is interested in
  let categoryBasedSuggestions = predefinedSuggestions.filter((s) => s.category && userCategories.has(s.category))

  // If we don't have enough category-based suggestions, add some general ones
  if (categoryBasedSuggestions.length < 3) {
    const generalSuggestions = predefinedSuggestions
      .filter((s) => !categoryBasedSuggestions.some((c) => c.id === s.id))
      .slice(0, 3 - categoryBasedSuggestions.length)

    categoryBasedSuggestions = [...categoryBasedSuggestions, ...generalSuggestions]
  }

  // Filter out behaviors the user already has
  const userBehaviorNames = new Set(behaviours.map((b) => b.name.toLowerCase()))
  return categoryBasedSuggestions.filter((s) => !userBehaviorNames.has(s.name.toLowerCase())).slice(0, 3)
}

// Analyze common missed reasons
export function analyzeCommonMissedReasons(behaviours: Behaviour[]): Record<string, number> {
  const reasonCounts: Record<string, number> = {}

  behaviours.forEach((behaviour) => {
    if (!behaviour.history) return

    behaviour.history.forEach((entry) => {
      if (!entry.completed && entry.missedReason) {
        reasonCounts[entry.missedReason] = (reasonCounts[entry.missedReason] || 0) + 1
      }
    })
  })

  return reasonCounts
}

// Get top missed reasons
export function getTopMissedReasons(behaviours: Behaviour[], limit = 3): { reason: string; count: number }[] {
  const reasonCounts = analyzeCommonMissedReasons(behaviours)

  return Object.entries(reasonCounts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
