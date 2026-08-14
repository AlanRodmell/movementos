import { catalogueStats, exerciseById } from '../data/exercises'
import { defaultState } from '../storage/state'
import { applySessionCompletion, createManualWorkout, generateWorkout, getExerciseDecision } from './engine'
import type { BuilderPreferences, WorkoutSession } from './types'

const preferences: BuilderPreferences = { intention:'train', goal:'strength', durationMinutes:30, focusAreas:['upper_body'], equipment:['none','wall','chair'], level:2, includeConditioning:false }

describe('workout engine', () => {
  it('substantially expands and preserves the catalogue', () => {
    expect(catalogueStats.legacy).toBe(223)
    expect(catalogueStats.total).toBeGreaterThan(300)
  })

  it('builds a varied, focus-led plan from available equipment', () => {
    const plan = generateWorkout(preferences, defaultState, 'fixed-seed')
    const main = plan.exercises.filter(item => item.section === 'Main work').map(item => exerciseById.get(item.exerciseId)!)
    expect(plan.exercises.length).toBeGreaterThanOrEqual(7)
    expect(main.filter(exercise => exercise.category === 'upper').length).toBeGreaterThan(main.length / 2)
    expect(new Set(main.map(exercise => exercise.pattern)).size).toBeGreaterThan(1)
    expect(main.every(exercise => exercise.equipment.includes('none') || exercise.equipment.every(item => preferences.equipment.includes(item)))).toBe(true)
  })

  it('removes movements that load an active flare-up', () => {
    const state = { ...defaultState, issues: [{ id:'issue', area:'chest' as const, severity:'flare' as const, status:'active' as const, note:'', createdAt:new Date().toISOString(), side:'bilateral' as const, resolvedAt:null }] }
    const plan = generateWorkout(preferences, state, 'injury-seed')
    expect(plan.exercises.map(item => exerciseById.get(item.exerciseId)!).every(exercise => ![...exercise.primaryMuscles,...exercise.secondaryMuscles].includes('chest'))).toBe(true)
  })

  it('is deterministic for the same inputs and seed', () => {
    const first = generateWorkout(preferences, defaultState, 'same').exercises.map(item => item.exerciseId)
    const second = generateWorkout(preferences, defaultState, 'same').exercises.map(item => item.exerciseId)
    expect(first).toEqual(second)
  })

  it('allows compatible custom exercises to participate in generation', () => {
    const custom = { id:'u_custom_test', name:'Custom press', description:'Test', category:'upper' as const, pattern:'custom_press', level:2 as const, durationSeconds:45, prescription:'10 reps', equipment:['none' as const], primaryMuscles:['chest' as const], secondaryMuscles:[], unilateral:false, lowImpact:true, goals:['strength' as const], contraindications:[], isCustom:true }
    const state = { ...defaultState, profile:{ ...defaultState.profile, favourites:[custom.id] }, customExercises:[custom] }
    const plan = generateWorkout(preferences, state, 'custom-seed')
    expect(plan.exercises.some(item => item.exerciseId === custom.id)).toBe(true)
  })

  it('adapts prescriptions around today’s check-in', () => {
    const state={...defaultState,dailyCheckIn:{date:new Date().toDateString(),tightAreas:['full_body' as const],primaryArea:'full_body' as const}}
    const plan=generateWorkout(preferences,state,'check-in')
    expect(plan.exercises.every(item=>item.adjusted)).toBe(true)
    expect(plan.insights.join(' ')).toContain('adjusted')
  })

  it('restores three-success progression and brutal-session regression', () => {
    const session=(rating:WorkoutSession['rating']):WorkoutSession=>({id:`s_${rating}_${Math.random()}`,planName:'Test',date:new Date().toISOString(),durationSeconds:60,intention:'train',goal:'strength',rating,completedExerciseIds:['x001'],exercises:[{id:'x001',name:'Dumbbell Floor Press',prescription:'10 reps',durationSeconds:45}],focus:['upper_body'],areaLoadBefore:{}})
    let state=applySessionCompletion(defaultState,session('good'))
    state=applySessionCompletion(state,session('easy'))
    state=applySessionCompletion(state,session('good'))
    expect(getExerciseDecision('x001',state).action).toBe('progress')
    state=applySessionCompletion(state,session('brutal'))
    expect(getExerciseDecision('x001',state).action).toBe('maintain')
    const harder={...state,exerciseStats:{...state.exerciseStats,x002:{...state.exerciseStats.x001,lastRating:'brutal' as const}}}
    expect(getExerciseDecision('x002',harder).action).toBe('regress')
  })

  it('builds editable manual workouts from the library',()=>{
    const plan=createManualWorkout(['w1','x001'],defaultState)
    expect(plan.exercises.map(item=>item.exerciseId)).toEqual(['w1','x001'])
    expect(plan.exercises.map(item=>item.section)).toEqual(['Prepare','Main work'])
  })
})
