import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent, GoogleGenAI } = vi.hoisted(() => {
  const generateContent = vi.fn();
  const GoogleGenAI = class {
    constructor() {
      this.models = { generateContent };
    }
  };

  return { generateContent, GoogleGenAI };
});

vi.mock("@google/genai", () => ({ GoogleGenAI }));

import {
  clearCoachKey,
  initializeCoach,
  isCoachReady,
  suggestWorkout,
} from "./geminiCoachService.js";

describe("geminiCoachService", () => {
  beforeEach(() => {
    clearCoachKey();
    sessionStorage.clear();
    localStorage.clear();
    generateContent.mockReset();
  });

  it("keeps BYOK credentials in session storage and removes the legacy persistent key", async () => {
    localStorage.setItem("movementos_gemini_key", "old-key");

    await initializeCoach(" new-key ");

    expect(sessionStorage.getItem("movementos_gemini_key")).toBe("new-key");
    expect(localStorage.getItem("movementos_gemini_key")).toBeNull();
    expect(isCoachReady()).toBe(true);
  });

  it("rejects a structurally invalid workout response", async () => {
    await initializeCoach("test-key");
    generateContent.mockResolvedValue({
      text: JSON.stringify({ workoutName: "Only a title" }),
    });

    await expect(suggestWorkout("strength", "low")).rejects.toThrow(
      "issue planning",
    );
  });

  it("returns a validated workout response", async () => {
    await initializeCoach("test-key");
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        workoutName: "Steady Strength",
        focus: "Full body",
        routine: [{ phase: "Warm-up", exercises: ["March in place"] }],
      }),
    });

    await expect(suggestWorkout("strength", "steady")).resolves.toEqual({
      workoutName: "Steady Strength",
      focus: "Full body",
      routine: [{ phase: "Warm-up", exercises: ["March in place"] }],
    });
  });
});
