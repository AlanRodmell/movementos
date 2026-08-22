import { act,fireEvent,render,screen } from '@testing-library/react'
import { defaultState } from '../storage/state'
import { createManualWorkout } from '../domain/engine'
import type { ActiveSession,WorkoutPlan } from '../domain/types'
import { isTimedPrescription,PlayerScreen,restSecondsForGoal,timedPrescriptionSeconds } from './PlayerScreen'
import { resetWorkoutAudioForTests } from '../audio/workoutAudio'

afterEach(()=>resetWorkoutAudioForTests())

it('adjusts rest duration to the workout objective',()=>{
  expect(restSecondsForGoal('strength')).toBe(30)
  expect(restSecondsForGoal('muscle')).toBe(20)
  expect(restSecondsForGoal('general')).toBe(15)
  expect(restSecondsForGoal('endurance')).toBe(10)
  expect(restSecondsForGoal('mobility')).toBe(10)
})

it('derives work timers only from explicit time prescriptions',()=>{
  expect(isTimedPrescription('10-13 reps')).toBe(false)
  expect(isTimedPrescription('5 breaths')).toBe(false)
  expect(timedPrescriptionSeconds('45 sec')).toBe(45)
  expect(timedPrescriptionSeconds('30-45 sec')).toBe(45)
  expect(timedPrescriptionSeconds('20 sec each side')).toBe(20)
  expect(timedPrescriptionSeconds('0.5 min')).toBe(30)
})

it('runs get-ready, work, waiting, rest, and the next exercise automatically',()=>{
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T10:00:00Z'))
  const startedAt=Date.now()
  const plan:WorkoutPlan={
    id:'player-flow',name:'Player flow',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['full_body'],insights:[],
    exercises:[
      {exerciseId:'x001',prescription:'2 sec',durationSeconds:2,rationale:'First',section:'Main work'},
      {exerciseId:'x002',prescription:'2 sec',durationSeconds:2,rationale:'Second',section:'Main work'},
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
    exercises:[{exerciseId:'x005',prescription:'10 sec each side',durationSeconds:20,rationale:'Full time per side',section:'Main work'}],
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
  expect(screen.queryByText('30 sec / side')).not.toBeInTheDocument()

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
    exercises:[{exerciseId:'x001',prescription:'6 sec',durationSeconds:6,rationale:'Countdown',section:'Main work'}],
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
  expect(screen.queryByRole('button',{name:/pause|resume/i})).not.toBeInTheDocument()
  expect(container.querySelector('.timer')).not.toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Skip'})).toBeEnabled()
})

it('shows the Prone Swimmer rep target without turning its 45-second estimate into a timer',()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-08-22T12:00:00Z'))
  const plan:WorkoutPlan={id:'prone-swimmer-reps',name:'Rep-only player',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x085',prescription:'10-13 reps',durationSeconds:45,rationale:'Rep target',section:'Main work'}]}
  const onProgress=vi.fn()
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:45,running:true,deadlineAt:Date.now()+45_000,startedAt:Date.now(),completedExerciseIds:[]}
  const {container}=render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={onProgress} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(screen.getByRole('heading',{name:'Prone Swimmer Pulls'})).toBeInTheDocument()
  expect(screen.getByText('10-13 reps')).toBeInTheDocument()
  expect(screen.queryByText('0:45')).not.toBeInTheDocument()
  expect(container.querySelector('.timer')).not.toBeInTheDocument()
  expect(screen.queryByRole('button',{name:/pause|resume/i})).not.toBeInTheDocument()
  expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({remainingSeconds:0,running:false,deadlineAt:null}))
  act(()=>vi.advanceTimersByTime(60_000))
  expect(screen.getByRole('heading',{name:'Prone Swimmer Pulls'})).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/complete session/i}))
  expect(screen.getByRole('heading',{name:'How did each movement fit?'})).toBeInTheDocument()
  vi.useRealTimers()
})

