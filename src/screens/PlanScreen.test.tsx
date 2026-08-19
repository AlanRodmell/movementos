import { act, createEvent, fireEvent, render, screen, within } from '@testing-library/react'
import { exerciseById } from '../data/exercises'
import { createManualWorkout, generateWorkout, setPlanSetCount } from '../domain/engine'
import { defaultState } from '../storage/state'
import { PlanScreen } from './PlanScreen'

it('shows every library selection together before splitting them into workout sections',()=>{
  const plan=createManualWorkout(['w1','x001','c1','m5'],defaultState)
  const noop=vi.fn()
  render(<PlanScreen plan={plan} customExercises={[]} isSaved={false} onStart={noop} onSave={noop} onViewSaved={noop} onRegenerate={noop} onEasier={noop} onHarder={noop} onAdjust={noop} onSwap={noop} onReorder={noop} onAdd={noop} onRemove={noop} onAvoid={noop}/>)

  expect(screen.getByRole('heading',{name:'All selected movements'})).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'All selected movements, 4 exercises'})).toHaveAttribute('aria-pressed','true')
  expect(screen.getAllByRole('listitem')).toHaveLength(4)
  expect(screen.getByText('Jumping Jacks')).toBeInTheDocument()
  expect(screen.getByText('Dumbbell Floor Press')).toBeInTheDocument()
  expect(screen.queryByText(/Hold any row/)).not.toBeInTheDocument()
  expect(screen.queryByRole('button',{name:'+ Add exercise'})).not.toBeInTheDocument()
})

it('lets a library-built workout create and remove coherent main-circuit sets',()=>{
  const plan=createManualWorkout(['w1','x001','u1','m5'],defaultState)
  const onSetCount=vi.fn()
  const noop=vi.fn()
  const props={customExercises:[],isSaved:false,onStart:noop,onSave:noop,onViewSaved:noop,onRegenerate:noop,onSetCount,onEasier:noop,onHarder:noop,onAdjust:noop,onSwap:noop,onReorder:noop,onAdd:noop,onRemove:noop,onAvoid:noop}
  const {rerender}=render(<PlanScreen {...props} plan={plan}/>)

  expect(screen.getByRole('heading',{name:'How many sets?'})).toBeInTheDocument()
  expect(screen.getByText(/Preparation, conditioning and recovery stay single-pass/)).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'1 set'})).toHaveAttribute('aria-pressed','true')
  fireEvent.click(screen.getByRole('button',{name:'2 sets'}))
  expect(onSetCount).toHaveBeenCalledWith(2)

  const twoSets=setPlanSetCount(plan,2)
  rerender(<PlanScreen {...props} plan={twoSets}/>)
  expect(screen.getByRole('button',{name:'2 sets'})).toHaveAttribute('aria-pressed','true')
  expect(screen.getByRole('button',{name:'Set 1, 2 exercises'})).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Set 2, 2 exercises'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'1 set'}))
  expect(onSetCount).toHaveBeenLastCalledWith(1)
})

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
  fireEvent.touchStart(touchRow,{changedTouches:[{identifier:9,clientX:10,clientY:10}]})
  act(()=>vi.advanceTimersByTime(1000))
  expect(touchRow).toHaveAttribute('aria-grabbed','true')
  fireEvent.touchMove(window,{touches:[{identifier:9,clientX:10,clientY:2}]})
  fireEvent.touchEnd(window,{changedTouches:[{identifier:9,clientX:10,clientY:2}]})
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

