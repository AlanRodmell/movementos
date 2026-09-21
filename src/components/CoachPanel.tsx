import { useState, type FormEvent } from "react";
import {
  clearCoachKey,
  createNewExercise,
  initializeCoach,
  isCoachReady,
  suggestWorkout,
  type NewExercise,
  type WorkoutSuggestion,
} from "../services/geminiCoachService.js";

interface CoachPanelProps {
  goal: string;
  equipment: string;
}

const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The Coach could not complete that request.";

export function CoachPanel({ goal, equipment }: CoachPanelProps) {
  const [ready, setReady] = useState(() => isCoachReady());
  const [apiKey, setApiKey] = useState("");
  const [energy, setEnergy] = useState("");
  const [availableEquipment, setAvailableEquipment] = useState(
    equipment || "bodyweight only",
  );
  const [targetMuscle, setTargetMuscle] = useState("");
  const [loading, setLoading] = useState<"key" | "workout" | "exercise" | null>(
    null,
  );
  const [error, setError] = useState("");
  const [workout, setWorkout] = useState<WorkoutSuggestion | null>(null);
  const [exercise, setExercise] = useState<NewExercise | null>(null);

  const saveKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading("key");
    try {
      await initializeCoach(apiKey);
      setReady(true);
      setApiKey("");
      setError("");
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setLoading(null);
    }
  };

  const clearKey = () => {
    clearCoachKey();
    setReady(false);
    setWorkout(null);
    setExercise(null);
    setError("");
  };

  const requestWorkout = async () => {
    setLoading("workout");
    setError("");
    setExercise(null);
    try {
      setWorkout(await suggestWorkout(`${goal} training`, energy));
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(null);
    }
  };

  const requestExercise = async () => {
    setLoading("exercise");
    setError("");
    setWorkout(null);
    try {
      setExercise(await createNewExercise(availableEquipment, targetMuscle));
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="panel coach-panel" aria-labelledby="coach-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TEST MODE · BYOK</span>
          <h2 id="coach-heading">Movement OS AI Coach</h2>
        </div>
        <span>{ready ? "Ready" : "Not connected"}</span>
      </div>
      <p>
        Use a temporary Gemini key for this browser session. The key is cleared
        when the session ends or when you disconnect it.
      </p>
      {error && (
        <p className="coach-error" role="alert">
          {error}
        </p>
      )}
      {!ready ? (
        <form
          className="coach-key-form"
          onSubmit={(event) => void saveKey(event)}
        >
          <label>
            Gemini API key
            <input
              type="password"
              value={apiKey}
              autoComplete="off"
              placeholder="Paste a temporary key"
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>
          <button className="primary" type="submit" disabled={loading !== null}>
            {loading === "key" ? "Activating…" : "Activate coach"}
          </button>
        </form>
      ) : (
        <>
          <div className="coach-actions">
            <label>
              Energy today
              <input
                value={energy}
                placeholder="High energy, a bit sore…"
                onChange={(event) => setEnergy(event.target.value)}
              />
            </label>
            <button
              className="primary"
              type="button"
              disabled={loading !== null}
              onClick={() => void requestWorkout()}
            >
              {loading === "workout" ? "Planning…" : "Suggest workout"}
            </button>
          </div>
          <div className="coach-actions">
            <label>
              Available equipment
              <input
                value={availableEquipment}
                onChange={(event) => setAvailableEquipment(event.target.value)}
              />
            </label>
            <label>
              Target area
              <input
                value={targetMuscle}
                placeholder="Core, shoulders…"
                onChange={(event) => setTargetMuscle(event.target.value)}
              />
            </label>
            <button
              className="secondary"
              type="button"
              disabled={loading !== null || !targetMuscle.trim()}
              onClick={() => void requestExercise()}
            >
              {loading === "exercise" ? "Creating…" : "Invent exercise"}
            </button>
          </div>
          <button
            className="text-button coach-clear"
            type="button"
            onClick={clearKey}
          >
            Clear session key
          </button>
        </>
      )}
      {workout && (
        <div className="coach-result" aria-live="polite">
          <h3>{workout.workoutName}</h3>
          <p>{workout.focus}</p>
          <ul>
            {workout.routine.map((phase, index) => (
              <li key={`${phase.phase}-${index}`}>
                <strong>{phase.phase}:</strong> {phase.exercises.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
      {exercise && (
        <div className="coach-result" aria-live="polite">
          <h3>{exercise.exerciseName}</h3>
          <p>{exercise.description}</p>
          <ol>
            {exercise.instructions.map((step, index) => (
              <li key={`${index}-${step}`}>{step}</li>
            ))}
          </ol>
          <p>
            <strong>Safety:</strong> {exercise.safetyTips.join(" | ")}
          </p>
        </div>
      )}
    </section>
  );
}
