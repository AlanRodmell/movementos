import type { ActiveSession, AppState, Category, Equipment, Exercise, Goal, Level, MuscleArea, WorkoutExercise, WorkoutPlan, WorkoutSession } from '../domain/types'

export const STORAGE_KEY = 'movementos:state'
// The external contract deliberately stays at v11 so legacy installs and backups remain compatible.
export const SCHEMA_VERSION = 11

export const defaultState: AppState = {
  schemaVersion: SCHEMA_VERSION,
  profile: {
    name: '', level: 2, goal: 'general', equipment: ['none', 'wall', 'chair'], soundEnabled: true,
    waitBetweenExercises: true, avoidList: [], favourites: [], advancedBridges: false,
  },
  issues: [], history: [], savedPlans: [], customExercises: [], activeSession: null,
}

const goals: Goal[] = ['general','strength','muscle','endurance','mobility']
const categories: Category[] = ['warmup','upper','lower','core','conditioning','mobility','mindfulness']
const equipment: Equipment[] = ['none','wall','chair','bench','table','bar','bands','dumbbells','kettlebell','barbell','cable','machine','slider','box','rope']
const areas: MuscleArea[] = ['full_body','upper_body','lower_body','chest','upper_back','lower_back','shoulders','anterior_shoulder','posterior_shoulder','biceps','triceps','core','deep_core','rectus_abdominis','obliques','hips','hip_flexors','glutes','quads','hamstrings','adductors','calves','legs','neck','mind']
const safeText = (value: unknown, fallback = '', max = 500) => typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max) : fallback
const safeIds = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter(item => typeof item === 'string' && /^[\w-]{1,100}$/.test(item)))].slice(0, 1000) : []
const level = (value: unknown): Level => Math.max(1, Math.min(5, Number(value) || 2)) as Level
const safeArea = (value: unknown, fallback: MuscleArea = 'full_body') => areas.includes(value as MuscleArea) ? value as MuscleArea : fallback

function migrateHistory(raw: Record<string, unknown>): WorkoutSession[] {
  const source = Array.isArray(raw.workoutHistory) ? raw.workoutHistory : Array.isArray(raw.history) ? raw.history : []
  return source.filter(item => item && typeof item === 'object').slice(0, 250).map((item, index) => {
    const session = item as Record<string, unknown>
    const exerciseRows = (Array.isArray(session.exercises) ? session.exercises : []).map(entry => {
      const exercise: Record<string, unknown> = typeof entry === 'object' && entry ? entry as Record<string, unknown> : { id: entry }
      return {
        id: safeText(exercise.id, '', 100), name: safeText(exercise.name ?? exercise.id, 'Exercise', 120),
        prescription: safeText(exercise.prescription ?? exercise.reps, '', 80), durationSeconds: Math.max(0, Number(exercise.durationSeconds ?? exercise.secs) || 0),
      }
    }).filter(entry => entry.id)
    return {
      id: safeText(session.id, `session_import_${index}`, 100), planName: safeText(session.planName ?? session.name, 'Workout', 120),
      date: Number.isFinite(Date.parse(String(session.date))) ? new Date(String(session.date)).toISOString() : new Date(0).toISOString(),
      durationSeconds: Math.max(0, Number(session.durationSeconds) || 0),
      intention: session.intention === 'recovery' || session.intention === 'recover' ? 'recover' : 'train',
      goal: goals.includes(session.goal as Goal) ? session.goal as Goal : 'general',
      rating: ['easy','good','hard','brutal','unrated'].includes(String(session.rating)) ? session.rating as WorkoutSession['rating'] : 'unrated',
      completedExerciseIds: safeIds(session.completedExerciseIds).length ? safeIds(session.completedExerciseIds) : exerciseRows.map(entry => entry.id),
      exercises: exerciseRows,
    }
  })
}

