import { useRotatingMessage } from "./useRotatingMessage"

// Shown while the backend scores a shadowing take (~3–4s).
export const SCORING_STEPS = [
    "Transcribing your speech…",
    "Comparing with native speaker…",
    "Measuring pitch accent…",
    "Preparing your feedback…",
] as const

export function useScoringMessage(active: boolean, intervalMs = 1500) {
    return { message: useRotatingMessage(SCORING_STEPS, active, intervalMs) }
}
