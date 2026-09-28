import { Check, Mic, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useCountUp } from "../../hooks/useCountUp"
import PitchContour from "./PitchContour"
import { useScoringMessage } from "../../hooks/useScoringMessage"
import ScoreExplanation from "./ScoreExplanation"
import ScoringWave from "./ScoringWave"

/* ============================================================================
 * Internal UI type — STABLE. The panel renders this shape.
 * Do not change it to match the backend. Instead, remap the raw API response
 * into it inside `toShadowingFeedback` below, so the UI never has to change
 * when the backend format is finalized.
 * ========================================================================== */
export interface ShadowingFeedback {
    cer: number
    /** Prosodic similarity, 0–100 (higher is better). */
    pitch_score: { score: number } & Record<string, unknown>
    /** URL or data-URI of the server-rendered prosody plot (pitch / energy curve). */
    /** Free-text coaching from the LLM. */
    /** Optional short bullet tips, rendered as a list if present. */
    /** What the learner was asked to say. [original, katakana] pairs */
    user_katakana: [string, string][]
    /** What ASR heard them say. [original, katakana] pairs */
    caption_katakana: [string, string][]

    pitch_comparison_figure: unknown
    
    user_pitch: []
    
    reference_pitch: []
    
    caption_error:ScoredWord[]
}


export interface ShadowingFeedbackPanelProps {
    result: ShadowingFeedback | null
    isLoading: boolean
    onClose?: () => void
}

// Each entry is [word, isCorrect]; we flag the WRONG ones (isCorrect === false).
type ScoredWord = [word: string, isCorrect: boolean]

function ScoredSentence({ words }: { words: ScoredWord[] }) {
    return (
        <p className="font-japanese text-lg leading-relaxed">
            {words.map(([word, isCorrect], i) => (
                <span
                    key={i}
                    className={
                        isCorrect
                            ? "text-green-500"
                            : "text-red-400  decoration-red-400/50 underline-offset-4"
                    }
                >
                    {word}
                </span>
            ))}
        </p>
    )
}

function scoreColor(score: number): string {
    if (score >= 80) return "text-teal-500"
    if (score >= 60) return "text-amber-400"
    return "text-red-400"
}

function barColor(score: number): string {
    if (score >= 80) return "bg-teal-500"
    if (score >= 60) return "bg-amber-400"
    return "bg-red-400"
}

function ScoreCard({
    label,
    score,
    hint,
}: {
    label: string
    score?: number
    hint?: string
}) {
    const has = typeof score === "number" && Number.isFinite(score)
    // Counts up from 0 once the card is revealed; the bar grows with it.
    const shown = useCountUp(has ? score! : 0, 900, 150)
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/50">{label}</p>
            <p className={`mt-1 text-2xl font-medium tabular-nums ${has ? scoreColor(score!) : "text-teal-500"}`}>
                {has ? `${shown.toFixed(2)}` : "—"}
                {has && <span className="text-base text-white/40">%</span>}
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                    className={`h-full rounded-full ${has ? barColor(score!) : "bg-amber-500"}`}
                    style={{ width: has ? `${Math.max(0, Math.min(100, shown))}%` : "0%" }}
                />
            </div>
            {hint && <p className="mt-1.5 text-[11px] text-white/30">{hint}</p>}
        </div>
    )
}

const SETTLE_MS = 450

// Staggered entrance for result sections (delay in ms).
const reveal = (delayMs: number) => ({
    className: "motion-safe:animate-reveal",
    style: { animationDelay: `${delayMs}ms` },
})

