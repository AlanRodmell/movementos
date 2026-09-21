const COACH_KEY = "movementos_gemini_key";
const LEGACY_COACH_KEY = "movementos_gemini_key";
const MAX_INPUT_LENGTH = 500;

let aiClient = null;

const getSessionStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const removeLegacyPersistentKey = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(LEGACY_COACH_KEY);
  } catch {
    // Storage can be unavailable in privacy modes.
  }
};

const readStoredKey = () => {
  removeLegacyPersistentKey();

  try {
    return getSessionStorage()?.getItem(COACH_KEY)?.trim() || null;
  } catch {
    return null;
  }
};

const storeKey = (apiKey) => {
  try {
    getSessionStorage()?.setItem(COACH_KEY, apiKey);
  } catch {
    // The key remains available in memory for this page session.
  }
};

const createCoachClient = async (apiKey) => {
  const { GoogleGenAI } = await import("@google/genai");
  return new GoogleGenAI({ apiKey });
};

const getCoachClient = async () => {
  if (aiClient) return aiClient;

  const savedKey = readStoredKey();
  if (!savedKey)
    throw new Error("Coach is not configured. Please provide your API key.");

  aiClient = await createCoachClient(savedKey);
  return aiClient;
};

const promptInput = (value, fallback) => {
  const normalised = String(value ?? "")
    .trim()
    .slice(0, MAX_INPUT_LENGTH);
  return normalised || fallback;
};

const isStringArray = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isWorkoutResponse = (value) => {
  if (!value || typeof value !== "object") return false;
  if (
    typeof value.workoutName !== "string" ||
    typeof value.focus !== "string" ||
    !Array.isArray(value.routine)
  )
    return false;

  return value.routine.every((phase) => {
    return (
      phase &&
      typeof phase === "object" &&
      typeof phase.phase === "string" &&
      isStringArray(phase.exercises)
    );
  });
};

const isExerciseResponse = (value) => {
  return (
    value &&
    typeof value === "object" &&
    typeof value.exerciseName === "string" &&
    typeof value.description === "string" &&
    isStringArray(value.instructions) &&
    isStringArray(value.safetyTips)
  );
};

const parseResponse = (text, isValid) => {
  let value;

  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("The Coach returned an invalid response.");
  }

  if (!isValid(value))
    throw new Error("The Coach returned an incomplete response.");
  return value;
};

export async function initializeCoach(apiKey) {
  const normalisedKey = String(apiKey ?? "").trim();
  if (!normalisedKey)
    throw new Error("API key is required to activate the Coach.");

  aiClient = await createCoachClient(normalisedKey);
  storeKey(normalisedKey);
  removeLegacyPersistentKey();
  return true;
}

export function clearCoachKey() {
  aiClient = null;
  removeLegacyPersistentKey();

  try {
    getSessionStorage()?.removeItem(COACH_KEY);
  } catch {
    // Storage can be unavailable in privacy modes.
  }
}

export function isCoachReady() {
  return Boolean(aiClient || readStoredKey());
}

export async function suggestWorkout(userPreferences, currentEnergyLevel) {
  const client = await getCoachClient();
  const prompt = `You are the MovementOS Coach. Based on the user's details:
  Preferences/Goals: ${promptInput(userPreferences, "General fitness")}
  Current Energy Level: ${promptInput(currentEnergyLevel, "Not specified")}

  Suggest a tailored workout routine. Include a warm-up, main exercises (with sets/reps), and a cool-down.
  Respond strictly in JSON format matching this schema:
  { "workoutName": "string", "focus": "string", "routine": [{ "phase": "string", "exercises": ["string"] }] }`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    return parseResponse(response.text, isWorkoutResponse);
  } catch {
    throw new Error("The Coach ran into an issue planning your workout.");
  }
}

export async function createNewExercise(equipmentAvailable, targetMuscleGroup) {
  const client = await getCoachClient();
  const prompt = `You are an innovative fitness Coach for MovementOS. Invent a brand new, unique exercise using ONLY the following equipment: ${promptInput(equipmentAvailable, "bodyweight only")}.
  The exercise must target: ${promptInput(targetMuscleGroup, "the full body")}.

  Respond strictly in JSON format matching this schema:
  { "exerciseName": "string", "description": "string", "instructions": ["string"], "safetyTips": ["string"] }`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    return parseResponse(response.text, isExerciseResponse);
  } catch {
    throw new Error("The Coach ran into an issue inventing this exercise.");
  }
}
