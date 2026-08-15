import { exerciseById, exercises } from '../data/exercises'
import type {
  AppState,
  BuilderPreferences,
  Category,
  Equipment,
  Exercise,
  ExerciseStat,
  Goal,
  Intention,
  MuscleArea,
  WorkoutExercise,
  WorkoutPlan,
  WorkoutSession,
} from './types'

const MAX_LEVEL = 5
const TRANSITION_SECONDS = 12
const SET_REST_SECONDS = 45
const MAIN_CATEGORIES: Category[] = ['upper', 'lower', 'core']

type ProgrammingFamily =
  | 'push'
  | 'pull'
  | 'knee'
  | 'hinge'
  | 'lunge'
  | 'core_stability'
  | 'core_flexion'
  | 'core_rotation'
  | 'carry'
  | 'conditioning'
  | 'mobility'
  | 'other'

interface MovementSlot {
  key: string
  label: string
  categories?: Category[]
  families?: ProgrammingFamily[]
  areas?: MuscleArea[]
}

interface SelectionContext {
  usedIds: Set<string>
  familyCounts: Map<ProgrammingFamily, number>
  patternCounts: Map<string, number>
  discouragedIds: Set<string>
  recentIds: Map<string, number>
  recentFamilies: Map<ProgrammingFamily, number>
  areaLoads: Record<'upper' | 'lower' | 'core', number>
}

const today = () => new Date().toDateString()
const allExercises = (state: AppState) => [...exercises, ...state.customExercises]
const resolveExercise = (id: string, state: AppState) => exerciseById.get(id) ?? state.customExercises.find(item => item.id === id)
const muscles = (exercise: Exercise) => [...exercise.primaryMuscles, ...exercise.secondaryMuscles]

function hash(input: string) {
  let value = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return Math.abs(value)
}

const seededNoise = (seed: string, id: string) => (hash(`${seed}:${id}`) % 1000) / 1000

export function programmingFamily(exercise: Exercise): ProgrammingFamily {
  const pattern = exercise.pattern.toLowerCase()
  if (exercise.category === 'conditioning') return 'conditioning'
  if (exercise.category === 'mobility' || exercise.category === 'stretching') return 'mobility'
  if (/row|pull|back_ext|front_lever|back_lever/.test(pattern)) return 'pull'
  if (/push|press|dip|planche|vertical_push|static_push/.test(pattern)) return 'push'
  if (/split_squat|lunge|step/.test(pattern)) return 'lunge'
  if (/hinge|deadlift|hamstring|glute|hip_extension/.test(pattern)) return 'hinge'
  if (/squat|knee|quad|pistol/.test(pattern)) return 'knee'
  if (/carry/.test(pattern)) return 'carry'
  if (/anti_rotation|rotation|oblique|side_plank/.test(pattern)) return 'core_rotation'
  if (/flex|crunch|leg_raise|trunk/.test(pattern)) return 'core_flexion'
  if (exercise.category === 'core' || /plank|anti_extension|stability|core_post/.test(pattern)) return 'core_stability'
  return 'other'
}

export function exerciseMatchesArea(exercise: Exercise, area: MuscleArea) {
  if (area === 'full_body') return true
  if (area === 'upper_body') {
    return exercise.category === 'upper' || muscles(exercise).some(value => ['chest', 'upper_back', 'shoulders', 'anterior_shoulder', 'posterior_shoulder', 'biceps', 'triceps', 'neck'].includes(value))
  }
  if (area === 'lower_body' || area === 'legs') {
    return exercise.category === 'lower' || muscles(exercise).some(value => ['hips', 'hip_flexors', 'glutes', 'quads', 'hamstrings', 'adductors', 'calves', 'legs'].includes(value))
  }
  if (area === 'core') {
    return exercise.category === 'core' || muscles(exercise).some(value => ['core', 'deep_core', 'rectus_abdominis', 'obliques', 'lower_back'].includes(value))
  }
  return muscles(exercise).includes(area)
}

const checkInAreas = (state: AppState) => state.dailyCheckIn.date === today() ? state.dailyCheckIn.tightAreas : []
const activeIssueAreas = (state: AppState, severity?: 'flare') => state.issues
  .filter(item => item.status === 'active' && (!severity || item.severity === severity))
  .map(item => item.area)

function targetLevel(exercise: Exercise, state: AppState, preferences?: BuilderPreferences) {
  if (exercise.category === 'upper') return state.profile.upper
  if (exercise.category === 'lower') return state.profile.lower
  if (exercise.category === 'core') return state.profile.core
  if (exercise.category === 'conditioning') return state.profile.conditioning
  return preferences?.level ?? state.profile.level
}

export function getExerciseDecision(id: string, state: AppState) {
  const exercise = resolveExercise(id, state)
  const stat = state.exerciseStats[id]
  if (!exercise) return { action: 'maintain' as const, reason: 'Unknown movement' }
  if (!stat) return { action: 'maintain' as const, reason: 'No sessions logged yet' }
  if (stat.lastRating === 'brutal') return exercise.level > 1
    ? { action: 'regress' as const, reason: 'Last session was very hard' }
    : { action: 'maintain' as const, reason: 'Already at the easiest variant' }
  if (stat.lastRating === 'hard') return { action: 'maintain' as const, reason: 'Recent session was hard' }
  if (stat.consecutiveSuccesses >= 3 && exercise.level < MAX_LEVEL) return { action: 'progress' as const, reason: 'Three consecutive easy/good sessions' }
  return { action: 'maintain' as const, reason: 'Maintain current level' }
}

