import { fireEvent, render, screen, within } from '@testing-library/react'
import { generateWorkout } from '../domain/engine'
import { defaultState } from '../storage/state'
import { PlanScreen } from './PlanScreen'

it('renders distinct sets and offers pointer and keyboard reordering without move buttons', () => {
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

  onReorder.mockClear()
  const targetRow = handles[1].closest<HTMLElement>('[data-reorder-index]')!
  const originalElementFromPoint = document.elementFromPoint
  document.elementFromPoint = vi.fn(() => targetRow)
  fireEvent.pointerDown(handles[0], { pointerId:7, button:0, clientX:10, clientY:10 })
  fireEvent.pointerMove(window, { pointerId:7, clientX:10, clientY:30 })
  fireEvent.pointerUp(window, { pointerId:7, clientX:10, clientY:30 })
  expect(onReorder).toHaveBeenCalledWith(firstSetIndexes[0], firstSetIndexes[1])
  document.elementFromPoint = originalElementFromPoint
})
