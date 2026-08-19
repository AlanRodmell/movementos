import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { defaultState } from '../storage/state'
import { ProfileScreen } from './ProfileScreen'

const noop=()=>undefined
const props=(overrides={})=>({state:structuredClone(defaultState),onProfile:vi.fn(),onReplaceState:vi.fn(),onResetData:vi.fn(),onAddIssue:vi.fn(),onResolveIssue:vi.fn(),onReopenIssue:vi.fn(),onDeleteIssue:vi.fn(),onSaveCustom:vi.fn(),onDeleteCustom:vi.fn(),...overrides})

it('offers a full local-data reset from the Data panel',()=>{
  const onResetData=vi.fn()
  render(<ProfileScreen state={structuredClone(defaultState)} onProfile={noop} onReplaceState={noop} onResetData={onResetData} onAddIssue={noop} onResolveIssue={noop} onReopenIssue={noop} onDeleteIssue={noop} onSaveCustom={noop} onDeleteCustom={noop}/>)
  expect(screen.getByText(/delete your profile, saved workouts, history/i)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Reset all data'}))
  expect(onResetData).toHaveBeenCalledOnce()
})

it('updates identity, goal, independent levels, equipment and playback preferences',()=>{
  const onProfile=vi.fn()
  render(<ProfileScreen {...props({onProfile})}/>)
  fireEvent.change(screen.getByLabelText('Name'),{target:{value:'Alex'}})
  expect(onProfile).toHaveBeenLastCalledWith(expect.objectContaining({name:'Alex'}))
  fireEvent.change(screen.getByLabelText('Primary goal'),{target:{value:'strength'}})
  expect(onProfile).toHaveBeenLastCalledWith(expect.objectContaining({goal:'strength'}))
  fireEvent.change(screen.getByLabelText('upper'),{target:{value:'4'}})
  expect(onProfile).toHaveBeenLastCalledWith(expect.objectContaining({upper:4}))
  fireEvent.click(screen.getByRole('button',{name:'dumbbells'}))
  expect(onProfile).toHaveBeenLastCalledWith(expect.objectContaining({equipment:expect.arrayContaining(['dumbbells'])}))
  fireEvent.click(screen.getByRole('checkbox',{name:/Countdown sounds/}))
  expect(onProfile).toHaveBeenLastCalledWith(expect.objectContaining({soundEnabled:false}))
  fireEvent.click(screen.getByRole('checkbox',{name:/Wait for me/}))
  expect(onProfile).toHaveBeenLastCalledWith(expect.objectContaining({waitBetweenExercises:false}))
  fireEvent.click(screen.getByRole('checkbox',{name:/Advanced bridges/}))
  expect(onProfile).toHaveBeenLastCalledWith(expect.objectContaining({advancedBridges:true}))
})

it('adds, resolves, reopens and safely deletes issues',()=>{
  const onAddIssue=vi.fn();const onResolveIssue=vi.fn();const onReopenIssue=vi.fn();const onDeleteIssue=vi.fn()
  const active={id:'active',area:'shoulders' as const,severity:'moderate' as const,status:'active' as const,note:'After sport',createdAt:new Date(0).toISOString(),side:'left' as const,resolvedAt:null}
  const resolved={...active,id:'resolved',status:'resolved' as const,resolvedAt:new Date().toISOString()}
  const confirm=vi.spyOn(window,'confirm').mockReturnValue(true)
  render(<ProfileScreen {...props({state:{...defaultState,issues:[active,resolved]},onAddIssue,onResolveIssue,onReopenIssue,onDeleteIssue})}/>)
  expect(screen.getByText('Shoulders · left')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Resolve'}))
  expect(onResolveIssue).toHaveBeenCalledWith('active')
  fireEvent.change(screen.getByRole('combobox',{name:'Issue severity'}),{target:{value:'flare'}})
  fireEvent.change(screen.getByRole('combobox',{name:'Issue side'}),{target:{value:'right'}})
  fireEvent.change(screen.getByPlaceholderText('Optional note'),{target:{value:'New note'}})
  fireEvent.click(screen.getByRole('button',{name:/Add shoulders issue/i}))
  expect(onAddIssue).toHaveBeenCalledWith('shoulders','flare','right','New note')
  fireEvent.click(screen.getByText('Resolved issues (1)'))
  fireEvent.click(screen.getByRole('button',{name:'Reopen'}))
  expect(onReopenIssue).toHaveBeenCalledWith('resolved')
  fireEvent.click(screen.getAllByRole('button',{name:'Delete'})[0])
  expect(onDeleteIssue).toHaveBeenCalledWith('active')
  confirm.mockRestore()
})

it('creates a normalised custom exercise and clamps input limits',()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-08-19T12:00:00Z'))
  const onSaveCustom=vi.fn()
  render(<ProfileScreen {...props({onSaveCustom})}/>)
  fireEvent.click(screen.getByRole('button',{name:'+ Create'}))
  const editor=screen.getByRole('heading',{name:'Create exercise'}).closest('section')!
  fireEvent.change(within(editor).getByLabelText('Name'),{target:{value:'  My custom press  '}})
  fireEvent.change(within(editor).getByLabelText('Category'),{target:{value:'stretching'}})
  fireEvent.change(within(editor).getByLabelText('Primary area'),{target:{value:'shoulders'}})
  fireEvent.change(within(editor).getByLabelText('Pattern'),{target:{value:'Shoulder / Reach!'}})
  fireEvent.change(within(editor).getByLabelText('Level'),{target:{value:'5'}})
  fireEvent.change(within(editor).getByLabelText('Equipment'),{target:{value:'bands'}})
  fireEvent.change(within(editor).getByLabelText('Prescription'),{target:{value:'30 sec'}})
  fireEvent.change(within(editor).getByLabelText('Timer (seconds)'),{target:{value:'5000'}})
  fireEvent.change(within(editor).getByLabelText('Video link (optional)'),{target:{value:' https://example.com/demo '}})
  fireEvent.click(within(editor).getByRole('button',{name:'Save exercise'}))
  expect(onSaveCustom).toHaveBeenCalledWith(expect.objectContaining({id:`m_custom_${Date.now()}`,name:'My custom press',category:'stretching',primaryMuscles:['shoulders'],pattern:'Shoulder_Reach_',level:5,equipment:['bands'],prescription:'30 sec',durationSeconds:3600,description:'Custom exercise.',videoUrl:'https://example.com/demo',isCustom:true}))
  vi.useRealTimers()
})

it('edits and deletes custom exercises without changing their stable id',()=>{
  const custom={id:'u_custom_existing',name:'Existing',description:'Notes',category:'upper' as const,pattern:'push',level:2 as const,durationSeconds:30,prescription:'8 reps',equipment:['none' as const],primaryMuscles:['chest' as const],secondaryMuscles:[],unilateral:false,lowImpact:true,goals:['general' as const],contraindications:[],isCustom:true}
  const onSaveCustom=vi.fn();const onDeleteCustom=vi.fn();const confirm=vi.spyOn(window,'confirm').mockReturnValue(true)
  render(<ProfileScreen {...props({state:{...defaultState,customExercises:[custom]},onSaveCustom,onDeleteCustom})}/>)
  fireEvent.click(screen.getByRole('button',{name:'Edit'}))
  const editor=screen.getByRole('heading',{name:'Edit exercise'}).closest('section')!
  fireEvent.change(within(editor).getByLabelText('Name'),{target:{value:'Updated'}})
  fireEvent.click(within(editor).getByRole('button',{name:'Save exercise'}))
  expect(onSaveCustom).toHaveBeenCalledWith(expect.objectContaining({id:custom.id,name:'Updated'}))
  fireEvent.click(screen.getByRole('button',{name:'Delete'}))
  expect(onDeleteCustom).toHaveBeenCalledWith(custom.id)
  confirm.mockRestore()
})

it('imports valid backups, rejects malformed JSON, and ignores files over 5 MB',async()=>{
  const onReplaceState=vi.fn();const alert=vi.spyOn(window,'alert').mockImplementation(()=>undefined)
  const {container}=render(<ProfileScreen {...props({onReplaceState})}/>)
  const input=container.querySelector('input[type="file"]')!
  fireEvent.change(input,{target:{files:[new File([JSON.stringify({profile:{name:'Imported'}})],'backup.json',{type:'application/json'})]}})
  await waitFor(()=>expect(onReplaceState).toHaveBeenCalledWith(expect.objectContaining({profile:expect.objectContaining({name:'Imported'})})))
  fireEvent.change(input,{target:{files:[new File(['{bad'],'bad.json',{type:'application/json'})]}})
  await waitFor(()=>expect(alert).toHaveBeenCalledWith('That backup could not be read.'))
  onReplaceState.mockClear()
  fireEvent.change(input,{target:{files:[new File([new Uint8Array(5_000_001)],'large.json',{type:'application/json'})]}})
  await new Promise(resolve=>setTimeout(resolve,0))
  expect(onReplaceState).not.toHaveBeenCalled()
  alert.mockRestore()
})
