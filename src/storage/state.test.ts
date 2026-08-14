import { defaultState, normaliseState, saveState, SCHEMA_VERSION, serializeLegacyState, STORAGE_KEY } from './state'

describe('state migration', () => {
  it('preserves useful version 11 profile and history data', () => {
    const state = normaliseState({
      schemaVersion:11,
      profile:{ upper:3,lower:2,core:2,conditioning:1,trainingGoal:'muscle',alwaysInclude:['u1'],avoidList:['c4'] },
      workoutHistory:[{ id:'old',date:'2025-01-01T10:00:00Z',name:'Old workout',durationSeconds:600,rating:'good',intention:'workout',exercises:[{id:'u1',name:'Push-Ups',reps:'10 reps',secs:45}] }],
    })
    expect(state.schemaVersion).toBe(SCHEMA_VERSION)
    expect(state.profile.goal).toBe('muscle')
    expect(state.profile.favourites).toEqual(['u1'])
    expect(state.history[0].completedExerciseIds).toEqual(['u1'])
    expect(state.history[0].exercises[0].prescription).toBe('10 reps')
  })

  it('drops unsafe identifiers while React safely renders text fields', () => {
    const state = normaliseState({ profile:{ avoidList:["');alert(1)//"] }, workoutHistory:[] })
    expect(state.profile.avoidList).toEqual([])
  })

  it('continues to write the existing key and schema-v11 backup contract', () => {
    const state = { ...defaultState, profile:{ ...defaultState.profile, name:'Alex', favourites:['u1'] } }
    saveState(state)
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.schemaVersion).toBe(11)
    expect(stored.profile.alwaysInclude).toEqual(['u1'])
    expect(stored.workoutHistory).toEqual([])
    expect(stored.savedWorkouts).toEqual([])
    expect(stored.customExercises).toEqual({})
  })

  it('round-trips saved workouts and custom exercises through the legacy format', () => {
    const state = normaliseState({
      schemaVersion:11,
      savedWorkouts:[{ id:'fav_one', name:'Upper', groups:[{ heading:'Main work', items:[{ id:'u1', reps:'8 reps', secs:40 }] }] }],
      customExercises:{ u_custom_1:{ name:'My press', reps:'12 reps', secs:45, detail:'Press smoothly.', tier:2, family:'push', customBodyArea:'chest', isCustom:true } },
    })
    expect(state.savedPlans[0].exercises[0].exerciseId).toBe('u1')
    expect(state.customExercises[0].primaryMuscles).toEqual(['chest'])
    const output = serializeLegacyState(state)
    expect(output.savedWorkouts[0].groups[0].items[0].id).toBe('u1')
    expect(output.customExercises.u_custom_1.reps).toBe('12 reps')
  })
})
