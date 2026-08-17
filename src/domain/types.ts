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

export type Category = 'warmup' | 'upper' | 'lower' | 'core' | 'conditioning' | 'mobility' | 'stretching' | 'mindfulness'
export type RecoveryMode = 'mobility' | 'stretching'
export type MuscleArea =
  | 'full_body' | 'upper_body' | 'lower_body' | 'chest' | 'upper_back' | 'mid_back' | 'lower_back'
  | 'shoulders' | 'anterior_shoulder' | 'posterior_shoulder' | 'biceps' | 'triceps'
  | 'core' | 'deep_core' | 'rectus_abdominis' | 'obliques' | 'hips' | 'hip_flexors'
  | 'glutes' | 'quads' | 'hamstrings' | 'adductors' | 'calves' | 'legs' | 'neck' | 'mind'
  | 'elbows' | 'forearms' | 'wrists' | 'hands' | 'knees' | 'shins' | 'ankles' | 'feet'

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
  videoUrl?: string
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
  setNumber?: number
  totalSets?: number
  slotKey?: string
  slotLabel?: string
}

export type MovementRole = 'horizontal_push' | 'horizontal_pull' | 'vertical_push' | 'vertical_pull' | 'squat' | 'hinge' | 'lunge' | 'carry' | 'rotation' | 'anti_extension' | 'conditioning' | 'recovery' | 'warmup' | 'mindfulness' | 'balanced'

export interface BalanceReport {
  valid: boolean
  templateKey: string
  requiredRoles: MovementRole[]
  coveredRoles: MovementRole[]
  requiredAreas: MuscleArea[]
  coveredAreas: MuscleArea[]
  sectionCounts: Partial<Record<WorkoutExercise['section'], number>>
  issues: string[]
  generatedAt: string
}

export interface WorkoutPlan {
  id: string
  name: string
  intention: Intention
  goal: Goal
  durationMinutes: number
  targetDurationMinutes?: number
  equipment?: Equipment[]
  createdAt: string
  exercises: WorkoutExercise[]
  insights: string[]
  focusAreas: MuscleArea[]
  balanceReport?: BalanceReport
}

export type ExerciseFeedback = 'good_fit' | 'too_easy' | 'too_hard' | 'discomfort' | 'didnt_enjoy'
export type WorkoutActionType = 'completed' | 'skipped' | 'swapped_out' | 'swapped_in' | 'easier' | 'harder' | 'prescription_down' | 'prescription_up' | 'favourited' | 'avoided'

export interface WorkoutAction {
  id: string
  type: WorkoutActionType
  exerciseId: string
  replacementExerciseId?: string
  occurrenceIndex: number
  at: string
  context?: LearningContext
}

export interface ExercisePerformance {
  achievedReps?: number
  achievedSeconds?: number
  load?: number
  loadUnit?: 'kg' | 'lbs'
}

export interface SessionExercise {
  id: string
  name: string
  prescription: string
  durationSeconds: number
  plannedAppearances?: number
  completedAppearances?: number
  skippedAppearances?: number
  adjusted?: boolean
  swapped?: boolean
  feedback?: ExerciseFeedback
  performance?: ExercisePerformance
  role?: MovementRole
  section?: WorkoutExercise['section']
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
  exercises: SessionExercise[]
  focus: MuscleArea[]
  areaLoadBefore: Partial<Record<Category, number>>
  actions?: WorkoutAction[]
  balanceReport?: BalanceReport
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
  phase: 'get_ready' | 'work' | 'switch_sides' | 'waiting' | 'rest'
  remainingSeconds: number
  running: boolean
  deadlineAt: number | null
  startedAt: number
  completedExerciseIds: string[]
  actions?: WorkoutAction[]
}

export interface LearningContext {
  key: string
  goal: Goal
  intention: Intention
  section: WorkoutExercise['section']
  role?: MovementRole
  focusArea?: MuscleArea
}

export interface ContextLearningStat {
  preference: number
  difficultySuitability: number
  reliability: number
  evidence: number
  lastUpdatedAt: string
  skips: number
  swapsOut: number
}

export type ProgressionCategory = 'variation' | 'volume' | 'load'
export type ProgressionStatus = 'none' | 'ready' | 'approaching' | 'accepted' | 'kept' | 'deferred'

export interface ProgressionRecommendation {
  id: string
  exerciseId: string
  category: ProgressionCategory
  status: Exclude<ProgressionStatus, 'none' | 'approaching'>
  title: string
  evidence: string[]
  createdAt: string
  availableAfter?: string
  fromExerciseId?: string
  toExerciseId?: string
  prescription?: string
  load?: number
  loadUnit?: 'kg' | 'lbs'
  previousPrescription?: string
}

export interface ExerciseLearningEntry {
  exposures: number
  completedAppearances: number
  skips: number
  swapsOut: number
  swapsIn: number
  positiveFeedback: number
  tooEasy: number
  tooHard: number
  discomfort: number
  negativePreference: number
  easierSelections: number
  harderSelections: number
  lastSelectedAt: string | null
  lastCompletedAt: string | null
  preference: number
  difficultySuitability: number
  completionReliability: number
  evidence: number
  contexts: Record<string, ContextLearningStat>
  successfulPerformances: number
  lastPerformance?: ExercisePerformance
  progressionStatus: ProgressionStatus
  progressionEvidenceAt: number
  currentPrescription?: string
  previousPrescription?: string
  currentExerciseId?: string
  previousExerciseId?: string
  deferredUntil?: string
}

export interface LearningEvent {
  id: string
  at: string
  exerciseId?: string
  type: WorkoutActionType | 'exercise_feedback' | 'overall_rating' | 'progression_accepted' | 'progression_kept' | 'progression_deferred' | 'progression_reverted'
  label: string
  context?: LearningContext
  feedback?: ExerciseFeedback
}

export interface LearningModel {
  version: 1
  exercises: Record<string, ExerciseLearningEntry>
  routineContexts: Record<string, RoutineLearningStat>
  events: LearningEvent[]
  recommendations: ProgressionRecommendation[]
}

export interface RoutineLearningStat {
  confidence: number
  positive: number
  negative: number
  evidence: number
  lastUpdatedAt: string
}

export interface BuilderPreferences {
  intention: Intention
  goal: Goal
  durationMinutes: number | 'auto'
  focusAreas: MuscleArea[]
  equipment: Equipment[]
  level: Level
  includeConditioning: boolean
  includeWarmup: boolean
  exercisesPerRound: number | 'auto'
  targetSets: number | 'auto'
  recoveryModes: RecoveryMode[]
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
  learningModel: LearningModel
}