function legacyCategory(id: string, item: Record<string, unknown>): Category {
  if (categories.includes(item.category as Category)) return item.category as Category
  return ({ u:'upper', l:'lower', k:'core', c:'conditioning', m:'mobility', b:'mindfulness', w:'warmup' } as Record<string, Category>)[id[0]] ?? 'upper'
}

function migrateCustomExercises(raw: Record<string, unknown>): Exercise[] {
  const source = Array.isArray(raw.customExercises) ? raw.customExercises : raw.customExercises && typeof raw.customExercises === 'object'
    ? Object.entries(raw.customExercises as object).map(([id, item]) => ({ id, ...(item as object) })) : []
  return source.filter(item => item && typeof item === 'object').map((item, index) => {
    const exercise = item as Record<string, unknown>
    const id = safeText(exercise.id, `u_custom_${index}`, 100)
    const rawEquipment = Array.isArray(exercise.equipment) ? exercise.equipment.filter(value => equipment.includes(value as Equipment)) as Equipment[] : []
    const rawPrimary = Array.isArray(exercise.primaryMuscles) ? exercise.primaryMuscles.map(value => safeArea(value)).slice(0, 10) : [safeArea(exercise.customBodyArea)]
    return {
      id, name: safeText(exercise.name, 'Custom exercise', 120), description: safeText(exercise.description ?? exercise.detail, 'Custom exercise.', 600),
      category: legacyCategory(id, exercise), pattern: safeText(exercise.pattern ?? exercise.family, 'custom', 80), level: level(exercise.level ?? exercise.tier),
      durationSeconds: Math.max(1, Math.min(3600, Number(exercise.durationSeconds ?? exercise.secs) || 30)), prescription: safeText(exercise.prescription ?? exercise.reps, '10 reps', 80),
      equipment: rawEquipment.length ? rawEquipment : ['none'], primaryMuscles: rawPrimary, secondaryMuscles: [], unilateral: Boolean(exercise.unilateral),
      lowImpact: exercise.lowImpact !== false, goals: Array.isArray(exercise.goals) ? exercise.goals.filter(value => goals.includes(value as Goal)) as Goal[] : ['general'],
      contraindications: Array.isArray(exercise.contraindications) ? exercise.contraindications.map(value => safeArea(value)).slice(0, 10) : [], isCustom: true,
    } satisfies Exercise
  }).slice(0, 250)
}

function planFromUnknown(value: unknown, fallbackId = 'plan_import'): WorkoutPlan | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const direct = Array.isArray(raw.exercises) ? raw.exercises : null
  const legacy = Array.isArray(raw.groups) ? raw.groups.flatMap(group => {
    const source = group && typeof group === 'object' ? group as Record<string, unknown> : {}
    return (Array.isArray(source.items) ? source.items : []).map(item => ({ ...(item as object), section: safeText(source.heading, 'Main work', 120) }))
  }) : []
  const exercises: WorkoutExercise[] = (direct ?? legacy).filter(item => item && typeof item === 'object').map(item => {
    const entry = item as Record<string, unknown>
    const heading = safeText(entry.section, 'Main work', 30)
    const section: WorkoutExercise['section'] = heading === 'Prepare' || heading === 'Condition' || heading === 'Restore' ? heading : 'Main work'
    return { exerciseId: safeText(entry.exerciseId ?? entry.id, '', 100), prescription: safeText(entry.prescription ?? entry.reps, '', 80), durationSeconds: Math.max(1, Math.min(3600, Number(entry.durationSeconds ?? entry.secs) || 30)), rationale: safeText(entry.rationale, 'Saved exercise', 200), section }
  }).filter(item => item.exerciseId)
  if (!exercises.length) return null
  return {
    id: safeText(raw.id, fallbackId, 100), name: safeText(raw.name, 'Saved workout', 120), intention: raw.intention === 'recover' || raw.intention === 'recovery' ? 'recover' : 'train',
    goal: goals.includes(raw.goal as Goal) ? raw.goal as Goal : 'general', durationMinutes: Math.max(1, Number(raw.durationMinutes) || Math.round(exercises.reduce((sum,item) => sum + item.durationSeconds, 0) / 60)),
    createdAt: Number.isFinite(Date.parse(String(raw.createdAt))) ? new Date(String(raw.createdAt)).toISOString() : new Date(0).toISOString(), exercises,
    insights: Array.isArray(raw.insights) ? raw.insights.map(value => safeText(value, '', 200)).filter(Boolean).slice(0, 10) : ['Restored from your saved workout library.'],
  }
}

