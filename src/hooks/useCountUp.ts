import { useEffect, useState } from "react"

// Eases a number from 0 up to `target` (ease-out cubic). Jumps straight to the
// target when the user prefers reduced motion.
export function useCountUp(target: number, durationMs = 900, delayMs = 0) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        if (!Number.isFinite(target)) return
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        let raf = 0
        let start: number | null = null

        const tick = (now: number) => {
            if (start === null) start = now + delayMs
            const t = reduce ? 1 : Math.min(1, Math.max(0, (now - start) / durationMs))
            setValue(target * (1 - Math.pow(1 - t, 3)))
            if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [target, durationMs, delayMs])

    return value
}
