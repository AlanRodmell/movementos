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

  it('preserves plan adjustments, set labels and custom video links',()=>{
    const state=normaliseState({
      savedWorkouts:[{id:'sets',name:'Sets',groups:[{heading:'Main work',items:[{id:'u1',reps:'5 reps 🩹',secs:20,adjusted:true,setNumber:2,totalSets:3}]}]}],
      customExercises:{u_custom_video:{name:'Video move',reps:'10 reps',secs:30,detail:'Demo',tier:2,family:'custom',customBodyArea:'chest',videoUrl:'https://example.com/demo'}},
    })
    expect(state.savedPlans[0].exercises[0]).toMatchObject({adjusted:true,setNumber:2,totalSets:3})
    expect(state.customExercises[0].videoUrl).toBe('https://example.com/demo')
    const output=serializeLegacyState(state)
    expect(output.savedWorkouts[0].groups[0].items[0]).toMatchObject({adjusted:true,setNumber:2,totalSets:3})
    expect(output.customExercises.u_custom_video.videoUrl).toBe('https://example.com/demo')
  })

  it('preserves check-ins, issues, and progression stats in the legacy backup',()=>{
    const source={...defaultState,dailyCheckIn:{date:'Fri Aug 14 2026',tightAreas:['shoulders' as const],primaryArea:'shoulders' as const},issues:[{id:'i1',area:'shoulders' as const,severity:'moderate' as const,status:'resolved' as const,note:'old issue',createdAt:'2026-08-01T00:00:00.000Z',side:'left' as const,resolvedAt:'2026-08-02T00:00:00.000Z'}],exerciseStats:{u1:{attempts:3,completed:3,easyGood:3,hard:0,brutal:0,consecutiveSuccesses:3,lastRating:'good' as const,lastCompletedAt:'2026-08-14T00:00:00.000Z',lastDurationSeconds:45,progressionReady:true,coachDecision:'progress' as const}}}
    const restored=normaliseState(serializeLegacyState(source))
    expect(restored.dailyCheckIn).toEqual(source.dailyCheckIn)
    expect(restored.issues[0].side).toBe('left')
    expect(restored.exerciseStats.u1.progressionReady).toBe(true)
  })

  it('preserves new joint and extremity issue areas',()=>{
    const source={...defaultState,dailyCheckIn:{date:'Sat Aug 16 2026',tightAreas:['hands' as const,'knees' as const,'feet' as const],primaryArea:'knees' as const},issues:[{id:'joint',area:'elbows' as const,severity:'moderate' as const,status:'active' as const,note:'',createdAt:new Date(0).toISOString(),side:'left' as const,resolvedAt:null}]}
    const restored=normaliseState(serializeLegacyState(source))
    expect(restored.dailyCheckIn.tightAreas).toEqual(['hands','knees','feet'])
    expect(restored.issues[0].area).toBe('elbows')
  })

  it('rebuilds progression history if an earlier React build erased exerciseStats',()=>{
    const restored=normaliseState({workoutHistory:[1,2,3].map(index=>({id:`s${index}`,date:`2026-08-1${index}T10:00:00Z`,name:'Workout',rating:'good',exercises:[{id:'u1',name:'Push-Up',reps:'10 reps',secs:45}]})),exerciseStats:{}})
    expect(restored.exerciseStats.u1.completed).toBe(3)
    expect(restored.exerciseStats.u1.progressionReady).toBe(true)
  })
})
