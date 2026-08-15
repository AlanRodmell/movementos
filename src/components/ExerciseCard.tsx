import type { Exercise, WorkoutExercise } from '../domain/types'
import { exerciseVideoUrl } from '../data/exercises'

export function ExerciseCard({ exercise, planned, compact = false, trailing }: { exercise: Exercise; planned?: WorkoutExercise; compact?: boolean; trailing?: React.ReactNode }) {
  const easierAdjusted=planned?.scaled==='down'
  const harderAdjusted=planned?.scaled==='up'
  return <article className={`exercise-card ${compact ? 'compact' : ''} ${planned?.adjusted ? 'adjusted' : ''} ${easierAdjusted?'easier-adjusted':''} ${harderAdjusted?'harder-adjusted':''}`}>
    <div className="exercise-icon">{exercise.category === 'stretching' ? '↔' : exercise.category === 'mobility' ? '〰' : exercise.category === 'conditioning' ? 'ϟ' : exercise.category === 'mindfulness' ? '◌' : '●'}</div>
    <div className="exercise-copy">
      <div className="exercise-title-row"><h3>{exercise.name}</h3><span className="level-badge">L{exercise.level || '•'}</span>{planned?.adjusted&&<span className="adjusted-badge">Adjusted</span>}{easierAdjusted&&<span className="easier-badge">Easier</span>}{harderAdjusted&&<span className="harder-badge">Harder</span>}</div>
      <p className="prescription">{planned?.prescription ?? exercise.prescription} · {exercise.pattern.replaceAll('_', ' ')}</p>
      {!compact && <p>{exercise.description}</p>}
      {planned && !compact && <small className="rationale">Why: {planned.rationale}</small>}
      {!compact&&<a className="video-link" href={exerciseVideoUrl(exercise)} target="_blank" rel="noopener noreferrer">▶ Watch video</a>}
    </div>
    {trailing && <div className="exercise-trailing">{trailing}</div>}
  </article>
}
