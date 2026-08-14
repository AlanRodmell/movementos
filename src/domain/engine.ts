import { exerciseById, exercises } from '../data/exercises'
import type { AppState, BuilderPreferences, Exercise, MuscleArea, WorkoutPlan } from './types'

const sectionTargets = {
  train: { Prepare: 0.16, 'Main work': 0.58, Condition: 0.12, Restore: 0.14 },
  recover: { Prepare: 0.1, 'Main work': 0, Condition: 0, Restore: 0.9 },
} as const

function hash(input: string) {
  let value = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return Math.abs(value)
}

function seededNoise(seed: string, id: string) {
  return (hash(`${seed}:${id}`) % 1000) / 1000
}

function muscles(exercise: Exercise) {
  return [...exercise.primaryMuscles, ...exercise.secondaryMuscles]
}

function matchesFocus(exercise: Exercise, area: MuscleArea) {
  if (area === 'full_body') return !['mobility','mindfulness'].includes(exercise.category)
  if (area === 'upper_body') return exercise.category === 'upper'
  if (area === 'lower_body') return exercise.category === 'lower'
  if (area === 'core') return exercise.category === 'core' || muscles(exercise).includes('core') || muscles(exercise).includes('deep_core')
  return muscles(exercise).includes(area)
}

function recentMuscleLoad(state: AppState) {
  const cutoff = Date.now() - 72 * 60 * 60 * 1000
  const load = new Map<MuscleArea, number>()
  state.history.filter(session => Date.parse(session.date) >= cutoff).forEach(session => {
    session.completedExerciseIds.forEach(id => {
      const exercise = exerciseById.get(id) ?? state.customExercises.find(item => item.id === id)
      exercise?.primaryMuscles.forEach(area => load.set(area, (load.get(area) ?? 0) + (exercise.level || 1)))
    })
  })
  return load
}

function equipmentMatches(exercise: Exercise, selected: Set<string>) {
  return exercise.equipment.includes('none') || exercise.equipment.every(item => selected.has(item))
}

function issuePenalty(exercise: Exercise, state: AppState) {
  const affected = new Set(muscles(exercise))
  let penalty = 0
  for (const issue of state.issues.filter(item => item.status === 'active')) {
    if (!affected.has(issue.area)) continue
    if (issue.severity === 'flare') return Number.NEGATIVE_INFINITY
    penalty += issue.severity === 'moderate' ? 18 : 7
  }
  return penalty
}

function candidateScore(exercise: Exercise, preferences: BuilderPreferences, state: AppState, seed: string, usedPatterns: Map<string, number>, load: Map<MuscleArea, number>) {
  const injuryPenalty = issuePenalty(exercise, state)
  if (!Number.isFinite(injuryPenalty)) return injuryPenalty
  let score = seededNoise(seed, exercise.id) * 3
  if (exercise.goals.includes(preferences.goal)) score += 10
  if (preferences.focusAreas.some(area => matchesFocus(exercise, area))) score += 20
  if (state.profile.favourites.includes(exercise.id)) score += 4
  score -= (usedPatterns.get(exercise.pattern) ?? 0) * 9
  score -= exercise.primaryMuscles.reduce((sum, area) => sum + (load.get(area) ?? 0) * 0.7, 0)
  score -= injuryPenalty
  if (exercise.level === preferences.level) score += 5
  if (exercise.level === preferences.level + 1) score += 1
  if (!preferences.includeConditioning && exercise.category === 'conditioning') score -= 40
  return score
}

function eligible(category: Exercise['category'], preferences: BuilderPreferences, state: AppState) {
  const selectedEquipment = new Set(['none', ...preferences.equipment])
  return [...exercises, ...state.customExercises].filter(exercise =>
    exercise.category === category &&
    exercise.level <= preferences.level + 1 &&
    equipmentMatches(exercise, selectedEquipment) &&
    !state.profile.avoidList.includes(exercise.id) &&
    (!exercise.optIn || state.profile.advancedBridges) &&
    Number.isFinite(issuePenalty(exercise, state)),
  )
}

function pick(pool: Exercise[], count: number, preferences: BuilderPreferences, state: AppState, seed: string, used: Set<string>, usedPatterns: Map<string, number>, load: Map<MuscleArea, number>) {
  const result: Exercise[] = []
  while (result.length < count) {
    const ranked = pool
      .filter(exercise => !used.has(exercise.id))
      .map(exercise => ({ exercise, score: candidateScore(exercise, preferences, state, seed, usedPatterns, load) }))
      .sort((a, b) => b.score - a.score)
    const next = ranked[0]?.exercise
    if (!next) break
    result.push(next)
    used.add(next.id)
    usedPatterns.set(next.pattern, (usedPatterns.get(next.pattern) ?? 0) + 1)
  }
  return result
}

