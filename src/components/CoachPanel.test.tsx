import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CoachPanel } from "./CoachPanel";

const suggestWorkout = vi.hoisted(() => vi.fn());
const createNewExercise = vi.hoisted(() => vi.fn());

vi.mock("../services/geminiCoachService.js", () => ({
  clearCoachKey: vi.fn(),
  createNewExercise,
  initializeCoach: vi.fn(),
  isCoachReady: () => true,
  suggestWorkout,
}));

describe("CoachPanel", () => {
  beforeEach(() => {
    suggestWorkout.mockReset();
    createNewExercise.mockReset();
  });

  it("renders model output as text instead of interpreting HTML", async () => {
    suggestWorkout.mockResolvedValue({
      workoutName: "<img src=x onerror=alert(1)>",
      focus: "Full body",
      routine: [{ phase: "Warm-up", exercises: ["March in place"] }],
    });

    render(<CoachPanel goal="strength" equipment="dumbbells" />);
    fireEvent.click(screen.getByRole("button", { name: "Suggest workout" }));

    expect(
      await screen.findByText("<img src=x onerror=alert(1)>"),
    ).toBeInTheDocument();
    expect(document.querySelector("img")).not.toBeInTheDocument();
  });
});
