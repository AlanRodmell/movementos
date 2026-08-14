import { exerciseById } from '../data/exercises'
import type { Exercise, WorkoutPlan } from '../domain/types'
import { ExerciseCard } from '../components/ExerciseCard'

export function PlanScreen({ plan, customExercises, onStart, onSave, onRegenerate }: { plan: WorkoutPlan; customExercises: Exercise[]; onStart: () => void; onSave: () => void; onRegenerate: () => void }) {
  const resolve = (id: string) => exerciseById.get(id) ?? customExercises.find(exercise => exercise.id === id)
  const sections = [...new Set(plan.exercises.map(item => item.section))]
  return <div className="screen plan-screen">
    <section className="plan-hero"><span className="eyebrow">YOUR SESSION</span><h1>{plan.name}</h1><div className="plan-meta"><span>{plan.durationMinutes} min</span><span>{plan.exercises.length} movements</span><span>{plan.goal}</span></div></section>
    <section className="algorithm-note"><span>✦</span><div><strong>Built around you</strong><p>{plan.insights.join(' ')}</p></div></section>
    {sections.map(section => <section key={section} className="plan-section"><div className="section-heading"><h2>{section}</h2><span>{plan.exercises.filter(item => item.section === section).length}</span></div>{plan.exercises.filter(item => item.section === section).map(item => { const exercise = resolve(item.exerciseId); return exercise ? <ExerciseCard key={item.exerciseId} exercise={exercise} planned={item}/> : null })}</section>)}
    <div className="sticky-actions"><button className="primary" onClick={onStart}>Start session <span>→</span></button><div><button className="secondary" onClick={onRegenerate}>Regenerate</button><button className="secondary" onClick={onSave}>Save</button></div></div>
  </div>
}