function exerciseLoad(exercise: Exercise) {
  return Math.round(exercise.durationSeconds * (0.75 + Math.max(0, exercise.level) * 0.25))
}

export function getAreaLoad(state: AppState, category: 'upper' | 'lower' | 'core' | 'conditioning', hours = 72) {
  const cutoff = Date.now() - hours * 3600000
  let total = 0
  state.history.filter(session => Date.parse(session.date) >= cutoff).forEach(session => {
    session.exercises.forEach(item => {
      const exercise = resolveExercise(item.id, state)
      if (!exercise) return
      if (exercise.category === category) total += exerciseLoad(exercise)
      else if (!MAIN_CATEGORIES.includes(exercise.category) && category !== 'conditioning') {
        const share = muscles(exercise).some(area => exerciseMatchesArea(exercise, category === 'upper' ? 'upper_body' : category === 'lower' ? 'lower_body' : 'core'))
        if (share) total += Math.round(exerciseLoad(exercise) * 0.25)
      }
    })
  })
  return total
}

export const getAreaLoadBreakdown = (state: AppState, hours = 72) => ({
  upper: getAreaLoad(state, 'upper', hours),
  lower: getAreaLoad(state, 'lower', hours),
  core: getAreaLoad(state, 'core', hours),
  conditioning: getAreaLoad(state, 'conditioning', hours),
})

export function getReadiness(state: AppState) {
  const rows = (['upper', 'lower', 'core', 'conditioning'] as const).map(area => {
    const checkAreas = checkInAreas(state)
    const affected = checkAreas.some(check => check === 'full_body' || check === (area === 'upper' ? 'upper_body' : area === 'lower' ? 'lower_body' : area))
    const load48 = getAreaLoad(state, area, 48)
    const load72 = getAreaLoad(state, area, 72)
    const cutoff = Date.now() - 48 * 3600000
    const hard = state.history.some(session => Date.parse(session.date) >= cutoff && ['hard', 'brutal'].includes(session.rating) && session.exercises.some(item => resolveExercise(item.id, state)?.category === area))
    if (affected || hard || load48 >= 180) return { area, status: 'recover' as const, label: affected ? 'Sore (check-in)' : 'Recover', load: load48 }
    if (load72 >= 140) return { area, status: 'caution' as const, label: 'Caution', load: load72 }
    return { area, status: 'ready' as const, label: 'Ready', load: load72 }
  })
  const recover = rows.filter(row => row.status === 'recover').length
  const caution = rows.filter(row => row.status === 'caution').length
  return { rows, status: recover >= 2 ? 'recover' as const : recover || caution ? 'caution' as const : 'ready' as const }
}

function equipmentMatches(exercise: Exercise, equipment: Equipment[]) {
  const selected = new Set(['none', ...equipment])
  return exercise.equipment.includes('none') || exercise.equipment.every(item => selected.has(item))
}

function isFlareExcluded(exercise: Exercise, state: AppState) {
  return activeIssueAreas(state, 'flare').some(area => exerciseMatchesArea(exercise, area) || exercise.contraindications.includes(area))
}

function isEligible(exercise: Exercise, preferences: BuilderPreferences, state: AppState, categories?: Category[]) {
  return (!categories || categories.includes(exercise.category))
    && equipmentMatches(exercise, preferences.equipment)
    && !state.profile.avoidList.includes(exercise.id)
    && (!exercise.optIn || state.profile.advancedBridges)
    && !isFlareExcluded(exercise, state)
}

function scaleNumbers(value: string, multiplier: number) {
  return value.replace(/\d+/g, raw => {
    const original = Number(raw)
    const adjusted = Math.max(1, Math.round(original * multiplier))
    return String(original >= 15 ? Math.max(5, Math.round(adjusted / 5) * 5) : adjusted)
  })
}

function goalPrescription(exercise: Exercise, goal: Goal) {
  const config = {
    strength: { rep: 0.75, seconds: 1 },
    muscle: { rep: 1.1, seconds: 1.05 },
    endurance: { rep: 1.35, seconds: 1.2 },
    general: { rep: 1, seconds: 1 },
    mobility: { rep: 1, seconds: 1.2 },
  }[goal]
  return {
    prescription: scaleNumbers(exercise.prescription, config.rep),
    durationSeconds: Math.max(10, Math.round(exercise.durationSeconds * config.seconds / 5) * 5),
  }
}

function plannedPrescription(exercise: Exercise, intention: Intention, goal: Goal, state: AppState) {
  const goalAdjusted = intention === 'train' ? goalPrescription(exercise, goal) : { prescription: exercise.prescription, durationSeconds: exercise.durationSeconds }
  const affected = [...checkInAreas(state), ...activeIssueAreas(state)].some(area => exerciseMatchesArea(exercise, area) || exercise.contraindications.includes(area))
  if (!affected) return { ...goalAdjusted, adjusted: false }
  const cautiousRecovery = intention === 'recover' && exercise.lowImpact
  const multiplier = cautiousRecovery ? 1.5 : 0.5
  return {
    prescription: `${scaleNumbers(goalAdjusted.prescription, multiplier)}${cautiousRecovery ? ' 🎯' : ' 🩹'}`,
    durationSeconds: Math.max(10, Math.round(goalAdjusted.durationSeconds * multiplier / 5) * 5),
    adjusted: true,
  }
}

