import { useEffect, useRef, useState } from 'react'
import { exerciseById, exerciseVideoUrl } from '../data/exercises'
import { adjustPlanPrescription, movementRole, scalePlanExercise, swapPlanExercise } from '../domain/engine'
import type { ActiveSession, AppState, Category, Exercise, ExerciseFeedback, ExercisePerformance, Goal, LearningContext, MuscleArea, SessionExercise, WorkoutAction, WorkoutActionType, WorkoutExercise, WorkoutSession } from '../domain/types'

const GET_READY_SECONDS=5
const formatTime=(seconds:number)=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`
const isBilateral=(item:WorkoutExercise)=>/side|each|leg|arm/i.test(item.prescription)
const workSeconds=(item:WorkoutExercise,phase:ActiveSession['phase'])=>phase==='switch_sides'||isBilateral(item)?Math.max(1,Math.round(item.durationSeconds/2)):item.durationSeconds
export const restSecondsForGoal=(goal:Goal)=>({strength:30,muscle:20,general:15,endurance:10,mobility:10})[goal]
type IssueDraft={area:MuscleArea;severity:'mild'|'moderate'|'flare';side:'left'|'right'|'bilateral'}

export function PlayerScreen({ session, state, customExercises, soundEnabled, waitBetweenExercises, areaLoadBefore, onProgress, onComplete, onCreateIssue,onExit }: { session: ActiveSession; state:AppState; customExercises: Exercise[]; soundEnabled: boolean; waitBetweenExercises:boolean; areaLoadBefore: Partial<Record<Category,number>>; onProgress: (session: ActiveSession) => void; onComplete: (session: WorkoutSession) => void;onCreateIssue?:(area:MuscleArea,severity:'mild'|'moderate'|'flare',side:'left'|'right'|'bilateral',note:string)=>void; onExit: () => void }) {
  const [plan,setPlan]=useState(session.plan)
  const [index,setIndex]=useState(session.index)
  const [phase,setPhase]=useState<ActiveSession['phase']>(session.phase??'work')
  const initialRemaining=session.running&&session.deadlineAt?Math.max(0,Math.ceil((session.deadlineAt-Date.now())/1000)):session.remainingSeconds
  const [remaining,setRemaining]=useState(initialRemaining)
  const [running,setRunning]=useState(session.running)
  const [completed,setCompleted]=useState<string[]>(session.completedExerciseIds)
  const [actions,setActions]=useState<WorkoutAction[]>(session.actions??[])
  const [finished,setFinished]=useState(false)
  const [ratingStage,setRatingStage]=useState(false)
  const [feedback,setFeedback]=useState<Record<string,ExerciseFeedback|undefined>>({})
  const [performance,setPerformance]=useState<Record<string,ExercisePerformance>>({})
  const [issueDrafts,setIssueDrafts]=useState<Record<string,IssueDraft>>({})
  const [createdIssueIds,setCreatedIssueIds]=useState<string[]>([])
  const deadline=useRef(session.running&&session.deadlineAt?session.deadlineAt:Date.now()+initialRemaining*1000)
  const current=plan.exercises[index]
  const exercise=current?exerciseById.get(current.exerciseId)??customExercises.find(item=>item.id===current.exerciseId):undefined
  const nextItem=plan.exercises[index+1]
  const nextExercise=nextItem?exerciseById.get(nextItem.exerciseId)??customExercises.find(item=>item.id===nextItem.exerciseId):undefined
  const restDuration=restSecondsForGoal(plan.goal)
  const contextFor=(item:WorkoutExercise,resolved?:Exercise):LearningContext=>({key:`${plan.goal}|${plan.intention}|${item.section}|${item.slotKey??movementRole(resolved!) }|${plan.focusAreas[0]??'full_body'}`,goal:plan.goal,intention:plan.intention,section:item.section,role:resolved?movementRole(resolved):undefined,focusArea:plan.focusAreas[0]})
  const recordAction=(type:WorkoutActionType,item:WorkoutExercise=current,resolved:Exercise|undefined=exercise,replacementExerciseId?:string)=>{
    if(!item||!resolved)return
    const next:WorkoutAction={id:`action_${Date.now()}_${type}_${index}`,type,exerciseId:resolved.id,replacementExerciseId,occurrenceIndex:index,at:new Date().toISOString(),context:contextFor(item,resolved)}
    setActions(items=>[...items,next])
  }

  const startPhase=(nextPhase:ActiveSession['phase'],seconds:number,shouldRun=true)=>{
    setPhase(nextPhase)
    setRemaining(seconds)
    setRunning(shouldRun)
    deadline.current=shouldRun?Date.now()+seconds*1000:0
  }

  const finishExercise=(log:boolean,bypassWait=false)=>{
    if(log&&current){setCompleted(items=>[...items,current.exerciseId]);recordAction('completed')}
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
    onProgress({plan,index,phase,remainingSeconds:remaining,running,deadlineAt:running?deadline.current:null,startedAt:session.startedAt,completedExerciseIds:completed,actions})
  },[actions,completed,finished,index,onProgress,phase,plan,remaining,running,session.startedAt])

  useEffect(()=>{
    const isExerciseCountdown=phase==='work'||phase==='switch_sides'
    const isFinalExerciseCountdown=remaining>=1&&remaining<=5&&isExerciseCountdown
    if((remaining!==0&&!isFinalExerciseCountdown)||!running||!soundEnabled)return
    try{
      const AudioContextClass=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext
      if(!AudioContextClass)return
      const context=new AudioContextClass();const oscillator=context.createOscillator();const gain=context.createGain()
      oscillator.frequency.value=remaining===0?880:660;gain.gain.value=.08;oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+(remaining===0?.18:.1))
    }catch{/* Audio may be blocked until interaction. */}
  },[phase,remaining,running,soundEnabled])

  const pause=()=>{
    if(running){setRemaining(Math.max(0,Math.ceil((deadline.current-Date.now())/1000)));setRunning(false)}
    else{deadline.current=Date.now()+remaining*1000;setRunning(true)}
  }
  const logAndContinue=()=>completeWorkPhase(true)
  const skip=()=>{
    if(phase==='rest'){startNextExercise();return}
    recordAction('skipped')
    if(index>=plan.exercises.length-1){setRunning(false);setFinished(true);return}
    startPhase('rest',restDuration,true)
  }
  const reviewRows=()=>{
    const ids=[...new Set([...session.plan.exercises.map(item=>item.exerciseId),...plan.exercises.map(item=>item.exerciseId),...actions.flatMap(action=>[action.exerciseId,action.replacementExerciseId].filter((id):id is string=>Boolean(id)))])]
    return ids.map(id=>{
      const entries=plan.exercises.filter(item=>item.exerciseId===id);const original=session.plan.exercises.filter(item=>item.exerciseId===id);const resolved=exerciseById.get(id)??customExercises.find(item=>item.id===id);const completedAppearances=completed.filter(item=>item===id).length;const skippedAppearances=actions.filter(action=>action.exerciseId===id&&action.type==='skipped').length
      return{id,name:resolved?.name??id,prescription:(entries[0]??original[0])?.prescription??'',durationSeconds:(entries[0]??original[0])?.durationSeconds??0,plannedAppearances:Math.max(entries.length,original.length),completedAppearances,skippedAppearances,adjusted:[...entries,...original].some(item=>item.adjusted||item.scaled),swapped:actions.some(action=>action.exerciseId===id&&(action.type==='swapped_out'||action.type==='swapped_in')),feedback:feedback[id],performance:performance[id],role:resolved?movementRole(resolved):undefined,section:(entries[0]??original[0])?.section} satisfies SessionExercise
    })
  }
  const issueOptions=(id:string)=>{const resolved=exerciseById.get(id)??customExercises.find(item=>item.id===id);return[...new Set([...(resolved?.primaryMuscles??[]),...(resolved?.secondaryMuscles??[])].filter(area=>area!=='mind'))] as MuscleArea[]}
  const toggleFeedback=(id:string,value:ExerciseFeedback)=>{
    const selected=feedback[id]===value?undefined:value
    setFeedback(values=>({...values,[id]:selected}))
    if(selected==='discomfort'&&!issueDrafts[id])setIssueDrafts(values=>({...values,[id]:{area:issueOptions(id)[0]??'full_body',severity:'mild',side:'bilateral'}}))
  }
  const updateIssueDraft=(id:string,update:Partial<IssueDraft>)=>setIssueDrafts(values=>({...values,[id]:{...(values[id]??{area:issueOptions(id)[0]??'full_body',severity:'mild',side:'bilateral'}),...update}}))
  const finish=(rating:WorkoutSession['rating'])=>onComplete({
    id:`session_${Date.now()}`,planName:plan.name,date:new Date().toISOString(),durationSeconds:Math.max(1,Math.round((Date.now()-session.startedAt)/1000)),intention:plan.intention,goal:plan.goal,rating,
    completedExerciseIds:completed,exercises:reviewRows(),focus:plan.focusAreas,areaLoadBefore,actions,balanceReport:plan.balanceReport,
  })
  const exitButton=<button className="bottom-back player-exit" onClick={()=>confirm('End this session without saving?')&&onExit()}>← End session</button>

  if(finished&&!ratingStage)return <div className="player-screen workout-review">
    <span className="eyebrow">SESSION REVIEW</span><h1>How did each movement fit?</h1><p>Optional feedback helps tune future sessions. Repeated sets are grouped together.</p>
    <div className="review-list">{reviewRows().map(row=>{
      const draft=issueDrafts[row.id]??{area:issueOptions(row.id)[0]??'full_body',severity:'mild' as const,side:'bilateral' as const}
      return <section className="review-row" key={row.id}>
        <header><div><strong>{row.name}</strong><small>{row.prescription} · {row.completedAppearances}/{row.plannedAppearances} completed{row.skippedAppearances?` · ${row.skippedAppearances} skipped`:''}{row.swapped?' · swapped':''}{row.adjusted?' · adjusted':''}</small></div></header>
        <div className="feedback-chips">{([['good_fit','Good fit'],['too_easy','Too easy'],['too_hard','Too hard'],['discomfort','Discomfort'],['didnt_enjoy',"Didn't enjoy"]] as const).map(([value,label])=><button className={feedback[row.id]===value?'selected':''} key={value} onClick={()=>toggleFeedback(row.id,value)}>{label}</button>)}</div>
        {feedback[row.id]==='discomfort'&&onCreateIssue&&<div className="discomfort-offer"><strong>Would you like to record an issue?</strong><small>This does not diagnose an injury. It only adjusts future workouts around the area you choose.</small><div><select aria-label={`${row.name} discomfort area`} value={draft.area} onChange={event=>updateIssueDraft(row.id,{area:event.target.value as MuscleArea})}>{issueOptions(row.id).map(area=><option key={area} value={area}>{area.replaceAll('_',' ')}</option>)}</select><select aria-label={`${row.name} issue severity`} value={draft.severity} onChange={event=>updateIssueDraft(row.id,{severity:event.target.value as IssueDraft['severity']})}><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="flare">Flare-up</option></select><select aria-label={`${row.name} issue side`} value={draft.side} onChange={event=>updateIssueDraft(row.id,{side:event.target.value as IssueDraft['side']})}><option value="bilateral">Both / centre</option><option value="left">Left</option><option value="right">Right</option></select></div><button className="secondary" disabled={createdIssueIds.includes(row.id)} onClick={()=>{onCreateIssue(draft.area,draft.severity,draft.side,`Reported after ${row.name}; discomfort selected in workout review.`);setCreatedIssueIds(ids=>[...ids,row.id])}}>{createdIssueIds.includes(row.id)?'Issue added':'Add issue'}</button></div>}
        <details><summary>Record achieved reps, time or load</summary><div className="performance-inputs"><input aria-label={`${row.name} achieved reps`} inputMode="numeric" placeholder="Reps" onChange={event=>setPerformance(values=>({...values,[row.id]:{...values[row.id],achievedReps:Number(event.target.value)||undefined}}))}/><input aria-label={`${row.name} achieved seconds`} inputMode="numeric" placeholder="Seconds" onChange={event=>setPerformance(values=>({...values,[row.id]:{...values[row.id],achievedSeconds:Number(event.target.value)||undefined}}))}/><input aria-label={`${row.name} load`} inputMode="decimal" placeholder="Load" onChange={event=>setPerformance(values=>({...values,[row.id]:{...values[row.id],load:Number(event.target.value)||undefined}}))}/><select aria-label={`${row.name} load unit`} onChange={event=>setPerformance(values=>({...values,[row.id]:{...values[row.id],loadUnit:event.target.value as 'kg'|'lbs'}}))}><option value="kg">kg</option><option value="lbs">lbs</option></select></div></details>
      </section>
    })}</div><button className="primary review-continue" onClick={()=>setRatingStage(true)}>Continue to overall rating <span>→</span></button>
  </div>
  if(finished&&ratingStage)return <div className="player-screen finish-screen"><span className="finish-symbol">✓</span><span className="eyebrow">SESSION COMPLETE</span><h1>{completed.length} of {plan.exercises.length} movements</h1><p>How did today’s session feel overall?</p><div className="rating-grid">{(['easy','good','hard','brutal'] as const).map(rating=><button key={rating} onClick={()=>finish(rating)}><span>{rating==='easy'?'○':rating==='good'?'●':rating==='hard'?'▲':'◆'}</span>{rating}</button>)}</div><button className="text-button" onClick={()=>finish('unrated')}>Finish without overall rating</button></div>
  if(!current||!exercise)return null

  if(phase==='get_ready')return <div className="player-screen player-phase-screen"><section className="player-phase-card"><span className="phase-symbol">⏳</span><span className="eyebrow">GET READY</span><h1>Workout begins in</h1><div className="timer">{remaining}</div><p>First up: <strong>{exercise.name}</strong></p></section>{exitButton}</div>

  if(phase==='waiting')return <div className="player-screen player-phase-screen"><section className="player-phase-card"><span className="phase-symbol">✓</span><span className="eyebrow">MOVEMENT COMPLETE</span><h1>Nice work</h1><p>Take your time. Log the movement when you’re ready to continue.</p><div className="player-next-card"><small>UP NEXT</small><strong>{nextExercise?`${restDuration} sec rest, then ${nextExercise.name}`:'Session complete'}</strong></div></section><div className="player-actions"><button className="primary" onClick={()=>startPhase('rest',restDuration,true)}>Log &amp; continue <span>→</span></button>{exitButton}</div></div>

  const progress=((index+1)/plan.exercises.length)*100
  if(phase==='rest')return <div className="player-screen"><div className="player-top"><span>REST</span><strong>{index+1} / {plan.exercises.length}</strong></div><div className="player-progress"><i style={{width:`${progress}%`}}/></div><section className="player-centre rest-phase"><span className="eyebrow">REST BLOCK</span><h1>Recover</h1><div className="timer">{formatTime(remaining)}</div><div className="player-next-card"><small>STARTS AUTOMATICALLY</small><strong>{nextExercise?.name??'Session complete'}</strong></div></section><div className="player-actions"><button className="primary" onClick={skip}>Skip rest <span>→</span></button><div><button className="secondary" onClick={pause}>{running?'Pause rest':'Resume rest'}</button></div>{exitButton}</div></div>

  const changePlan=(next:typeof plan)=>{setPlan(next);const changed=next.exercises[index];const seconds=workSeconds(changed,phase);setRemaining(seconds);deadline.current=Date.now()+seconds*1000}
  const changeDifficulty=(direction:-1|1)=>{const next=scalePlanExercise(plan,index,direction,state);if(next!==plan)recordAction(direction<0?'easier':'harder');changePlan(next)}
  const changePrescription=(direction:-1|1)=>{recordAction(direction<0?'prescription_down':'prescription_up');changePlan(adjustPlanPrescription(plan,index,direction))}
  const swap=()=>{const original=current;const originalExercise=exercise;const next=swapPlanExercise(plan,index,state);const replacement=next.exercises[index];if(next!==plan&&replacement.exerciseId!==original.exerciseId){recordAction('swapped_out',original,originalExercise,replacement.exerciseId);const resolved=exerciseById.get(replacement.exerciseId)??customExercises.find(item=>item.id===replacement.exerciseId);recordAction('swapped_in',replacement,resolved,original.exerciseId)}changePlan(next)}
  return <div className="player-screen"><div className="player-top"><span>{current.section}{current.setNumber?` · Set ${current.setNumber}/${current.totalSets}`:''}</span><strong>{index+1} / {plan.exercises.length}</strong></div><div className="player-progress"><i style={{width:`${progress}%`}}/></div><section className={`player-centre ${current.scaled==='down'?'easier-adjusted':current.scaled==='up'?'harder-adjusted':''}`}><span className="eyebrow">{phase==='switch_sides'?'SIDE 2':current.scaled==='down'?'EASIER ADJUSTED':current.scaled==='up'?'HARDER ADJUSTED':current.adjusted?'RECOVERY ADJUSTED':current.section.toUpperCase()}</span><h1>{exercise.name}{phase==='switch_sides'?' · Side 2':''}</h1><p>{exercise.description}</p><a className="player-video-link" href={exerciseVideoUrl(exercise)} target="_blank" rel="noopener noreferrer">▶ Watch video</a><div className={remaining===0?'timer complete':'timer'}>{formatTime(remaining)}</div><strong className="player-prescription">{current.prescription}</strong><small>{current.rationale}</small><div className="player-adjustments"><button onClick={()=>changeDifficulty(-1)}>Easier</button><button onClick={()=>changeDifficulty(1)}>Harder</button><button onClick={()=>changePrescription(-1)}>− reps/time</button><button onClick={()=>changePrescription(1)}>+ reps/time</button><button onClick={swap}>Swap</button></div></section><div className="player-actions"><button className="primary" onClick={logAndContinue}>{phase==='work'&&isBilateral(current)?'Log side & continue':index===plan.exercises.length-1?'Complete session':'Log & continue'} <span>→</span></button><div><button className="secondary" onClick={pause}>{running?'Pause':'Resume'}</button><button className="secondary" onClick={skip}>Skip</button></div>{exitButton}</div></div>
}
