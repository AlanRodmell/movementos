import { useEffect, useRef, useState } from 'react'
import { SafetyNotice } from '../components/SafetyNotice'
import type { Equipment, Goal, Level, Profile } from '../domain/types'

const goals:Array<{id:Goal;label:string;note:string}>=[
  {id:'general',label:'General fitness',note:'A balanced mix of strength and movement'},
  {id:'strength',label:'Strength',note:'Build capability with harder patterns'},
  {id:'muscle',label:'Build muscle',note:'Use repeat exposure and volume'},
  {id:'endurance',label:'Endurance',note:'Sustain more work and conditioning'},
  {id:'mobility',label:'Move and recover',note:'Prioritise range, control and restoration'},
]
const experience:Array<{level:Level;label:string;note:string}>=[
  {level:1,label:'Getting started',note:'Use accessible movement variations'},
  {level:2,label:'Some experience',note:'Start with broadly approachable training'},
  {level:3,label:'Experienced',note:'Include more demanding variations'},
]
const equipment:Array<[Equipment,string]>=[['wall','Wall'],['chair','Chair'],['bench','Bench'],['table','Table'],['bar','Pull-up bar'],['bands','Bands'],['dumbbells','Dumbbells'],['kettlebell','Kettlebell'],['barbell','Barbell'],['cable','Cable'],['machine','Machines'],['slider','Sliders'],['box','Box / step'],['rope','Rope']]

export function OnboardingScreen({ profile,onComplete }: { profile:Profile;onComplete:(profile:Profile)=>void }) {
  const [step,setStep]=useState(0)
  const [draft,setDraft]=useState<Profile>(()=>({...profile,equipment:[...new Set(['none' as const,...profile.equipment])]}))
  const [safetyAccepted,setSafetyAccepted]=useState(false)
  const headingRef=useRef<HTMLHeadingElement>(null)
  const toggleEquipment=(item:Equipment)=>setDraft(current=>({...current,equipment:current.equipment.includes(item)?current.equipment.filter(value=>value!==item):[...current.equipment,item]}))
  const selectLevel=(level:Level)=>setDraft(current=>({...current,level,upper:level,lower:level,core:level,conditioning:level}))
  useEffect(()=>{headingRef.current?.focus({preventScroll:true})},[step])

  return <main className="onboarding-screen" aria-labelledby="onboarding-title">
    <div className="onboarding-brand"><span>M</span><strong>Movement OS</strong></div>
    <div className="wizard-progress onboarding-progress"><span>SETUP {step+1} OF 3</span><div>{[0,1,2].map(value=><i className={value<=step?'active':''} key={value}/>)}</div></div>
    {step===0&&<section className="onboarding-card"><span className="eyebrow">WELCOME</span><h1 id="onboarding-title" ref={headingRef} tabIndex={-1}>Train for the body you have today.</h1><p>Set a few starting points. You can change every choice later in Profile.</p><label className="onboarding-name">Name <span>(optional)</span><input value={draft.name} maxLength={80} placeholder="What should we call you?" onChange={event=>setDraft({...draft,name:event.target.value})}/></label><fieldset className="onboarding-options"><legend>What matters most right now?</legend>{goals.map(goal=><button type="button" key={goal.id} className={draft.goal===goal.id?'selected':''} aria-pressed={draft.goal===goal.id} onClick={()=>setDraft({...draft,goal:goal.id})}><strong>{goal.label}</strong><small>{goal.note}</small></button>)}</fieldset></section>}
    {step===1&&<section className="onboarding-card"><span className="eyebrow">YOUR STARTING POINT</span><h1 id="onboarding-title" ref={headingRef} tabIndex={-1}>What should sessions assume?</h1><p>The on-device coach will adapt from your feedback after this.</p><fieldset className="onboarding-options"><legend>Movement experience</legend>{experience.map(item=><button type="button" key={item.level} className={draft.level===item.level?'selected':''} aria-pressed={draft.level===item.level} onClick={()=>selectLevel(item.level)}><strong>{item.label}</strong><small>{item.note}</small></button>)}</fieldset><fieldset className="onboarding-equipment"><legend>Equipment you can use</legend><p>Bodyweight is always available.</p><div className="filter-pills">{equipment.map(([id,label])=><button type="button" key={id} className={draft.equipment.includes(id)?'selected':''} aria-pressed={draft.equipment.includes(id)} onClick={()=>toggleEquipment(id)}>{label}</button>)}</div></fieldset></section>}
    {step===2&&<section className="onboarding-card"><span className="eyebrow">PRIVATE BY DEFAULT</span><h1 id="onboarding-title" ref={headingRef} tabIndex={-1}>Your training stays on this device.</h1><p>Sessions, feedback and preferences are stored locally. Profile includes backup and restore tools whenever you need them.</p><SafetyNotice/><label className="safety-accept"><input type="checkbox" checked={safetyAccepted} onChange={event=>setSafetyAccepted(event.target.checked)}/><span>I understand and will use Movement OS within my own abilities.</span></label></section>}
    <div className="onboarding-actions">{step>0&&<button className="secondary" onClick={()=>setStep(step-1)}>Back</button>}<button className="primary" disabled={step===2&&!safetyAccepted} onClick={()=>step<2?setStep(step+1):onComplete({...draft,name:draft.name.trim(),equipment:[...new Set(['none' as const,...draft.equipment])]})}>{step===2?'Finish setup':'Continue'} <span>→</span></button></div>
  </main>
}