function selectionContext(state: AppState, usedIds = new Set<string>(), discouragedIds: Iterable<string> = []): SelectionContext {
  const recentIds = new Map<string, number>()
  const recentFamilies = new Map<ProgrammingFamily, number>()
  const cutoff = Date.now() - 14 * 86400000
  state.history.filter(session => Date.parse(session.date) >= cutoff).forEach(session => session.exercises.forEach(item => {
    recentIds.set(item.id, (recentIds.get(item.id) ?? 0) + 1)
    const exercise = resolveExercise(item.id, state)
    if (exercise) {
      const family = programmingFamily(exercise)
      recentFamilies.set(family, (recentFamilies.get(family) ?? 0) + 1)
    }
  }))
  return {
    usedIds: new Set(usedIds),
    familyCounts: new Map(),
    patternCounts: new Map(),
    discouragedIds: new Set(discouragedIds),
    recentIds,
    recentFamilies,
    areaLoads: {
      upper:getAreaLoad(state, 'upper', 72),
      lower:getAreaLoad(state, 'lower', 72),
      core:getAreaLoad(state, 'core', 72),
    },
  }
}

function hasEarnedFamilyProgression(exercise: Exercise, state: AppState, target: number) {
  return allExercises(state).some(candidate => candidate.pattern === exercise.pattern
    && candidate.level === target
    && (state.exerciseStats[candidate.id]?.consecutiveSuccesses ?? 0) >= 3
    && !['hard', 'brutal'].includes(state.exerciseStats[candidate.id]?.lastRating ?? ''))
}

function tierCandidates(pool: Exercise[], state: AppState, preferences: BuilderPreferences) {
  const preferred = pool.filter(exercise => {
    if (exercise.level === 0) return true
    const target = targetLevel(exercise, state, preferences)
    return exercise.level === target || (exercise.level === target + 1 && hasEarnedFamilyProgression(exercise, state, target))
  })
  if (preferred.length) return preferred
  const below = pool.filter(exercise => exercise.level === 0 || exercise.level <= targetLevel(exercise, state, preferences))
  if (below.length) {
    const nearestDistance = Math.min(...below.map(exercise => exercise.level === 0 ? 99 : targetLevel(exercise, state, preferences) - exercise.level))
    return below.filter(exercise => exercise.level === 0 || targetLevel(exercise, state, preferences) - exercise.level === nearestDistance)
  }
  const above = pool.filter(exercise => exercise.level > 0)
  if (!above.length) return []
  const nearestDistance = Math.min(...above.map(exercise => exercise.level - targetLevel(exercise, state, preferences)))
  return above.filter(exercise => exercise.level - targetLevel(exercise, state, preferences) === nearestDistance)
}

function slotMatches(exercise: Exercise, slot: MovementSlot) {
  if (slot.categories && !slot.categories.includes(exercise.category)) return false
  if (slot.families && !slot.families.includes(programmingFamily(exercise))) return false
  if (slot.areas && !slot.areas.some(area => exerciseMatchesArea(exercise, area))) return false
  return true
}

function candidateScore(exercise: Exercise, preferences: BuilderPreferences, state: AppState, seed: string, context: SelectionContext, slot?: MovementSlot) {
  const stat = state.exerciseStats[exercise.id]
  const family = programmingFamily(exercise)
  let score = seededNoise(seed, exercise.id) * 3
  if (exercise.goals.includes(preferences.goal)) score += 10
  if (preferences.focusAreas.some(area => exerciseMatchesArea(exercise, area))) score += 18
  if (slot?.areas?.some(area => exerciseMatchesArea(exercise, area))) score += 8
  if (state.profile.favourites.includes(exercise.id)) score += 22
  if (context.discouragedIds.has(exercise.id)) score -= 24
  score -= (context.familyCounts.get(family) ?? 0) * 12
  score -= (context.patternCounts.get(exercise.pattern) ?? 0) * 10
  score -= (context.recentIds.get(exercise.id) ?? 0) * 2.2
  score -= (context.recentFamilies.get(family) ?? 0) * 0.65
  if (MAIN_CATEGORIES.includes(exercise.category)) {
    score -= Math.min(8, context.areaLoads[exercise.category as 'upper' | 'lower' | 'core'] / 35)
  }
  if (stat?.lastRating === 'good' || stat?.lastRating === 'easy') score += 2
  if (stat?.lastRating === 'hard') score -= 4
  if (stat?.lastRating === 'brutal') score -= 10
  if (getExerciseDecision(exercise.id, state).action === 'regress') score -= 8
  return score
}

function rememberSelection(exercise: Exercise, context: SelectionContext) {
  const family = programmingFamily(exercise)
  context.usedIds.add(exercise.id)
  context.familyCounts.set(family, (context.familyCounts.get(family) ?? 0) + 1)
  context.patternCounts.set(exercise.pattern, (context.patternCounts.get(exercise.pattern) ?? 0) + 1)
}

