import { exerciseById, exercises } from '../data/exercises'
import { defaultState } from '../storage/state'
import type { BuilderPreferences, Exercise, MuscleArea, WorkoutPlan } from './types'
import { adjustPlanPrescription, createManualWorkout, exerciseMatchesArea, generateWorkout, getReadiness, setPlanSetCount } from './engine'

const base:BuilderPreferences={intention:'train',goal:'general',durationMinutes:30,focusAreas:['full_body'],equipment:['none','wall','chair'],level:2,includeConditioning:true,includeWarmup:true,exercisesPerRound:5,targetSets:3,recoveryModes:['mobility','stretching']}
const issue=(area:MuscleArea,severity:'mild'|'moderate'|'flare'='moderate',status:'active'|'resolved'='active',side:'left'|'right'|'bilateral'='bilateral')=>({id:`${area}_${severity}_${status}_${side}`,area,severity,status,note:'',createdAt:new Date().toISOString(),side,resolvedAt:status==='resolved'?new Date().toISOString():null})

describe('safety invariants',()=>{
  const areas:MuscleArea[]=['full_body','upper_body','lower_body','chest','upper_back','mid_back','lower_back','shoulders','anterior_shoulder','posterior_shoulder','biceps','triceps','core','deep_core','rectus_abdominis','obliques','hips','hip_flexors','glutes','quads','hamstrings','adductors','calves','legs','neck','elbows','forearms','wrists','hands','knees','shins','ankles','feet']

  it.each(areas)('maps %s to at least one catalogue movement and adapts an active issue',area=>{
    const candidate=exercises.find(exercise=>exerciseMatchesArea(exercise,area)&&!exercise.optIn)
    expect(candidate,`catalogue movement for ${area}`).toBeDefined()
    const plan=createManualWorkout([candidate!.id],{...defaultState,issues:[issue(area)]})
    expect(plan.exercises[0]?.adjusted).toBe(true)
  })

  it.each(['mild','moderate'] as const)('adapts %s active issues but ignores resolved issues',severity=>{
    const active=createManualWorkout(['x001'],{...defaultState,issues:[issue('chest',severity)]})
    const resolved=createManualWorkout(['x001'],{...defaultState,issues:[issue('chest',severity,'resolved')]})
    expect(active.exercises[0].adjusted).toBe(true)
    expect(resolved.exercises[0].adjusted).toBe(false)
  })

  it.each(['left','right','bilateral'] as const)('records %s issues while applying the same area-level safety rule',side=>{
    const plan=createManualWorkout(['x001'],{...defaultState,issues:[issue('chest','moderate','active',side)]})
    expect(plan.exercises[0]).toMatchObject({adjusted:true})
  })

  it('excludes flare conflicts, avoided movements, and locked advanced bridges from manual workouts',()=>{
    const advanced=exercises.find(exercise=>exercise.optIn==='advancedBridges')!
    const state={...defaultState,profile:{...defaultState.profile,avoidList:['w1'],advancedBridges:false},issues:[issue('chest','flare')]}
    const plan=createManualWorkout(['w1','x001',advanced.id],state)
    expect(plan.exercises).toHaveLength(0)
    expect(createManualWorkout([advanced.id],{...state,profile:{...state.profile,advancedBridges:true}}).exercises).toHaveLength(1)
  })

  it('ignores stale check-ins and applies a check-in only on its local calendar day',()=>{
    const stale=createManualWorkout(['x001'],{...defaultState,dailyCheckIn:{date:'Mon Jan 01 2001',tightAreas:['chest'],primaryArea:'chest'}})
    const today=createManualWorkout(['x001'],{...defaultState,dailyCheckIn:{date:new Date().toDateString(),tightAreas:['chest'],primaryArea:'chest'}})
    expect(stale.exercises[0].adjusted).toBe(false)
    expect(today.exercises[0].adjusted).toBe(true)
  })
})

