import { catalogueStats, exerciseById, exercises, exerciseVideoUrl } from '../data/exercises'
import { defaultState } from '../storage/state'
import { addPlanExercise, applySessionCompletion, avoidPlanExercise, createManualWorkout, exerciseMatchesArea, generateFreshWorkout, generateWorkout, getExerciseDecision, programmingFamily, removePlanExercise, reorderPlanExercise, scalePlanExercise, swapPlanExercise } from './engine'
import type { BuilderPreferences, WorkoutSession } from './types'

const preferences: BuilderPreferences = { intention:'train', goal:'strength', durationMinutes:30, focusAreas:['upper_body'], equipment:['none','wall','chair'], level:2, includeConditioning:false, includeWarmup:true, exercisesPerRound:'auto', targetSets:'auto', recoveryModes:['mobility','stretching'] }

it('maps mid-back focus to exercises targeting the back',()=>{
  const backExercise=exercises.find(exercise=>exercise.primaryMuscles.includes('upper_back'))
  expect(backExercise).toBeDefined()
  expect(exerciseMatchesArea(backExercise!, 'mid_back')).toBe(true)
})

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
    const state = { ...defaultState, issues: [{ id:'issue', area:'chest' as const, severity:'flare' as const, status:'active' as const, note:'', createdAt:new Date().toISOString(), side:'bilateral' as const, resolvedAt:null }],learningModel:{...defaultState.learningModel,exercises:{x001:{exposures:20,completedAppearances:20,skips:0,swapsOut:0,swapsIn:0,positiveFeedback:20,tooEasy:0,tooHard:0,discomfort:0,negativePreference:0,easierSelections:0,harderSelections:0,lastSelectedAt:null,lastCompletedAt:null,preference:1,difficultySuitability:1,completionReliability:1,evidence:40,contexts:{},successfulPerformances:20,progressionStatus:'ready' as const,progressionEvidenceAt:0}}} }
    const plan = generateWorkout(preferences, state, 'injury-seed')
    expect(plan.exercises.map(item => exerciseById.get(item.exerciseId)!).every(exercise => ![...exercise.primaryMuscles,...exercise.secondaryMuscles].includes('chest'))).toBe(true)
  })

  it('maps joint, hand, and foot issues to exercises that load them',()=>{
    expect(exerciseMatchesArea(exerciseById.get('x012')!,'elbows')).toBe(true)
    expect(exerciseMatchesArea(exerciseById.get('x042')!,'hands')).toBe(true)
    expect(exerciseMatchesArea(exerciseById.get('x001')!,'wrists')).toBe(true)
    expect(exerciseMatchesArea(exerciseById.get('x021')!,'knees')).toBe(true)
    expect(exerciseMatchesArea(exerciseById.get('x040')!,'ankles')).toBe(true)
    expect(exerciseMatchesArea(exerciseById.get('x040')!,'feet')).toBe(true)
    expect(exerciseMatchesArea(exerciseById.get('x025')!,'knees')).toBe(false)
  })

  it('uses new body areas for prescription adjustment and flare exclusion',()=>{
    const handState={...defaultState,issues:[{id:'hand',area:'hands' as const,severity:'moderate' as const,status:'active' as const,note:'',createdAt:new Date().toISOString(),side:'left' as const,resolvedAt:null}]}
    expect(createManualWorkout(['x042'],handState).exercises[0].adjusted).toBe(true)
    const kneeState={...defaultState,issues:[{id:'knee',area:'knees' as const,severity:'flare' as const,status:'active' as const,note:'',createdAt:new Date().toISOString(),side:'right' as const,resolvedAt:null}]}
    const plan=generateWorkout({...preferences,focusAreas:['lower_body']},kneeState,'knee-flare')
    expect(plan.exercises.every(item=>!exerciseMatchesArea(exerciseById.get(item.exerciseId)!, 'knees'))).toBe(true)
  })

  it('is deterministic for the same inputs and seed', () => {
    const first = generateWorkout(preferences, defaultState, 'same').exercises.map(item => item.exerciseId)
    const second = generateWorkout(preferences, defaultState, 'same').exercises.map(item => item.exerciseId)
    expect(first).toEqual(second)
  })

  it('creates a fresh routine for each new builder submission',()=>{
    const first=generateFreshWorkout(preferences,defaultState)
    const next=generateFreshWorkout(preferences,defaultState,first)
    const firstIds=first.exercises.map(item=>item.exerciseId)
    const nextIds=next.exercises.map(item=>item.exerciseId)
    expect(next.id).not.toBe(first.id)
    expect(nextIds).not.toEqual(firstIds)
  })

  it('regenerates a meaningfully different but still valid circuit',()=>{
    const fullBody={...preferences,focusAreas:['full_body' as const],exercisesPerRound:5 as const,targetSets:2 as const}
    const first=generateWorkout(fullBody,defaultState,'first-plan')
    const firstMain=new Set(first.exercises.filter(item=>item.section==='Main work').map(item=>item.exerciseId))
    const next=generateWorkout(fullBody,defaultState,'next-plan',firstMain)
    const nextMain=new Set(next.exercises.filter(item=>item.section==='Main work').map(item=>item.exerciseId))
    expect([...nextMain].filter(id=>firstMain.has(id)).length).toBeLessThan(firstMain.size)
    expect(new Set([...nextMain].map(id=>programmingFamily(exerciseById.get(id)!)))).toEqual(new Set([...firstMain].map(id=>programmingFamily(exerciseById.get(id)!))))
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

  it('keeps recovery adjustments when a user selects a harder variant',()=>{
    const state={...defaultState,profile:{...defaultState.profile,equipment:['none' as const,'dumbbells' as const,'bench' as const]},dailyCheckIn:{date:new Date().toDateString(),tightAreas:['full_body' as const],primaryArea:'full_body' as const}}
    const plan=createManualWorkout(['x001'],state)
    const adjusted={...plan,exercises:plan.exercises.map(item=>({...item,adjusted:true,prescription:'5 reps 🩹',durationSeconds:25}))}
    const harder=scalePlanExercise(adjusted,0,1,state)
    expect(harder.exercises[0].exerciseId).toBe('x002')
    expect(harder.exercises[0].adjusted).toBe(true)
    expect(harder.exercises[0].prescription).toContain('🩹')
  })

  it('marks a selected easier variant for green highlighting',()=>{
    const state={...defaultState,profile:{...defaultState.profile,equipment:['none' as const,'dumbbells' as const,'bench' as const]}}
    const plan=createManualWorkout(['x002'],state)
    const easier=scalePlanExercise(plan,0,-1,state)
    expect(easier.exercises[0]).toMatchObject({exerciseId:'x001',scaled:'down'})
  })

  it('marks harder variants red and clears the state at the original tier',()=>{
    const state={...defaultState,profile:{...defaultState.profile,equipment:['none' as const,'dumbbells' as const,'bench' as const]}}
    const plan=createManualWorkout(['x001'],state)
    const harder=scalePlanExercise(plan,0,1,state)
    expect(harder.exercises[0]).toMatchObject({exerciseId:'x002',scaled:'up',originalLevel:1})
    const original=scalePlanExercise(harder,0,-1,state)
    expect(original.exercises[0]).toMatchObject({exerciseId:'x001',scaled:null,originalLevel:1})
  })

  it('includes exactly one meditation in every generated plan',()=>{
    const plan=generateWorkout({...preferences,durationMinutes:45},defaultState,'one-meditation')
    const meditations=plan.exercises.filter(item=>exerciseById.get(item.exerciseId)?.category==='mindfulness')
    expect(meditations).toHaveLength(1)
  })

  it('honours exercises per round, target sets and optional warm-up',()=>{
    const plan=generateWorkout({...preferences,includeWarmup:false,exercisesPerRound:3,targetSets:4},defaultState,'custom-structure')
    const main=plan.exercises.filter(item=>item.section==='Main work')
    expect(plan.exercises.some(item=>item.section==='Prepare')).toBe(false)
    expect(main).toHaveLength(12)
    expect(new Set(main.map(item=>item.setNumber))).toEqual(new Set([1,2,3,4]))
  })

  it('guarantees balanced full-body movement coverage when the catalogue permits',()=>{
    const fullBody={...preferences,focusAreas:['full_body' as const],exercisesPerRound:5 as const,targetSets:2 as const}
    const plan=generateWorkout(fullBody,defaultState,'full-body-quality')
    const firstSet=plan.exercises.filter(item=>item.section==='Main work'&&item.setNumber===1).map(item=>exerciseById.get(item.exerciseId)!)
    const families=new Set(firstSet.map(programmingFamily))
    expect(families).toContain('push')
    expect(families).toContain('pull')
    expect([...families].some(family=>family==='knee'||family==='lunge')).toBe(true)
    expect(families).toContain('hinge')
    expect([...families].some(family=>family.startsWith('core_')||family==='carry')).toBe(true)
    expect(plan.balanceReport?.valid).toBe(true)
    expect(plan.balanceReport?.requiredRoles).toEqual(['horizontal_push','horizontal_pull','squat','hinge','anti_extension'])
  })

  it('uses distinct data-driven goal templates',()=>{
    const common={...preferences,focusAreas:['full_body' as const],exercisesPerRound:5 as const,targetSets:1 as const}
    const strength=generateWorkout({...common,goal:'strength' as const},defaultState,'goal-strength')
    const muscle=generateWorkout({...common,goal:'muscle' as const},defaultState,'goal-muscle')
    expect(strength.balanceReport?.requiredRoles).toContain('hinge')
    expect(muscle.balanceReport?.requiredRoles).toContain('rotation')
    expect(strength.balanceReport?.requiredRoles).not.toEqual(muscle.balanceReport?.requiredRoles)
  })

  it('stores required and covered body areas in the balance report',()=>{
    const plan=generateWorkout({...preferences,focusAreas:['upper_body' as const],exercisesPerRound:3,targetSets:1},defaultState,'upper-report')
    expect(plan.balanceReport?.requiredAreas).toEqual(['upper_body'])
    expect(plan.balanceReport?.coveredAreas).toContain('upper_body')
    expect(plan.balanceReport?.issues.some(issue=>issue.includes('upper body'))).toBe(false)
  })

  it('uses one coherent circuit order across every generated set',()=>{
    const plan=generateWorkout({...preferences,exercisesPerRound:4,targetSets:2},defaultState,'coherent-sets')
    const setOneIndexes=plan.exercises.map((item,index)=>item.section==='Main work'&&item.setNumber===1?index:-1).filter(index=>index>=0)
    const reordered=reorderPlanExercise(plan,setOneIndexes[0],setOneIndexes[2])
    const idsFor=(setNumber:number)=>reordered.exercises.filter(item=>item.section==='Main work'&&item.setNumber===setNumber).map(item=>item.exerciseId)
    expect(idsFor(1)).toEqual(idsFor(2))
    expect(idsFor(1)).not.toEqual(plan.exercises.filter(item=>item.section==='Main work'&&item.setNumber===1).map(item=>item.exerciseId))
  })

  it('avoids and replaces every occurrence across all sets',()=>{
    const plan=generateWorkout({...preferences,exercisesPerRound:4,targetSets:3},defaultState,'avoid-all-sets')
    const index=plan.exercises.findIndex(item=>item.section==='Main work')
    const avoidedId=plan.exercises[index].exerciseId
    const state={...defaultState,profile:{...defaultState.profile,avoidList:[avoidedId]}}
    const updated=avoidPlanExercise(plan,index,state)
    expect(updated.exercises.some(item=>item.exerciseId===avoidedId)).toBe(false)
    const setOrders=[1,2,3].map(setNumber=>updated.exercises.filter(item=>item.section==='Main work'&&item.setNumber===setNumber).map(item=>item.exerciseId))
    expect(setOrders[1]).toEqual(setOrders[0])
    expect(setOrders[2]).toEqual(setOrders[0])
  })

  it('keeps swaps within the equipment recorded on the plan',()=>{
    const plan=generateWorkout({...preferences,exercisesPerRound:4,targetSets:2},defaultState,'equipment-safe-swap')
    const index=plan.exercises.findIndex(item=>item.section==='Main work')
    const swapped=swapPlanExercise(plan,index,defaultState)
    expect(swapped.exercises.map(item=>exerciseById.get(item.exerciseId)!).every(exercise=>exercise.equipment.includes('none')||exercise.equipment.every(item=>plan.equipment?.includes(item)))).toBe(true)
  })

  it('changes prescriptions materially by training goal',()=>{
    const strengthState={...defaultState,profile:{...defaultState.profile,goal:'strength' as const,equipment:['none' as const,'dumbbells' as const]}}
    const enduranceState={...strengthState,profile:{...strengthState.profile,goal:'endurance' as const}}
    const strength=createManualWorkout(['x001'],strengthState)
    const endurance=createManualWorkout(['x001'],enduranceState)
    expect(strength.exercises[0].prescription).not.toBe(endurance.exercises[0].prescription)
    expect(strength.exercises[0].durationSeconds).toBeLessThan(endurance.exercises[0].durationSeconds)
  })

  it('separates stretching from mobility and restores video search links',()=>{
    expect(exerciseById.get('m5')?.category).toBe('stretching')
    expect(exerciseById.get('x063')?.category).toBe('mobility')
    expect(exerciseVideoUrl(exerciseById.get('u1')!)).toContain('youtube.com/results')
  })

  it('removes a movement from a reviewed plan without avoiding it',()=>{
    const plan=createManualWorkout(['w1','x001'],defaultState)
    expect(removePlanExercise(plan,0).exercises.map(item=>item.exerciseId)).toEqual(['x001'])
    expect(defaultState.profile.avoidList).not.toContain('w1')
  })

  it('adds a movement to every set of a generated main circuit',()=>{
    const plan=generateWorkout({...preferences,exercisesPerRound:3,targetSets:2},defaultState,'add-to-plan')
    const firstMainIndex=plan.exercises.findIndex(item=>item.section==='Main work'&&item.setNumber===1)
    const candidate=[...exerciseById.values()].find(exercise=>!plan.exercises.some(item=>item.exerciseId===exercise.id))!
    const added=addPlanExercise(plan,firstMainIndex,candidate.id,defaultState)
    expect(added.exercises.filter(item=>item.exerciseId===candidate.id)).toHaveLength(2)
    expect(added.exercises.filter(item=>item.section==='Main work'&&item.setNumber===1).at(-1)?.exerciseId).toBe(candidate.id)
    expect(added.exercises.filter(item=>item.section==='Main work'&&item.setNumber===2).at(-1)?.exerciseId).toBe(candidate.id)
    expect(added.durationMinutes).toBeGreaterThan(plan.durationMinutes)
  })

  it('reorders movements within a section and protects section boundaries',()=>{
    const plan=createManualWorkout(['x001','x002','u1','w1'],defaultState)
    const reordered=reorderPlanExercise(plan,0,2)
    expect(reordered.exercises.map(item=>item.exerciseId)).toEqual(['x002','u1','x001','w1'])
    expect(reorderPlanExercise(plan,0,3)).toBe(plan)
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
