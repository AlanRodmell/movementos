import { fireEvent,render,screen } from '@testing-library/react'
import { emptyLearningEntry } from '../domain/learning'
import { defaultState } from '../storage/state'
import { ProgressScreen } from './ProgressScreen'

it('renders readable learning evidence and progression controls',()=>{
  const entry={...emptyLearningEntry(),exposures:4,completedAppearances:4,positiveFeedback:3,tooEasy:2,preference:.4,difficultySuitability:.5,completionReliability:.9,evidence:12,successfulPerformances:4,progressionStatus:'ready' as const}
  const state={...defaultState,profile:{...defaultState.profile,equipment:['none' as const,'dumbbells' as const,'bench' as const]},learningModel:{...defaultState.learningModel,exercises:{x001:entry},events:[{id:'e1',at:'2026-08-17T10:00:00.000Z',exerciseId:'x001',type:'exercise_feedback' as const,label:'Good fit'}]}}
  const onProgression=vi.fn()
  render(<ProgressScreen state={state} onProgression={onProgression}/>)
  expect(screen.getByRole('heading',{name:'Learning'})).toBeInTheDocument()
  expect(screen.getByText('Dumbbell Floor Press')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Accept progression'}))
  expect(onProgression).toHaveBeenCalledWith(expect.objectContaining({exerciseId:'x001',category:'variation'}),'accept')
  fireEvent.change(screen.getByRole('combobox',{name:'Filter learning history'}),{target:{value:'exercise_feedback'}})
  expect(screen.getByText('Good fit')).toBeInTheDocument()
  expect(screen.queryByText(/preference.*0\.4/i)).not.toBeInTheDocument()
})

it('offers undo for an accepted progression',()=>{
  const recommendation={id:'accepted',exerciseId:'x001',category:'variation' as const,status:'accepted' as const,title:'Try Dumbbell Bench Press',evidence:['Completed successfully 4 times'],createdAt:'2026-08-17T10:00:00.000Z',fromExerciseId:'x001',toExerciseId:'x002'}
  const entry={...emptyLearningEntry(),evidence:12,successfulPerformances:4,progressionStatus:'accepted' as const,currentExerciseId:'x002',previousExerciseId:'x001'}
  const state={...defaultState,learningModel:{...defaultState.learningModel,exercises:{x001:entry},recommendations:[recommendation]}}
  const onUndoProgression=vi.fn()
  render(<ProgressScreen state={state} onUndoProgression={onUndoProgression}/>)
  fireEvent.click(screen.getByRole('button',{name:'Undo progression'}))
  expect(onUndoProgression).toHaveBeenCalledWith(recommendation)
})

it('renders complete empty states before the user has any history',()=>{
  render(<ProgressScreen state={defaultState}/>)
  expect(screen.getByText('0 ready · 0 approaching')).toBeInTheDocument()
  expect(screen.getByText(/No progression is ready yet/)).toBeInTheDocument()
  expect(screen.getByText(/Generate and complete a workout/)).toBeInTheDocument()
  expect(screen.getByText(/Rate completed sessions/)).toBeInTheDocument()
  expect(screen.getByText(/No matching learning activity/)).toBeInTheDocument()
  expect(screen.getByText(/Complete your first workout/)).toBeInTheDocument()
})

it('shows populated analytics, custom names, readiness, balance failures, charts and recent dates',()=>{
  const custom={id:'u_custom_progress',name:'Custom Carry',description:'Carry',category:'upper' as const,pattern:'carry',level:1 as const,durationSeconds:30,prescription:'30 sec',equipment:['none' as const],primaryMuscles:['upper_body' as const],secondaryMuscles:[],unilateral:false,lowImpact:true,goals:['general' as const],contraindications:[],isCustom:true}
  const balance={valid:false,templateKey:'general-full-body',requiredRoles:['horizontal_push' as const],coveredRoles:[],requiredAreas:['upper_body' as const],coveredAreas:[],sectionCounts:{'Main work':1},issues:['Missing horizontal push coverage.'],generatedAt:new Date().toISOString()}
  const session={id:'recent',planName:'Custom day',date:'2026-08-19T10:00:00.000Z',durationSeconds:120,intention:'train' as const,goal:'general' as const,rating:'hard' as const,completedExerciseIds:[custom.id,custom.id],exercises:[],focus:['upper_body' as const],areaLoadBefore:{},balanceReport:balance}
  const stat={attempts:3,completed:3,easyGood:3,hard:0,brutal:0,consecutiveSuccesses:3,lastRating:'good' as const,lastCompletedAt:session.date,lastDurationSeconds:30,progressionReady:true,coachDecision:'progress' as const}
  const state={...defaultState,customExercises:[custom],history:[session],exerciseStats:{[custom.id]:stat},learningModel:{...defaultState.learningModel,events:[{id:'skip',at:session.date,exerciseId:custom.id,type:'skipped' as const,label:'Skipped custom carry'},{id:'rating',at:session.date,type:'overall_rating' as const,label:'Hard workout'}]}}
  render(<ProgressScreen state={state}/>)
  expect(screen.getAllByText('Custom Carry').length).toBeGreaterThanOrEqual(2)
  expect(screen.getByText('2 completions')).toBeInTheDocument()
  expect(screen.getByText('Missing horizontal push coverage.')).toBeInTheDocument()
  expect(screen.getByTitle('2 minutes')).toHaveStyle({height:'100%'})
  expect(screen.getByText('Custom day')).toBeInTheDocument()
  expect(screen.getAllByText(/^\d+ load$/)).toHaveLength(4)
  fireEvent.change(screen.getByRole('combobox',{name:'Filter learning history'}),{target:{value:'swapped_out'}})
  expect(screen.getByText('No matching learning activity yet.')).toBeInTheDocument()
})