function SkeletonBlock({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />
}

export default function ShadowingFeedbackPanel({
    result,
    isLoading,
    onClose,
}: ShadowingFeedbackPanelProps) {
    const { message: scoringMessage } = useScoringMessage(isLoading)

    // "Settling" beat between loading and the result: the progress bar completes and
    // the status reads "Feedback ready" for a moment, so the swap never feels abrupt.
    // (Adjust-state-during-render pattern — no flash of the result before settling.)
    const [prevLoading, setPrevLoading] = useState(isLoading)
    const [settling, setSettling] = useState(false)
    if (prevLoading !== isLoading) {
        setPrevLoading(isLoading)
        if (!isLoading && result) setSettling(true)
    }
    useEffect(() => {
        if (!settling) return
        const t = setTimeout(() => setSettling(false), SETTLE_MS)
        return () => clearTimeout(t)
    }, [settling])

    const showStatus = isLoading || settling

    return (
        <div className="flex h-full flex-col text-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h2 className="text-lg font-medium">Score & Feedback</h2>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close feedback"
                        className="text-white/40 transition-colors hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                {/* Loading */}
                {showStatus && (
                    <div className="space-y-4">
                        {/* Live status — something moving makes the 3–4s wait feel shorter */}
                        <div role="status" className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-4 motion-safe:animate-fade-up">
                            <span className="sr-only">Scoring your recording</span>
                            <div className="flex items-center gap-3" aria-hidden="true">
                                {settling ? (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-400 text-[#04241f] motion-safe:animate-fade-up">
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                    </span>
                                ) : (
                                    <ScoringWave bars={7} />
                                )}
                                <p key={settling ? "ready" : scoringMessage} className="text-sm text-teal-100 motion-safe:animate-fade-up">
                                    {settling ? "Feedback ready" : scoringMessage}
                                </p>
                            </div>
                            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                                {settling ? (
                                    <div className="h-full w-full rounded-full bg-teal-400 motion-safe:animate-scoring-complete" />
                                ) : (
                                    <div className="h-full w-1/2 rounded-full bg-teal-400 motion-safe:animate-scoring-progress" />
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <SkeletonBlock className="h-24" />
                            <SkeletonBlock className="h-24" />
                        </div>
                        <SkeletonBlock className="h-40" />
                        <SkeletonBlock className="h-20" />
                    </div>
                )}

                {/* Empty */}
                {!showStatus && !result && (
                    <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                            <Mic className="h-5 w-5 text-white/30" />
                        </div>
                        <p className="mt-3 max-w-[200px] text-sm text-white/40">
                            Record a sentence to see how close you are.
                        </p>
                    </div>
                )}

                {/* Result */}
                {!showStatus && result && (
                    <div className="space-y-5">
                        {/* Scores */}
                        <div {...reveal(0)} className={`grid grid-cols-2 gap-3 ${reveal(0).className}`}>
                            <ScoreCard
                                label="Pronunciation Accuracy"
                                score={Number((1-result.cer) * 100)}
                                // hint={
                                //     typeof result.cer === "number"
                                //         ? `CER ${result.cer.toFixed(2)}`
                                //         : undefined
                                // }
                            />
                            <ScoreCard label="Pitch Accent Similarity" score={result.pitch_score.score} />
                        </div>

                      

                        <div {...reveal(120)}>
                            <ScoredSentence words={result.caption_error} />
                        </div>
                        <div {...reveal(220)}>
                            <PitchContour userPitch={result.user_pitch} referencePitch={result.reference_pitch} animationDelayMs={320} />
                        </div>


                        

                        {/* Prosody plot
                        {result.pitch_comparison_figure && (
                            <div>
                                <div className="mb-2 flex items-center gap-1.5 text-xs text-white/50">
                                    <AudioLines className="h-3.5 w-3.5" />
                                    Pitch &amp; energy
                                </div>
                                <img
                                    src={`data:image/png;base64,${result.pitch_comparison_figure}`}
                                    alt="Your pitch and energy compared to the native speaker"
                                    className="w-full rounded-lg border border-white/10 bg-black"
                                />
                            </div>
                        )} */}

                        {/* AI feedback */}
                        <div {...reveal(340)}>
                        <ScoreExplanation request={
                            {
                                 cer: result.cer,
            pitch_score: result.pitch_score.score,
            caption_katakana: result.caption_katakana.map(([, k]) => k).join(""),
                                user_katakana: result.user_katakana.map(([, k]) => k).join(""),
                                user_pitch: result.user_pitch,
                                reference_pitch: result.reference_pitch,
                                caption: result.caption_katakana.map(([, k]) => k).join("")
                            }
                        }

                        />
                        </div>
                        {/* {(result.feedback || result.feedbackPoints?.length) && (
                            <div className="rounded-lg border border-teal/30 bg-teal/5 p-4">
                                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-teal">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Coaching
                                </div>
                                {result.feedback && (
                                    <p className="text-sm leading-relaxed text-white/80">
                                        {result.feedback}
                                    </p>
                                )}
                                {result.feedbackPoints?.length ? (
                                    <ul className="mt-2 space-y-1.5">
                                        {result.feedbackPoints.map((point, i) => (
                                            <li
                                                key={i}
                                                className="flex gap-2 text-sm leading-relaxed text-white/80"
                                            >
                                                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-teal" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        )} */}
                    </div>
                )}
            </div>
        </div>
    )
}