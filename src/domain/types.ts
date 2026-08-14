export type Intention = 'train' | 'recover'
export type Goal = 'general' | 'strength' | 'muscle' | 'endurance' | 'mobility'
export type Level = 1 | 2 | 3 | 4 | 5
export type Equipment =
  | 'none'
  | 'wall'
  | 'chair'
  | 'bench'
  | 'table'
  | 'bar'
  | 'bands'
  | 'dumbbells'
  | 'kettlebell'
  | 'barbell'
  | 'cable'
  | 'machine'
  | 'slider'
  | 'box'
  | 'rope'

export type Category = 'warmup' | 'upper' | 'lower' | 'core' | 'conditioning' | 'mobility' | 'mindfulness'
export type MuscleArea =
  | 'full_body' | 'upper_body' | 'lower_body' | 'chest' | 'upper_back' | 'lower_back'
  | 'shoulders' | 'anterior_shoulder' | 'posterior_shoulder' | 'biceps' | 'triceps'
  | 'core' | 'deep_core' | 'rectus_abdominis' | 'obliques' | 'hips' | 'hip_flexors'
  | 'glutes' | 'quads' | 'hamstrings' | 'adductors' | 'calves' | 'legs' | 'neck' | 'mind'

export interface Exercise {
  id: string
  name: string
  description: string
  category: Category
  pattern: string
  level: Level | 0
  durationSeconds: number
  prescription: string
  equipment: Equipment[]
  primaryMuscles: MuscleArea[]
  secondaryMuscles: MuscleArea[]
  unilateral: boolean
  lowImpact: boolean
  goals: Goal[]
  contraindications: MuscleArea[]
  optIn?: 'advancedBridges'
  isCustom?: boolean
}

export interface Issue {
  id: string
  area: MuscleArea
  severity: 'mild' | 'moderate' | 'flare'
  status: 'active' | 'resolved'
  note: string
  createdAt: string
  side: 'left' | 'right' | 'bilateral'
  resolvedAt: string | null
}

export interface Profile {
  name: string
  level: Level
  goal: Goal
  equipment: Equipment[]
  soundEnabled: boolean
  waitBetweenExercises: boolean
  avoidList: string[]
  favourites: string[]
  advancedBridges: boolean
  height: string
  weight: string
  heightUnit: 'cm' | 'in'
  weightUnit: 'kg' | 'lbs'
  upper: Level
  lower: Level
  core: Level
  conditioning: Level
}

export interface WorkoutExercise {
  exerciseId: string
  prescription: string
  durationSeconds: number
  rationale: string
  section: 'Prepare' | 'Main work' | 'Condition' | 'Restore'
  adjusted?: boolean
  scaled?: 'up' | 'down' | null
  originalLevel?: number
}

export interface WorkoutPlan {
  id: string
  name: string
  intention: Intention
  goal: Goal
  durationMinutes: number
  createdAt: string
  exercises: WorkoutExercise[]
  insights: string[]
  focusAreas: MuscleArea[]
}

export interface WorkoutSession {
  id: string
  planName: string
  date: string
  durationSeconds: number
  intention: Intention
  goal: Goal
  rating: 'easy' | 'good' | 'hard' | 'brutal' | 'unrated'
  completedExerciseIds: string[]
  exercises: Array<{ id: string; name: string; prescription: string; durationSeconds: number }>
  focus: MuscleArea[]
  areaLoadBefore: Partial<Record<Category, number>>
}

export interface ExerciseStat {
  attempts: number
  completed: number
  easyGood: number
  hard: number
  brutal: number
  consecutiveSuccesses: number
  lastRating: WorkoutSession['rating'] | null
  lastCompletedAt: string | null
  lastDurationSeconds: number | null
  progressionReady: boolean
  coachDecision: 'progress' | 'maintain' | 'regress' | null
}

export interface DailyCheckIn {
  date: string | null
  tightAreas: MuscleArea[]
  primaryArea: MuscleArea | null
}

export interface ActiveSession {
  plan: WorkoutPlan
  index: number
  remainingSeconds: number
  running: boolean
  deadlineAt: number | null
  startedAt: number
  completedExerciseIds: string[]
}

export interface BuilderPreferences {
  intention: Intention
  goal: Goal
  durationMinutes: number
  focusAreas: MuscleArea[]
  equipment: Equipment[]
  level: Level
  includeConditioning: boolean
}

export interface AppState {
  schemaVersion: number
  profile: Profile
  issues: Issue[]
  history: WorkoutSession[]
  savedPlans: WorkoutPlan[]
  customExercises: Exercise[]
  activeSession: ActiveSession | null
  dailyCheckIn: DailyCheckIn
  exerciseStats: Record<string, ExerciseStat>
  rotation: Record<string, number>
  legacyHistory: Record<string, number>
  recovery: Record<'upper' | 'lower' | 'core' | 'conditioning', number>
}
