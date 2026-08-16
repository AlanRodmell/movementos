import type { ActiveSession, AppState, Category, Equipment, Exercise, ExerciseStat, Goal, Level, MuscleArea, WorkoutExercise, WorkoutPlan, WorkoutSession } from '../domain/types'

export const STORAGE_KEY = 'movementos:state'
// The external contract deliberately stays at v11 so legacy installs and backups remain compatible.
export const SCHEMA_VERSION = 11

export const defaultState: AppState = {
  schemaVersion: SCHEMA_VERSION,
  profile: {
    name: '', level: 2, goal: 'general', equipment: ['none', 'wall', 'chair'], soundEnabled: true,
    waitBetweenExercises: true, avoidList: [], favourites: [], advancedBridges: false,
    height:'', weight:'', heightUnit:'cm', weightUnit:'kg', upper:2, lower:2, core:2, conditioning:2,
  },
  issues: [], history: [], savedPlans: [], customExercises: [], activeSession: null,
  dailyCheckIn:{ date:null, tightAreas:[], primaryArea:null }, exerciseStats:{}, rotation:{}, legacyHistory:{},
  recovery:{ upper:0, lower:0, core:0, conditioning:0 },
}

const goals: Goal[] = ['general','strength','muscle','endurance','mobility']
const categories: Category[] = ['warmup','upper','lower','core','conditioning','mobility','stretching','mindfulness']
const equipment: Equipment[] = ['none','wall','chair','bench','table','bar','bands','dumbbells','kettlebell','barbell','cable','machine','slider','box','rope']
const areas: MuscleArea[] = ['full_body','upper_body','lower_body','chest','upper_back','lower_back','shoulders','anterior_shoulder','posterior_shoulder','biceps','triceps','core','deep_core','rectus_abdominis','obliques','hips','hip_flexors','glutes','quads','hamstrings','adductors','calves','legs','neck','mind','elbows','forearms','wrists','hands','knees','shins','ankles','feet']
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
      focus: Array.isArray(session.focus) ? session.focus.map(value => safeArea(value)).slice(0,20) : [],
      areaLoadBefore: session.areaLoadBefore && typeof session.areaLoadBefore === 'object' ? session.areaLoadBefore as WorkoutSession['areaLoadBefore'] : {},
    }
  })
}

function numericMap(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value as Record<string,unknown>).filter(([key]) => /^[\w-]{1,100}$/.test(key)).map(([key,raw]) => [key, Number(raw) || 0]).slice(0,1000))
}

function migrateExerciseStats(value: unknown): Record<string, ExerciseStat> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value as Record<string,unknown>).filter(([id,item]) => /^[\w-]{1,100}$/.test(id) && item && typeof item === 'object').map(([id,item]) => {
    const raw = item as Record<string,unknown>
    const rating = ['easy','good','hard','brutal','unrated'].includes(String(raw.lastRating)) ? raw.lastRating as ExerciseStat['lastRating'] : null
    const decision = ['progress','maintain','regress'].includes(String(raw.coachDecision)) ? raw.coachDecision as ExerciseStat['coachDecision'] : null
    return [id, { attempts:Number(raw.attempts)||0, completed:Number(raw.completed)||0, easyGood:Number(raw.easyGood)||0, hard:Number(raw.hard)||0, brutal:Number(raw.brutal)||0, consecutiveSuccesses:Number(raw.consecutiveSuccesses)||0, lastRating:rating, lastCompletedAt:raw.lastCompletedAt ? safeText(raw.lastCompletedAt,'',40) : null, lastDurationSeconds:raw.lastDurationSeconds == null ? null : Number(raw.lastDurationSeconds)||0, progressionReady:Boolean(raw.progressionReady), coachDecision:decision } satisfies ExerciseStat]
  }).slice(0,1000))
}