function migrateActiveSession(value: unknown): ActiveSession | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const plan = planFromUnknown(raw.plan, 'active_plan')
  if (!plan) return null
  const index = Math.max(0, Math.min(plan.exercises.length - 1, Number(raw.index) || 0))
  return { plan, index, remainingSeconds: Math.max(0, Number(raw.remainingSeconds) || plan.exercises[index].durationSeconds), running: Boolean(raw.running), deadlineAt: Number(raw.deadlineAt) || null, startedAt: Number(raw.startedAt) || Date.now(), completedExerciseIds: safeIds(raw.completedExerciseIds) }
}

export function normaliseState(value: unknown): AppState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return structuredClone(defaultState)
  const raw = value as Record<string, unknown>
  const profile = raw.profile && typeof raw.profile === 'object' ? raw.profile as Record<string, unknown> : {}
  const inferredLevel = Math.round(['upper','lower','core','conditioning'].reduce((sum, key) => sum + (Number(profile[key]) || 2), 0) / 4)
  const savedSource = Array.isArray(raw.savedPlans) ? raw.savedPlans : Array.isArray(raw.savedWorkouts) ? raw.savedWorkouts : []
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: safeText(profile.name, '', 80), level: level(profile.level ?? inferredLevel),
      goal: goals.includes(profile.goal as Goal) ? profile.goal as Goal : goals.includes(profile.trainingGoal as Goal) ? profile.trainingGoal as Goal : 'general',
      equipment: Array.isArray(profile.equipment) ? profile.equipment.filter(item => equipment.includes(item as Equipment)) as Equipment[] : ['none','wall','chair'],
      soundEnabled: profile.soundEnabled !== false, waitBetweenExercises: profile.waitBetweenExercises !== false,
      avoidList: safeIds(profile.avoidList), favourites: safeIds(profile.favourites ?? profile.alwaysInclude), advancedBridges: Boolean(profile.advancedBridges ?? (profile.unlocks as Record<string, unknown> | undefined)?.advancedBridges),
    },
    issues: Array.isArray(raw.issues) ? raw.issues.filter(item => item && typeof item === 'object').map((item, index) => {
      const issue = item as Record<string, unknown>
      return { id: safeText(issue.id, `issue_${index}`, 100), area: safeArea(issue.area, 'lower_back'), severity: ['mild','moderate','flare'].includes(String(issue.severity)) ? issue.severity as 'mild'|'moderate'|'flare' : 'mild', status: issue.status === 'resolved' ? 'resolved' as const : 'active' as const, note: safeText(issue.note, '', 500), createdAt: safeText(issue.createdAt, new Date().toISOString(), 40) }
    }).slice(0, 250) : [],
    history: migrateHistory(raw), savedPlans: savedSource.map((item,index) => planFromUnknown(item, `plan_import_${index}`)).filter((item): item is WorkoutPlan => Boolean(item)).slice(0,100),
    customExercises: migrateCustomExercises(raw), activeSession: migrateActiveSession(raw.activeSession),
  }
}

function legacyGroups(plan: WorkoutPlan) {
  return ['Prepare','Main work','Condition','Restore'].map(heading => ({
    heading,
    items: plan.exercises.filter(item => item.section === heading).map((item,index) => ({ id:item.exerciseId, reps:item.prescription, secs:item.durationSeconds, adjusted:false, scaled:null, originalTier:0, ukey:`${item.exerciseId}_${index}` })),
  })).filter(group => group.items.length)
}

