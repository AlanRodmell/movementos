import { fireEvent,render,screen } from '@testing-library/react'
import { defaultState } from '../storage/state'
import { LibraryScreen } from './LibraryScreen'

const props=(overrides={})=>({state:defaultState,onToggleFavourite:vi.fn(),onToggleAvoid:vi.fn(),onCreateExercise:vi.fn(),onDeleteCustom:vi.fn(),onBuildSelected:vi.fn(),...overrides})

it('makes staples persistent, visible, and filterable',()=>{
  const onToggleFavourite=vi.fn()
  const {rerender}=render(<LibraryScreen {...props({onToggleFavourite})}/>)
  fireEvent.change(screen.getByPlaceholderText('Search exercises…'),{target:{value:'Jumping Jacks'}})
  fireEvent.click(screen.getByRole('button',{name:'Mark Jumping Jacks as staple'}))
  expect(onToggleFavourite).toHaveBeenCalledWith('w1')

  rerender(<LibraryScreen {...props({onToggleFavourite,state:{...defaultState,profile:{...defaultState.profile,favourites:['w1']}}})}/>)
  expect(screen.getByRole('button',{name:'Remove Jumping Jacks from staple'})).toHaveAttribute('aria-pressed','true')
  fireEvent.change(screen.getByPlaceholderText('Search exercises…'),{target:{value:''}})
  fireEvent.click(screen.getByRole('button',{name:'Staples (1)'}))
  expect(screen.getByRole('heading',{name:'Jumping Jacks'})).toBeInTheDocument()
  expect(screen.getAllByRole('article')).toHaveLength(1)
})

it('keeps every workout selection visible while searching and passes all ids to review',()=>{
  const onBuildSelected=vi.fn()
  render(<LibraryScreen {...props({onBuildSelected})}/>)
  const search=screen.getByPlaceholderText('Search exercises…')
  fireEvent.change(search,{target:{value:'Jumping Jacks'}})
  fireEvent.click(screen.getByRole('button',{name:'Add Jumping Jacks to workout'}))
  fireEvent.change(search,{target:{value:'Dumbbell Floor Press'}})
  fireEvent.click(screen.getByRole('button',{name:'Add Dumbbell Floor Press to workout'}))

  const summary=screen.getByRole('region',{name:'Selected workout exercises'})
  expect(summary).toHaveTextContent('Jumping Jacks')
  expect(summary).toHaveTextContent('Dumbbell Floor Press')
  expect(screen.getByText('2 movements')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/Review workout/}))
  expect(onBuildSelected).toHaveBeenCalledWith(['w1','x001'])
})

it('maps visible cardio labels to a Cardio filter and exposes the full equipment catalogue',()=>{
  render(<LibraryScreen {...props()}/>)
  fireEvent.click(screen.getByRole('button',{name:'Cardio'}))
  expect(screen.getByRole('heading',{name:'Jumping Jacks'})).toBeInTheDocument()
  const equipment=screen.getByRole('combobox',{name:'Equipment'})
  expect(equipment).toHaveTextContent('dumbbells')
  expect(equipment).toHaveTextContent('kettlebell')
})

it('toggles the avoid list and reflects persisted avoided state',()=>{
  const onToggleAvoid=vi.fn()
  const {rerender}=render(<LibraryScreen {...props({onToggleAvoid})}/>)
  fireEvent.change(screen.getByPlaceholderText('Search exercises…'),{target:{value:'Jumping Jacks'}})
  fireEvent.click(screen.getByRole('button',{name:'Mark Jumping Jacks as avoided'}))
  expect(onToggleAvoid).toHaveBeenCalledWith('w1')
  rerender(<LibraryScreen {...props({onToggleAvoid,state:{...defaultState,profile:{...defaultState.profile,avoidList:['w1']}}})}/>)
  expect(screen.getByRole('button',{name:'Remove Jumping Jacks from avoid list'})).toHaveAttribute('aria-pressed','true')
})

it('confirms custom deletion, supports cancellation, and opens the custom editor route',()=>{
  const custom={id:'u_custom_test',name:'My Press',description:'Custom',category:'upper' as const,pattern:'press',level:2 as const,durationSeconds:30,prescription:'8 reps',equipment:['none' as const],primaryMuscles:['chest' as const],secondaryMuscles:[],unilateral:false,lowImpact:true,goals:['general' as const],contraindications:[],isCustom:true}
  const onDeleteCustom=vi.fn();const onCreateExercise=vi.fn()
  const confirm=vi.spyOn(window,'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
  render(<LibraryScreen {...props({state:{...defaultState,customExercises:[custom]},onDeleteCustom,onCreateExercise})}/>)
  fireEvent.change(screen.getByPlaceholderText('Search exercises…'),{target:{value:'My Press'}})
  fireEvent.click(screen.getByRole('button',{name:'Delete My Press'}))
  expect(onDeleteCustom).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button',{name:'Delete My Press'}))
  expect(onDeleteCustom).toHaveBeenCalledWith(custom.id)
  fireEvent.click(screen.getByRole('button',{name:/Create custom exercise/}))
  expect(onCreateExercise).toHaveBeenCalledOnce()
  confirm.mockRestore()
})

it('combines category, equipment and search filters and reports empty results',()=>{
  render(<LibraryScreen {...props()}/>)
  fireEvent.click(screen.getByRole('button',{name:'Upper'}))
  fireEvent.change(screen.getByRole('combobox',{name:'Equipment'}),{target:{value:'dumbbells'}})
  fireEvent.change(screen.getByPlaceholderText('Search exercises…'),{target:{value:'Dumbbell Floor Press'}})
  expect(screen.getByRole('heading',{name:'Dumbbell Floor Press'})).toBeInTheDocument()
  expect(screen.getByRole('link',{name:'▶ Watch video'})).toHaveAttribute('target','_blank')
  fireEvent.change(screen.getByPlaceholderText('Search exercises…'),{target:{value:'no such movement anywhere'}})
  expect(screen.getByText('0 matching movements')).toBeInTheDocument()
  expect(screen.queryAllByRole('article')).toHaveLength(0)
})

it('renders the full large catalogue without dropping movements',()=>{
  render(<LibraryScreen {...props()}/>)
  const reported=Number(screen.getByText(/matching movements/).textContent?.match(/\d+/)?.[0])
  expect(reported).toBeGreaterThan(300)
  expect(screen.getAllByRole('article')).toHaveLength(reported)
})