function chooseForSlot(pool: Exercise[], slot: MovementSlot, preferences: BuilderPreferences, state: AppState, seed: string, context: SelectionContext) {
  const matching = pool.filter(exercise => !context.usedIds.has(exercise.id) && slotMatches(exercise, slot))
  const candidates = tierCandidates(matching, state, preferences)
  return candidates.sort((a, b) => candidateScore(b, preferences, state, seed, context, slot) - candidateScore(a, preferences, state, seed, context, slot))[0] ?? null
}

const slot = (key: string, label: string, families?: ProgrammingFamily[], areas?: MuscleArea[], categories: Category[] = MAIN_CATEGORIES): MovementSlot => ({ key, label, families, areas, categories })

function mainSlots(preferences: BuilderPreferences, count: number) {
  const focuses = preferences.focusAreas.length ? preferences.focusAreas : ['full_body' as const]
  if (focuses.includes('full_body')) {
    const required = count <= 1
      ? [slot('balanced', 'balanced full-body movement', undefined, ['full_body'])]
      : count === 2
        ? [slot('upper', 'upper-body compound', ['push', 'pull'], ['upper_body']), slot('lower', 'lower-body compound', ['knee', 'hinge', 'lunge'], ['lower_body'])]
        : count === 3
          ? [slot('push', 'push'), slot('pull', 'pull'), slot('lower', 'lower-body compound', ['knee', 'hinge', 'lunge'])]
          : [slot('push', 'push', ['push']), slot('pull', 'pull', ['pull']), slot('knee', 'knee-dominant', ['knee', 'lunge']), slot('hinge', 'hip-dominant', ['hinge'])]
    if (count >= 5) required.push(slot('core', 'core stability', ['core_stability', 'core_rotation', 'carry'], ['core']))
    while (required.length < count) required.push(slot(`balance-${required.length}`, 'balanced accessory', undefined, ['full_body']))
    return required.slice(0, count)
  }

  const broad: MovementSlot[] = []
  if (focuses.includes('upper_body')) broad.push(slot('push', 'push', ['push'], ['upper_body']), slot('pull', 'pull', ['pull'], ['upper_body']))
  if (focuses.includes('lower_body')) broad.push(slot('knee', 'knee-dominant', ['knee', 'lunge'], ['lower_body']), slot('hinge', 'hip-dominant', ['hinge'], ['lower_body']))
  if (focuses.includes('core')) broad.push(slot('core-stability', 'core stability', ['core_stability', 'carry'], ['core']), slot('core-rotation', 'core rotation', ['core_rotation', 'core_flexion'], ['core']))
  const specific = focuses.filter(area => !['upper_body', 'lower_body', 'core'].includes(area)).map(area => slot(`area-${area}`, area.replaceAll('_', ' '), undefined, [area]))
  const result = [...broad, ...specific]
  const areaCycle = focuses.map(area => slot(`focus-${area}`, area.replaceAll('_', ' '), undefined, [area]))
  while (result.length < count) result.push(areaCycle[(result.length - broad.length - specific.length + areaCycle.length) % areaCycle.length])
  return result.slice(0, count)
}

function selectMainCircuit(preferences: BuilderPreferences, state: AppState, seed: string, count: number, discouragedIds: Iterable<string> = []) {
  const pool = allExercises(state).filter(exercise => isEligible(exercise, preferences, state, MAIN_CATEGORIES))
  const context = selectionContext(state, new Set(), discouragedIds)
  const selected: Exercise[] = []
  const warnings: string[] = []
  for (const movementSlot of mainSlots(preferences, count)) {
    const chosen = chooseForSlot(pool, movementSlot, preferences, state, `${seed}:${movementSlot.key}`, context)
    if (!chosen) {
      warnings.push(`No equipment- and tier-compatible ${movementSlot.label} was available.`)
      continue
    }
    selected.push(chosen)
    rememberSelection(chosen, context)
  }
  if (selected.length < count) warnings.push(`Built ${selected.length} of ${count} requested main-work slots from the available catalogue.`)
  return { selected, warnings }
}

function pickAuxiliary(pool: Exercise[], count: number, preferences: BuilderPreferences, state: AppState, seed: string, usedIds = new Set<string>(), relevance: Exercise[] = [], discouragedIds: Iterable<string> = []) {
  const context = selectionContext(state, usedIds, discouragedIds)
  const relevantMuscles = new Set(relevance.flatMap(muscles))
  const result: Exercise[] = []
  while (result.length < count) {
    const candidates = tierCandidates(pool.filter(exercise => !context.usedIds.has(exercise.id)), state, preferences)
    const next = candidates.map(exercise => ({
      exercise,
      score: candidateScore(exercise, preferences, state, seed, context) + muscles(exercise).filter(area => relevantMuscles.has(area)).length * 5,
    })).sort((a, b) => b.score - a.score)[0]?.exercise
    if (!next) break
    result.push(next)
    rememberSelection(next, context)
  }
  return result
}

function rationale(exercise: Exercise, preferences: BuilderPreferences, state: AppState, slotLabel?: string) {
  const reasons: string[] = []
  if (slotLabel) reasons.push(`fills the ${slotLabel} slot`)
  if (exercise.goals.includes(preferences.goal)) reasons.push(`supports ${preferences.goal}`)
  const focus = preferences.focusAreas.find(area => exerciseMatchesArea(exercise, area))
  if (focus && focus !== 'full_body') reasons.push(`targets ${focus.replaceAll('_', ' ')}`)
  const decision = getExerciseDecision(exercise.id, state)
  if (decision.action !== 'maintain') reasons.push(decision.action === 'progress' ? 'earned progression' : 'easier work recommended')
  return reasons.join(' · ') || `balances the ${programmingFamily(exercise).replaceAll('_', ' ')} pattern`
}

