import type { WorkoutPlan } from '../domain/types'

export function SavedPlansScreen({plans,onOpen,onDelete,onBuild}:{plans:WorkoutPlan[];onOpen:(index:number)=>void;onDelete:(id:string)=>void;onBuild:()=>void}) {
  return <div className="screen saved-screen">
    <section className="page-intro"><span className="eyebrow">YOUR LIBRARY</span><h1>Saved workouts</h1><p>Open any saved workout to review, adjust, or start it again.</p></section>
    {plans.length===0?<section className="panel saved-empty"><span>▣</span><h2>No saved workouts yet</h2><p>Build or generate a workout, review it, then tap Save workout.</p><button className="primary" onClick={onBuild}>Build a workout →</button></section>:<section className="saved-workout-list">{plans.map((plan,index)=><article className="saved-workout-card" key={plan.id}>
      <div><span className="eyebrow">{plan.intention==='recover'?'RECOVERY':'TRAINING'}</span><h2>{plan.name}</h2><p>{plan.exercises.length} movements · {plan.durationMinutes} min · {plan.goal}</p></div>
      <div className="saved-workout-actions"><button className="primary" onClick={()=>onOpen(index)}>Open workout →</button><button className="secondary danger-text" onClick={()=>confirm(`Delete ${plan.name}?`)&&onDelete(plan.id)}>Delete</button></div>
    </article>)}</section>}
  </div>
}
