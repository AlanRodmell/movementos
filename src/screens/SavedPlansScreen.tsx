import { useState } from 'react'
import type { WorkoutPlan } from '../domain/types'

export function SavedPlansScreen({plans,onOpen,onDelete,onRename,onBuild}:{plans:WorkoutPlan[];onOpen:(index:number)=>void;onDelete:(id:string)=>void;onRename:(id:string,name:string)=>void;onBuild:()=>void}) {
  const [renaming,setRenaming]=useState<string|null>(null)
  const [draftName,setDraftName]=useState('')
  const startRename=(plan:WorkoutPlan)=>{setRenaming(plan.id);setDraftName(plan.name)}
  const saveRename=(plan:WorkoutPlan)=>{const name=draftName.trim().slice(0,120);if(!name)return;onRename(plan.id,name);setRenaming(null)}
  return <div className="screen saved-screen">
    <section className="page-intro"><span className="eyebrow">YOUR LIBRARY</span><h1>Saved workouts</h1><p>Open any saved workout to review, adjust, or start it again.</p></section>
    {plans.length===0?<section className="panel saved-empty"><span>▣</span><h2>No saved workouts yet</h2><p>Build or generate a workout, review it, then tap Save workout.</p><button className="primary" onClick={onBuild}>Build a workout →</button></section>:<section className="saved-workout-list">{plans.map((plan,index)=><article className="saved-workout-card" key={plan.id}>
      <div><span className="eyebrow">{plan.intention==='recover'?'RECOVERY':'TRAINING'}</span>{renaming===plan.id?<form className="saved-workout-rename" onSubmit={event=>{event.preventDefault();saveRename(plan)}}><label htmlFor={`rename-${plan.id}`}>Workout name</label><input id={`rename-${plan.id}`} autoFocus maxLength={120} value={draftName} onChange={event=>setDraftName(event.target.value)}/><div><button className="primary compact" type="submit" disabled={!draftName.trim()}>Save name</button><button className="secondary compact" type="button" onClick={()=>setRenaming(null)}>Cancel</button></div></form>:<h2>{plan.name}</h2>}<p>{plan.exercises.length} movements · {plan.durationMinutes} min · {plan.goal}</p></div>
      <div className="saved-workout-actions"><button className="primary" onClick={()=>onOpen(index)}>Open workout →</button><button className="secondary" onClick={()=>startRename(plan)}>Rename</button><button className="secondary danger-text" onClick={()=>confirm(`Delete ${plan.name}?`)&&onDelete(plan.id)}>Delete</button></div>
    </article>)}</section>}
  </div>
}