function requestedMainCount(preferences: BuilderPreferences) {
  if (preferences.exercisesPerRound !== 'auto') return Math.max(1, Math.min(12, preferences.exercisesPerRound))
  if (preferences.durationMinutes !== 'auto' && preferences.durationMinutes <= 15) return 3
  if (preferences.durationMinutes !== 'auto' && preferences.durationMinutes >= 45) return 6
  return 4
}

function requestedSetCount(preferences: BuilderPreferences, main: Exercise[]) {
  if (preferences.targetSets !== 'auto') return Math.max(1, Math.min(10, preferences.targetSets))
  if (preferences.durationMinutes === 'auto') return 3
  const fixedBudget = (preferences.includeWarmup ? preferences.durationMinutes * 60 * 0.15 : 0) + preferences.durationMinutes * 60 * 0.18 + (preferences.includeConditioning ? 60 : 0)
  const mainBudget = Math.max(60, preferences.durationMinutes * 60 - fixedBudget)
  const roundSeconds = Math.max(1, main.reduce((sum, exercise) => sum + exercise.durationSeconds + TRANSITION_SECONDS, 0))
  return Math.max(1, Math.min(3, Math.floor((mainBudget + SET_REST_SECONDS) / (roundSeconds + SET_REST_SECONDS))))
}

function planItem(exercise: Exercise, section: WorkoutExercise['section'], preferences: BuilderPreferences, state: AppState, setNumber?: number, totalSets?: number, slotLabel?: string): WorkoutExercise {
  const prescription = plannedPrescription(exercise, preferences.intention, preferences.goal, state)
  return {
    exerciseId: exercise.id,
    ...prescription,
    rationale: rationale(exercise, preferences, state, slotLabel),
    section,
    scaled: null,
    originalLevel: exercise.level,
    setNumber,
    totalSets,
  }
}

function estimatedPlanMinutes(items: WorkoutExercise[]) {
  if (!items.length) return 1
  const setNumbers = [...new Set(items.filter(item => item.section === 'Main work' && item.setNumber).map(item => item.setNumber!))]
  const seconds = items.reduce((sum, item) => sum + item.durationSeconds, 0)
    + Math.max(0, items.length - 1) * TRANSITION_SECONDS
    + Math.max(0, setNumbers.length - 1) * SET_REST_SECONDS
  return Math.max(1, Math.round(seconds / 60))
}

function validateGeneratedPlan(plan: WorkoutPlan, preferences: BuilderPreferences, state: AppState, expectedSlots: MovementSlot[]) {
  const issues: string[] = []
  const selected = plan.exercises.map(item => resolveExercise(item.exerciseId, state)).filter((item): item is Exercise => Boolean(item))
  if (selected.length !== plan.exercises.length) issues.push('One or more selected exercises could not be resolved.')
  if (selected.some(exercise => !equipmentMatches(exercise, preferences.equipment))) issues.push('An exercise requires unavailable equipment.')
  if (selected.some(exercise => state.profile.avoidList.includes(exercise.id))) issues.push('An avoided exercise was selected.')
  if (selected.some(exercise => isFlareExcluded(exercise, state))) issues.push('An exercise conflicts with an active flare-up.')
  const firstSet = plan.exercises.filter(item => item.section === 'Main work' && (!item.setNumber || item.setNumber === 1)).map(item => resolveExercise(item.exerciseId, state)).filter((item): item is Exercise => Boolean(item))
  expectedSlots.forEach(movementSlot => {
    if (!firstSet.some(exercise => slotMatches(exercise, movementSlot))) issues.push(`Missing ${movementSlot.label} coverage.`)
  })
  if (plan.exercises.filter(item => resolveExercise(item.exerciseId, state)?.category === 'mindfulness').length !== 1) issues.push('The plan must include exactly one mindful close-out.')
  return issues
}

