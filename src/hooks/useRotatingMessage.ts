import { useEffect, useState } from "react"

// Steps through `steps` every `intervalMs` while `active`, holding on the last one
// (so a slow response never looks like it restarted). Resets when inactive.
export function useRotatingMessage(steps: readonly string[], active: boolean, intervalMs = 1500) {
    const [index, setIndex] = useState(0)
    const last = steps.length - 1

    useEffect(() => {
        if (!active) return
        const id = setInterval(() => setIndex((i) => Math.min(i + 1, last)), intervalMs)
        return () => {
            clearInterval(id)
            setIndex(0)
        }
    }, [active, intervalMs, last])

    return steps[Math.min(index, last)]
}
