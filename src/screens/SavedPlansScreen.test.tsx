import { fireEvent, render, screen } from '@testing-library/react'
import type { WorkoutPlan } from '../domain/types'
import { SavedPlansScreen } from './SavedPlansScreen'

const savedPlan:WorkoutPlan={id:'saved-one',name:'Upper strength',intention:'train',goal:'strength',durationMinutes:20,createdAt:new Date(0).toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:45,rationale:'Saved',section:'Main work'}]}

it('shows, opens, and deletes saved workouts',()=>{
  const onOpen=vi.fn()
  const onDelete=vi.fn()
  vi.spyOn(window,'confirm').mockReturnValue(true)
  render(<SavedPlansScreen plans={[savedPlan]} onOpen={onOpen} onDelete={onDelete} onBuild={()=>undefined}/>)
  expect(screen.getByRole('heading',{name:'Saved workouts'})).toBeInTheDocument()
  expect(screen.getByText('Upper strength')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/open workout/i}))
  expect(onOpen).toHaveBeenCalledWith(0)
  fireEvent.click(screen.getByRole('button',{name:'Delete'}))
  expect(onDelete).toHaveBeenCalledWith('saved-one')
})