it('wires every inspector action and closes the inspector after avoiding or removing',()=>{
  const plan=createManualWorkout(['x001'],defaultState)
  const actions={onEasier:vi.fn(),onHarder:vi.fn(),onAdjust:vi.fn(),onSwap:vi.fn(),onRemove:vi.fn(),onAvoid:vi.fn()}
  const noop=vi.fn()
  render(<PlanScreen plan={plan} customExercises={[]} isSaved={false} onStart={noop} onSave={noop} onViewSaved={noop} onRegenerate={noop} onSetCount={noop} onReorder={noop} onAdd={noop} {...actions}/>)
  const row=screen.getByRole('listitem')
  fireEvent.keyDown(row,{key:'Enter'})
  fireEvent.click(screen.getByRole('button',{name:/Easier/}))
  fireEvent.click(screen.getByRole('button',{name:/Harder/}))
  fireEvent.click(screen.getByRole('button',{name:/Swap/}))
  fireEvent.click(screen.getByRole('button',{name:/Decrease reps or time/}))
  fireEvent.click(screen.getByRole('button',{name:/Increase reps or time/}))
  expect(actions.onEasier).toHaveBeenCalledWith(0)
  expect(actions.onHarder).toHaveBeenCalledWith(0)
  expect(actions.onSwap).toHaveBeenCalledWith(0)
  expect(actions.onAdjust).toHaveBeenNthCalledWith(1,0,-1)
  expect(actions.onAdjust).toHaveBeenNthCalledWith(2,0,1)
  fireEvent.click(screen.getByRole('button',{name:/Avoid/}))
  expect(actions.onAvoid).toHaveBeenCalledWith(0,'x001')
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  fireEvent.keyDown(row,{key:'Enter'})
  fireEvent.click(screen.getByRole('button',{name:'Remove'}))
  expect(actions.onRemove).toHaveBeenCalledWith(0)
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
})

it('only offers exercises appropriate to the active section and focuses search',()=>{
  const plan=createManualWorkout(['x001','m5'],defaultState)
  const noop=vi.fn()
  render(<PlanScreen plan={plan} customExercises={[]} isSaved={false} onStart={noop} onSave={noop} onViewSaved={noop} onRegenerate={noop} onSetCount={noop} onEasier={noop} onHarder={noop} onAdjust={noop} onSwap={noop} onReorder={noop} onAdd={noop} onRemove={noop} onAvoid={noop}/>)
  fireEvent.click(screen.getByRole('button',{name:'Restore, 1 exercises'}))
  fireEvent.click(screen.getByRole('button',{name:'+ Add exercise'}))
  const search=screen.getByRole('searchbox',{name:'Search exercises to add'})
  expect(search).toHaveFocus()
  fireEvent.change(search,{target:{value:'Dumbbell Floor Press'}})
  expect(screen.getByText('No matching exercises available for this section.')).toBeInTheDocument()
  fireEvent.change(search,{target:{value:'Neck Side Stretch'}})
  expect(screen.getByRole('button',{name:/Neck Side Stretch/})).toBeInTheDocument()
})

it('cancels a touch drag without reordering and keeps the combined manual overview unique',()=>{
  vi.useFakeTimers()
  const plan=setPlanSetCount(createManualWorkout(['w1','x001','u1','m5'],defaultState),2)
  const onReorder=vi.fn();const noop=vi.fn()
  render(<PlanScreen plan={plan} customExercises={[]} isSaved={false} onStart={noop} onSave={noop} onViewSaved={noop} onRegenerate={noop} onSetCount={noop} onEasier={noop} onHarder={noop} onAdjust={noop} onSwap={noop} onReorder={onReorder} onAdd={noop} onRemove={noop} onAvoid={noop}/>)
  expect(screen.getByRole('button',{name:'All selected movements, 4 exercises'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Set 1, 2 exercises'}))
  const row=screen.getAllByRole('listitem')[0]
  fireEvent.touchStart(row,{changedTouches:[{identifier:4,clientX:10,clientY:10}]})
  act(()=>vi.advanceTimersByTime(1000))
  fireEvent.touchMove(window,{touches:[{identifier:4,clientX:10,clientY:30}]})
  fireEvent.touchCancel(window,{changedTouches:[{identifier:4,clientX:10,clientY:30}]})
  expect(onReorder).not.toHaveBeenCalled()
  expect(row).toHaveAttribute('aria-grabbed','false')
  vi.useRealTimers()
})
