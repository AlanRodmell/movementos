import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { exerciseById, exercises, exerciseVideoUrl } from '../data/exercises'
import type { Exercise, WorkoutExercise, WorkoutPlan } from '../domain/types'

interface PlanGroup {
  key: string
  label: string
  note: string
  indexes: number[]
}

interface DragState {
  fromIndex: number
  targetIndex: number
  pointerId: number
  startX: number
  startY: number
  offsetY: number
  rowHeight: number
  activated: boolean
  moved: boolean
}

const DRAG_HOLD_MS = 1000
const HOLD_MOVE_TOLERANCE = 8

function groupKey(item: WorkoutExercise) {
  return item.section === 'Main work' && item.setNumber ? `main-${item.setNumber}` : item.section
}

function planGroups(plan: WorkoutPlan): PlanGroup[] {
  const groups: PlanGroup[] = []
  plan.exercises.forEach((item, index) => {
    const key = groupKey(item)
    let group = groups.find(candidate => candidate.key === key)
    if (!group) {
      const label = item.section === 'Main work' && item.setNumber
        ? `Main circuit — Set ${item.setNumber} of ${item.totalSets ?? item.setNumber}`
        : item.section
      const note = item.section === 'Prepare'
        ? 'Specific preparation for the work ahead'
        : item.section === 'Main work'
          ? 'Drag any exercise to update the circuit order in every set'
          : item.section === 'Condition'
            ? 'Capacity finisher'
            : 'Mobility and mindful close-out'
      group = { key, label, note, indexes: [] }
      groups.push(group)
    }
    group.indexes.push(index)
  })
  return groups
}

function shortGroupLabel(group: PlanGroup) {
  const set = group.label.match(/Set (\d+)/)?.[1]
  if (set) return `Set ${set}`
  return group.label
}

function pretty(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase())
}