it('logs each side of a bilateral rep target manually without a countdown',()=>{
  const plan:WorkoutPlan={id:'bilateral-reps',name:'Bilateral reps',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x005',prescription:'10 each side',durationSeconds:50,rationale:'Rep target',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:50,running:true,deadlineAt:Date.now()+50_000,startedAt:Date.now(),completedExerciseIds:[]}
  const {container}=render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(container.querySelector('.timer')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/log side & continue/i}))
  expect(screen.getByRole('heading',{name:'Single-Arm Dumbbell Row · Side 2'})).toBeInTheDocument()
  expect(screen.getByText('10 each side')).toBeInTheDocument()
  expect(container.querySelector('.timer')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:/complete session/i}))
  expect(screen.getByRole('heading',{name:'How did each movement fit?'})).toBeInTheDocument()
})

it('pauses the workout and progressively discloses modification controls',()=>{
  const startedAt=Date.now()
  const plan:WorkoutPlan={id:'modify-player',name:'Modify player',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'10 reps',durationSeconds:30,rationale:'Balanced push volume.',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:true,deadlineAt:startedAt+30000,startedAt,completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)

  expect(screen.queryByRole('button',{name:'Make easier'})).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Modify exercise'}))
  expect(screen.getByRole('dialog',{name:'Make it work for today'})).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Close modify exercise'})).toHaveFocus()
  expect(screen.queryByRole('button',{name:/pause|resume/i})).not.toBeInTheDocument()
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

it('removes the personalised treatment when an adjusted timed exercise advances to an ordinary timed exercise',()=>{
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-16T10:00:00Z'))
  const startedAt=Date.now()
  const plan:WorkoutPlan={id:'adaptive-transition',name:'Adaptive transition',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[{exerciseId:'x001',prescription:'1 sec 🩹',durationSeconds:1,rationale:'Adjusted today.',section:'Main work',adjusted:true},{exerciseId:'x002',prescription:'2 sec',durationSeconds:2,rationale:'Ordinary movement.',section:'Main work'}]}
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

it.each([
  ['waiting',0,false,'Nice work'],
  ['rest',8,false,'Recover'],
  ['work',12,false,'Dumbbell Floor Press'],
  ['switch_sides',6,false,'Dumbbell Floor Press · Side 2'],
] as const)('restores the persisted %s phase without resetting its remaining time',(phase,remaining,running,heading)=>{
  const plan:WorkoutPlan={id:`resume-${phase}`,name:'Resume',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:[],insights:[],exercises:[{exerciseId:'x001',prescription:phase==='switch_sides'?'6 sec each side':phase==='work'?'12 sec':'10 reps',durationSeconds:12,rationale:'Test',section:'Main work'},{exerciseId:'x002',prescription:'8 reps',durationSeconds:10,rationale:'Next',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase,remainingSeconds:remaining,running,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:phase==='waiting'||phase==='rest'?['x001']:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  expect(screen.getByRole('heading',{name:heading})).toBeInTheDocument()
  if(remaining)expect(screen.getByText(`0:${String(remaining).padStart(2,'0')}`)).toBeInTheDocument()
})

it('catches up an expired backgrounded rest deadline and starts the next movement',()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-08-19T12:00:00Z'))
  const plan:WorkoutPlan={id:'expired',name:'Expired',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:[],insights:[],exercises:[{exerciseId:'x001',prescription:'8 reps',durationSeconds:10,rationale:'First',section:'Main work'},{exerciseId:'x002',prescription:'8 reps',durationSeconds:10,rationale:'Next',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'rest',remainingSeconds:8,running:true,deadlineAt:Date.now()-5000,startedAt:Date.now()-20_000,completedExerciseIds:['x001']}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  act(()=>vi.advanceTimersByTime(0))
  expect(screen.getByRole('heading',{name:'Dumbbell Bench Press'})).toBeInTheDocument()
  expect(screen.getByText('8 reps')).toBeInTheDocument()
  expect(screen.queryByText('0:10')).not.toBeInTheDocument()
  vi.useRealTimers()
})

it('keeps a paused timer stable until the user resumes it',()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-08-19T12:00:00Z'))
  const plan:WorkoutPlan={id:'paused-timer',name:'Paused timer',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:[],insights:[],exercises:[{exerciseId:'x001',prescription:'12 sec',durationSeconds:12,rationale:'Timed work',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:12,running:false,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  act(()=>vi.advanceTimersByTime(20_000))
  expect(screen.getByText('0:12')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Resume'}))
  act(()=>vi.advanceTimersByTime(5000))
  expect(screen.getByText('0:07')).toBeInTheDocument()
  vi.useRealTimers()
})

it('finishes correctly after the second side of a final bilateral movement',()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-08-19T12:00:00Z'))
  const plan:WorkoutPlan={id:'final-side',name:'Final side',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:[],insights:[],exercises:[{exerciseId:'x005',prescription:'2 sec each side',durationSeconds:4,rationale:'Test',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'switch_sides',remainingSeconds:2,running:true,deadlineAt:Date.now()+2000,startedAt:Date.now(),completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  act(()=>vi.advanceTimersByTime(2000))
  expect(screen.getByRole('heading',{name:'How did each movement fit?'})).toBeInTheDocument()
  expect(screen.getByText(/1\/1 completed/)).toBeInTheDocument()
  vi.useRealTimers()
})

it('continues directly to rest when waiting is disabled and survives audio failures',()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-08-19T12:00:00Z'))
  const originalAudioContext=window.AudioContext
  Object.defineProperty(window,'AudioContext',{configurable:true,value:class{constructor(){throw new Error('blocked')}}})
  const plan:WorkoutPlan={id:'no-wait',name:'No wait',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:[],insights:[],exercises:[{exerciseId:'x001',prescription:'1 sec',durationSeconds:1,rationale:'First',section:'Main work'},{exerciseId:'x002',prescription:'1 sec',durationSeconds:1,rationale:'Second',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:1,running:true,deadlineAt:Date.now()+1000,startedAt:Date.now(),completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  act(()=>vi.advanceTimersByTime(1000))
  expect(screen.getByRole('heading',{name:'Recover'})).toBeInTheDocument()
  expect(screen.queryByRole('heading',{name:'Nice work'})).not.toBeInTheDocument()
  Object.defineProperty(window,'AudioContext',{configurable:true,value:originalAudioContext})
  vi.useRealTimers()
})

it('submits grouped completions, skips, performance and an unrated session payload',()=>{
  const startedAt=Date.now()-5000
  const plan:WorkoutPlan={id:'payload',name:'Payload',intention:'train',goal:'strength',durationMinutes:3,targetDurationMinutes:3,createdAt:new Date().toISOString(),focusAreas:['upper_body'],insights:[],exercises:[
    {exerciseId:'x001',prescription:'8 reps',durationSeconds:30,rationale:'Set 1',section:'Main work',setNumber:1,totalSets:2},
    {exerciseId:'x001',prescription:'8 reps',durationSeconds:30,rationale:'Set 2',section:'Main work',setNumber:2,totalSets:2},
    {exerciseId:'x002',prescription:'8 reps',durationSeconds:30,rationale:'Finish',section:'Main work',setNumber:2,totalSets:2},
  ]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:false,deadlineAt:null,startedAt,completedExerciseIds:[],actions:[]}
  const onComplete=vi.fn()
  render(<PlayerScreen session={session} state={defaultState} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{upper:12}} onProgress={vi.fn()} onComplete={onComplete} onExit={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button',{name:/Log & continue/}))
  fireEvent.click(screen.getByRole('button',{name:/Skip rest/}))
  fireEvent.click(screen.getByRole('button',{name:'Skip'}))
  fireEvent.click(screen.getByRole('button',{name:/Skip rest/}))
  fireEvent.click(screen.getByRole('button',{name:/Complete session/}))
  const rows=screen.getAllByText(/completed/)
  expect(rows.some(row=>row.textContent?.includes('1/2 completed')&&row.textContent.includes('1 skipped'))).toBe(true)
  fireEvent.click(screen.getAllByText('Record achieved reps, time or load')[0])
  fireEvent.change(screen.getByRole('textbox',{name:/Dumbbell Floor Press achieved reps/}),{target:{value:'9'}})
  fireEvent.change(screen.getByRole('textbox',{name:/Dumbbell Floor Press load$/}),{target:{value:'12.5'}})
  fireEvent.change(screen.getByRole('combobox',{name:/Dumbbell Floor Press load unit/}),{target:{value:'lbs'}})
  fireEvent.click(screen.getByRole('button',{name:/Continue to overall rating/}))
  fireEvent.click(screen.getByRole('button',{name:'Finish without overall rating'}))
  expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({rating:'unrated',completedExerciseIds:['x001','x002'],areaLoadBefore:{upper:12},exercises:expect.arrayContaining([expect.objectContaining({id:'x001',plannedAppearances:2,completedAppearances:1,skippedAppearances:1,performance:{achievedReps:9,load:12.5,loadUnit:'lbs'}})]),actions:expect.arrayContaining([expect.objectContaining({type:'skipped'})]),planStructure:expect.objectContaining({mainExerciseCount:2,totalSets:2})}))
})

it('includes prescription and swap modifications in the submitted session record',()=>{
  const state={...defaultState,profile:{...defaultState.profile,equipment:['none' as const,'dumbbells' as const,'bench' as const]}}
  const plan=createManualWorkout(['x001'],state)
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:30,running:false,deadlineAt:null,startedAt:Date.now()-1000,completedExerciseIds:[],actions:[]}
  const onComplete=vi.fn()
  render(<PlayerScreen session={session} state={state} customExercises={[]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={onComplete} onExit={vi.fn()}/>)
  fireEvent.click(screen.getByRole('button',{name:'Modify exercise'}))
  fireEvent.click(screen.getByRole('button',{name:'Increase reps or time'}))
  fireEvent.click(screen.getByRole('button',{name:'Swap exercise'}))
  expect(screen.getByRole('status')).toHaveTextContent('Exercise swapped')
  fireEvent.click(screen.getByRole('button',{name:'Done'}))
  const firstSide=screen.queryByRole('button',{name:/Log side & continue/})
  if(firstSide)fireEvent.click(firstSide)
  fireEvent.click(screen.getByRole('button',{name:/Complete session/}))
  expect(screen.getAllByText(/swapped/)).toHaveLength(2)
  fireEvent.click(screen.getByRole('button',{name:/Continue to overall rating/}))
  fireEvent.click(screen.getByRole('button',{name:'Finish without overall rating'}))
  const payload=onComplete.mock.calls[0][0]
  expect(payload.actions.map((item:{type:string})=>item.type)).toEqual(expect.arrayContaining(['prescription_up','swapped_out','swapped_in','completed']))
  expect(payload.exercises.filter((item:{swapped?:boolean})=>item.swapped).length).toBeGreaterThanOrEqual(2)
})

it('resolves custom exercise coaching and video content during playback',()=>{
  const custom={id:'u_custom_player',name:'Custom Player Move',description:'Move with control.',category:'upper' as const,pattern:'custom_press',level:2 as const,durationSeconds:20,prescription:'6 reps',equipment:['none' as const],primaryMuscles:['chest' as const],secondaryMuscles:[],unilateral:false,lowImpact:true,goals:['general' as const],contraindications:[],videoUrl:'https://example.com/custom-video',isCustom:true}
  const plan:WorkoutPlan={id:'custom-player',name:'Custom',intention:'train',goal:'general',durationMinutes:1,createdAt:new Date().toISOString(),focusAreas:['chest'],insights:[],exercises:[{exerciseId:custom.id,prescription:'6 reps',durationSeconds:20,rationale:'Custom',section:'Main work'}]}
  const session:ActiveSession={plan,index:0,phase:'work',remainingSeconds:20,running:false,deadlineAt:null,startedAt:Date.now(),completedExerciseIds:[]}
  render(<PlayerScreen session={session} state={{...defaultState,customExercises:[custom]}} customExercises={[custom]} soundEnabled={false} waitBetweenExercises={false} areaLoadBefore={{}} onProgress={vi.fn()} onComplete={vi.fn()} onExit={vi.fn()}/>)
  expect(screen.getByRole('heading',{name:custom.name})).toBeInTheDocument()
  expect(screen.getByText(custom.description)).toBeInTheDocument()
  expect(screen.getByRole('link',{name:'▶ Watch demo'})).toHaveAttribute('href',custom.videoUrl)
})