export function serializeLegacyState(state: AppState) {
  const customExercises = Object.fromEntries(state.customExercises.map(exercise => [exercise.id, {
    name: exercise.name, reps: exercise.prescription, secs: exercise.durationSeconds, detail: exercise.description, bp: [...exercise.primaryMuscles, ...exercise.secondaryMuscles],
    tier: exercise.level, family: exercise.pattern, isCustom: true, customBodyArea: exercise.primaryMuscles[0] ?? 'full_body', videoUrl: '',
    category: exercise.category, equipment: exercise.equipment, primaryMuscles: exercise.primaryMuscles, unilateral: exercise.unilateral, lowImpact: exercise.lowImpact, goals: exercise.goals, contraindications: exercise.contraindications,
  }]))
  return {
    schemaVersion: SCHEMA_VERSION, dailyCheckIn: { date:null, tightAreas:[], primaryArea:null },
    profile: { height:'', weight:'', heightUnit:'cm', weightUnit:'kg', trainingGoal:state.profile.goal, upper:Math.min(3,state.profile.level), lower:Math.min(3,state.profile.level), core:Math.min(3,state.profile.level), conditioning:Math.min(3,state.profile.level), unlocks:{ advancedBridges:state.profile.advancedBridges }, soundEnabled:state.profile.soundEnabled, waitBetweenExercises:state.profile.waitBetweenExercises, avoidList:state.profile.avoidList, alwaysInclude:state.profile.favourites, name:state.profile.name, level:state.profile.level, goal:state.profile.goal, equipment:state.profile.equipment, favourites:state.profile.favourites },
    rotation:{}, history:{},
    workoutHistory: state.history.map(session => ({ id:session.id, date:session.date, name:session.planName, durationSeconds:session.durationSeconds, plannedExercises:session.exercises.length, completedExercises:session.completedExerciseIds.length, rating:session.rating, focus:[], intention:session.intention === 'recover' ? 'recovery' : 'workout', goal:session.goal, completedExerciseIds:session.completedExerciseIds, exercises:session.exercises.map(exercise => ({ id:exercise.id, name:exercise.name, family:null, reps:exercise.prescription, detail:'', secs:exercise.durationSeconds })) , areaLoadBefore:{} })),
    exerciseStats:{}, recovery:{ upper:0, lower:0, core:0, conditioning:0 },
    savedWorkouts: state.savedPlans.map(plan => ({ id:plan.id, name:plan.name, groups:legacyGroups(plan), intention:plan.intention, goal:plan.goal, durationMinutes:plan.durationMinutes, createdAt:plan.createdAt, insights:plan.insights })),
    customExercises, issues:state.issues, activeSession:state.activeSession,
  }
}

export function loadState(): AppState {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? normaliseState(JSON.parse(raw)) : structuredClone(defaultState) } catch { return structuredClone(defaultState) }
}

export function saveState(state: AppState) { localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeLegacyState(state))) }

function download(contents: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url)
}

export function downloadBackup(state: AppState) { download(JSON.stringify(serializeLegacyState(state), null, 2), 'movement-os-backup.json', 'application/json;charset=utf-8') }

const csvCell = (value: unknown) => { let text = String(value ?? ''); if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"','""')}"` }
export function downloadHistoryCsv(state: AppState) {
  const rows = ['Date,Workout Name,Duration (sec),Rating,Completed Exercises,Exercise Details', ...state.history.map(session => [new Date(session.date).toLocaleDateString(), session.planName, session.durationSeconds, session.rating, session.exercises.length, session.exercises.map(exercise => `${exercise.name}: ${exercise.prescription}`).join(' | ')].map(csvCell).join(','))]
  download(rows.join('\n'), 'movement-os-history.csv', 'text/csv;charset=utf-8')
}
