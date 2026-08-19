import { act,fireEvent,render,screen } from '@testing-library/react'
import { defaultState } from '../storage/state'
import { createManualWorkout } from '../domain/engine'
import type { ActiveSession,WorkoutPlan } from '../domain/types'
import { PlayerScreen,restSecondsForGoal } from './PlayerScreen'
import { resetWorkoutAudioForTests } from '../audio/workoutAudio'

afterEach(()=>resetWorkoutAudioForTests())

it('adjusts rest duration to the workout objective',()=>{
  expect(restSecondsForGoal('strength')).toBe(30)
  expect(restSecondsForGoal('muscle')).toBe(20)
  expect(restSecondsForGoal('general')).toBe(15)
  expect(restSecondsForGoal('endurance')).toBe(10)
  expect(restSecondsForGoal('mobility')).toBe(10)
})

it('runs get-ready, work, waiting, rest, and the next exercise automatically',()=>{
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T10:00:00Z'))
  const startedAt=Date.now()
  const plan:WorkoutPlan={
    id:'player-flow',name:'Player flow',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['full_body'],insights:[],
    exercises:[
      {exerciseId:'x001',prescription:'10 reps',durationSeconds:2,rationale:'First',section:'Main work'},
      {exerciseId:'x002',prescription:'10 reps',durationSeconds:2,rationale:'Second',section:'Main work'},
    ],
  }
  const session:ActiveSession={plan,index:0,phase:'get_ready',remainingSeconds:5,running:true,deadlineAt:startedAt+5000,startedAt,completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(screen.getByRole('heading',{name:'Workout begins in'})).toBeInTheDocument()
  expect(screen.getByText('5')).toBeInTheDocument()

  act(()=>vi.advanceTimersByTime(5000))
  expect(screen.getByRole('heading',{name:'Dumbbell Floor Press'})).toBeInTheDocument()
  expect(screen.getByText('0:02')).toBeInTheDocument()

  act(()=>vi.advanceTimersByTime(2000))
  expect(screen.getByRole('heading',{name:'Nice work'})).toBeInTheDocument()
  expect(screen.queryByRole('button',{name:/resume/i})).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button',{name:/log & continue/i}))
  expect(screen.getByRole('heading',{name:'Recover'})).toBeInTheDocument()
  expect(screen.getByText('0:15')).toBeInTheDocument()

  act(()=>vi.advanceTimersByTime(15000))
  expect(screen.getByRole('heading',{name:'Dumbbell Bench Press'})).toBeInTheDocument()
  expect(screen.getByText('0:02')).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Pause'})).toBeInTheDocument()
  vi.useRealTimers()
})

it('gives both sides their full allotted time after the get-ready countdown',()=>{
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T10:00:00Z'))
  const startedAt=Date.now()
  const plan:WorkoutPlan={
    id:'bilateral-count-in',name:'Bilateral count-in',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],
    exercises:[{exerciseId:'x005',prescription:'10 each side',durationSeconds:20,rationale:'Full time per side',section:'Main work'}],
  }
  const session:ActiveSession={plan,index:0,phase:'get_ready',remainingSeconds:5,running:true,deadlineAt:startedAt+5000,startedAt,completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  act(()=>vi.advanceTimersByTime(5000))
  expect(screen.getByRole('heading',{name:'Single-Arm Dumbbell Row'})).toBeInTheDocument()
  expect(screen.getByText('0:10')).toBeInTheDocument()

  act(()=>vi.advanceTimersByTime(10000))
  expect(screen.getByRole('heading',{name:/Single-Arm Dumbbell Row · Side 2/})).toBeInTheDocument()
  expect(screen.getByText('0:10')).toBeInTheDocument()
  vi.useRealTimers()
})

it('plays an injury-adjusted bilateral stretch for the full increased hold on each side',()=>{
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T10:00:00Z'))
  const startedAt=Date.now()
  const state={...defaultState,issues:[{id:'neck',area:'neck' as const,severity:'moderate' as const,status:'active' as const,note:'',createdAt:new Date().toISOString(),side:'bilateral' as const,resolvedAt:null}]}
  const plan=createManualWorkout(['m31'],state)
  const session:ActiveSession={plan,index:0,phase:'get_ready',remainingSeconds:5,running:true,deadlineAt:startedAt+5000,startedAt,completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={state} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  act(()=>vi.advanceTimersByTime(5000))
  expect(screen.getByRole('heading',{name:'Neck Side Stretch'})).toBeInTheDocument()
  expect(screen.getByText('0:30')).toBeInTheDocument()
  expect(screen.getByText('30 sec / side')).toBeInTheDocument()

  act(()=>vi.advanceTimersByTime(30000))
  expect(screen.getByRole('heading',{name:'Neck Side Stretch · Side 2'})).toBeInTheDocument()
  expect(screen.getByText('0:30')).toBeInTheDocument()
  vi.useRealTimers()
})

it('sounds a cue for each of the final five exercise seconds',()=>{
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T10:00:00Z'))
  const oscillators:Array<{frequency:{value:number};start:ReturnType<typeof vi.fn>;stop:ReturnType<typeof vi.fn>}>=[]
  let contextCount=0
  class MockAudioContext {
    constructor(){contextCount+=1}
    currentTime=0
    destination={}
    createOscillator(){
      const oscillator={frequency:{value:0},connect:vi.fn(),start:vi.fn(),stop:vi.fn()}
      oscillators.push(oscillator)
      return oscillator
    }
    createGain(){return{gain:{value:0},connect:vi.fn()}}
  }
  const originalAudioContext=window.AudioContext
  Object.defineProperty(window,'AudioContext',{configurable:true,value:MockAudioContext})
  const startedAt=Date.now()
  const plan:WorkoutPlan={
    id:'audio-countdown',name:'Audio countdown',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['full_body'],insights:[],
    exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:6,rationale:'Countdown',section:'Main work'}],
  }
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:6,running:true,deadlineAt:startedAt+6000,startedAt,completedExerciseIds:[]}

  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  expect(oscillators).toHaveLength(0)
  for(let second=0;second<5;second+=1)act(()=>vi.advanceTimersByTime(1000))
  expect(oscillators).toHaveLength(5)
  expect(oscillators.every(oscillator=>oscillator.frequency.value===660)).toBe(true)
  act(()=>vi.advanceTimersByTime(1000))
  expect(oscillators).toHaveLength(6)
  expect(oscillators.at(-1)?.frequency.value).toBe(880)
  expect(contextCount).toBe(1)

  Object.defineProperty(window,'AudioContext',{configurable:true,value:originalAudioContext})
  vi.useRealTimers()
})

