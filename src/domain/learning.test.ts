import { defaultState } from '../storage/state'
import type { AppState, Exercise, ExerciseFeedback, WorkoutAction, WorkoutSession } from './types'
import { applyLearningFromSession, emptyLearningEntry, emptyLearningModel, getProgressionRecommendations, normaliseLearningModel, respondToProgression, revertProgression } from './learning'

const action=(type:WorkoutAction['type'],exerciseId='x001'):WorkoutAction=>({id:`a_${type}`,type,exerciseId,occurrenceIndex:0,at:'2026-08-17T10:00:00.000Z',context:{key:'strength|train|Main work|horizontal-push|upper_body',goal:'strength',intention:'train',section:'Main work',role:'horizontal_push',focusArea:'upper_body'}})
const session=(feedback?:ExerciseFeedback,actions:WorkoutAction[]=[] ,id='x001',performance?:WorkoutSession['exercises'][number]['performance']):WorkoutSession=>({id:`s_${feedback??'none'}_${actions.map(item=>item.type).join('_')}`,planName:'Test',date:'2026-08-17T10:00:00.000Z',durationSeconds:60,intention:'train',goal:'strength',rating:'good',completedExerciseIds:[id],exercises:[{id,name:'Exercise',prescription:'10 reps',durationSeconds:30,plannedAppearances:1,completedAppearances:1,feedback,performance}],focus:['upper_body'],areaLoadBefore:{},actions:[action('completed',id),...actions]})

