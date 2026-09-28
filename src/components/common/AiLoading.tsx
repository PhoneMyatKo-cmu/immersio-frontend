import ScoringWave from "../videoPlayer/ScoringWave"

// Shared wait-state UI for AI explanations — same visual language as the
// pronunciation-scoring wait (teal wave + rotating status text + light sweep).

/** Status row that replaces the "✦ Explain" button in place while the AI works. */
export function AiThinkingStatus({ message, srLabel }: { message: string; srLabel: string }) {
    return (
        <div
            role="status"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-teal-500/25 bg-teal-500/5 px-4 py-2.5 text-sm text-teal-100"
        >
            <span className="sr-only">{srLabel}</span>
            <ScoringWave bars={7} />
            {/* key → each new message re-mounts and fades in */}
            <span key={message} aria-hidden="true" className="truncate motion-safe:animate-fade-up">
                {message}
            </span>
        </div>
    )
}

/** Placeholder text line with a travelling light sweep (reads as progress, unlike a pulse). */
export function ShimmerLine({ className = "", delayMs = 0 }: { className?: string; delayMs?: number }) {
    return (
        <div className={`relative overflow-hidden rounded bg-white/6 ${className}`}>
            <span
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent motion-safe:animate-scoring-sweep motion-reduce:hidden"
                style={{ animationDelay: `${delayMs}ms` }}
            />
        </div>
    )
}

