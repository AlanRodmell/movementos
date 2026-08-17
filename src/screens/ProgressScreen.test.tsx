import { fireEvent,render,screen } from '@testing-library/react'
import { emptyLearningEntry } from '../domain/learning'
import { defaultState } from '../storage/state'
import { ProgressScreen } from './ProgressScreen'

it('renders readable learning evidence and progression controls',()=>{
  const entry={...emptyLearningEntry(),exposures:4,completedAppearances:4,positiveFeedback:3,tooEasy:2,preference:.4,difficultySuitability:.5,completionReliability:.9,evidence:12,successfulPerformances:4,progressionStatus:'ready' as const}
  const state={...defaultState,profile:{...defaultState.profile,equipment:['none' as const,'dumbbells' as const,'bench' as const]},learningModel:{...defaultState.learningModel,exercises:{x001:entry},events:[{id:'e1',at:'2026-08-17T10:00:00.000Z',exerciseId:'x001',type:'exercise_feedback' as const,label:'Good fit'}]}}
  const onProgression=vi.fn()
  render(<ProgressScreen state={state} onProgression={onProgression}/>)
  expect(screen.getByRole('heading',{name:'Learning'})).toBeInTheDocument()
  expect(screen.getByText('Dumbbell Floor Press')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Accept progression'}))
  expect(onProgression).toHaveBeenCalledWith(expect.objectContaining({exerciseId:'x001',category:'variation'}),'accept')
  fireEvent.change(screen.getByRole('combobox',{name:'Filter learning history'}),{target:{value:'exercise_feedback'}})
  expect(screen.getByText('Good fit')).toBeInTheDocument()
  expect(screen.queryByText(/preference.*0\.4/i)).not.toBeInTheDocument()
})