export function generateWorkout(preferences: BuilderPreferences, state: AppState, seed = new Date().toISOString().slice(0, 10), discouragedIds: Iterable<string> = []): WorkoutPlan {
  const desiredMinutes = preferences.durationMinutes === 'auto' ? null : preferences.durationMinutes
  const requestedExercises = requestedMainCount(preferences)
  const warnings: string[] = []
  let main: Exercise[] = []
  let movementSlots: MovementSlot[] = []

  if (preferences.intention === 'train') {
    const selection = selectMainCircuit(preferences, state, seed, requestedExercises, discouragedIds)
    main = selection.selected
    warnings.push(...selection.warnings)
    movementSlots = mainSlots(preferences, requestedExercises).slice(0, main.length)
  }

  const totalSets = preferences.intention === 'train' ? requestedSetCount(preferences, main) : 0
  const planningMinutes = desiredMinutes ?? Math.max(10, Math.round(((preferences.includeWarmup ? 150 : 0) + main.length * Math.max(1, totalSets) * 65 + 150) / 60))
  const used = new Set(main.map(exercise => exercise.id))
  const warmupPool = allExercises(state).filter(exercise => isEligible(exercise, preferences, state, ['warmup']))
  const warmupCount = preferences.includeWarmup ? Math.max(1, Math.min(4, Math.round(planningMinutes * 60 * 0.14 / 45))) : 0
  const warmup = pickAuxiliary(warmupPool, warmupCount, preferences, state, `${seed}:warmup`, used, main, discouragedIds)
  warmup.forEach(exercise => used.add(exercise.id))

  const conditionPool = allExercises(state).filter(exercise => isEligible(exercise, preferences, state, ['conditioning']))
  const conditionCount = preferences.intention === 'train' && preferences.includeConditioning ? (planningMinutes >= 45 ? 2 : 1) : 0
  const condition = pickAuxiliary(conditionPool, conditionCount, preferences, state, `${seed}:condition`, used, main, discouragedIds)
  condition.forEach(exercise => used.add(exercise.id))

  const recoveryCategories: Category[] = preferences.recoveryModes.length ? preferences.recoveryModes : ['mobility', 'stretching']
  const recoveryPool = allExercises(state).filter(exercise => isEligible(exercise, preferences, state, recoveryCategories))
  const recoveryCount = preferences.intention === 'recover'
    ? Math.max(1, Math.min(12, Math.round((planningMinutes * 60 - 60) / 60)))
    : Math.max(1, Math.min(3, Math.round(planningMinutes * 60 * 0.12 / 60)))
  const restoreMovements = pickAuxiliary(recoveryPool, recoveryCount, preferences, state, `${seed}:restore`, used, main, discouragedIds)
  restoreMovements.forEach(exercise => used.add(exercise.id))
  const meditationPool = allExercises(state).filter(exercise => isEligible(exercise, preferences, state, ['mindfulness']))
  const meditation = pickAuxiliary(meditationPool, 1, preferences, state, `${seed}:meditation`, used, main, discouragedIds)

  const planned: WorkoutExercise[] = []
  warmup.forEach(exercise => planned.push(planItem(exercise, 'Prepare', preferences, state)))
  for (let setNumber = 1; setNumber <= totalSets; setNumber += 1) {
    main.forEach((exercise, index) => planned.push(planItem(exercise, 'Main work', preferences, state, setNumber, totalSets, movementSlots[index]?.label)))
  }
  condition.forEach(exercise => planned.push(planItem(exercise, 'Condition', preferences, state)))
  ;[...restoreMovements, ...meditation].forEach(exercise => planned.push(planItem(exercise, 'Restore', preferences, state)))

  const durationMinutes = estimatedPlanMinutes(planned)
  const focus = preferences.focusAreas.map(area => area.replaceAll('_', ' ')).join(' + ') || 'full body'
  const readiness = getReadiness(state)
  const familyCoverage = [...new Set(main.map(exercise => programmingFamily(exercise).replaceAll('_', ' ')))]
  const plan: WorkoutPlan = {
    id: `plan_${Date.now()}`,
    name: preferences.intention === 'recover' ? `${durationMinutes} min Restore` : `${focus.replace(/\b\w/g, char => char.toUpperCase())} · ${preferences.goal}`,
    intention: preferences.intention,
    goal: preferences.goal,
    durationMinutes,
    targetDurationMinutes: desiredMinutes ?? durationMinutes,
    equipment: [...preferences.equipment],
    createdAt: new Date().toISOString(),
    exercises: planned,
    focusAreas: preferences.focusAreas,
    insights: [
      preferences.intention === 'recover'
        ? `${restoreMovements.length} targeted mobility/stretch movements and one mindful close-out.`
        : `${main.length} main movements across ${totalSets} set${totalSets === 1 ? '' : 's'}: ${familyCoverage.join(', ')}.`,
      `Estimated ${durationMinutes} min${desiredMinutes ? ` against a ${desiredMinutes} min target` : ''}.`,
      readiness.status === 'ready' ? 'Current training load is ready.' : `Readiness is ${readiness.status}; volume and selection were adjusted.`,
      state.issues.some(issue => issue.status === 'active') ? 'Active issues were applied as safety constraints.' : 'No active issue constraints applied.',
      Object.keys(state.exerciseStats).length ? 'Exercise and movement-family history informed progression and variety.' : 'Complete and rate sessions to begin progression.',
      ...warnings,
    ],
  }
  const validationIssues = validateGeneratedPlan(plan, preferences, state, movementSlots)
  if (validationIssues.length) plan.insights.push(...validationIssues.map(issue => `Planning note: ${issue}`))
  return plan
}

function compatiblePreferences(plan: WorkoutPlan, state: AppState): BuilderPreferences {
  return {
    intention: plan.intention,
    goal: plan.goal,
    durationMinutes: plan.targetDurationMinutes ?? plan.durationMinutes,
    focusAreas: plan.focusAreas,
    equipment: plan.equipment ?? state.profile.equipment,
    level: state.profile.level,
    includeConditioning: true,
    includeWarmup: true,
    exercisesPerRound: 'auto',
    targetSets: 'auto',
    recoveryModes: ['mobility', 'stretching'],
  }
}

export function findTierVariant(id: string, direction: -1 | 1, state: AppState, equipment = state.profile.equipment) {
  const current = resolveExercise(id, state)
  if (!current || current.level === 0 || current.isCustom) return null
  return allExercises(state).filter(exercise => exercise.id !== id
    && exercise.pattern === current.pattern
    && exercise.level === current.level + direction
    && equipmentMatches(exercise, equipment)
    && !isFlareExcluded(exercise, state)
    && !state.profile.avoidList.includes(exercise.id))[0] ?? null
}

