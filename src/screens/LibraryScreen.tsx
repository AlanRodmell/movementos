import { useMemo, useState } from 'react'
import { exercises } from '../data/exercises'
import type { AppState, Category, Equipment, Exercise } from '../domain/types'
import { ExerciseCard } from '../components/ExerciseCard'

const categories: Array<['all' | Category,string]> = [['all','All'],['upper','Upper'],['lower','Lower'],['core','Core'],['conditioning','Condition'],['mobility','Mobility'],['mindfulness','Mindful']]

export function LibraryScreen({ state, onToggleFavourite, onToggleAvoid, onCreateExercise, onBuildSelected }: { state: AppState; onToggleFavourite: (id: string) => void; onToggleAvoid: (id: string) => void; onCreateExercise:()=>void; onBuildSelected:(ids:string[])=>void }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | Category>('all')
  const [equipment, setEquipment] = useState<'all' | Equipment>('all')
  const [selected,setSelected]=useState<string[]>([])
  const allExercises: Exercise[] = [...exercises, ...state.customExercises]
  const results = useMemo(() => allExercises.filter(exercise =>
    (category === 'all' || exercise.category === category) &&
    (equipment === 'all' || exercise.equipment.includes(equipment)) &&
    (!search || `${exercise.name} ${exercise.pattern} ${exercise.primaryMuscles.join(' ')}`.toLowerCase().includes(search.toLowerCase())),
  ), [allExercises, category, equipment, search])
  return <div className="screen library-screen">
    <section className="library-header"><span className="eyebrow">EXERCISE CATALOGUE</span><h1>Explore {allExercises.length} movements</h1><p>Search by movement, muscle, pattern, or filter by the kit you have.</p><div className="library-tools"><input className="search-input" type="search" placeholder="Search exercises…" value={search} onChange={event => setSearch(event.target.value)}/><button className="secondary" onClick={onCreateExercise}>+ Create your own</button></div></section>
    <div className="horizontal-filters">{categories.map(([id,label]) => <button key={id} className={category === id ? 'selected' : ''} onClick={() => setCategory(id)}>{label}</button>)}</div>
    <label className="select-row">Equipment <select value={equipment} onChange={event => setEquipment(event.target.value as typeof equipment)}><option value="all">All equipment</option>{state.profile.equipment.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
    <p className="result-count">{results.length} matching movements</p>
    <section className="exercise-list">{results.map(exercise => <ExerciseCard key={exercise.id} exercise={exercise} trailing={<div className="card-actions"><button className={selected.includes(exercise.id)?'build-selected':''} onClick={()=>setSelected(current=>current.includes(exercise.id)?current.filter(id=>id!==exercise.id):[...current,exercise.id])} aria-label="Add to workout">{selected.includes(exercise.id)?'✓':'+'}</button><button className={state.profile.favourites.includes(exercise.id) ? 'selected' : ''} onClick={() => onToggleFavourite(exercise.id)} aria-label="Favourite">★</button><button className={state.profile.avoidList.includes(exercise.id) ? 'danger selected' : ''} onClick={() => onToggleAvoid(exercise.id)} aria-label="Avoid">⊘</button></div>}/>)}</section>
    {selected.length>0&&<div className="library-build"><span><strong>{selected.length}</strong> selected</span><button className="primary" onClick={()=>onBuildSelected(selected)}>Review workout →</button></div>}
  </div>
}