export function PlanScreen({ plan, customExercises, isSaved, onStart, onSave, onViewSaved, onRegenerate, onEasier, onHarder, onAdjust, onSwap, onReorder, onAdd, onRemove, onAvoid }: { plan: WorkoutPlan; customExercises: Exercise[]; isSaved:boolean; onStart: () => void; onSave: () => void; onViewSaved:()=>void; onRegenerate: () => void; onEasier:(index:number)=>void; onHarder:(index:number)=>void; onAdjust:(index:number,direction:-1|1)=>void; onSwap:(index:number)=>void; onReorder:(fromIndex:number,toIndex:number)=>void; onAdd:(groupIndex:number,exerciseId:string)=>void; onRemove:(index:number)=>void; onAvoid:(index:number,id:string)=>void }) {
  const groups = planGroups(plan)
  const firstMainGroup = groups.find(group => group.key.startsWith('main-'))?.key ?? groups[0]?.key ?? ''
  const [activeGroupKey, setActiveGroupKey] = useState(firstMainGroup)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [addingToGroupKey, setAddingToGroupKey] = useState<string | null>(null)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const holdTimerRef = useRef<number | null>(null)
  const groupSignature = groups.map(group => group.key).join('|')
  const resolve = (id: string) => exerciseById.get(id) ?? customExercises.find(exercise => exercise.id === id)
  const activeGroup = groups.find(group => group.key === activeGroupKey) ?? groups[0]
  const selectedEntry = selectedIndex === null ? null : plan.exercises[selectedIndex]
  const selectedExercise = selectedEntry ? resolve(selectedEntry.exerciseId) : null
  const activeExerciseIds = new Set(activeGroup?.indexes.map(index => plan.exercises[index].exerciseId) ?? [])
  const normalizedSearch = exerciseSearch.trim().toLowerCase()
  const addCandidates = [...exercises, ...customExercises].filter(exercise => !activeExerciseIds.has(exercise.id)
    && (!normalizedSearch || `${exercise.name} ${exercise.pattern} ${exercise.primaryMuscles.join(' ')}`.toLowerCase().includes(normalizedSearch)))
    .slice(0, 10)

  useEffect(() => {
    if (!groups.some(group => group.key === activeGroupKey)) setActiveGroupKey(firstMainGroup)
  }, [activeGroupKey, firstMainGroup, groupSignature])

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= plan.exercises.length) setSelectedIndex(null)
  }, [plan.exercises.length, selectedIndex])

  const updateDrag = (next: DragState | null) => {
    dragRef.current = next
    setDrag(next)
  }

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current)
    holdTimerRef.current = null
  }

  useEffect(() => clearHoldTimer, [])

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>, index: number) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button,a,input,select,textarea')) return
    event.currentTarget.focus()
    const pointerId = event.pointerId
    updateDrag({
      fromIndex:index,
      targetIndex:index,
      pointerId,
      startX:event.clientX,
      startY:event.clientY,
      offsetY:0,
      rowHeight:event.currentTarget.getBoundingClientRect().height + 8,
      activated:false,
      moved:false,
    })
    clearHoldTimer()
    holdTimerRef.current = window.setTimeout(() => {
      const current = dragRef.current
      if (current?.pointerId === pointerId) updateDrag({ ...current, activated:true })
      holdTimerRef.current = null
    }, DRAG_HOLD_MS)
  }

  useEffect(() => {
    if (!drag) return

    const moveDrag = (event: PointerEvent) => {
      const current = dragRef.current
      if (!current || current.pointerId !== event.pointerId) return
      if (!current.activated) {
        if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > HOLD_MOVE_TOLERANCE) {
          clearHoldTimer()
          updateDrag(null)
        }
        return
      }
      const offsetY = event.clientY - current.startY
      if (!current.moved && Math.abs(offsetY) < 6) return
      event.preventDefault()
      const source = plan.exercises[current.fromIndex]
      const groupIndexes = plan.exercises.map((item, index) => source && groupKey(item) === groupKey(source) ? index : -1).filter(index => index >= 0)
      const sourcePosition = groupIndexes.indexOf(current.fromIndex)
      const targetPosition = Math.max(0, Math.min(groupIndexes.length - 1, sourcePosition + Math.round(offsetY / current.rowHeight)))
      const targetIndex = groupIndexes[targetPosition] ?? current.targetIndex
      updateDrag({ ...current, targetIndex, offsetY, moved:true })
    }

    const finishDrag = (event: PointerEvent) => {
      const completed = dragRef.current
      if (!completed || completed.pointerId !== event.pointerId) return
      clearHoldTimer()
      updateDrag(null)
      if (completed.moved) {
        if (completed.fromIndex !== completed.targetIndex) onReorder(completed.fromIndex, completed.targetIndex)
      } else {
        setSelectedIndex(current => current === completed.fromIndex ? null : completed.fromIndex)
      }
    }

    const cancelDrag = (event: PointerEvent) => {
      if (dragRef.current?.pointerId === event.pointerId) {
        clearHoldTimer()
        updateDrag(null)
      }
    }

    window.addEventListener('pointermove', moveDrag, { passive:false })
    window.addEventListener('pointerup', finishDrag)
    window.addEventListener('pointercancel', cancelDrag)
    return () => {
      window.removeEventListener('pointermove', moveDrag)
      window.removeEventListener('pointerup', finishDrag)
      window.removeEventListener('pointercancel', cancelDrag)
    }
  }, [drag?.pointerId, drag?.fromIndex, onReorder, plan])

  const keyboardRowAction = (event: ReactKeyboardEvent<HTMLDivElement>, group: PlanGroup, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedIndex(current => current === index ? null : index)
      return
    }
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const position = group.indexes.indexOf(index)
    const targetPosition = event.key === 'ArrowUp' ? position - 1 : position + 1
    const targetIndex = group.indexes[targetPosition]
    if (targetIndex !== undefined) onReorder(index, targetIndex)
  }

  const activateGroup = (key: string) => {
    setActiveGroupKey(key)
    setSelectedIndex(null)
    setAddingToGroupKey(null)
    setExerciseSearch('')
  }

  const toggleAddExercise = () => {
    setAddingToGroupKey(current => current === activeGroup?.key ? null : activeGroup?.key ?? null)
    setExerciseSearch('')
    setSelectedIndex(null)
  }

  const closeInspector = () => setSelectedIndex(null)

  return <div className="screen plan-screen">
    <section className="plan-hero">
      <div className="plan-title-block"><span className="eyebrow">YOUR SESSION</span><h1>{plan.name}</h1></div>
      <div className="plan-fact"><span>◎</span><div><strong>{pretty(plan.goal)}</strong><small>Focus</small></div></div>
      <div className="plan-fact"><span>◷</span><div><strong>{plan.durationMinutes} min</strong><small>Est. duration</small></div></div>
    </section>

    <nav className="routine-map" aria-label="Routine structure">
      {groups.map((group, index) => <button key={group.key} className={group.key === activeGroup?.key ? 'active' : ''} aria-label={`${shortGroupLabel(group)}, ${group.indexes.length} exercises`} aria-pressed={group.key === activeGroup?.key} onClick={() => activateGroup(group.key)}>
        <b>{index + 1}</b><span><strong>{shortGroupLabel(group)}</strong><small>{group.indexes.length} exercises</small></span>
      </button>)}
    </nav>

    {activeGroup && <div className={`plan-workspace ${selectedExercise ? 'has-inspector' : ''}`}>
      <section className={`plan-section routine-set ${activeGroup.key.startsWith('main-') ? 'main-set' : ''}`}>
        <div className="section-heading">
          <div><h2>{activeGroup.label.replace('Main circuit — ', '')}</h2><small>{activeGroup.note}</small></div>
          <div className="plan-heading-actions"><span className="drag-instruction">↕ Hold 1 second, then drag to reorder</span><button className="add-exercise-button" onClick={toggleAddExercise} aria-expanded={addingToGroupKey === activeGroup.key}>+ Add exercise</button></div>
        </div>
        {addingToGroupKey === activeGroup.key && <section className="exercise-picker" aria-label={`Add exercise to ${activeGroup.label}`}>
          <header><div><strong>Add an exercise</strong><small>{activeGroup.key.startsWith('main-') ? 'It will be added to every main set.' : `It will be added to ${activeGroup.label}.`}</small></div><button onClick={toggleAddExercise} aria-label="Close exercise picker">×</button></header>
          <input autoFocus type="search" value={exerciseSearch} onChange={event => setExerciseSearch(event.target.value)} placeholder="Search by exercise, muscle, or pattern…" aria-label="Search exercises to add"/>
          <div className="exercise-picker-results">{addCandidates.map(exercise => <button key={exercise.id} onClick={() => { onAdd(activeGroup.indexes[activeGroup.indexes.length - 1], exercise.id); setAddingToGroupKey(null); setExerciseSearch('') }}><span><strong>{exercise.name}</strong><small>{pretty(exercise.pattern)} · Level {exercise.level}</small></span><b>Add</b></button>)}</div>
          {!addCandidates.length && <p>No matching exercises available for this section.</p>}
        </section>}
        <div className="set-exercises" role="list" aria-label={activeGroup.label}>
          {activeGroup.indexes.map((index, position) => {
            const item = plan.exercises[index]
            const exercise = resolve(item.exerciseId)
            if (!exercise) return null
            const isDragging = drag?.fromIndex === index
            const isDropTarget = drag?.targetIndex === index && drag.fromIndex !== index
            const fromPosition = drag ? activeGroup.indexes.indexOf(drag.fromIndex) : -1
            const targetPosition = drag ? activeGroup.indexes.indexOf(drag.targetIndex) : -1
            let transform = ''
            if (isDragging && drag?.moved) transform = `translateY(${drag.offsetY}px) scale(.995)`
            else if (drag?.moved && fromPosition < targetPosition && position > fromPosition && position <= targetPosition) transform = `translateY(-${drag.rowHeight}px)`
            else if (drag?.moved && fromPosition > targetPosition && position >= targetPosition && position < fromPosition) transform = `translateY(${drag.rowHeight}px)`
            return <div
              className={`plan-exercise ${selectedIndex === index ? 'selected' : ''} ${isDragging && drag?.activated ? 'drag-ready' : ''} ${isDragging && drag?.moved ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''} ${item.scaled === 'up' ? 'scaled-up' : item.scaled === 'down' ? 'scaled-down' : ''}`}
              key={`${activeGroup.key}_${item.exerciseId}_${index}`}
              data-reorder-index={index}
              role="listitem"
              tabIndex={0}
              aria-label={`${exercise.name}, ${item.prescription}. Hold for 1 second, then drag to reorder, or press Enter for details.`}
              aria-roledescription="draggable exercise"
              aria-grabbed={Boolean(isDragging && drag?.activated)}
              onPointerDown={event => beginDrag(event, index)}
              onKeyDown={event => keyboardRowAction(event, activeGroup, index)}
              style={transform ? { transform } : undefined}
            >
              <span className="exercise-position">{position + 1}</span>
              <span className="exercise-dot" aria-hidden="true"/>
              <div className="plan-exercise-name"><strong>{exercise.name}</strong><span className="level-badge">L{exercise.level}</span>{item.scaled === 'up' && <span className="harder-badge">Harder</span>}{item.scaled === 'down' && <span className="easier-badge">Easier</span>}</div>
              <span className="plan-dose">{item.prescription}</span>
              <span className="plan-pattern">{pretty(exercise.pattern)}</span>
              <span className="row-chevron" aria-hidden="true">›</span>
            </div>
          })}
        </div>
      </section>

      {selectedExercise && selectedEntry && selectedIndex !== null && <aside className="exercise-inspector" aria-label={`${selectedExercise.name} details`}>
        <div className="sheet-grabber" aria-hidden="true"/>
        <header>
          <span className="inspector-icon">●</span>
          <div><h2>{selectedExercise.name}</h2><p>{selectedEntry.prescription} · {pretty(selectedExercise.pattern)}</p></div>
          <button className="inspector-close" onClick={closeInspector} aria-label="Close exercise details">×</button>
        </header>
        <div className="inspector-details">
          <p className="inspector-focus"><strong>Focus</strong><span>{[...selectedExercise.primaryMuscles, ...selectedExercise.secondaryMuscles].slice(0,4).map(pretty).join(' · ')}</span></p>
          <p className="inspector-description">{selectedExercise.description.trim() || 'See video on the link below for more info'}</p>
          <a href={exerciseVideoUrl(selectedExercise)} target="_blank" rel="noopener noreferrer"><span className="inspector-symbol">▶</span><p><strong>Watch video</strong><small>See movement demonstration</small></p><b>›</b></a>
        </div>
        <div className="inspector-actions" aria-label={`Adjust ${selectedExercise.name}`}>
          <button className="easier" onClick={() => onEasier(selectedIndex)}>⌄ <span>Easier</span></button>
          <button className="harder" onClick={() => onHarder(selectedIndex)}>⌃ <span>Harder</span></button>
          <button onClick={() => onSwap(selectedIndex)}>↻ <span>Swap</span></button>
          <button className="avoid" onClick={() => { onAvoid(selectedIndex, selectedEntry.exerciseId); closeInspector() }}>⊘ <span>Avoid</span></button>
        </div>
        <div className="inspector-secondary-actions">
          <span>Adjust reps/time</span><button onClick={() => onAdjust(selectedIndex,-1)} aria-label={`Decrease reps or time for ${selectedExercise.name}`}>−</button><button onClick={() => onAdjust(selectedIndex,1)} aria-label={`Increase reps or time for ${selectedExercise.name}`}>+</button>
          <button className="remove" onClick={() => { onRemove(selectedIndex); closeInspector() }}>Remove</button>
        </div>
      </aside>}
    </div>}

    <details className="algorithm-note"><summary><span>✦</span><strong>Why this session?</strong></summary><p>{plan.insights.join(' ')}</p></details>
    {isSaved&&<div className="save-confirmation" role="status">✓ Workout saved on this device</div>}
    <div className="plan-footer-actions"><button className="secondary" onClick={onRegenerate}>Regenerate</button><button className={`secondary ${isSaved?'saved':''}`} onClick={isSaved?onViewSaved:onSave}>{isSaved?'View saved':'Save workout'}</button><button className="primary plan-footer-start" onClick={onStart}>Start session <span>→</span></button></div>
  </div>
}
