import { fireEvent,render,screen } from '@testing-library/react'
import { defaultState } from '../storage/state'
import { BuilderScreen } from './BuilderScreen'

it('uses the detailed issue areas for workout focus',()=>{
  const onGenerate=vi.fn()
  render(<BuilderScreen profile={defaultState.profile} dailyCheckIn={defaultState.dailyCheckIn} onCheckIn={vi.fn()} onGenerate={onGenerate}/>)

  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))

  expect(screen.getByRole('heading',{name:'Where should we focus?'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/upper body/i}))
  fireEvent.click(screen.getByRole('button',{name:'Mid back'}))
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/generate my session/i}))

  expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({focusAreas:['mid_back']}))
})
