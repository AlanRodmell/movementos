import { useEffect, useRef, useState } from 'react'
import { exerciseById, exerciseVideoUrl } from '../data/exercises'
import { adjustPlanPrescription, scalePlanExercise, swapPlanExercise } from '../domain/engine'
import type { ActiveSession, AppState, Category, Exercise, Goal, WorkoutExercise, WorkoutSession } from '../domain/types'

const GET_READY_SECONDS=5
const formatTime=(seconds:number)=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`
const isBilateral=(item:WorkoutExercise)=>/side|each|leg|arm/i.test(item.prescription)
const workSeconds=(item:WorkoutExercise,phase:ActiveSession['phase'])=>phase==='switch_sides'||isBilateral(item)?Math.max(1,Math.round(item.durationSeconds/2)):item.durationSeconds
export const restSecondsForGoal=(goal:Goal)=>({strength:30,muscle:20,general:15,endurance:10,mobility:10})[goal]

export function PlayerScreen({ session, state, customExercises, soundEnabled, waitBetweenExercises, areaLoadBefore, onProgress, onComplete, onExit }: { session: ActiveSession; state:AppState; customExercises: Exercise[]; soundEnabled: boolean; waitBetweenExercises:boolean; areaLoadBefore: Partial<Record<Category,number>>; onProgress: (session: ActiveSession) => void; onComplete: (session: WorkoutSession) => void; onExit: () => void }) {
  const [plan,setPlan]=useState(session.plan)
  const [index,setIndex]=useState(session.index)
  const [phase,setPhase]=useState<ActiveSession['phase']>(session.phase??'work')
  const initialRemaining=session.running&&session.deadlineAt?Math.max(0,Math.ceil((session.deadlineAt-Date.now())/1000)):session.remainingSeconds
  const [remaining,setRemaining]=useState(initialRemaining)
  const [running,setRunning]=useState(session.running)
  const [completed,setCompleted]=useState<string[]>(session.completedExerciseIds)
  const [finished,setFinished]=useState(false)
  const deadline=useRef(session.running&&session.deadlineAt?session.deadlineAt:Date.now()+initialRemaining*1000)
  const current=plan.exercises[index]
  const exercise=current?exerciseById.get(current.exerciseId)??customExercises.find(item=>item.id===current.exerciseId):undefined
  const nextItem=plan.exercises[index+1]
  const nextExercise=nextItem?exerciseById.get(nextItem.exerciseId)??customExercises.find(item=>item.id===nextItem.exerciseId):undefined
  const restDuration=restSecondsForGoal(plan.goal)

  const startPhase=(nextPhase:ActiveSession['phase'],seconds:number,shouldRun=true)=>{
    setPhase(nextPhase)
    setRemaining(seconds)
    setRunning(shouldRun)
    deadline.current=shouldRun?Date.now()+seconds*1000:0
  }

  const finishExercise=(log:boolean,bypassWait=false)=>{
    if(log&&current)setCompleted(items=>[...items,current.exerciseId])
    if(index>=plan.exercises.length-1){setRunning(false);setFinished(true);return}
    if(waitBetweenExercises&&!bypassWait)startPhase('waiting',0,false)
    else startPhase('rest',restDuration,true)
  }

  const completeWorkPhase=(bypassWait=false)=>{
    if(phase==='work'&&current&&isBilateral(current)){startPhase('switch_sides',workSeconds(current,'switch_sides'),true);return}
    finishExercise(true,bypassWait)
  }

  const startNextExercise=()=>{
    const next=index+1
    const item=plan.exercises[next]
    if(!item){setRunning(false);setFinished(true);return}
    setIndex(next)
    startPhase('work',workSeconds(item,'work'),true)
  }

  const onPhaseComplete=()=>{
    if(phase==='get_ready'&&current){startPhase('work',workSeconds(current,'work'),true);return}
    if(phase==='work'||phase==='switch_sides'){completeWorkPhase();return}
    if(phase==='rest')startNextExercise()
  }

  useEffect(()=>{
    if(!running||finished)return
    const timer=window.setInterval(()=>setRemaining(Math.max(0,Math.ceil((deadline.current-Date.now())/1000))),250)
    return()=>window.clearInterval(timer)
  },[finished,index,phase,running])

  useEffect(()=>{
    if(remaining===0&&running&&!finished)onPhaseComplete()
  },[finished,remaining,running])

  useEffect(()=>{
    if(finished)return
    onProgress({plan,index,phase,remainingSeconds:remaining,running,deadlineAt:running?deadline.current:null,startedAt:session.startedAt,completedExerciseIds:completed})
  },[completed,finished,index,onProgress,phase,plan,remaining,running,session.startedAt])

  useEffect(()=>{
    if(remaining!==0||!running||!soundEnabled)return
    try{
      const AudioContextClass=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext
      if(!AudioContextClass)return
      const context=new AudioContextClass();const oscillator=context.createOscillator();const gain=context.createGain()
      oscillator.frequency.value=660;gain.gain.value=.08;oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.12)
    }catch{/* Audio may be blocked until interaction. */}
  },[remaining,running,soundEnabled])

  const pause=()=>{
    if(running){setRemaining(Math.max(0,Math.ceil((deadline.current-Date.now())/1000)));setRunning(false)}
    else{deadline.current=Date.now()+remaining*1000;setRunning(true)}
  }
  const logAndContinue=()=>completeWorkPhase(true)
  const skip=()=>{
    if(phase==='rest'){startNextExercise();return}
    if(index>=plan.exercises.length-1){setRunning(false);setFinished(true);return}
    startPhase('rest',restDuration,true)
  }
  const finish=(rating:WorkoutSession['rating'])=>onComplete({
    id:`session_${Date.now()}`,planName:plan.name,date:new Date().toISOString(),durationSeconds:Math.max(1,Math.round((Date.now()-session.startedAt)/1000)),intention:plan.intention,goal:plan.goal,rating,
    completedExerciseIds:completed,exercises:completed.map(id=>{const item=plan.exercises.find(entry=>entry.exerciseId===id);const resolved=exerciseById.get(id)??customExercises.find(entry=>entry.id===id);return{id,name:resolved?.name??id,prescription:item?.prescription??'',durationSeconds:item?.durationSeconds??0}}),focus:plan.focusAreas,areaLoadBefore,
  })
  const exitButton=<button className="bottom-back player-exit" onClick={()=>confirm('End this session without saving?')&&onExit()}>← End session</button>

  if(finished)return <div className="player-screen finish-screen"><span className="finish-symbol">✓</span><span className="eyebrow">SESSION COMPLETE</span><h1>{completed.length} of {plan.exercises.length} movements</h1><p>How did today’s session feel?</p><div className="rating-grid">{(['easy','good','hard','brutal'] as const).map(rating=><button key={rating} onClick={()=>finish(rating)}><span>{rating==='easy'?'○':rating==='good'?'●':rating==='hard'?'▲':'◆'}</span>{rating}</button>)}</div><button className="text-button" onClick={()=>finish('unrated')}>Skip feedback</button></div>
  if(!current||!exercise)return null

  if(phase==='get_ready')return <div className="player-screen player-phase-screen"><section className="player-phase-card"><span className="phase-symbol">⏳</span><span className="eyebrow">GET READY</span><h1>Workout begins in</h1><div className="timer">{remaining}</div><p>First up: <strong>{exercise.name}</strong></p></section>{exitButton}</div>

  if(phase==='waiting')return <div className="player-screen player-phase-screen"><section className="player-phase-card"><span className="phase-symbol">✓</span><span className="eyebrow">MOVEMENT COMPLETE</span><h1>Nice work</h1><p>Take your time. Log the movement when you’re ready to continue.</p><div className="player-next-card"><small>UP NEXT</small><strong>{nextExercise?`${restDuration} sec rest, then ${nextExercise.name}`:'Session complete'}</strong></div></section><div className="player-actions"><button className="primary" onClick={()=>startPhase('rest',restDuration,true)}>Log &amp; continue <span>→</span></button>{exitButton}</div></div>

  const progress=((index+1)/plan.exercises.length)*100
  if(phase==='rest')return <div className="player-screen"><div className="player-top"><span>REST</span><strong>{index+1} / {plan.exercises.length}</strong></div><div className="player-progress"><i style={{width:`${progress}%`}}/></div><section className="player-centre rest-phase"><span className="eyebrow">REST BLOCK</span><h1>Recover</h1><div className="timer">{formatTime(remaining)}</div><div className="player-next-card"><small>STARTS AUTOMATICALLY</small><strong>{nextExercise?.name??'Session complete'}</strong></div></section><div className="player-actions"><button className="primary" onClick={skip}>Skip rest <span>→</span></button><div><button className="secondary" onClick={pause}>{running?'Pause rest':'Resume rest'}</button></div>{exitButton}</div></div>

  const changePlan=(next:typeof plan)=>{setPlan(next);const changed=next.exercises[index];const seconds=workSeconds(changed,phase);setRemaining(seconds);deadline.current=Date.now()+seconds*1000}
  return <div className="player-screen"><div className="player-top"><span>{current.section}{current.setNumber?` · Set ${current.setNumber}/${current.totalSets}`:''}</span><strong>{index+1} / {plan.exercises.length}</strong></div><div className="player-progress"><i style={{width:`${progress}%`}}/></div><section className={`player-centre ${current.scaled==='down'?'easier-adjusted':current.scaled==='up'?'harder-adjusted':''}`}><span className="eyebrow">{phase==='switch_sides'?'SIDE 2':current.scaled==='down'?'EASIER ADJUSTED':current.scaled==='up'?'HARDER ADJUSTED':current.adjusted?'RECOVERY ADJUSTED':current.section.toUpperCase()}</span><h1>{exercise.name}{phase==='switch_sides'?' · Side 2':''}</h1><p>{exercise.description}</p><a className="player-video-link" href={exerciseVideoUrl(exercise)} target="_blank" rel="noopener noreferrer">▶ Watch video</a><div className={remaining===0?'timer complete':'timer'}>{formatTime(remaining)}</div><strong className="player-prescription">{current.prescription}</strong><small>{current.rationale}</small><div className="player-adjustments"><button onClick={()=>changePlan(scalePlanExercise(plan,index,-1,state))}>Easier</button><button onClick={()=>changePlan(scalePlanExercise(plan,index,1,state))}>Harder</button><button onClick={()=>changePlan(adjustPlanPrescription(plan,index,-1))}>− reps/time</button><button onClick={()=>changePlan(adjustPlanPrescription(plan,index,1))}>+ reps/time</button><button onClick={()=>changePlan(swapPlanExercise(plan,index,state))}>Swap</button></div></section><div className="player-actions"><button className="primary" onClick={logAndContinue}>{phase==='work'&&isBilateral(current)?'Log side & continue':index===plan.exercises.length-1?'Complete session':'Log & continue'} <span>→</span></button><div><button className="secondary" onClick={pause}>{running?'Pause':'Resume'}</button><button className="secondary" onClick={skip}>Skip</button></div>{exitButton}</div></div>
}
