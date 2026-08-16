import { fireEvent, render, screen, within } from '@testing-library/react'
import { generateWorkout } from '../domain/engine'
import { defaultState } from '../storage/state'
import { PlanScreen } from './PlanScreen'

it('uses set navigation, whole-row dragging and an exercise inspector without move controls', () => {
  const plan = generateWorkout({
    intention:'train', goal:'strength', durationMinutes:30, focusAreas:['full_body'], equipment:defaultState.profile.equipment,
    level:2, includeConditioning:false, includeWarmup:false, exercisesPerRound:4, targetSets:2, recoveryModes:['mobility','stretching'],
  }, defaultState, 'plan-screen')
  const onReorder = vi.fn()
  const onAdd = vi.fn()
  const noop = vi.fn()
  render(<PlanScreen
    plan={plan}
    customExercises={[]}
    isSaved={false}
    onStart={noop}
    onSave={noop}
    onViewSaved={noop}
    onRegenerate={noop}
    onEasier={noop}
    onHarder={noop}
    onAdjust={noop}
    onSwap={noop}
    onReorder={onReorder}
    onAdd={onAdd}
    onRemove={noop}
    onAvoid={noop}
  />)

  const setOne = screen.getByRole('heading', { name:'Set 1 of 2' }).closest('section')!
  expect(screen.queryByRole('heading', { name:'Set 2 of 2' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name:'Set 2, 4 exercises' }))
  expect(screen.getByRole('heading', { name:'Set 2 of 2' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name:'Set 1, 4 exercises' }))
  expect(screen.queryByRole('button', { name:/move .* up/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name:/drag .* to reorder/i })).not.toBeInTheDocument()
  const rows = within(setOne).getAllByRole('listitem')
  fireEvent.keyDown(rows[0], { key:'ArrowDown' })
  const firstSetIndexes = plan.exercises.map((item,index)=>item.section==='Main work'&&item.setNumber===1?index:-1).filter(index=>index>=0)
  expect(onReorder).toHaveBeenCalledWith(firstSetIndexes[0], firstSetIndexes[1])

  onReorder.mockClear()
  fireEvent.pointerDown(rows[0], { pointerId:7, button:0, clientX:10, clientY:10 })
  fireEvent.pointerMove(window, { pointerId:7, clientX:10, clientY:18 })
  fireEvent.pointerUp(window, { pointerId:7, clientX:10, clientY:18 })
  expect(onReorder).toHaveBeenCalledWith(firstSetIndexes[0], firstSetIndexes[1])

  fireEvent.keyDown(rows[0], { key:'Enter' })
  const inspector = screen.getByRole('complementary', { name:/details$/i })
  expect(inspector).toHaveTextContent(/Why/i)
  expect(inspector).toHaveTextContent(/Easier/i)

  fireEvent.click(screen.getByRole('button', { name:'Close exercise details' }))
  fireEvent.click(screen.getByRole('button', { name:'+ Add exercise' }))
  expect(screen.getByRole('region', { name:/Add exercise to Main circuit/i })).toHaveTextContent('every main set')
  fireEvent.change(screen.getByRole('searchbox', { name:'Search exercises to add' }), { target:{ value:'Dumbbell Floor Press' } })
  fireEvent.click(screen.getByRole('button', { name:/Dumbbell Floor Press/i }))
  expect(onAdd).toHaveBeenCalledWith(firstSetIndexes[firstSetIndexes.length - 1], 'x001')
})

it('turns the save action into a saved-workout link after saving',()=>{
  const plan=generateWorkout({
    intention:'train',goal:'strength',durationMinutes:15,focusAreas:['upper_body'],equipment:defaultState.profile.equipment,
    level:2,includeConditioning:false,includeWarmup:false,exercisesPerRound:3,targetSets:1,recoveryModes:['mobility','stretching'],
  },defaultState,'save-plan')
  const onSave=vi.fn()
  const onViewSaved=vi.fn()
  const noop=vi.fn()
  const props={plan,customExercises:[],onStart:noop,onSave,onViewSaved,onRegenerate:noop,onEasier:noop,onHarder:noop,onAdjust:noop,onSwap:noop,onReorder:noop,onAdd:noop,onRemove:noop,onAvoid:noop}
  const {rerender}=render(<PlanScreen {...props} isSaved={false}/>)
  fireEvent.click(screen.getByRole('button',{name:'Save workout'}))
  expect(onSave).toHaveBeenCalledOnce()
  rerender(<PlanScreen {...props} isSaved/>)
  expect(screen.getByRole('status')).toHaveTextContent('Workout saved')
  fireEvent.click(screen.getByRole('button',{name:'View saved'}))
  expect(onViewSaved).toHaveBeenCalledOnce()
})
