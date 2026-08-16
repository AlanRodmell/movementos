import { fireEvent, render, screen } from '@testing-library/react'
import { defaultState } from '../storage/state'
import { ProfileScreen } from './ProfileScreen'

const noop=()=>undefined

it('offers a full local-data reset from the Data panel',()=>{
  const onResetData=vi.fn()
  render(<ProfileScreen state={structuredClone(defaultState)} onProfile={noop} onReplaceState={noop} onResetData={onResetData} onAddIssue={noop} onResolveIssue={noop} onReopenIssue={noop} onDeleteIssue={noop} onSaveCustom={noop} onDeleteCustom={noop}/>)
  expect(screen.getByText(/delete your profile, saved workouts, history/i)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Reset all data'}))
  expect(onResetData).toHaveBeenCalledOnce()
})
