import type { Exercise, WorkoutExercise } from '../domain/types'

export function ExerciseCard({ exercise, planned, compact = false, trailing }: { exercise: Exercise; planned?: WorkoutExercise; compact?: boolean; trailing?: React.ReactNode }) {
  return <article className={`exercise-card ${compact ? 'compact' : ''}`}>
    <div className="exercise-icon">{exercise.category === 'mobility' ? '〰' : exercise.category === 'conditioning' ? 'ϟ' : exercise.category === 'mindfulness' ? '◌' : '●'}</div>
    <div className="exercise-copy">
      <div className="exercise-title-row"><h3>{exercise.name}</h3><span className="level-badge">L{exercise.level || '•'}</span></div>
      <p className="prescription">{planned?.prescription ?? exercise.prescription} · {exercise.pattern.replaceAll('_', ' ')}</p>
      {!compact && <p>{exercise.description}</p>}
      {planned && !compact && <small className="rationale">Why: {planned.rationale}</small>}
    </div>
    {trailing && <div className="exercise-trailing">{trailing}</div>}
  </article>
}
