import { fireEvent,render,screen } from '@testing-library/react'
import { defaultState } from '../storage/state'
import type { ActiveSession, WorkoutPlan, WorkoutSession } from '../domain/types'
import { HomeScreen } from './HomeScreen'

const plan=(index:number):WorkoutPlan=>({id:`plan-${index}`,name:`Saved ${index}`,intention:'train',goal:'general',durationMinutes:10+index,createdAt:new Date(0).toISOString(),exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:30,rationale:'Test',section:'Main work'}],insights:[],focusAreas:[]})
const history:WorkoutSession={id:'session',planName:'Done',date:new Date().toISOString(),durationSeconds:600,intention:'train',goal:'general',rating:'good',completedExerciseIds:['x001'],exercises:[],focus:[],areaLoadBefore:{}}
const callbacks=()=>({onBuild:vi.fn(),onSuggested:vi.fn(),onCategory:vi.fn(),onResume:vi.fn(),onOpenPlan:vi.fn(),onViewSaved:vi.fn()})

it('shows the empty personalised launch state and routes every quick start',()=>{
  const actions=callbacks()
  render(<HomeScreen state={{...defaultState,profile:{...defaultState.profile,name:'Alex'}}} {...actions}/>)
  expect(screen.getByRole('heading',{name:'Good to see you, Alex.'})).toBeInTheDocument()
  expect(screen.getByRole('region',{name:'Training statistics'})).toHaveTextContent('0active days')
  fireEvent.click(screen.getByRole('button',{name:/Start what’s best today/}))
  fireEvent.click(screen.getByRole('button',{name:'Build my own'}))
  for(const [label,area] of [['Upper body','upper_body'],['Lower body','lower_body'],['Core','core'],['Conditioning','full_body'],['Mobility','hips']] as const){
    fireEvent.click(screen.getByRole('button',{name:new RegExp(label)}))
    expect(actions.onCategory).toHaveBeenLastCalledWith(area)
  }
  expect(actions.onSuggested).toHaveBeenCalledOnce()
  expect(actions.onBuild).toHaveBeenCalledOnce()
})

it('shows populated stats, only the latest three saved plans, and opens the correct plan',()=>{
  const actions=callbacks()
  render(<HomeScreen state={{...defaultState,history:[history],savedPlans:[plan(1),plan(2),plan(3),plan(4)]}} {...actions}/>)
  expect(screen.getByRole('region',{name:'Training statistics'})).toHaveTextContent('10minutes')
  expect(screen.getByRole('button',{name:/View all \(4\)/})).toBeInTheDocument()
  expect(screen.getByText('Saved 1')).toBeInTheDocument()
  expect(screen.getByText('Saved 3')).toBeInTheDocument()
  expect(screen.queryByText('Saved 4')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/Saved 2/}))
  fireEvent.click(screen.getByRole('button',{name:/View all/}))
  expect(actions.onOpenPlan).toHaveBeenCalledWith(1)
  expect(actions.onViewSaved).toHaveBeenCalledOnce()
})

it('offers an active-session resume route with current progress',()=>{
  const actions=callbacks()
  const activePlan={...plan(1),exercises:[...plan(1).exercises,...plan(1).exercises]}
  const activeSession:ActiveSession={plan:activePlan,index:1,phase:'work',remainingSeconds:20,running:false,deadlineAt:null,startedAt:1,completedExerciseIds:['x001']}
  render(<HomeScreen state={{...defaultState,activeSession}} {...actions}/>)
  expect(screen.getByText('Movement 2 of 2')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/Resume/}))
  expect(actions.onResume).toHaveBeenCalledOnce()
})
