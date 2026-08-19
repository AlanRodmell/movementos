import { fireEvent, render, screen } from '@testing-library/react'
import type { WorkoutPlan } from '../domain/types'
import { SavedPlansScreen } from './SavedPlansScreen'

const savedPlan:WorkoutPlan={id:'saved-one',name:'Upper strength',intention:'train',goal:'strength',durationMinutes:20,createdAt:new Date(0).toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:45,rationale:'Saved',section:'Main work'}]}

it('shows, opens, renames, and deletes saved workouts',()=>{
  const onOpen=vi.fn()
  const onDelete=vi.fn()
  const onRename=vi.fn()
  vi.spyOn(window,'confirm').mockReturnValue(true)
  render(<SavedPlansScreen plans={[savedPlan]} onOpen={onOpen} onDelete={onDelete} onRename={onRename} onBuild={()=>undefined}/>)
  expect(screen.getByRole('heading',{name:'Saved workouts'})).toBeInTheDocument()
  expect(screen.getByText('Upper strength')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/open workout/i}))
  expect(onOpen).toHaveBeenCalledWith(0)
  fireEvent.click(screen.getByRole('button',{name:'Rename'}))
  fireEvent.change(screen.getByRole('textbox',{name:'Workout name'}),{target:{value:'  Push day  '}})
  fireEvent.click(screen.getByRole('button',{name:'Save name'}))
  expect(onRename).toHaveBeenCalledWith('saved-one','Push day')
  fireEvent.click(screen.getByRole('button',{name:'Delete'}))
  expect(onDelete).toHaveBeenCalledWith('saved-one')
})

it('routes the empty state back to the workout builder',()=>{
  const onBuild=vi.fn()
  render(<SavedPlansScreen plans={[]} onOpen={vi.fn()} onDelete={vi.fn()} onRename={vi.fn()} onBuild={onBuild}/>)
  expect(screen.getByRole('heading',{name:'No saved workouts yet'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/Build a workout/}))
  expect(onBuild).toHaveBeenCalledOnce()
})

it('blocks blank names, caps names at 120 characters, supports cancel, and honours delete confirmation',()=>{
  const onRename=vi.fn();const onDelete=vi.fn()
  const confirm=vi.spyOn(window,'confirm').mockReturnValue(false)
  render(<SavedPlansScreen plans={[savedPlan]} onOpen={vi.fn()} onDelete={onDelete} onRename={onRename} onBuild={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button',{name:'Rename'}))
  fireEvent.change(screen.getByRole('textbox',{name:'Workout name'}),{target:{value:'   '}})
  expect(screen.getByRole('button',{name:'Save name'})).toBeDisabled()
  fireEvent.click(screen.getByRole('button',{name:'Cancel'}))
  expect(onRename).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button',{name:'Rename'}))
  const longName='x'.repeat(140)
  fireEvent.change(screen.getByRole('textbox',{name:'Workout name'}),{target:{value:longName}})
  fireEvent.click(screen.getByRole('button',{name:'Save name'}))
  expect(onRename).toHaveBeenCalledWith(savedPlan.id,'x'.repeat(120))
  fireEvent.click(screen.getByRole('button',{name:'Delete'}))
  expect(onDelete).not.toHaveBeenCalled()
  confirm.mockRestore()
})
