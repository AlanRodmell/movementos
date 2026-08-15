import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { exerciseById } from '../data/exercises'
import type { Exercise, WorkoutExercise, WorkoutPlan } from '../domain/types'
import { ExerciseCard } from '../components/ExerciseCard'

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
}

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
          ? 'Drag one set to update the circuit order everywhere'
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

export function PlanScreen({ plan, customExercises, onStart, onSave, onRegenerate, onEasier, onHarder, onAdjust, onSwap, onReorder, onRemove, onAvoid }: { plan: WorkoutPlan; customExercises: Exercise[]; onStart: () => void; onSave: () => void; onRegenerate: () => void; onEasier:(index:number)=>void; onHarder:(index:number)=>void; onAdjust:(index:number,direction:-1|1)=>void; onSwap:(index:number)=>void; onReorder:(fromIndex:number,toIndex:number)=>void; onRemove:(index:number)=>void; onAvoid:(index:number,id:string)=>void }) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const resolve = (id: string) => exerciseById.get(id) ?? customExercises.find(exercise => exercise.id === id)
  const groups = planGroups(plan)

  const sameGroup = (fromIndex: number, toIndex: number) => {
    const from = plan.exercises[fromIndex]
    const to = plan.exercises[toIndex]
    return Boolean(from && to && groupKey(from) === groupKey(to))
  }

  const updateDrag = (next: DragState | null) => {
    dragRef.current = next
    setDrag(next)
  }

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (event.button !== 0) return
    event.preventDefault()
    updateDrag({ fromIndex:index, targetIndex:index, pointerId:event.pointerId })
    try { event.currentTarget.setPointerCapture?.(event.pointerId) } catch { /* global listeners keep the drag active */ }
  }

  useEffect(() => {
    if (!drag) return

    const moveDrag = (event: PointerEvent) => {
      const current = dragRef.current
      if (!current || current.pointerId !== event.pointerId) return
      event.preventDefault()
      const row = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-reorder-index]')
      const targetIndex = Number(row?.dataset.reorderIndex)
      if (Number.isInteger(targetIndex) && sameGroup(current.fromIndex, targetIndex) && targetIndex !== current.targetIndex) {
        updateDrag({ ...current, targetIndex })
      }
    }

    const finishDrag = (event: PointerEvent) => {
      const completed = dragRef.current
      if (!completed || completed.pointerId !== event.pointerId) return
      updateDrag(null)
      if (completed.fromIndex !== completed.targetIndex) onReorder(completed.fromIndex, completed.targetIndex)
    }

    const cancelDrag = (event: PointerEvent) => {
      if (dragRef.current?.pointerId === event.pointerId) updateDrag(null)
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

  const keyboardReorder = (event: ReactKeyboardEvent<HTMLButtonElement>, group: PlanGroup, index: number) => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const position = group.indexes.indexOf(index)
    const targetPosition = event.key === 'ArrowUp' ? position - 1 : position + 1
    const targetIndex = group.indexes[targetPosition]
    if (targetIndex !== undefined) onReorder(index, targetIndex)
  }

  return <div className="screen plan-screen">
    <section className="plan-hero">
      <span className="eyebrow">YOUR SESSION</span>
      <h1>{plan.name}</h1>
      <div className="plan-meta"><span>~{plan.durationMinutes} min</span><span>{plan.exercises.length} steps</span><span>{plan.goal}</span></div>
    </section>
    <section className="algorithm-note"><span>✦</span><div><strong>Built around you</strong><p>{plan.insights.join(' ')}</p></div></section>
    <div className="routine-map" aria-label="Routine structure">
      {groups.map((group, index) => <span key={group.key}><b>{index + 1}</b>{group.label.replace('Main circuit — ', '')}</span>)}
    </div>
    {groups.map(group => <section key={group.key} className={`plan-section routine-set ${group.key.startsWith('main-') ? 'main-set' : ''}`}>
      <div className="section-heading">
        <div><span className="section-kicker">SESSION BLOCK</span><h2>{group.label}</h2><small>{group.note}</small></div>
        <span>{group.indexes.length}</span>
      </div>
      <div className="set-exercises">
        {group.indexes.map((index, position) => {
          const item = plan.exercises[index]
          const exercise = resolve(item.exerciseId)
          if (!exercise) return null
          const isDragging = drag?.fromIndex === index
          const isDropTarget = drag?.targetIndex === index && drag.fromIndex !== index
          return <div
            className={`plan-exercise ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`}
            key={`${group.key}_${item.exerciseId}_${index}`}
            data-reorder-index={index}
          >
            <div className="exercise-order-row">
              <span className="exercise-position">{position + 1}</span>
              <button
                type="button"
                className="drag-handle"
                onPointerDown={event => beginDrag(event, index)}
                onKeyDown={event => keyboardReorder(event, group, index)}
                aria-label={`Drag ${exercise.name} to reorder. Use arrow keys for keyboard reordering.`}
              ><span aria-hidden="true">⠿</span> Drag</button>
            </div>
            <ExerciseCard exercise={exercise} planned={item}/>
            <div className="exercise-adjustments" aria-label={`Adjust ${exercise.name}`}>
              <button onClick={()=>onEasier(index)}>Easier</button>
              <button onClick={()=>onHarder(index)}>Harder</button>
              <button onClick={()=>onAdjust(index,-1)}>− reps/time</button>
              <button onClick={()=>onAdjust(index,1)}>+ reps/time</button>
              <button onClick={()=>onSwap(index)}>Swap all sets</button>
              <button className="danger-text" onClick={()=>onRemove(index)}>Remove all sets</button>
              <button className="danger-text" onClick={()=>onAvoid(index,item.exerciseId)}>Avoid & replace</button>
            </div>
          </div>
        })}
      </div>
    </section>)}
    <div className="sticky-actions"><button className="primary" onClick={onStart}>Start session <span>→</span></button><div><button className="secondary" onClick={onRegenerate}>Regenerate</button><button className="secondary" onClick={onSave}>Save</button></div></div>
  </div>
}
