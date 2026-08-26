import { fireEvent,render,screen } from '@testing-library/react'
import { SuggestedCheckInScreen } from './SuggestedCheckInScreen'

it('submits a fresh same-day check-in before creating the suggestion',()=>{
  const onSubmit=vi.fn()
  render(<SuggestedCheckInScreen dailyCheckIn={{date:null,tightAreas:[],primaryArea:null}} onSubmit={onSubmit}/>)

  fireEvent.click(screen.getByRole('button',{name:/Upper body/}))
  fireEvent.click(screen.getByRole('button',{name:'Shoulders'}))
  fireEvent.click(screen.getByRole('button',{name:/Create today’s session/}))

  expect(onSubmit).toHaveBeenCalledWith({date:new Date().toDateString(),tightAreas:['shoulders'],primaryArea:'shoulders'})
})
