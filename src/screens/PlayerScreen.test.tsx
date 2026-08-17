import { act,fireEvent,render,screen } from '@testing-library/react'
import { defaultState } from '../storage/state'
import type { ActiveSession,WorkoutPlan } from '../domain/types'
import { PlayerScreen,restSecondsForGoal } from './PlayerScreen'

it('adjusts rest duration to the workout objective',()=>{
  expect(restSecondsForGoal('strength')).toBe(30)
  expect(restSecondsForGoal('muscle')).toBe(20)
  expect(restSecondsForGoal('general')).toBe(15)
  expect(restSecondsForGoal('endurance')).toBe(10)
  expect(restSecondsForGoal('mobility')).toBe(10)
})

it('runs get-ready, work, waiting, rest, and the next exercise automatically',()=>{
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T10:00:00Z'))
  const startedAt=Date.now()
  const plan:WorkoutPlan={
    id:'player-flow',name:'Player flow',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['full_body'],insights:[],
    exercises:[
      {exerciseId:'x001',prescription:'10 reps',durationSeconds:2,rationale:'First',section:'Main work'},
      {exerciseId:'x002',prescription:'10 reps',durationSeconds:2,rationale:'Second',section:'Main work'},
    ],
  }
  const session:ActiveSession={plan,index:0,phase:'get_ready',remainingSeconds:5,running:true,deadlineAt:startedAt+5000,startedAt,completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(screen.getByRole('heading',{name:'Workout begins in'})).toBeInTheDocument()
  expect(screen.getByText('5')).toBeInTheDocument()

  act(()=>vi.advanceTimersByTime(5000))
  expect(screen.getByRole('heading',{name:'Dumbbell Floor Press'})).toBeInTheDocument()
  expect(screen.getByText('0:02')).toBeInTheDocument()

  act(()=>vi.advanceTimersByTime(2000))
  expect(screen.getByRole('heading',{name:'Nice work'})).toBeInTheDocument()
  expect(screen.queryByRole('button',{name:/resume/i})).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button',{name:/log & continue/i}))
  expect(screen.getByRole('heading',{name:'Recover'})).toBeInTheDocument()
  expect(screen.getByText('0:15')).toBeInTheDocument()

  act(()=>vi.advanceTimersByTime(15000))
  expect(screen.getByRole('heading',{name:'Dumbbell Bench Press'})).toBeInTheDocument()
  expect(screen.getByText('0:02')).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Pause'})).toBeInTheDocument()
  vi.useRealTimers()
})

it('sounds a cue for each of the final five exercise seconds',()=>{
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T10:00:00Z'))
  const oscillators:Array<{frequency:{value:number};start:ReturnType<typeof vi.fn>;stop:ReturnType<typeof vi.fn>}>=[]
  class MockAudioContext {
    currentTime=0
    destination={}
    createOscillator(){
      const oscillator={frequency:{value:0},connect:vi.fn(),start:vi.fn(),stop:vi.fn()}
      oscillators.push(oscillator)
      return oscillator
    }
    createGain(){return{gain:{value:0},connect:vi.fn()}}
  }
  const originalAudioContext=window.AudioContext
  Object.defineProperty(window,'AudioContext',{configurable:true,value:MockAudioContext})
  const startedAt=Date.now()
  const plan:WorkoutPlan={
    id:'audio-countdown',name:'Audio countdown',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['full_body'],insights:[],
    exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:6,rationale:'Countdown',section:'Main work'}],
  }
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:6,running:true,deadlineAt:startedAt+6000,startedAt,completedExerciseIds:[]}

  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  expect(oscillators).toHaveLength(0)
  for(let second=0;second<5;second+=1)act(()=>vi.advanceTimersByTime(1000))
  expect(oscillators).toHaveLength(5)
  expect(oscillators.every(oscillator=>oscillator.frequency.value===660)).toBe(true)
  act(()=>vi.advanceTimersByTime(1000))
  expect(oscillators).toHaveLength(6)
  expect(oscillators.at(-1)?.frequency.value).toBe(880)

  Object.defineProperty(window,'AudioContext',{configurable:true,value:originalAudioContext})
  vi.useRealTimers()
})

it('collects optional grouped exercise feedback before the overall rating',()=>{
  const startedAt=Date.now()
  const plan:WorkoutPlan={id:'review',name:'Review',intention:'train',goal:'strength',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:30,rationale:'Press slot',section:'Main work',setNumber:1,totalSets:1,slotKey:'horizontal-push'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:false,deadlineAt:null,startedAt,completedExerciseIds:[],actions:[]}
  const onComplete=vi.fn()
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={onComplete} onExit={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button',{name:/complete session/i}))
  expect(screen.getByRole('heading',{name:'How did each movement fit?'})).toBeInTheDocument()
  expect(screen.getByText(/1\/1 completed/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Good fit'}))
  fireEvent.click(screen.getByRole('button',{name:/continue to overall rating/i}))
  fireEvent.click(screen.getByRole('button',{name:/good/i}))
  expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({rating:'good',exercises:[expect.objectContaining({id:'x001',feedback:'good_fit',completedAppearances:1})],actions:[expect.objectContaining({type:'completed'})]}))
})

it('offers an explicit issue after discomfort without diagnosing an injury',()=>{
  const plan:WorkoutPlan={id:'discomfort',name:'Discomfort',intention:'train',goal:'strength',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:30,rationale:'Press',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:false,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:[],actions:[]}
  const onCreateIssue=vi.fn()
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onCreateIssue={onCreateIssue} onExit={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button',{name:/complete session/i}))
  fireEvent.click(screen.getByRole('button',{name:'Discomfort'}))
  expect(screen.getByText(/does not diagnose an injury/i)).toBeInTheDocument()
  fireEvent.change(screen.getByRole('combobox',{name:/issue severity/i}),{target:{value:'moderate'}})
  fireEvent.change(screen.getByRole('combobox',{name:/issue side/i}),{target:{value:'left'}})
  fireEvent.click(screen.getByRole('button',{name:'Add issue'}))
  expect(onCreateIssue).toHaveBeenCalledWith(expect.any(String),'moderate','left',expect.stringContaining('Dumbbell Floor Press'))
  expect(screen.getByRole('button',{name:'Issue added'})).toBeDisabled()
})
