import { fireEvent,render,screen,within } from '@testing-library/react'
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

it('persists today’s check-in with the selected primary area',()=>{
  const onCheckIn=vi.fn()
  render(<BuilderScreen profile={defaultState.profile} dailyCheckIn={defaultState.dailyCheckIn} onCheckIn={onCheckIn} onGenerate={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button',{name:/upper body/i}))
  fireEvent.click(screen.getByRole('button',{name:'Shoulders'}))
  fireEvent.click(screen.getByRole('button',{name:'Upper arms'}))
  fireEvent.change(screen.getByRole('combobox',{name:'Most noticeable today'}),{target:{value:'biceps'}})
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  expect(onCheckIn).toHaveBeenCalledWith({date:new Date().toDateString(),tightAreas:['shoulders','biceps'],primaryArea:'biceps'})
})

it('submits every training constraint and retains choices after backwards navigation',()=>{
  const onGenerate=vi.fn()
  render(<BuilderScreen profile={defaultState.profile} dailyCheckIn={defaultState.dailyCheckIn} onCheckIn={vi.fn()} onGenerate={onGenerate}/>)
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/Endurance/i}))
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:'45 min'}))
  const setControls=screen.getByRole('heading',{name:'Target sets'}).nextElementSibling!
  fireEvent.change(screen.getByRole('spinbutton',{name:'Custom exercises per round'}),{target:{value:'11'}})
  fireEvent.click(within(setControls as HTMLElement).getByRole('button',{name:'5'}))
  fireEvent.click(screen.getByRole('button',{name:'Kettlebell'}))
  fireEvent.click(screen.getByRole('button',{name:'Previous step'}))
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  expect(screen.getByRole('button',{name:'45 min'})).toHaveClass('selected')
  expect(screen.getByRole('spinbutton',{name:'Custom exercises per round'})).toHaveValue(11)
  expect(within(screen.getByRole('heading',{name:'Target sets'}).nextElementSibling as HTMLElement).getByRole('button',{name:'5'})).toHaveClass('selected')
  fireEvent.click(screen.getByRole('button',{name:/generate my session/i}))
  expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({intention:'train',goal:'endurance',durationMinutes:45,exercisesPerRound:11,targetSets:5,includeConditioning:true,includeMindfulness:false,equipment:expect.arrayContaining(['kettlebell'])}))
})

it('uses recovery-only constraints and never allows all recovery modes to be removed',()=>{
  const onGenerate=vi.fn()
  render(<BuilderScreen profile={defaultState.profile} dailyCheckIn={defaultState.dailyCheckIn} onCheckIn={vi.fn()} onGenerate={onGenerate}/>)
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/Recover/}))
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/Mobility/}))
  fireEvent.click(screen.getByRole('button',{name:/Stretching/}))
  expect(screen.getByRole('button',{name:/Stretching/})).toHaveClass('selected')
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  fireEvent.click(screen.getByRole('button',{name:/continue/i}))
  expect(screen.queryByRole('heading',{name:'Target sets'})).not.toBeInTheDocument()
  expect(screen.getByRole('checkbox',{name:/Preparation warm-up/})).not.toBeChecked()
  expect(screen.getByRole('checkbox',{name:/Mindfulness close-out/})).not.toBeChecked()
  fireEvent.click(screen.getByRole('checkbox',{name:/Mindfulness close-out/}))
  fireEvent.click(screen.getByRole('button',{name:'30 min'}))
  fireEvent.click(screen.getByRole('button',{name:/generate my session/i}))
  expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({intention:'recover',goal:'mobility',durationMinutes:30,includeConditioning:false,includeWarmup:false,includeMindfulness:true,recoveryModes:['stretching']}))
})

it('restores a same-day check-in and ignores an old one',()=>{
  const today={date:new Date().toDateString(),tightAreas:['neck' as const],primaryArea:'neck' as const}
  const {unmount}=render(<BuilderScreen profile={defaultState.profile} dailyCheckIn={today} onCheckIn={vi.fn()} onGenerate={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button',{name:/upper body/i}))
  expect(screen.getByRole('button',{name:'Neck'})).toHaveAttribute('aria-pressed','true')
  unmount()
  render(<BuilderScreen profile={defaultState.profile} dailyCheckIn={{...today,date:'old'}} onCheckIn={vi.fn()} onGenerate={vi.fn()}/>)
  expect(screen.getByRole('button',{name:'Nothing to flag'})).toHaveClass('selected')
})
