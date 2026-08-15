import { fireEvent, render, screen, within } from '@testing-library/react'
import { generateWorkout } from '../domain/engine'
import { defaultState } from '../storage/state'
import { PlanScreen } from './PlanScreen'

it('renders distinct sets and offers drag-first reordering', () => {
  const plan = generateWorkout({
    intention:'train', goal:'strength', durationMinutes:30, focusAreas:['full_body'], equipment:defaultState.profile.equipment,
    level:2, includeConditioning:false, includeWarmup:false, exercisesPerRound:4, targetSets:2, recoveryModes:['mobility','stretching'],
  }, defaultState, 'plan-screen')
  const onReorder = vi.fn()
  const noop = vi.fn()
  render(<PlanScreen
    plan={plan}
    customExercises={[]}
    onStart={noop}
    onSave={noop}
    onRegenerate={noop}
    onEasier={noop}
    onHarder={noop}
    onAdjust={noop}
    onSwap={noop}
    onReorder={onReorder}
    onRemove={noop}
    onAvoid={noop}
  />)

  const setOne = screen.getByRole('heading', { name:'Main circuit — Set 1 of 2' }).closest('section')!
  expect(screen.getByRole('heading', { name:'Main circuit — Set 2 of 2' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name:/move .* up/i })).not.toBeInTheDocument()
  const handles = within(setOne).getAllByRole('button', { name:/drag .* to reorder/i })
  fireEvent.keyDown(handles[0], { key:'ArrowDown' })
  const firstSetIndexes = plan.exercises.map((item,index)=>item.section==='Main work'&&item.setNumber===1?index:-1).filter(index=>index>=0)
  expect(onReorder).toHaveBeenCalledWith(firstSetIndexes[0], firstSetIndexes[1])
})
