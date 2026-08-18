type WebkitAudioWindow = typeof window & { webkitAudioContext?: typeof AudioContext }

let workoutAudioContext: AudioContext | null = null

function getWorkoutAudioContext() {
  if (workoutAudioContext && workoutAudioContext.state !== 'closed') return workoutAudioContext
  const AudioContextClass = window.AudioContext || (window as WebkitAudioWindow).webkitAudioContext
  if (!AudioContextClass) return null
  workoutAudioContext = new AudioContextClass()
  return workoutAudioContext
}

export function unlockWorkoutAudio() {
  try {
    const context = getWorkoutAudioContext()
    if (context?.state === 'suspended') void context.resume().catch(() => undefined)
  } catch {
    // Browsers can reject audio until a user gesture. A later interaction retries it.
  }
}

export function playWorkoutCue(final = false) {
  try {
    const context = getWorkoutAudioContext()
    if (!context) return
    if (context.state === 'suspended') {
      void context.resume().then(() => playWorkoutCue(final)).catch(() => undefined)
      return
    }
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = final ? 880 : 660
    gain.gain.value = .08
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + (final ? .18 : .1))
  } catch {
    // Audio is optional and must never interrupt the workout timer.
  }
}

export function resetWorkoutAudioForTests() {
  workoutAudioContext = null
}
