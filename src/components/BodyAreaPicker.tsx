import { useState } from 'react'
import { BODY_AREA_GROUPS } from '../data/bodyAreas'
import type { MuscleArea } from '../domain/types'

export function BodyAreaPicker({value,onChange,multiple=true}:{value:MuscleArea[];onChange:(areas:MuscleArea[])=>void;multiple?:boolean}) {
  const [openGroup,setOpenGroup]=useState<string|null>(null)
  const group=BODY_AREA_GROUPS.find(item=>item.id===openGroup)
  const select=(area:MuscleArea)=>onChange(multiple?(value.includes(area)?value.filter(item=>item!==area):[...value,area]):[area])
  return <div className="body-area-picker">
    <div className="body-area-groups">{BODY_AREA_GROUPS.map(item=>{
      const count=item.areas.filter(([area])=>value.includes(area)).length
      return <button type="button" key={item.id} className={`${openGroup===item.id?'open':''} ${count?'has-selection':''}`} aria-expanded={openGroup===item.id} onClick={()=>setOpenGroup(current=>current===item.id?null:item.id)}><span>{item.icon}</span><strong>{item.label}</strong>{count>0&&<b>{count}</b>}</button>
    })}</div>
    {group&&<div className="body-area-options" aria-label={`${group.label} areas`}>{group.areas.map(([area,label])=><button type="button" key={area} className={value.includes(area)?'selected':''} aria-pressed={value.includes(area)} onClick={()=>select(area)}>{label}</button>)}</div>}
  </div>
}
