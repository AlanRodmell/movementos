import { useMemo, useState } from 'react'
import { exercises } from '../data/exercises'
import type { AppState, Category, Equipment, Exercise } from '../domain/types'
import { ExerciseCard } from '../components/ExerciseCard'

type LibraryFilter = 'all' | 'selected' | 'staples' | 'cardio' | Category

const filters: Array<[LibraryFilter,string]> = [
  ['all','All'],['selected','Selected'],['staples','Staples'],['warmup','Warm-up'],['upper','Upper'],['lower','Lower'],['core','Core'],
  ['cardio','Cardio'],['mobility','Mobility'],['stretching','Stretch'],['mindfulness','Meditate'],
]

const matchesFilter = (exercise:Exercise,filter:LibraryFilter,selected:string[],staples:string[]) => {
  if(filter==='all')return true
  if(filter==='selected')return selected.includes(exercise.id)
  if(filter==='staples')return staples.includes(exercise.id)
  if(filter==='cardio')return exercise.category==='conditioning'||exercise.pattern==='cardio'
  return exercise.category===filter
}

export function LibraryScreen({ state, onToggleFavourite, onToggleAvoid, onCreateExercise, onDeleteCustom, onBuildSelected }: { state: AppState; onToggleFavourite: (id: string) => void; onToggleAvoid: (id: string) => void; onCreateExercise:()=>void; onDeleteCustom:(id:string)=>void; onBuildSelected:(ids:string[])=>void }) {
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState<LibraryFilter>('all')
  const [equipment,setEquipment]=useState<'all'|Equipment>('all')
  const [selected,setSelected]=useState<string[]>([])
  const allExercises=useMemo<Exercise[]>(()=>[...exercises,...state.customExercises],[state.customExercises])
  const exerciseById=useMemo(()=>new Map(allExercises.map(exercise=>[exercise.id,exercise])),[allExercises])
  const equipmentOptions=useMemo(()=>[...new Set(allExercises.flatMap(exercise=>exercise.equipment))].sort(),[allExercises])
  const normalizedSearch=search.trim().toLowerCase()
  const results=useMemo(()=>allExercises.filter(exercise=>
    matchesFilter(exercise,filter,selected,state.profile.favourites)
    &&(equipment==='all'||exercise.equipment.includes(equipment))
    &&(!normalizedSearch||`${exercise.name} ${exercise.description} ${exercise.category} ${exercise.pattern} ${exercise.primaryMuscles.join(' ')} ${exercise.secondaryMuscles.join(' ')} ${exercise.equipment.join(' ')} ${exercise.goals.join(' ')}`.toLowerCase().includes(normalizedSearch)),
  ),[allExercises,equipment,filter,normalizedSearch,selected,state.profile.favourites])
  const selectedExercises=selected.map(id=>exerciseById.get(id)).filter((exercise):exercise is Exercise=>Boolean(exercise))
  const toggleSelected=(id:string)=>setSelected(current=>current.includes(id)?current.filter(selectedId=>selectedId!==id):[...current,id])

  return <div className="screen library-screen">
    <section className="library-header"><span className="eyebrow">EXERCISE CATALOGUE</span><h1>Explore {allExercises.length} movements</h1><p>Search by movement, muscle, pattern, goal, or filter the full catalogue by type and equipment.</p><div className="custom-exercise-callout"><span><strong>Your custom exercises</strong><small>{state.customExercises.length?`${state.customExercises.length} saved — edit them in Profile or delete them here.`:'Add a movement, prescription, coaching notes and an optional video.'}</small></span><button className="primary" onClick={onCreateExercise}>+ Create custom exercise</button></div><div className="library-tools"><input className="search-input" type="search" placeholder="Search exercises…" value={search} onChange={event=>setSearch(event.target.value)}/></div></section>
    <div className="horizontal-filters">{filters.map(([id,label])=><button key={id} className={filter===id?'selected':''} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}{id==='selected'&&selected.length?` (${selected.length})`:id==='staples'&&state.profile.favourites.length?` (${state.profile.favourites.length})`:''}</button>)}</div>
    <label className="select-row">Equipment <select value={equipment} onChange={event=>setEquipment(event.target.value as typeof equipment)}><option value="all">All equipment</option>{equipmentOptions.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
    {selectedExercises.length>0&&<section className="library-selection-summary" aria-label="Selected workout exercises"><header><strong>Selected for workout</strong><span>{selectedExercises.length} movement{selectedExercises.length===1?'':'s'}</span></header><div>{selectedExercises.map(exercise=><button key={exercise.id} onClick={()=>toggleSelected(exercise.id)} aria-label={`Remove ${exercise.name} from workout`}>{exercise.name}<span aria-hidden="true">×</span></button>)}</div></section>}
    <p className="result-count">{results.length} matching movements</p>
    <section className="exercise-list">{results.map(exercise=>{
      const isSelected=selected.includes(exercise.id)
      const isStaple=state.profile.favourites.includes(exercise.id)
      const isAvoided=state.profile.avoidList.includes(exercise.id)
      return <ExerciseCard key={exercise.id} exercise={exercise} trailing={<div className="card-actions">
        <button className={isSelected?'build-selected':''} aria-label={`${isSelected?'Remove':'Add'} ${exercise.name} ${isSelected?'from':'to'} workout`} aria-pressed={isSelected} onClick={()=>toggleSelected(exercise.id)}>{isSelected?'✓':'+'}</button>
        <button className={isStaple?'selected':''} aria-label={`${isStaple?'Remove':'Mark'} ${exercise.name} ${isStaple?'from':'as'} staple`} aria-pressed={isStaple} title="Prioritise in suggested workouts" onClick={()=>onToggleFavourite(exercise.id)}>★</button>
        <button className={isAvoided?'danger selected':''} aria-label={`${isAvoided?'Remove':'Mark'} ${exercise.name} ${isAvoided?'from avoid list':'as avoided'}`} aria-pressed={isAvoided} onClick={()=>onToggleAvoid(exercise.id)}>⊘</button>
        {exercise.isCustom&&<button className="danger" onClick={()=>confirm(`Delete ${exercise.name}?`)&&onDeleteCustom(exercise.id)} aria-label={`Delete ${exercise.name}`}>×</button>}
      </div>}/>
    })}</section>
    {selected.length>0&&<div className="library-build"><span><strong>{selected.length}</strong> selected</span><button className="primary" onClick={()=>onBuildSelected(selected)}>Review workout →</button></div>}
  </div>
}
