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
