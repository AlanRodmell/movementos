import { exerciseById } from '../data/exercises'
import type { Exercise, WorkoutPlan } from '../domain/types'
import { ExerciseCard } from '../components/ExerciseCard'

export function PlanScreen({ plan, customExercises, onStart, onSave, onRegenerate, onEasier, onHarder, onAdjust, onSwap, onRemove, onAvoid }: { plan: WorkoutPlan; customExercises: Exercise[]; onStart: () => void; onSave: () => void; onRegenerate: () => void; onEasier:(index:number)=>void; onHarder:(index:number)=>void; onAdjust:(index:number,direction:-1|1)=>void; onSwap:(index:number)=>void; onRemove:(index:number)=>void; onAvoid:(index:number,id:string)=>void }) {
  const resolve = (id: string) => exerciseById.get(id) ?? customExercises.find(exercise => exercise.id === id)
  const sections = [...new Set(plan.exercises.map(item => item.section))]
  return <div className="screen plan-screen">
    <section className="plan-hero"><span className="eyebrow">YOUR SESSION</span><h1>{plan.name}</h1><div className="plan-meta"><span>{plan.durationMinutes} min</span><span>{plan.exercises.length} movements</span><span>{plan.goal}</span></div></section>
    <section className="algorithm-note"><span>✦</span><div><strong>Built around you</strong><p>{plan.insights.join(' ')}</p></div></section>
    {sections.map(section => <section key={section} className="plan-section"><div className="section-heading"><h2>{section}</h2><span>{plan.exercises.filter(item => item.section === section).length}</span></div>{plan.exercises.map((item,index) => { if(item.section!==section)return null;const exercise = resolve(item.exerciseId); return exercise ? <div className="plan-exercise" key={`${item.exerciseId}_${index}`}><ExerciseCard exercise={exercise} planned={item}/><div className="exercise-adjustments" aria-label={`Adjust ${exercise.name}`}><button onClick={()=>onEasier(index)}>Easier</button><button onClick={()=>onHarder(index)}>Harder</button><button onClick={()=>onAdjust(index,-1)}>− reps/time</button><button onClick={()=>onAdjust(index,1)}>+ reps/time</button><button onClick={()=>onSwap(index)}>Swap</button><button className="danger-text" onClick={()=>onRemove(index)}>Remove</button><button className="danger-text" onClick={()=>onAvoid(index,item.exerciseId)}>Avoid future</button></div></div> : null })}</section>)}
    <div className="sticky-actions"><button className="primary" onClick={onStart}>Start session <span>→</span></button><div><button className="secondary" onClick={onRegenerate}>Regenerate</button><button className="secondary" onClick={onSave}>Save</button></div></div>
  </div>
}