it('sounds a five-second countdown through the end of a rest phase',()=>{
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T10:00:00Z'))
  const frequencies:number[]=[]
  let contextCount=0
  class MockAudioContext {
    constructor(){contextCount+=1}
    currentTime=0
    destination={}
    createOscillator(){return{frequency:{set value(value:number){frequencies.push(value)}},connect:vi.fn(),start:vi.fn(),stop:vi.fn()}}
    createGain(){return{gain:{value:0},connect:vi.fn()}}
  }
  const originalAudioContext=window.AudioContext
  Object.defineProperty(window,'AudioContext',{configurable:true,value:MockAudioContext})
  const startedAt=Date.now()
  const plan:WorkoutPlan={
    id:'rest-audio-countdown',name:'Rest audio countdown',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['full_body'],insights:[],
    exercises:[
      {exerciseId:'x001',prescription:'10 reps',durationSeconds:10,rationale:'First',section:'Main work'},
      {exerciseId:'x002',prescription:'10 reps',durationSeconds:10,rationale:'Second',section:'Main work'},
    ],
  }
  const session:ActiveSession={plan,index:0,phase:'rest',remainingSeconds:6,running:true,deadlineAt:startedAt+6000,startedAt,completedExerciseIds:['x001']}

  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  expect(frequencies).toHaveLength(0)
  for(let second=0;second<5;second+=1)act(()=>vi.advanceTimersByTime(1000))
  expect(frequencies).toEqual([660,660,660,660,660])
  act(()=>vi.advanceTimersByTime(1000))
  expect(frequencies.at(-1)).toBe(880)
  expect(contextCount).toBe(1)

  Object.defineProperty(window,'AudioContext',{configurable:true,value:originalAudioContext})
  vi.useRealTimers()
})

