// Looping "thinking" waveform shown while a shadowing take is being scored.
// Visually continues the live recording meter (same bar shape), recoloured teal.
export default function ScoringWave({ bars = 9, className = "" }: { bars?: number; className?: string }) {
    return (
        <span className={`flex h-4 items-center gap-0.5 ${className}`} aria-hidden="true">
            {Array.from({ length: bars }, (_, i) => (
                <span
                    key={i}
                    className="h-full w-0.5 origin-center rounded-full motion-reduce:scale-y-50 bg-teal-400 motion-safe:animate-scoring-wave"
                    style={{ animationDelay: `${i * 90}ms` }}
                />
            ))}
        </span>
    )
}
