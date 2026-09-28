import { useEffect, useState } from "react"

// Shown while the backend scores a shadowing take (~3–4s). Holds on the last step
// instead of looping, so a slow response never looks like it restarted.
export const SCORING_STEPS = [
    "Transcribing your speech…",
    "Analyzing phonemes…",
    "Comparing with native speaker…",
    "Measuring pitch accent…",
    "Preparing your feedback…",
] as const

export function useScoringMessage(active: boolean, intervalMs = 1500) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (!active) return
        const id = setInterval(
            () => setIndex((i) => Math.min(i + 1, SCORING_STEPS.length - 1)),
            intervalMs,
        )
        return () => {
            clearInterval(id)
            setIndex(0)
        }
    }, [active, intervalMs])

    return { message: SCORING_STEPS[index], index }
}
