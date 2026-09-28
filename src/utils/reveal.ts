// Staggered entrance for revealed sections (pairs with the `animate-reveal` keyframe).
export function revealProps(delayMs: number) {
    return {
        className: "motion-safe:animate-reveal",
        style: { animationDelay: `${delayMs}ms` },
    }
}