function matchingOccurrences(plan: WorkoutPlan, index: number) {
  const item = plan.exercises[index]
  if (!item) return new Set<number>()
  return new Set(plan.exercises.map((entry, itemIndex) => entry.exerciseId === item.exerciseId && entry.section === item.section ? itemIndex : -1).filter(itemIndex => itemIndex >= 0))
}

export function scalePlanExercise(plan: WorkoutPlan, index: number, direction: -1 | 1, state: AppState) {
  const item = plan.exercises[index]
  if (!item) return plan
  const current = resolveExercise(item.exerciseId, state)
  const variant = findTierVariant(item.exerciseId, direction, state, plan.equipment ?? state.profile.equipment)
  if (!current || !variant) return plan
  const originalLevel = item.originalLevel ?? current.level
  const scaled = variant.level > originalLevel ? 'up' as const : variant.level < originalLevel ? 'down' as const : null
  const adjustment = plannedPrescription(variant, plan.intention, plan.goal, state)
  const occurrences = matchingOccurrences(plan, index)
  const exercises = plan.exercises.map((entry, itemIndex) => occurrences.has(itemIndex) ? {
    ...entry,
    exerciseId: variant.id,
    ...adjustment,
    originalLevel,
    scaled,
    rationale: `${scaled === 'up' ? 'Manually progressed above the original tier.' : scaled === 'down' ? 'Manually regressed below the original tier.' : 'Returned to the original tier.'}${adjustment.adjusted ? ' Recovery adjustment retained.' : ''}`,
  } : entry)
  return { ...plan, exercises }
}

export function adjustPlanPrescription(plan: WorkoutPlan, index: number, direction: -1 | 1) {
  const occurrences = matchingOccurrences(plan, index)
  const exercises = plan.exercises.map((entry, itemIndex) => {
    if (!occurrences.has(itemIndex)) return entry
    const timed = /sec|min/i.test(entry.prescription)
    const step = timed ? 5 : 1
    const prescription = entry.prescription.replace(/\d+/g, value => String(Math.max(1, Number(value) + direction * step)))
    return { ...entry, prescription, durationSeconds: timed ? Math.max(5, entry.durationSeconds + direction * 5) : entry.durationSeconds }
  })
  return { ...plan, exercises, durationMinutes: estimatedPlanMinutes(exercises) }
}

export function removePlanExercise(plan: WorkoutPlan, index: number) {
  const occurrences = matchingOccurrences(plan, index)
  const exercises = plan.exercises.filter((_, itemIndex) => !occurrences.has(itemIndex))
  return { ...plan, exercises, durationMinutes: estimatedPlanMinutes(exercises) }
}

function sameReorderGroup(a: WorkoutExercise, b: WorkoutExercise) {
  return a.section === b.section && (a.setNumber ?? 0) === (b.setNumber ?? 0)
}

export function reorderPlanExercise(plan: WorkoutPlan, fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= plan.exercises.length || toIndex >= plan.exercises.length) return plan
  const from = plan.exercises[fromIndex]
  const to = plan.exercises[toIndex]
  if (!sameReorderGroup(from, to)) return plan
  const fromGroup = plan.exercises.map((item, index) => sameReorderGroup(item, from) ? index : -1).filter(index => index >= 0)
  const fromPosition = fromGroup.indexOf(fromIndex)
  const toPosition = fromGroup.indexOf(toIndex)
  if (fromPosition < 0 || toPosition < 0) return plan
  const exercises = [...plan.exercises]
  const setNumbers = from.section === 'Main work' && from.setNumber
    ? [...new Set(plan.exercises.filter(item => item.section === 'Main work' && item.setNumber).map(item => item.setNumber!))]
    : [from.setNumber ?? 0]
  setNumbers.forEach(setNumber => {
    const indexes = plan.exercises.map((item, index) => item.section === from.section && (item.setNumber ?? 0) === setNumber ? index : -1).filter(index => index >= 0)
    if (fromPosition >= indexes.length || toPosition >= indexes.length) return
    const values = indexes.map(index => exercises[index])
    const [moved] = values.splice(fromPosition, 1)
    values.splice(toPosition, 0, moved)
    indexes.forEach((index, position) => { exercises[index] = values[position] })
  })
  return { ...plan, exercises }
}

function replacementFor(plan: WorkoutPlan, index: number, state: AppState) {
  const currentItem = plan.exercises[index]
  const current = currentItem ? resolveExercise(currentItem.exerciseId, state) : null
  if (!current) return null
  const preferences = compatiblePreferences(plan, state)
  const used = new Set(plan.exercises.map(item => item.exerciseId))
  const base = allExercises(state).filter(exercise => exercise.id !== current.id
    && !used.has(exercise.id)
    && exercise.category === current.category
    && isEligible(exercise, preferences, state, [current.category]))
  const sameFamily = base.filter(exercise => programmingFamily(exercise) === programmingFamily(current))
  const samePattern = sameFamily.filter(exercise => exercise.pattern === current.pattern)
  const pool = samePattern.length ? samePattern : sameFamily.length ? sameFamily : base
  const candidates = tierCandidates(pool, state, preferences)
  const context = selectionContext(state, used)
  return candidates.sort((a, b) => candidateScore(b, preferences, state, `${plan.id}:replacement:${index}`, context) - candidateScore(a, preferences, state, `${plan.id}:replacement:${index}`, context))[0] ?? null
}