function rebuildExerciseStats(history:WorkoutSession[]):Record<string,ExerciseStat> {
  const stats:Record<string,ExerciseStat>={}
  history.slice().sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)).forEach(session=>[...new Set(session.completedExerciseIds)].forEach(id=>{
    const previous=stats[id]??{ attempts:0,completed:0,easyGood:0,hard:0,brutal:0,consecutiveSuccesses:0,lastRating:null,lastCompletedAt:null,lastDurationSeconds:null,progressionReady:false,coachDecision:null }
    const positive=session.rating==='easy'||session.rating==='good';const consecutiveSuccesses=positive?previous.consecutiveSuccesses+1:0
    stats[id]={ attempts:previous.attempts+1,completed:previous.completed+1,easyGood:previous.easyGood+(positive?1:0),hard:previous.hard+(session.rating==='hard'?1:0),brutal:previous.brutal+(session.rating==='brutal'?1:0),consecutiveSuccesses,lastRating:session.rating,lastCompletedAt:session.date,lastDurationSeconds:session.exercises.find(item=>item.id===id)?.durationSeconds??null,progressionReady:consecutiveSuccesses>=3,coachDecision:session.rating==='brutal'?'regress':consecutiveSuccesses>=3?'progress':'maintain' }
  }))
  return stats
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
      contraindications: Array.isArray(exercise.contraindications) ? exercise.contraindications.map(value => safeArea(value)).slice(0, 10) : [], videoUrl:safeText(exercise.videoUrl,'',1000), isCustom: true,
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
    const scaled:WorkoutExercise['scaled']=entry.scaled==='up'||entry.scaled==='down'?entry.scaled:null
    return { exerciseId: safeText(entry.exerciseId ?? entry.id, '', 100), prescription: safeText(entry.prescription ?? entry.reps, '', 80), durationSeconds: Math.max(1, Math.min(3600, Number(entry.durationSeconds ?? entry.secs) || 30)), rationale: safeText(entry.rationale, 'Saved exercise', 200), section, adjusted:Boolean(entry.adjusted), scaled, originalLevel:Number(entry.originalLevel??entry.originalTier)||0, setNumber:Number(entry.setNumber)||undefined, totalSets:Number(entry.totalSets)||undefined }
  }).filter(item => item.exerciseId)
  if (!exercises.length) return null
  return {
    id: safeText(raw.id, fallbackId, 100), name: safeText(raw.name, 'Saved workout', 120), intention: raw.intention === 'recover' || raw.intention === 'recovery' ? 'recover' : 'train',
    goal: goals.includes(raw.goal as Goal) ? raw.goal as Goal : 'general', durationMinutes: Math.max(1, Number(raw.durationMinutes) || Math.round(exercises.reduce((sum,item) => sum + item.durationSeconds, 0) / 60)),
    targetDurationMinutes: Math.max(1, Number(raw.targetDurationMinutes) || Number(raw.durationMinutes) || Math.round(exercises.reduce((sum,item) => sum + item.durationSeconds, 0) / 60)),
    equipment: Array.isArray(raw.equipment) ? raw.equipment.filter(item => equipment.includes(item as Equipment)) as Equipment[] : undefined,
    createdAt: Number.isFinite(Date.parse(String(raw.createdAt))) ? new Date(String(raw.createdAt)).toISOString() : new Date(0).toISOString(), exercises,
    insights: Array.isArray(raw.insights) ? raw.insights.map(value => safeText(value, '', 200)).filter(Boolean).slice(0, 10) : ['Restored from your saved workout library.'],
    focusAreas: Array.isArray(raw.focusAreas) ? raw.focusAreas.map(value => safeArea(value)).slice(0, 20) : [],
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
  const history=migrateHistory(raw)
  const migratedStats=migrateExerciseStats(raw.exerciseStats)
  const exerciseStats=Object.keys(migratedStats).length?migratedStats:rebuildExerciseStats(history)
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: safeText(profile.name, '', 80), level: level(profile.level ?? inferredLevel),
      goal: goals.includes(profile.goal as Goal) ? profile.goal as Goal : goals.includes(profile.trainingGoal as Goal) ? profile.trainingGoal as Goal : 'general',
      equipment: Array.isArray(profile.equipment) ? profile.equipment.filter(item => equipment.includes(item as Equipment)) as Equipment[] : ['none','wall','chair'],
      soundEnabled: profile.soundEnabled !== false, waitBetweenExercises: profile.waitBetweenExercises !== false,
      avoidList: safeIds(profile.avoidList), favourites: safeIds(profile.favourites ?? profile.alwaysInclude), advancedBridges: Boolean(profile.advancedBridges ?? (profile.unlocks as Record<string, unknown> | undefined)?.advancedBridges),
      height:safeText(profile.height,'',12), weight:safeText(profile.weight,'',12), heightUnit:profile.heightUnit === 'in' ? 'in' : 'cm', weightUnit:profile.weightUnit === 'lbs' ? 'lbs' : 'kg',
      upper:level(profile.upper ?? profile.level), lower:level(profile.lower ?? profile.level), core:level(profile.core ?? profile.level), conditioning:level(profile.conditioning ?? profile.level),
    },
    issues: Array.isArray(raw.issues) ? raw.issues.filter(item => item && typeof item === 'object').map((item, index) => {
      const issue = item as Record<string, unknown>
      return { id: safeText(issue.id, `issue_${index}`, 100), area: safeArea(issue.area, 'lower_back'), severity: ['mild','moderate','flare'].includes(String(issue.severity)) ? issue.severity as 'mild'|'moderate'|'flare' : 'mild', status: issue.status === 'resolved' ? 'resolved' as const : 'active' as const, note: safeText(issue.note, '', 500), createdAt: safeText(issue.createdAt, new Date().toISOString(), 40), side:['left','right','bilateral'].includes(String(issue.side)) ? issue.side as 'left'|'right'|'bilateral' : 'bilateral', resolvedAt:issue.resolvedAt ? safeText(issue.resolvedAt,'',40) : null }
    }).slice(0, 250) : [],
    history, savedPlans: savedSource.map((item,index) => planFromUnknown(item, `plan_import_${index}`)).filter((item): item is WorkoutPlan => Boolean(item)).slice(0,100),
    customExercises: migrateCustomExercises(raw), activeSession: migrateActiveSession(raw.activeSession),
    dailyCheckIn: raw.dailyCheckIn && typeof raw.dailyCheckIn === 'object' ? (() => { const check = raw.dailyCheckIn as Record<string,unknown>; return { date:check.date ? safeText(check.date,'',40) : null, tightAreas:Array.isArray(check.tightAreas) ? check.tightAreas.map(value => safeArea(value)).slice(0,30) : [], primaryArea:check.primaryArea ? safeArea(check.primaryArea) : null } })() : { date:null,tightAreas:[],primaryArea:null },
    exerciseStats, rotation:numericMap(raw.rotation), legacyHistory:numericMap(raw.history),
    recovery:{ upper:Number((raw.recovery as Record<string,unknown> | undefined)?.upper)||0, lower:Number((raw.recovery as Record<string,unknown> | undefined)?.lower)||0, core:Number((raw.recovery as Record<string,unknown> | undefined)?.core)||0, conditioning:Number((raw.recovery as Record<string,unknown> | undefined)?.conditioning)||0 },
  }
}