describe('generator invariants across seeds and equipment',()=>{
  it.each([
    ['bodyweight',['none','wall','chair'] as const],
    ['dumbbells',['none','dumbbells','bench'] as const],
    ['bands',['none','bands'] as const],
  ])('keeps every %s plan safe, compatible, coherent, and explicit about balance',(_,equipment)=>{
    const avoided=exercises.find(exercise=>exercise.category==='upper')!.id
    const state={...defaultState,profile:{...defaultState.profile,equipment:[...equipment],avoidList:[avoided]},issues:[issue('wrists','flare')]}
    for(const seed of Array.from({length:20},(_,index)=>`invariant-${equipment.join('-')}-${index}`)){
      const plan=generateWorkout({...base,equipment:[...equipment]},state,seed)
      const resolved=plan.exercises.map(item=>exerciseById.get(item.exerciseId)!).filter(Boolean)
      expect(plan.exercises.some(item=>item.exerciseId===avoided)).toBe(false)
      expect(resolved.every(exercise=>!exerciseMatchesArea(exercise,'wrists'))).toBe(true)
      expect(resolved.every(exercise=>exercise.equipment.includes('none')||exercise.equipment.every(item=>equipment.includes(item as never)))).toBe(true)
      expect(resolved.filter(exercise=>exercise.category==='mindfulness')).toHaveLength(1)
      const setIds=[1,2,3].map(setNumber=>plan.exercises.filter(item=>item.section==='Main work'&&item.setNumber===setNumber).map(item=>item.exerciseId))
      expect(new Set(setIds[0]).size).toBe(setIds[0].length)
      expect(setIds[1]).toEqual(setIds[0])
      expect(setIds[2]).toEqual(setIds[0])
      expect(plan.balanceReport).toBeDefined()
      expect(plan.balanceReport?.valid||Boolean(plan.balanceReport?.issues.length)).toBe(true)
    }
  })

  it('selects an accepted compatible variation in the next generated context',()=>{
    const accepted={exposures:4,completedAppearances:4,skips:0,swapsOut:0,swapsIn:0,positiveFeedback:4,tooEasy:2,tooHard:0,discomfort:0,negativePreference:0,easierSelections:0,harderSelections:0,lastSelectedAt:null,lastCompletedAt:null,preference:.5,difficultySuitability:.7,completionReliability:1,evidence:12,contexts:{},successfulPerformances:4,progressionStatus:'accepted' as const,progressionEvidenceAt:10,currentExerciseId:'x002',previousExerciseId:'x001'}
    const equipment=['none' as const,'dumbbells' as const,'bench' as const]
    const state={...defaultState,profile:{...defaultState.profile,equipment},learningModel:{...defaultState.learningModel,exercises:{x001:accepted}}}
    const plan=generateWorkout({...base,goal:'strength',focusAreas:['upper_body'],equipment,includeConditioning:false,exercisesPerRound:4,targetSets:1},state,'accepted-variation')
    expect(plan.exercises.some(item=>item.exerciseId==='x002')).toBe(true)
  })
})

describe('readiness time boundaries',()=>{
  afterEach(()=>vi.useRealTimers())
  const stateAt=(hoursAgo:number)=>{
    const date=new Date(Date.now()-hoursAgo*3_600_000).toISOString()
    const row={id:'x001',name:'Dumbbell Floor Press',prescription:'8 reps',durationSeconds:45,section:'Main work' as const}
    return {...defaultState,history:[{id:`load-${hoursAgo}`,planName:'Load',date,durationSeconds:180,intention:'train' as const,goal:'strength' as const,rating:'good' as const,completedExerciseIds:['x001','x001','x001','x001'],exercises:[row,row,row,row],focus:['upper_body' as const],areaLoadBefore:{}}]}
  }

  it('moves recent load from recover to caution and ready at the 48/72-hour boundaries',()=>{
    vi.useFakeTimers();vi.setSystemTime(new Date('2026-08-19T12:00:00Z'))
    const upperStatus=(hours:number)=>getReadiness(stateAt(hours)).rows.find(row=>row.area==='upper')?.status
    expect(upperStatus(47)).toBe('recover')
    expect(upperStatus(49)).toBe('caution')
    expect(upperStatus(73)).toBe('ready')
  })
})

describe('prescription editing',()=>{
  const planWith=(prescription:string,durationSeconds:number):WorkoutPlan=>{
    const plan=createManualWorkout(['x001'],defaultState)
    return {...plan,exercises:[{...plan.exercises[0],prescription,durationSeconds}]}
  }

  it.each([
    ['8-12 reps',40,'9-13 reps',40],
    ['30 sec',30,'35 sec',35],
    ['1 min',60,'2 min',120],
    ['20 sec / side',40,'25 sec / side',50],
    ['8 each side',40,'9 each side',40],
    ['8 per leg',40,'9 per leg',40],
    ['12 kg · 8 reps',40,'12 kg · 9 reps',40],
    ['3 x 8 reps',40,'3 x 9 reps',40],
  ])('adjusts %s without changing unrelated numbers', (source,duration,expected,expectedDuration)=>{
    const updated=adjustPlanPrescription(planWith(source,duration),0,1)
    expect(updated.exercises[0]).toMatchObject({prescription:expected,durationSeconds:expectedDuration})
  })

  it.each([
    ['1 rep',40,'1 rep',40],
    ['5 sec',5,'5 sec',5],
    ['0.5 min',30,'0.5 min',5],
  ])('enforces a safe lower bound for %s',(source,duration,expected,expectedDuration)=>{
    const updated=adjustPlanPrescription(planWith(source,duration),0,-1)
    expect(updated.exercises[0]).toMatchObject({prescription:expected,durationSeconds:expectedDuration})
  })

  it('recalculates exact circuit duration when sets are added and removed',()=>{
    const manual=createManualWorkout(['x001','u1'],defaultState)
    const one=setPlanSetCount(manual,1)
    const three=setPlanSetCount(one,3)
    expect(three.durationMinutes).toBeGreaterThan(one.durationMinutes)
    expect(setPlanSetCount(three,1).durationMinutes).toBe(one.durationMinutes)
  })
})