export function swapPlanExercise(plan: WorkoutPlan, index: number, state: AppState) {
  const current = plan.exercises[index]
  const replacement = replacementFor(plan, index, state)
  if (!current || !replacement) return plan
  const adjustment = plannedPrescription(replacement, plan.intention, plan.goal, state)
  const occurrences = matchingOccurrences(plan, index)
  const exercises = plan.exercises.map((item, itemIndex) => occurrences.has(itemIndex) ? {
    ...item,
    exerciseId: replacement.id,
    ...adjustment,
    rationale: `Swapped consistently across every set for a compatible ${programmingFamily(replacement).replaceAll('_', ' ')} movement.`,
    scaled: null,
    originalLevel: replacement.level,
  } : item)
  return { ...plan, exercises, durationMinutes: estimatedPlanMinutes(exercises) }
}

export function avoidPlanExercise(plan: WorkoutPlan, index: number, state: AppState) {
  const current = plan.exercises[index]
  if (!current) return plan
  const replacement = replacementFor(plan, index, state)
  if (!replacement) return removePlanExercise(plan, index)
  return swapPlanExercise(plan, index, state)
}

export function applySessionCompletion(state: AppState, session: WorkoutSession): AppState {
  const stats = { ...state.exerciseStats }
  for (const id of [...new Set(session.completedExerciseIds)]) {
    const previous = stats[id] ?? {
      attempts: 0, completed: 0, easyGood: 0, hard: 0, brutal: 0, consecutiveSuccesses: 0,
      lastRating: null, lastCompletedAt: null, lastDurationSeconds: null, progressionReady: false, coachDecision: null,
    } satisfies ExerciseStat
    const positive = session.rating === 'easy' || session.rating === 'good'
    const next = {
      ...previous,
      attempts: previous.attempts + 1,
      completed: previous.completed + 1,
      easyGood: previous.easyGood + (positive ? 1 : 0),
      hard: previous.hard + (session.rating === 'hard' ? 1 : 0),
      brutal: previous.brutal + (session.rating === 'brutal' ? 1 : 0),
      consecutiveSuccesses: positive ? previous.consecutiveSuccesses + 1 : 0,
      lastRating: session.rating,
      lastCompletedAt: session.date,
      lastDurationSeconds: session.exercises.find(item => item.id === id)?.durationSeconds ?? null,
    }
    const exercise = resolveExercise(id, state)
    const action = session.rating === 'brutal' && exercise && exercise.level > 1
      ? 'regress'
      : next.consecutiveSuccesses >= 3 && exercise && exercise.level < MAX_LEVEL ? 'progress' : 'maintain'
    stats[id] = { ...next, progressionReady: action === 'progress', coachDecision: action }
  }
  return { ...state, exerciseStats: stats, history: [session, ...state.history].slice(0, 250) }
}

export function generateCategoryWorkout(area: MuscleArea, state: AppState, durationMinutes = 20) {
  const recover = area === 'hips'
  return generateWorkout({
    intention: recover ? 'recover' : 'train',
    goal: recover ? 'mobility' : area === 'full_body' ? 'endurance' : state.profile.goal,
    durationMinutes,
    focusAreas: [area],
    equipment: state.profile.equipment,
    level: state.profile.level,
    includeConditioning: area === 'full_body',
    includeWarmup: !recover,
    exercisesPerRound: 'auto',
    targetSets: 'auto',
    recoveryModes: ['mobility', 'stretching'],
  }, state, `${new Date().toISOString().slice(0, 10)}:${area}`)
}

export function createManualWorkout(ids: string[], state: AppState): WorkoutPlan {
  const selected = ids.map(id => resolveExercise(id, state)).filter((item): item is Exercise => Boolean(item))
  const preferences: BuilderPreferences = {
    intention: 'train', goal: state.profile.goal, durationMinutes: 'auto', focusAreas: [], equipment: state.profile.equipment,
    level: state.profile.level, includeConditioning: true, includeWarmup: true, exercisesPerRound: 'auto', targetSets: 1,
    recoveryModes: ['mobility', 'stretching'],
  }
  const manual: WorkoutExercise[] = selected.map(exercise => planItem(
    exercise,
    exercise.category === 'warmup' ? 'Prepare' : exercise.category === 'mobility' || exercise.category === 'stretching' || exercise.category === 'mindfulness' ? 'Restore' : exercise.category === 'conditioning' ? 'Condition' : 'Main work',
    preferences,
    state,
  ))
  const durationMinutes = estimatedPlanMinutes(manual)
  return {
    id: `manual_${Date.now()}`,
    name: 'My selected workout',
    intention: 'train',
    goal: state.profile.goal,
    durationMinutes,
    targetDurationMinutes: durationMinutes,
    equipment: [...state.profile.equipment],
    createdAt: new Date().toISOString(),
    exercises: manual,
    focusAreas: [],
    insights: [`${manual.length} movements selected from your library.`, 'Adjust, scale, swap, reorder, or avoid any movement before starting.'],
  }
}
