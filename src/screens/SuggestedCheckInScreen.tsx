import { useState } from 'react'
import { currentCheckInDate, DailyCheckInFields, type DailyCheckInDraft } from '../components/DailyCheckInFields'
import { SafetyNotice } from '../components/SafetyNotice'
import type { DailyCheckIn } from '../domain/types'

export function SuggestedCheckInScreen({ dailyCheckIn,onSubmit }: { dailyCheckIn:DailyCheckIn;onSubmit:(checkIn:DailyCheckIn)=>void }) {
  const isToday=dailyCheckIn.date===currentCheckInDate()
  const [draft,setDraft]=useState<DailyCheckInDraft>(()=>isToday?{tightAreas:dailyCheckIn.tightAreas,primaryArea:dailyCheckIn.primaryArea}:{tightAreas:[],primaryArea:null})
  const submit=()=>onSubmit({date:currentCheckInDate(),tightAreas:draft.tightAreas,primaryArea:draft.tightAreas.length?(draft.primaryArea??draft.tightAreas[0]):null})

  return <div className="screen suggested-checkin-screen">
    <section className="page-intro"><span className="eyebrow">TODAY’S SUGGESTION</span><h1>How are you moving today?</h1><p>A ten-second check helps avoid unsuitable work and choose between training and recovery.</p></section>
    <section className="panel suggested-checkin-panel"><DailyCheckInFields value={draft} onChange={setDraft}/></section>
    <SafetyNotice compact/>
    <button className="primary suggested-checkin-submit" onClick={submit}>Create today’s session <span>→</span></button>
  </div>
}
