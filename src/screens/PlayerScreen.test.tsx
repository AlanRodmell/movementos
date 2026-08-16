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
