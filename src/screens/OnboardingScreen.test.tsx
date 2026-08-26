import { fireEvent,render,screen } from '@testing-library/react'
import { defaultState } from '../storage/state'
import { OnboardingScreen } from './OnboardingScreen'

it('collects a safe starting profile before completing setup',()=>{
  const onComplete=vi.fn()
  render(<OnboardingScreen profile={defaultState.profile} onComplete={onComplete}/>)

  expect(screen.getByRole('heading',{name:'Train for the body you have today.'})).toHaveFocus()
  fireEvent.change(screen.getByLabelText(/Name/),{target:{value:' Alex '}})
  fireEvent.click(screen.getByRole('button',{name:/Strength/}))
  fireEvent.click(screen.getByRole('button',{name:/Continue/}))
  expect(screen.getByRole('heading',{name:'What should sessions assume?'})).toHaveFocus()
  fireEvent.click(screen.getByRole('button',{name:/Experienced/}))
  fireEvent.click(screen.getByRole('button',{name:'Dumbbells'}))
  fireEvent.click(screen.getByRole('button',{name:/Continue/}))

  const finish=screen.getByRole('button',{name:/Finish setup/})
  expect(finish).toBeDisabled()
  expect(screen.getByRole('complementary',{name:'Exercise safety'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.click(finish)

  expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({name:'Alex',goal:'strength',level:3,upper:3,lower:3,core:3,conditioning:3,equipment:expect.arrayContaining(['none','dumbbells'])}))
})
