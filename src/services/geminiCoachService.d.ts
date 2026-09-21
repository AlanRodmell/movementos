export interface WorkoutSuggestion {
  workoutName: string;
  focus: string;
  routine: Array<{ phase: string; exercises: string[] }>;
}

export interface NewExercise {
  exerciseName: string;
  description: string;
  instructions: string[];
  safetyTips: string[];
}

export function initializeCoach(apiKey: string): Promise<true>;
export function clearCoachKey(): void;
export function isCoachReady(): boolean;
export function suggestWorkout(
  userPreferences: string,
  currentEnergyLevel: string,
): Promise<WorkoutSuggestion>;
export function createNewExercise(
  equipmentAvailable: string,
  targetMuscleGroup: string,
): Promise<NewExercise>;