function rationale(exercise: Exercise, preferences: BuilderPreferences) {
  const reasons = []
  if (exercise.goals.includes(preferences.goal)) reasons.push(`supports ${preferences.goal}`)
  const focus = preferences.focusAreas.find(area => matchesFocus(exercise, area))
  if (focus) reasons.push(`targets ${focus.replaceAll('_', ' ')}`)
  if (exercise.lowImpact) reasons.push('low impact')
  return reasons.length ? reasons.join(' · ') : `balances the ${exercise.pattern.replaceAll('_', ' ')} pattern`
}

export function generateWorkout(preferences: BuilderPreferences, state: AppState, seed = new Date().toISOString().slice(0, 10)): WorkoutPlan {
  const used = new Set<string>()
  const patterns = new Map<string, number>()
  const load = recentMuscleLoad(state)
  const targets = sectionTargets[preferences.intention]
  const usableSeconds = preferences.durationMinutes * 60
  const countFor = (ratio: number, average = 55) => Math.max(0, Math.round((usableSeconds * ratio) / average))

  const warmup = pick(eligible('warmup', preferences, state), Math.max(1, countFor(targets.Prepare, 40)), preferences, state, `${seed}:warm`, used, patterns, load)
  const mainCategories: Exercise['category'][] = preferences.intention === 'recover' ? ['mobility', 'mindfulness'] : ['upper', 'lower', 'core']
  const mainPool = mainCategories.flatMap(category => eligible(category, preferences, state))
  const main = pick(mainPool, preferences.intention === 'recover' ? 0 : Math.max(3, countFor(targets['Main work'], 60)), preferences, state, `${seed}:main`, used, patterns, load)
  const conditioning = preferences.intention === 'train' && preferences.includeConditioning
    ? pick(eligible('conditioning', preferences, state), Math.max(1, countFor(targets.Condition, 45)), preferences, state, `${seed}:condition`, used, patterns, load)
    : []
  const restorePool = [...eligible('mobility', preferences, state), ...eligible('mindfulness', preferences, state)]
  const restore = pick(restorePool, Math.max(2, countFor(targets.Restore, 60)), preferences, state, `${seed}:restore`, used, patterns, load)

  const sections: Array<[WorkoutPlan['exercises'][number]['section'], Exercise[]]> = [
    ['Prepare', warmup], ['Main work', main], ['Condition', conditioning], ['Restore', restore],
  ]
  const selected = sections.flatMap(([section, items]) => items.map(exercise => ({
    exerciseId: exercise.id,
    prescription: exercise.prescription,
    durationSeconds: exercise.durationSeconds,
    rationale: rationale(exercise, preferences),
    section,
  })))
  const activeIssues = state.issues.filter(issue => issue.status === 'active')
  const focusLabel = preferences.focusAreas.length ? preferences.focusAreas.map(area => area.replaceAll('_', ' ')).join(' + ') : 'full body'
  return {
    id: `plan_${Date.now()}`,
    name: preferences.intention === 'recover' ? `${preferences.durationMinutes} min Restore` : `${focusLabel.replace(/\b\w/g, char => char.toUpperCase())} · ${preferences.goal}`,
    intention: preferences.intention,
    goal: preferences.goal,
    durationMinutes: preferences.durationMinutes,
    createdAt: new Date().toISOString(),
    exercises: selected,
    insights: [
      `${selected.length} movements selected from ${exercises.length + state.customExercises.length} supported exercises.`,
      preferences.equipment.length ? `Built for ${preferences.equipment.join(', ')}.` : 'No specialist equipment required.',
      activeIssues.length ? `Adjusted around ${activeIssues.length} active issue${activeIssues.length === 1 ? '' : 's'}.` : 'No active issue constraints applied.',
      load.size ? 'Recent muscle load was used to reduce repeated stress.' : 'This is your baseline session; future plans will learn from completed work.',
    ],
  }
}

export function generateCategoryWorkout(area: MuscleArea, state: AppState, durationMinutes = 20) {
  const recovery = area === 'hips'
  return generateWorkout({
    intention: recovery ? 'recover' : 'train',
    goal: recovery ? 'mobility' : area === 'full_body' ? 'endurance' : state.profile.goal,
    durationMinutes,
    focusAreas: [area],
    equipment: state.profile.equipment,
    level: state.profile.level,
    includeConditioning: area === 'full_body',
  }, state, `${new Date().toISOString().slice(0, 10)}:${area}`)
}