function legacyGroups(plan: WorkoutPlan) {
  return ['Prepare','Main work','Condition','Restore'].map(heading => ({
    heading,
    items: plan.exercises.filter(item => item.section === heading).map((item,index) => ({ id:item.exerciseId, reps:item.prescription, secs:item.durationSeconds, adjusted:Boolean(item.adjusted), scaled:item.scaled??null, originalTier:item.originalLevel??0, setNumber:item.setNumber, totalSets:item.totalSets, ukey:`${item.exerciseId}_${index}` })),
  })).filter(group => group.items.length)
}

export function serializeLegacyState(state: AppState) {
  const customExercises = Object.fromEntries(state.customExercises.map(exercise => [exercise.id, {
    name: exercise.name, reps: exercise.prescription, secs: exercise.durationSeconds, detail: exercise.description, bp: [...exercise.primaryMuscles, ...exercise.secondaryMuscles],
    tier: exercise.level, family: exercise.pattern, isCustom: true, customBodyArea: exercise.primaryMuscles[0] ?? 'full_body', videoUrl: exercise.videoUrl ?? '',
    category: exercise.category, equipment: exercise.equipment, primaryMuscles: exercise.primaryMuscles, unilateral: exercise.unilateral, lowImpact: exercise.lowImpact, goals: exercise.goals, contraindications: exercise.contraindications,
  }]))
  return {
    schemaVersion: SCHEMA_VERSION, dailyCheckIn:state.dailyCheckIn,
    profile: { height:state.profile.height, weight:state.profile.weight, heightUnit:state.profile.heightUnit, weightUnit:state.profile.weightUnit, trainingGoal:state.profile.goal, upper:state.profile.upper, lower:state.profile.lower, core:state.profile.core, conditioning:state.profile.conditioning, unlocks:{ advancedBridges:state.profile.advancedBridges }, soundEnabled:state.profile.soundEnabled, waitBetweenExercises:state.profile.waitBetweenExercises, avoidList:state.profile.avoidList, alwaysInclude:state.profile.favourites, name:state.profile.name, level:state.profile.level, goal:state.profile.goal, equipment:state.profile.equipment, favourites:state.profile.favourites },
    rotation:state.rotation, history:state.legacyHistory,
    workoutHistory: state.history.map(session => ({ id:session.id, date:session.date, name:session.planName, durationSeconds:session.durationSeconds, plannedExercises:session.exercises.length, completedExercises:session.completedExerciseIds.length, rating:session.rating, focus:session.focus, intention:session.intention === 'recover' ? 'recovery' : 'workout', goal:session.goal, completedExerciseIds:session.completedExerciseIds, exercises:session.exercises.map(exercise => ({ id:exercise.id, name:exercise.name, family:null, reps:exercise.prescription, detail:'', secs:exercise.durationSeconds })) , areaLoadBefore:session.areaLoadBefore })),
    exerciseStats:state.exerciseStats, recovery:state.recovery,
    savedWorkouts: state.savedPlans.map(plan => ({ id:plan.id, name:plan.name, groups:legacyGroups(plan), intention:plan.intention, goal:plan.goal, durationMinutes:plan.durationMinutes, targetDurationMinutes:plan.targetDurationMinutes, equipment:plan.equipment, createdAt:plan.createdAt, insights:plan.insights, focusAreas:plan.focusAreas })),
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
