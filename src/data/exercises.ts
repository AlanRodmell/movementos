import type { Exercise } from '../domain/types'
import { expandedExercises } from './expandedExercises'
import { legacyExercises } from './legacyExercises'

const stretchName = /stretch|pose|pigeon|cobra|sphinx|downward dog|child.?s pose|fold|butterfly|frog|lizard|warrior|triangle|tree pose|figure.?4|side bend/i
const classify = (exercise: Exercise): Exercise => exercise.category === 'mobility' && stretchName.test(exercise.name)
  ? { ...exercise, category: 'stretching' }
  : exercise

export const exercises: Exercise[] = [...legacyExercises, ...expandedExercises].map(classify)
export const exerciseById = new Map(exercises.map(exercise => [exercise.id, exercise]))

export function exerciseVideoUrl(exercise: Exercise) {
  const supplied = exercise.videoUrl?.trim()
  if (supplied && /^https?:\/\//i.test(supplied)) return supplied
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} exercise tutorial`)}`
}

export const catalogueStats = {
  total: exercises.length,
  legacy: legacyExercises.length,
  expanded: expandedExercises.length,
  equipmentAware: exercises.filter(exercise => !exercise.equipment.includes('none')).length,
}
