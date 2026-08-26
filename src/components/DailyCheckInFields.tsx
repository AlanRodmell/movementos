import { BodyAreaPicker } from './BodyAreaPicker'
import { bodyAreaLabel } from '../data/bodyAreas'
import type { MuscleArea } from '../domain/types'

export interface DailyCheckInDraft {
  tightAreas: MuscleArea[]
  primaryArea: MuscleArea | null
}

export function currentCheckInDate() {
  return new Date().toDateString()
}

export function DailyCheckInFields({ value, onChange }: { value: DailyCheckInDraft; onChange: (value: DailyCheckInDraft) => void }) {
  const selectAreas = (tightAreas: MuscleArea[]) => {
    const primaryArea = value.primaryArea && tightAreas.includes(value.primaryArea) ? value.primaryArea : tightAreas[0] ?? null
    onChange({ tightAreas, primaryArea })
  }

  return <>
    <button type="button" className={`nothing-flag ${!value.tightAreas.length?'selected':''}`} aria-pressed={!value.tightAreas.length} onClick={() => onChange({ tightAreas:[], primaryArea:null })}>Nothing to flag</button>
    <BodyAreaPicker value={value.tightAreas} onChange={selectAreas}/>
    {value.tightAreas.length>1&&<label className="checkin-primary">Most noticeable today<select value={value.primaryArea??value.tightAreas[0]} onChange={event=>onChange({ ...value, primaryArea:event.target.value as MuscleArea })}>{value.tightAreas.map(area=><option key={area} value={area}>{bodyAreaLabel(area)}</option>)}</select></label>}
  </>
}
