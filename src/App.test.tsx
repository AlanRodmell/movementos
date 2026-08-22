import { fireEvent,render,screen } from '@testing-library/react'
import App from './App'
import { defaultState, serializeLegacyState, STORAGE_KEY } from './storage/state'
import type { ActiveSession, WorkoutPlan } from './domain/types'

beforeEach(()=>{localStorage.clear();window.scrollTo=vi.fn()})
afterEach(()=>vi.useRealTimers())

function submitDefaultBuilder() {
  for(let step=0;step<4;step+=1)fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/generate my session/i}))
}

it('builds a fresh routine on each builder submission and exposes one start action',()=>{
  render(<App/>)

  fireEvent.click(screen.getByRole('button',{name:'Build my own'}))
  submitDefaultBuilder()
  const firstRoutine=screen.getAllByRole('listitem').map(item=>item.getAttribute('aria-label'))
  expect(screen.getAllByRole('button',{name:/^Start session/})).toHaveLength(1)

  fireEvent.click(screen.getByRole('button',{name:/back/i}))
  submitDefaultBuilder()
  const nextRoutine=screen.getAllByRole('listitem').map(item=>item.getAttribute('aria-label'))
  expect(nextRoutine).not.toEqual(firstRoutine)
  expect(screen.getAllByRole('button',{name:/^Start session/})).toHaveLength(1)
})

it('creates sets for a library workout and preserves them through save and reopen',()=>{
  render(<App/>)
  fireEvent.click(screen.getByRole('button',{name:/Explore/}))
  const search=screen.getByPlaceholderText('Search exercises…')
  fireEvent.change(search,{target:{value:'Dumbbell Floor Press'}})
  fireEvent.click(screen.getByRole('button',{name:'Add Dumbbell Floor Press to workout'}))
  fireEvent.change(search,{target:{value:'Push-Up'}})
  fireEvent.click(screen.getByRole('button',{name:'Add Push-Ups to workout'}))
  fireEvent.click(screen.getByRole('button',{name:/Review workout/}))
  expect(screen.getByRole('heading',{name:'How many sets?'})).toBeInTheDocument()
  expect(screen.getByRole('group',{name:'Number of main circuit sets'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'2 sets'}))
  expect(screen.getByRole('button',{name:'Set 1, 2 exercises'})).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Set 2, 2 exercises'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Save workout'}))
  fireEvent.click(screen.getByRole('button',{name:/Saved/}))
  expect(screen.getByText(/4 movements · \d+ min · general/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/Open workout/}))
  expect(screen.getByRole('button',{name:'2 sets'})).toHaveAttribute('aria-pressed','true')
  expect(screen.getByRole('button',{name:'Set 2, 2 exercises'})).toBeInTheDocument()
})

it('resumes a persisted session, records review data, and transitions into Progress',()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-08-19T12:00:00Z'))
  const plan:WorkoutPlan={id:'journey',name:'Journey',intention:'train',goal:'general',durationMinutes:1,targetDurationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['chest'],insights:[],exercises:[{exerciseId:'x001',prescription:'8 reps',durationSeconds:1,rationale:'Test',section:'Main work',setNumber:1,totalSets:1}]}
  const activeSession:ActiveSession={plan,index:0,phase:'work',remainingSeconds:1,running:true,deadlineAt:Date.now()+1000,startedAt:Date.now()-30_000,completedExerciseIds:[]}
  localStorage.setItem(STORAGE_KEY,JSON.stringify(serializeLegacyState({...defaultState,activeSession})))
  render(<App/>)
  fireEvent.click(screen.getByRole('button',{name:/Resume/}))
  expect(screen.queryByRole('navigation',{name:'Primary navigation'})).not.toBeInTheDocument()
  expect(screen.getByText('8 reps')).toBeInTheDocument()
  expect(screen.queryByText('0:01')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/Complete session/}))
  expect(screen.getByRole('heading',{name:'How did each movement fit?'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Good fit'}))
  fireEvent.click(screen.getByText('Record achieved reps, time or load'))
  fireEvent.change(screen.getByRole('textbox',{name:/achieved reps/}),{target:{value:'9'}})
  fireEvent.click(screen.getByRole('button',{name:/Continue to overall rating/}))
  fireEvent.click(screen.getByRole('button',{name:/good$/}))
  expect(screen.getByRole('heading',{name:'Progress is the work repeated.'})).toBeInTheDocument()
  const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)!)
  expect(stored.workoutHistory[0].exercises[0]).toMatchObject({id:'x001',feedback:'good_fit',performance:{achievedReps:9}})
  expect(stored.activeSession).toBeNull()
})

it('uses navigation history for Profile and Back without losing the current route',()=>{
  render(<App/>)
  fireEvent.click(screen.getByRole('button',{name:/Explore/}))
  fireEvent.click(screen.getByRole('button',{name:'Profile'}))
  expect(screen.getByRole('heading',{name:'Your training profile'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/Back/}))
  expect(screen.getByRole('heading',{name:/Explore .* movements/})).toBeInTheDocument()
})
