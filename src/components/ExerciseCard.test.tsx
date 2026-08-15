import { render, screen } from '@testing-library/react'
import { exerciseById } from '../data/exercises'
import { ExerciseCard } from './ExerciseCard'

it('highlights an easier adjusted exercise in green',()=>{
  const exercise=exerciseById.get('x001')!
  render(<ExerciseCard exercise={exercise} planned={{exerciseId:exercise.id,prescription:exercise.prescription,durationSeconds:exercise.durationSeconds,rationale:'Manually regressed to an easier family variant.',section:'Main work',scaled:'down'}}/>)
  expect(screen.getByRole('article')).toHaveClass('easier-adjusted')
  expect(screen.getByText('Easier')).toHaveClass('easier-badge')
})

it('highlights a harder adjusted exercise in red',()=>{
  const exercise=exerciseById.get('x002')!
  render(<ExerciseCard exercise={exercise} planned={{exerciseId:exercise.id,prescription:exercise.prescription,durationSeconds:exercise.durationSeconds,rationale:'Manually progressed above the original tier.',section:'Main work',scaled:'up'}}/>)
  expect(screen.getByRole('article')).toHaveClass('harder-adjusted')
  expect(screen.getByText('Harder')).toHaveClass('harder-badge')
})
