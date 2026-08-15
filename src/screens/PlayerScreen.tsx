import { useEffect, useRef, useState } from 'react'
import { exerciseById, exerciseVideoUrl } from '../data/exercises'
import { adjustPlanPrescription, scalePlanExercise, swapPlanExercise } from '../domain/engine'
import type { ActiveSession, AppState, Category, Exercise, WorkoutSession } from '../domain/types'

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,'0')}`

export function PlayerScreen({ session, state, customExercises, soundEnabled, waitBetweenExercises, areaLoadBefore, onProgress, onComplete, onExit }: { session: ActiveSession; state:AppState; customExercises: Exercise[]; soundEnabled: boolean; waitBetweenExercises:boolean; areaLoadBefore: Partial<Record<Category,number>>; onProgress: (session: ActiveSession) => void; onComplete: (session: WorkoutSession) => void; onExit: () => void }) {
  const [plan,setPlan]=useState(session.plan)
  const [index, setIndex] = useState(session.index)
  const initialRemaining = session.running && session.deadlineAt ? Math.max(0, Math.ceil((session.deadlineAt-Date.now())/1000)) : session.remainingSeconds
  const [remaining, setRemaining] = useState(initialRemaining)
  const [running, setRunning] = useState(session.running)
  const [completed, setCompleted] = useState<string[]>(session.completedExerciseIds)
  const [finished, setFinished] = useState(false)
  const deadline = useRef(session.running && session.deadlineAt ? session.deadlineAt : Date.now() + initialRemaining * 1000)
  const current = plan.exercises[index]
  const exercise = current ? exerciseById.get(current.exerciseId) ?? customExercises.find(item => item.id === current.exerciseId) : undefined

  useEffect(() => {
    if (!running || finished) return
    const timer = window.setInterval(() => setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))), 250)
    return () => window.clearInterval(timer)
  }, [running, finished, index])

  useEffect(() => {
    if (finished) return
    onProgress({ plan, index, remainingSeconds:remaining, running, deadlineAt:running ? deadline.current : null, startedAt:session.startedAt, completedExerciseIds:completed })
  }, [completed, finished, index, onProgress, plan, remaining, running, session.startedAt])

  useEffect(() => {
    if (remaining !== 0 || !running || !soundEnabled) return
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      const context = new AudioContextClass(); const oscillator = context.createOscillator(); const gain = context.createGain()
      oscillator.frequency.value = 660; gain.gain.value = 0.08; oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.12)
    } catch { /* Audio is an enhancement and may be blocked until interaction. */ }
  }, [remaining, running, soundEnabled])

  const pause = () => {
    if (running) { setRemaining(Math.max(0, Math.ceil((deadline.current-Date.now())/1000))); setRunning(false) }
    else { deadline.current = Date.now() + remaining * 1000; setRunning(true) }
  }
  const advance = (log: boolean) => {
    const nextCompleted = log && current ? [...completed, current.exerciseId] : completed
    setCompleted(nextCompleted)
    if (index >= plan.exercises.length - 1) { setRunning(false); setFinished(true); return }
    const next = index + 1; const duration = plan.exercises[next].durationSeconds
    setIndex(next); setRemaining(duration); deadline.current = Date.now() + duration * 1000; setRunning(!waitBetweenExercises)
  }
  const finish = (rating: WorkoutSession['rating']) => onComplete({
    id: `session_${Date.now()}`, planName: plan.name, date: new Date().toISOString(), durationSeconds: Math.max(1, Math.round((Date.now()-session.startedAt)/1000)), intention: plan.intention, goal: plan.goal, rating,
    completedExerciseIds: completed, exercises: completed.map(id => { const item = plan.exercises.find(entry => entry.exerciseId === id); const resolved = exerciseById.get(id) ?? customExercises.find(entry => entry.id === id); return { id, name: resolved?.name ?? id, prescription: item?.prescription ?? '', durationSeconds: item?.durationSeconds ?? 0 } }), focus:plan.focusAreas, areaLoadBefore,
  })
  if (finished) return <div className="player-screen finish-screen"><span className="finish-symbol">✓</span><span className="eyebrow">SESSION COMPLETE</span><h1>{completed.length} of {plan.exercises.length} movements</h1><p>How did today’s session feel?</p><div className="rating-grid">{(['easy','good','hard','brutal'] as const).map(rating => <button key={rating} onClick={() => finish(rating)}><span>{rating === 'easy' ? '○' : rating === 'good' ? '●' : rating === 'hard' ? '▲' : '◆'}</span>{rating}</button>)}</div><button className="text-button" onClick={() => finish('unrated')}>Skip feedback</button></div>
  if (!current || !exercise) return null
  const progress = ((index + 1) / plan.exercises.length) * 100
  const changePlan=(next:typeof plan)=>{setPlan(next);const changed=next.exercises[index];setRemaining(changed.durationSeconds);deadline.current=Date.now()+changed.durationSeconds*1000}
  return <div className="player-screen"><div className="player-top"><span>{current.section}{current.setNumber?` · Set ${current.setNumber}/${current.totalSets}`:''}</span><strong>{index + 1} / {plan.exercises.length}</strong></div><div className="player-progress"><i style={{ width: `${progress}%` }}/></div><section className="player-centre"><span className="eyebrow">{current.adjusted?'RECOVERY ADJUSTED':current.section.toUpperCase()}</span><h1>{exercise.name}</h1><p>{exercise.description}</p><a className="player-video-link" href={exerciseVideoUrl(exercise)} target="_blank" rel="noopener noreferrer">▶ Watch video</a><div className={remaining === 0 ? 'timer complete' : 'timer'}>{formatTime(remaining)}</div><strong className="player-prescription">{current.prescription}</strong><small>{current.rationale}</small><div className="player-adjustments"><button onClick={()=>changePlan(scalePlanExercise(plan,index,-1,state))}>Easier</button><button onClick={()=>changePlan(scalePlanExercise(plan,index,1,state))}>Harder</button><button onClick={()=>changePlan(adjustPlanPrescription(plan,index,-1))}>− reps/time</button><button onClick={()=>changePlan(adjustPlanPrescription(plan,index,1))}>+ reps/time</button><button onClick={()=>changePlan(swapPlanExercise(plan,index,state))}>Swap</button></div></section><div className="player-actions"><button className="primary" onClick={() => advance(true)}>{index === plan.exercises.length - 1 ? 'Complete session' : 'Log & continue'} <span>→</span></button><div><button className="secondary" onClick={pause}>{running ? 'Pause' : 'Resume'}</button><button className="secondary" onClick={() => advance(false)}>Skip</button></div><button className="bottom-back player-exit" onClick={() => confirm('End this session without saving?') && onExit()}>← End session</button></div></div>
}