it('keeps the player exit action independent from the light shell back-button style',()=>{
  const plan:WorkoutPlan={id:'exit-style',name:'Exit style',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['full_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:10,rationale:'Test',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:10,running:false,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  expect(screen.getByRole('button',{name:/end session/i})).toHaveClass('player-exit')
  expect(screen.getByRole('button',{name:/end session/i})).not.toHaveClass('bottom-back')
})

it('uses one personalised explanation and keeps exercise guidance prominent',()=>{
  const plan:WorkoutPlan={id:'personalised-player',name:'Personalised player',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'8 reps 🩹',durationSeconds:30,rationale:'Reduced from 10-12 reps to protect the area flagged today.',section:'Main work',adjusted:true}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:false,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:[]}
  const state={...defaultState,issues:[{id:'left-chest',area:'chest' as const,severity:'moderate' as const,status:'active' as const,note:'Sensitive today',createdAt:new Date().toISOString(),side:'left' as const,resolvedAt:null}]}
  const {container}=render(<PlayerScreen session={session} state={state} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(container.querySelector('.player-screen')).toHaveClass('player-personalised')
  expect(screen.getByText('PERSONALISED FOR TODAY')).toBeInTheDocument()
  expect(screen.getByText('For today: Left chest · moderate sensitivity')).toBeInTheDocument()
  expect(screen.queryByText('TARGET AREAS')).not.toBeInTheDocument()
  expect(screen.queryByText('Chest · Triceps')).not.toBeInTheDocument()
  expect(screen.getByText('8 reps')).toBeInTheDocument()
  expect(screen.queryByText(/🩹/)).not.toBeInTheDocument()
  expect(screen.queryByText('ADAPTATION')).not.toBeInTheDocument()
  expect(screen.queryByText('Prescription adapted for today')).not.toBeInTheDocument()
  expect(screen.queryByText('We’ll learn from how this feels today.')).not.toBeInTheDocument()
  expect(screen.getByText('Press dumbbells from the floor, pausing softly as the upper arms touch down.')).toHaveClass('player-cue')
  expect(screen.getByRole('link',{name:/watch demo/i})).toBeInTheDocument()
  expect(screen.getAllByText(/main work/i)).toHaveLength(1)
})

it('explains an automatic daily check-in adaptation without requiring an active issue',()=>{
  const plan:WorkoutPlan={id:'check-in-player',name:'Check-in player',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['shoulders'],insights:[],exercises:[{exerciseId:'x008',prescription:'6 reps 🩹',durationSeconds:30,rationale:'Reduced after today’s shoulder check-in.',section:'Main work',adjusted:true}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:false,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:[]}
  const state={...defaultState,dailyCheckIn:{date:new Date().toDateString(),tightAreas:['shoulders' as const],primaryArea:'shoulders' as const}}
  render(<PlayerScreen session={session} state={state} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(screen.getByText('Based on today’s check-in: Shoulders')).toBeInTheDocument()
  expect(screen.queryByText('Shoulders · Triceps')).not.toBeInTheDocument()
  expect(screen.queryByText('Prescription adapted for today')).not.toBeInTheDocument()
})

it.each([
  ['down','Easier level selected','easier-adjusted'],
  ['up','Harder level selected','harder-adjusted'],
] as const)('labels a manually scaled %s exercise without presenting it as an automatic recovery change',(scaled,label,className)=>{
  const plan:WorkoutPlan={id:`manual-${scaled}`,name:'Manual adjustment',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x002',prescription:'8 reps',durationSeconds:30,rationale:'Changed during the workout.',section:'Main work',scaled,originalLevel:2}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:false,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:[]}
  const {container}=render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(screen.getByText('ADJUSTED BY YOU')).toBeInTheDocument()
  expect(screen.getAllByText(label).length).toBeGreaterThan(0)
  expect(container.querySelector('.player-centre')).toHaveClass(className)
  expect(screen.queryByText('RECOVERY ADJUSTED')).not.toBeInTheDocument()
})

it('keeps the ordinary unadjusted player state uncluttered',()=>{
  const plan:WorkoutPlan={id:'ordinary-player',name:'Ordinary player',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:30,rationale:'Balanced push volume.',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:false,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:[]}
  const {container}=render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(container.querySelector('.player-screen')).not.toHaveClass('player-personalised')
  expect(screen.queryByText('PERSONALISED FOR TODAY')).not.toBeInTheDocument()
  expect(screen.queryByText('ADAPTATION')).not.toBeInTheDocument()
  expect(screen.queryByText('We’ll learn from how this feels today.')).not.toBeInTheDocument()
  expect(screen.queryByText('TARGET AREAS')).not.toBeInTheDocument()
  expect(screen.queryByText('Chest · Triceps')).not.toBeInTheDocument()
  expect(screen.getByText('Balanced push volume.')).toBeInTheDocument()
  expect(screen.getByRole('button',{name:/complete session/i})).toBeEnabled()
  expect(screen.getByRole('button',{name:'Resume'})).toBeEnabled()
  expect(screen.getByRole('button',{name:'Skip'})).toBeEnabled()
})

it('pauses the workout and progressively discloses modification controls',()=>{
  const startedAt=Date.now()
  const plan:WorkoutPlan={id:'modify-player',name:'Modify player',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:30,rationale:'Balanced push volume.',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:true,deadlineAt:startedAt+30000,startedAt,completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(screen.queryByRole('button',{name:'Make easier'})).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Modify exercise'}))
  expect(screen.getByRole('dialog',{name:'Make it work for today'})).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Resume'})).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Make easier'})).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Make harder'})).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Swap exercise'})).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button',{name:'Increase reps or time'}))
  expect(screen.getAllByText('11 reps')).toHaveLength(2)
  expect(screen.getByRole('status')).toHaveTextContent('We’ll remember this prescription change.')
  fireEvent.click(screen.getByRole('button',{name:'Done'}))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('keeps personalised workout chrome out of get-ready and rest phase screens',()=>{
  const plan:WorkoutPlan={id:'phase-chrome',name:'Phase chrome',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'8 reps 🩹',durationSeconds:30,rationale:'Adjusted today.',section:'Main work',adjusted:true},{exerciseId:'x002',prescription:'10 reps',durationSeconds:30,rationale:'Next.',section:'Main work'}]}
  const ready:ActiveSession={plan,index:0,phase:'get_ready',remainingSeconds:5,running:false,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:[]}
  const {unmount}=render(<PlayerScreen session={ready} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  expect(screen.getByRole('heading',{name:'Workout begins in'})).toBeInTheDocument()
  expect(screen.queryByText('PERSONALISED FOR TODAY')).not.toBeInTheDocument()

  unmount()
  render(<PlayerScreen session={{...ready,phase:'rest',remainingSeconds:15,index:0}} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  expect(screen.getByRole('heading',{name:'Recover'})).toBeInTheDocument()
  expect(screen.queryByText('PERSONALISED FOR TODAY')).not.toBeInTheDocument()
})

it('removes the personalised treatment when an adjusted exercise advances to an ordinary exercise',()=>{
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T10:00:00Z'))
  const startedAt=Date.now()
  const plan:WorkoutPlan={id:'adaptive-transition',name:'Adaptive transition',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'8 reps 🩹',durationSeconds:1,rationale:'Adjusted today.',section:'Main work',adjusted:true},{exerciseId:'x002',prescription:'10 reps',durationSeconds:2,rationale:'Ordinary movement.',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:1,running:true,deadlineAt:startedAt+1000,startedAt,completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(screen.getByText('PERSONALISED FOR TODAY')).toBeInTheDocument()
  act(()=>vi.advanceTimersByTime(1000))
  expect(screen.getByRole('heading',{name:'Recover'})).toBeInTheDocument()
  expect(screen.queryByText('PERSONALISED FOR TODAY')).not.toBeInTheDocument()

  act(()=>vi.advanceTimersByTime(15000))
  expect(screen.getByRole('heading',{name:'Dumbbell Bench Press'})).toBeInTheDocument()
  expect(screen.queryByText('PERSONALISED FOR TODAY')).not.toBeInTheDocument()
  expect(screen.queryByText('Chest · Triceps')).not.toBeInTheDocument()
  expect(screen.getByText('0:02')).toBeInTheDocument()
  vi.useRealTimers()
})

it('collects optional grouped exercise feedback before the overall rating',()=>{
  const startedAt=Date.now()
  const plan:WorkoutPlan={id:'review',name:'Review',intention:'train',goal:'strength',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:30,rationale:'Press slot',section:'Main work',setNumber:1,totalSets:1,slotKey:'horizontal-push'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:false,deadlineAt:null,startedAt,completedExerciseIds:[],actions:[]}
  const onComplete=vi.fn()
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={onComplete} onExit={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button',{name:/complete session/i}))
  expect(screen.getByRole('heading',{name:'How did each movement fit?'})).toBeInTheDocument()
  expect(screen.getByText(/1\/1 completed/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Good fit'}))
  fireEvent.click(screen.getByRole('button',{name:/continue to overall rating/i}))
  fireEvent.click(screen.getByRole('button',{name:/good/i}))
  expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({rating:'good',exercises:[expect.objectContaining({id:'x001',feedback:'good_fit',completedAppearances:1})],actions:[expect.objectContaining({type:'completed'})]}))
})

it('offers an explicit issue after discomfort without diagnosing an injury',()=>{
  const plan:WorkoutPlan={id:'discomfort',name:'Discomfort',intention:'train',goal:'strength',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:30,rationale:'Press',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:false,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:[],actions:[]}
  const onCreateIssue=vi.fn()
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onCreateIssue={onCreateIssue} onExit={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button',{name:/complete session/i}))
  fireEvent.click(screen.getByRole('button',{name:'Discomfort'}))
  expect(screen.getByText(/does not diagnose an injury/i)).toBeInTheDocument()
  fireEvent.change(screen.getByRole('combobox',{name:/issue severity/i}),{target:{value:'moderate'}})
  fireEvent.change(screen.getByRole('combobox',{name:/issue side/i}),{target:{value:'left'}})
  fireEvent.click(screen.getByRole('button',{name:'Add issue'}))
  expect(onCreateIssue).toHaveBeenCalledWith(expect.any(String),'moderate','left',expect.stringContaining('Dumbbell Floor Press'))
  expect(screen.getByRole('button',{name:'Issue added'})).toBeDisabled()
})
