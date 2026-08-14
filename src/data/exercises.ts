import type { Exercise } from '../domain/types'
import { expandedExercises } from './expandedExercises'
import { legacyExercises } from './legacyExercises'

export const exercises: Exercise[] = [...legacyExercises, ...expandedExercises]
export const exerciseById = new Map(exercises.map(exercise => [exercise.id, exercise]))

export const catalogueStats = {
  total: exercises.length,
  legacy: legacyExercises.length,
  expanded: expandedExercises.length,
  equipmentAware: exercises.filter(exercise => !exercise.equipment.includes('none')).length,
}
