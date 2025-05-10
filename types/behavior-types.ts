export type TimePeriod = "morning" | "afternoon" | "evening" | "night"
export type BehaviorCategory = "health" | "productivity" | "mindfulness" | "learning" | "social" | "other"

export interface CheckInHistory {
  date: string
  completed: boolean
  completedAt?: string // ISO string with time
  missedReason?: string
  notes?: string
}

export interface Behaviour {
  id: number
  name: string
  description: string
  category?: BehaviorCategory
  tags?: string[]
  streak: number
  lastCheckIn: string | null
  checkedInToday: boolean
  history?: CheckInHistory[]
  targetDays?: number
  targetFrequency?: string
  currentGoal?: string
  optimalTimePeriod?: TimePeriod
}

export interface MissedReason {
  id: string
  label: string
  icon?: string
}

export const DEFAULT_MISSED_REASONS: MissedReason[] = [
  { id: "forgot", label: "Forgot" },
  { id: "busy", label: "Too busy" },
  { id: "unmotivated", label: "Not motivated" },
  { id: "tired", label: "Too tired" },
  { id: "sick", label: "Sick" },
  { id: "traveling", label: "Traveling" },
  { id: "other", label: "Other" },
]

export const PREDEFINED_SUGGESTIONS: Behaviour[] = [
  {
    id: 101,
    name: "Mindfulness Meditation",
    description: "10 minutes of mindfulness meditation",
    category: "mindfulness",
    tags: ["wellness", "mental health"],
    streak: 0,
    lastCheckIn: null,
    checkedInToday: false,
    optimalTimePeriod: "morning",
  },
  {
    id: 102,
    name: "Daily Reading",
    description: "Read for 20 minutes",
    category: "learning",
    tags: ["education", "personal development"],
    streak: 0,
    lastCheckIn: null,
    checkedInToday: false,
    optimalTimePeriod: "evening",
  },
  {
    id: 103,
    name: "Stretching",
    description: "5 minutes of stretching",
    category: "health",
    tags: ["fitness", "wellness"],
    streak: 0,
    lastCheckIn: null,
    checkedInToday: false,
    optimalTimePeriod: "morning",
  },
  {
    id: 104,
    name: "Gratitude Journal",
    description: "Write down 3 things you're grateful for",
    category: "mindfulness",
    tags: ["wellness", "mental health"],
    streak: 0,
    lastCheckIn: null,
    checkedInToday: false,
    optimalTimePeriod: "evening",
  },
  {
    id: 105,
    name: "Drink Water",
    description: "Drink 8 glasses of water",
    category: "health",
    tags: ["wellness", "nutrition"],
    streak: 0,
    lastCheckIn: null,
    checkedInToday: false,
  },
  {
    id: 106,
    name: "Daily Planning",
    description: "Plan your day for 5 minutes",
    category: "productivity",
    tags: ["organization", "time management"],
    streak: 0,
    lastCheckIn: null,
    checkedInToday: false,
    optimalTimePeriod: "morning",
  },
  {
    id: 107,
    name: "Evening Reflection",
    description: "Reflect on your day for 5 minutes",
    category: "mindfulness",
    tags: ["wellness", "mental health"],
    streak: 0,
    lastCheckIn: null,
    checkedInToday: false,
    optimalTimePeriod: "night",
  },
  {
    id: 108,
    name: "Social Connection",
    description: "Connect with a friend or family member",
    category: "social",
    tags: ["relationships", "wellbeing"],
    streak: 0,
    lastCheckIn: null,
    checkedInToday: false,
  },
]