describe('local learning model',()=>{
  it('safely initialises an empty versioned model',()=>{
    expect(normaliseLearningModel(undefined)).toEqual(emptyLearningModel())
    expect(normaliseLearningModel({version:99,exercises:null})).toEqual(emptyLearningModel())
  })

  it('raises preference for positive feedback',()=>{
    const model=applyLearningFromSession(emptyLearningModel(),session('good_fit'));const learned=model.exercises.x001
    expect(learned.preference).toBeGreaterThan(0)
    expect(learned.positiveFeedback).toBe(1)
    expect(Object.values(model.routineContexts)[0].confidence).toBeGreaterThan(0)
  })

  it('keeps preference separate when feedback says too hard',()=>{
    const learned=applyLearningFromSession(emptyLearningModel(),session('too_hard')).exercises.x001
    expect(learned.preference).toBe(0)
    expect(learned.difficultySuitability).toBeLessThan(0)
  })

  it('updates the intended signal for easier and harder selections',()=>{
    const easier=applyLearningFromSession(emptyLearningModel(),session(undefined,[action('easier')])).exercises.x001
    const harder=applyLearningFromSession(emptyLearningModel(),session(undefined,[action('harder')])).exercises.x001
    expect(easier.easierSelections).toBe(1);expect(easier.difficultySuitability).toBeLessThan(0)
    expect(harder.harderSelections).toBe(1);expect(harder.difficultySuitability).toBeGreaterThan(0)
  })

  it('learns a contextual negative from skips and swaps and a positive from replacements',()=>{
    const actions=[action('skipped'),action('swapped_out'),action('swapped_in','x002')]
    const model=applyLearningFromSession(emptyLearningModel(),session(undefined,actions))
    expect(model.exercises.x001.skips).toBe(1);expect(model.exercises.x001.swapsOut).toBe(1);expect(model.exercises.x001.preference).toBeLessThan(0)
    expect(model.exercises.x002.swapsIn).toBe(1);expect(model.exercises.x002.preference).toBeGreaterThan(0)
  })

  it('bounds repeated updates and caps context storage',()=>{
    let model=emptyLearningModel()
    for(let index=0;index<40;index+=1)model=applyLearningFromSession(model,session(index%2?'good_fit':'didnt_enjoy'))
    expect(model.exercises.x001.preference).toBeGreaterThanOrEqual(-1);expect(model.exercises.x001.preference).toBeLessThanOrEqual(1)
    expect(Object.keys(model.exercises.x001.contexts).length).toBeLessThanOrEqual(12)
  })

  it('does not apply progression automatically and supports accept, keep and defer',()=>{
    let model=emptyLearningModel();for(let index=0;index<3;index+=1)model=applyLearningFromSession(model,session('too_easy'))
    const state={...defaultState,profile:{...defaultState.profile,equipment:['none' as const,'dumbbells' as const,'bench' as const]},learningModel:model}
    expect(state.learningModel.exercises.x001.currentExerciseId).toBeUndefined()
    const recommendation=getProgressionRecommendations(state)[0]
    expect(recommendation.status).toBe('ready')
    const accepted=respondToProgression(state,recommendation,'accept')
    expect(accepted.learningModel.exercises.x001.currentExerciseId).toBe('x002')
    const reverted=revertProgression(accepted,accepted.learningModel.recommendations[0])
    expect(reverted.learningModel.exercises.x001.currentExerciseId).toBeUndefined()
    expect(reverted.learningModel.exercises.x001.progressionStatus).toBe('deferred')
    expect(reverted.learningModel.events[0].type).toBe('progression_reverted')
    expect(respondToProgression(state,recommendation,'keep').learningModel.recommendations[0].status).toBe('kept')
    expect(respondToProgression(state,recommendation,'defer').learningModel.recommendations[0].availableAfter).toBeTruthy()
  })

  it('never recommends load without recorded load data',()=>{
    const custom:Exercise={id:'u_weighted',name:'Custom lift',description:'Lift',category:'upper',pattern:'unique_weighted',level:2,durationSeconds:30,prescription:'8 reps',equipment:['dumbbells'],primaryMuscles:['chest'],secondaryMuscles:[],unilateral:false,lowImpact:true,goals:['strength'],contraindications:[],isCustom:true}
    let model=emptyLearningModel();for(let index=0;index<3;index+=1)model=applyLearningFromSession(model,session('good_fit',[],'u_weighted'))
    const without=getProgressionRecommendations({...defaultState,customExercises:[custom],profile:{...defaultState.profile,equipment:['none','dumbbells']},learningModel:model})[0]
    expect(without.category).not.toBe('load')
    model=applyLearningFromSession(model,session('good_fit',[],'u_weighted',{load:20,loadUnit:'kg'}))
    const withLoad=getProgressionRecommendations({...defaultState,customExercises:[custom],profile:{...defaultState.profile,equipment:['none','dumbbells']},learningModel:model})[0]
    expect(withLoad.category).toBe('load');expect(withLoad.load).toBeGreaterThan(20)
    const accepted=respondToProgression({...defaultState,customExercises:[custom],profile:{...defaultState.profile,equipment:['none','dumbbells']},learningModel:model},withLoad,'accept')
    expect(accepted.learningModel.exercises.u_weighted.previousPrescription).toBe('8 reps')
    expect(revertProgression(accepted,accepted.learningModel.recommendations[0]).learningModel.exercises.u_weighted.currentPrescription).toBe('8 reps')
  })

  it('decays stale preference before applying new evidence',()=>{
    const old={...emptyLearningEntry(),preference:1,lastSelectedAt:'2025-01-01T00:00:00.000Z'}
    const model={...emptyLearningModel(),exercises:{x001:old}}
    const learned=applyLearningFromSession(model,session('too_hard')).exercises.x001
    expect(learned.preference).toBeLessThan(.1)
  })

  it('timestamps discomfort so an old event does not indefinitely block progression',()=>{
    const entry={...emptyLearningEntry(),successfulPerformances:3,discomfort:1,lastDiscomfortAt:'2026-01-01T00:00:00.000Z',lastCompletedAt:new Date().toISOString()}
    const state={...defaultState,profile:{...defaultState.profile,equipment:['none' as const,'dumbbells' as const,'bench' as const]},learningModel:{...defaultState.learningModel,exercises:{x001:entry}}}
    expect(getProgressionRecommendations(state)).toHaveLength(1)
    const recent={...state,learningModel:{...state.learningModel,exercises:{x001:{...entry,lastDiscomfortAt:new Date().toISOString()}}}}
    expect(getProgressionRecommendations(recent)).toHaveLength(0)
  })

  it('learns completion-backed routine structure from positive sessions',()=>{
    const structured={...session('good_fit'),planStructure:{targetDurationMinutes:1,mainExerciseCount:4,totalSets:3,includeWarmup:false,includeConditioning:false}}
    const model=applyLearningFromSession(emptyLearningModel(),structured)
    const routine=Object.values(model.routineContexts)[0]
    expect(routine.preferredMainCount).toBe(4)
    expect(routine.preferredSets).toBe(3)
    expect(routine.averageCompletionRate).toBe(1)
  })

  it('prefers a compatible variation over load and volume recommendations',()=>{
    const entry={...emptyLearningEntry(),successfulPerformances:4,positiveFeedback:4,evidence:12,lastPerformance:{load:20,loadUnit:'kg' as const},progressionStatus:'ready' as const}
    const state={...defaultState,profile:{...defaultState.profile,equipment:['none' as const,'dumbbells' as const,'bench' as const]},learningModel:{...defaultState.learningModel,exercises:{x001:entry}}}
    expect(getProgressionRecommendations(state)[0]).toMatchObject({category:'variation',fromExerciseId:'x001',toExerciseId:'x002'})
  })

  it('retains keep and defer decisions until new evidence or the defer window expires',()=>{
    vi.useFakeTimers();vi.setSystemTime(new Date('2026-08-19T12:00:00Z'))
    const entry={...emptyLearningEntry(),successfulPerformances:3,evidence:10,progressionStatus:'ready' as const}
    const state={...defaultState,profile:{...defaultState.profile,equipment:['none' as const,'dumbbells' as const,'bench' as const]},learningModel:{...defaultState.learningModel,exercises:{x001:entry}}}
    const recommendation=getProgressionRecommendations(state)[0]
    const kept=respondToProgression(state,recommendation,'keep')
    expect(getProgressionRecommendations(kept)[0].status).toBe('kept')
    const deferred=respondToProgression(state,recommendation,'defer')
    expect(getProgressionRecommendations(deferred)[0].status).toBe('deferred')
    vi.setSystemTime(new Date('2026-09-03T12:00:00Z'))
    expect(getProgressionRecommendations(deferred)[0].status).toBe('ready')
    vi.useRealTimers()
  })

  it('sanitises corrupt learning imports and enforces every storage cap',()=>{
    const contexts=Object.fromEntries(Array.from({length:20},(_,index)=>[`context-${index}`,{preference:index,difficultySuitability:-index,reliability:4,evidence:index,lastUpdatedAt:'invalid',skips:-1,swapsOut:-1}]))
    const routineContexts=Object.fromEntries(Array.from({length:70},(_,index)=>[`routine-${index}`,{confidence:9,positive:-1,negative:-1,evidence:index,lastUpdatedAt:'invalid'}]))
    const raw={version:1,exercises:{'bad id':{},x001:{preference:9,difficultySuitability:-9,completionReliability:9,progressionStatus:'invented',currentExerciseId:'bad id!',currentPrescription:'x'.repeat(200),contexts,performanceHistory:[{at:'bad',load:-2}]}},routineContexts,events:Array.from({length:400},(_,index)=>({id:String(index)})),recommendations:Array.from({length:120},(_,index)=>({id:String(index)}))}
    const model=normaliseLearningModel(raw)
    expect(Object.keys(model.exercises)).toEqual(['x001'])
    expect(model.exercises.x001).toMatchObject({preference:1,difficultySuitability:-1,completionReliability:1,progressionStatus:'none',currentExerciseId:undefined})
    expect(model.exercises.x001.currentPrescription).toHaveLength(80)
    expect(Object.keys(model.exercises.x001.contexts)).toHaveLength(12)
    expect(model.exercises.x001.performanceHistory).toEqual([])
    expect(Object.keys(model.routineContexts)).toHaveLength(50)
    expect(model.events).toHaveLength(300)
    expect(model.recommendations).toHaveLength(100)
  })
})
