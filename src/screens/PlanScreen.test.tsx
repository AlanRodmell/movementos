import { act, createEvent, fireEvent, render, screen, within } from '@testing-library/react'
import { exerciseById } from '../data/exercises'
import { generateWorkout } from '../domain/engine'
import { defaultState } from '../storage/state'
import { PlanScreen } from './PlanScreen'

it('uses set navigation, whole-row dragging and an exercise inspector without move controls', () => {
  vi.useFakeTimers()
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
  const briefPress = createEvent.pointerDown(rows[0], { pointerId:6, button:0, clientX:10, clientY:10 })
  fireEvent(rows[0], briefPress)
  expect(briefPress.defaultPrevented).toBe(false)
  fireEvent.pointerMove(window, { pointerId:6, clientX:10, clientY:19 })
  fireEvent.pointerUp(window, { pointerId:6, clientX:10, clientY:19 })
  act(()=>vi.advanceTimersByTime(1000))
  expect(onReorder).not.toHaveBeenCalled()
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  fireEvent.click(rows[0])
  expect(screen.getByRole('complementary', { name:/details$/i })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name:'Close exercise details' }))

  fireEvent.pointerDown(rows[0], { pointerId:7, button:0, clientX:10, clientY:10 })
  act(()=>vi.advanceTimersByTime(1000))
  expect(rows[0]).toHaveAttribute('aria-grabbed','true')
  fireEvent.pointerMove(window, { pointerId:7, clientX:10, clientY:18 })
  fireEvent.pointerUp(window, { pointerId:7, clientX:10, clientY:18 })
  expect(onReorder).toHaveBeenCalledWith(firstSetIndexes[0], firstSetIndexes[1])
  fireEvent.click(rows[0])
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument()

  const touchRow=rows[1]
  fireEvent.pointerDown(touchRow,{pointerId:8,button:0,pointerType:'touch',clientX:10,clientY:10})
  act(()=>vi.advanceTimersByTime(1000))
  expect(touchRow).toHaveAttribute('aria-grabbed','false')
  fireEvent.pointerDown(touchRow.querySelector('.exercise-position')!,{pointerId:9,button:0,pointerType:'touch',clientX:10,clientY:10})
  act(()=>vi.advanceTimersByTime(1000))
  expect(touchRow).toHaveAttribute('aria-grabbed','true')
  fireEvent.pointerMove(window,{pointerId:9,pointerType:'touch',clientX:10,clientY:2})
  fireEvent.pointerUp(window,{pointerId:9,pointerType:'touch',clientX:10,clientY:2})
  expect(onReorder).toHaveBeenLastCalledWith(firstSetIndexes[1],firstSetIndexes[0])

  fireEvent.keyDown(rows[0], { key:'Enter' })
  const inspector = screen.getByRole('complementary', { name:/details$/i })
  expect(inspector).not.toHaveTextContent(/Why/i)
  expect(inspector).not.toHaveTextContent(/How/i)
  expect(inspector).toHaveTextContent(/Easier/i)
  const selectedItem=plan.exercises[firstSetIndexes[0]]
  const selectedExercise=exerciseById.get(selectedItem.exerciseId)!
  expect(inspector).toHaveTextContent(selectedExercise.description)
  expect(inspector).toHaveTextContent(new RegExp(selectedExercise.primaryMuscles[0].replaceAll('_',' '),'i'))
  expect(within(inspector).getByText('Focus').closest('p')).toHaveClass('inspector-focus')
  expect(screen.getByRole('link',{name:/watch video/i}).getAttribute('href')).toContain('youtube.com')

  fireEvent.click(screen.getByRole('button', { name:'Close exercise details' }))
  fireEvent.click(screen.getByRole('button', { name:'+ Add exercise' }))
  expect(screen.getByRole('region', { name:/Add exercise to Main circuit/i })).toHaveTextContent('every main set')
  fireEvent.change(screen.getByRole('searchbox', { name:'Search exercises to add' }), { target:{ value:'Dumbbell Floor Press' } })
  fireEvent.click(screen.getByRole('button', { name:/Dumbbell Floor Press/i }))
  expect(onAdd).toHaveBeenCalledWith(firstSetIndexes[firstSetIndexes.length - 1], 'x001')
  expect(screen.getAllByRole('button', { name:/^Start session/ })).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name:/^Start session/ }))
  expect(noop).toHaveBeenCalledOnce()
  vi.useRealTimers()
})

it('uses helpful copy when an exercise description is blank',()=>{
  const generated=generateWorkout({
    intention:'train',goal:'strength',durationMinutes:30,focusAreas:['full_body'],equipment:defaultState.profile.equipment,
    level:2,includeConditioning:false,includeWarmup:false,exercisesPerRound:3,targetSets:2,recoveryModes:['mobility','stretching'],
  },defaultState,'blank-description')
  const firstMainIndex=generated.exercises.findIndex(item=>item.section==='Main work'&&item.setNumber===1)
  const sourceExercise=exerciseById.get(generated.exercises[firstMainIndex].exerciseId)!
  const customExercise={...sourceExercise,id:'custom_blank_description',name:'Custom movement',description:'   '}
  const plan={...generated,exercises:generated.exercises.map((item,index)=>index===firstMainIndex?{...item,exerciseId:customExercise.id}:item)}
  const noop=vi.fn()
  render(<PlanScreen plan={plan} customExercises={[customExercise]} isSaved={false} onStart={noop} onSave={noop} onViewSaved={noop} onRegenerate={noop} onEasier={noop} onHarder={noop} onAdjust={noop} onSwap={noop} onReorder={noop} onAdd={noop} onRemove={noop} onAvoid={noop}/>)
  const setOne=screen.getByRole('heading',{name:/Set 1 of/i}).closest('section')!
  fireEvent.keyDown(within(setOne).getAllByRole('listitem')[0],{key:'Enter'})
  expect(screen.getByRole('complementary',{name:/Custom movement details/i})).toHaveTextContent('See video on the link below for more info')
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
