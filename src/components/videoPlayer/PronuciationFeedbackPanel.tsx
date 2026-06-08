import { Mic, X } from "lucide-react"
import PitchContour from "./PitchContour"
import ScoreExplanation from "./ScoreExplanation"

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
    const has = typeof score === "number"
    console.log("Type of score:",typeof score)
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/50">{label}</p>
            <p className={`mt-1 text-2xl font-medium tabular-nums ${has ? scoreColor(score!) : "text-teal-500"}`}>
                {has ? `${score.toFixed(2)}` : "—"}
                {has && <span className="text-base text-white/40">%</span>}
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                    className={`h-full rounded-full ${has ? barColor(score!) : "bg-amber-500"}`}
                    style={{ width: has ? `${Math.max(0, Math.min(100, score!))}%` : "0%" }}
                />
            </div>
            {hint && <p className="mt-1.5 text-[11px] text-white/30">{hint}</p>}
        </div>
    )
}

function SkeletonBlock({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />
}

export default function ShadowingFeedbackPanel({
    result,
    isLoading,
    onClose,
}: ShadowingFeedbackPanelProps) {
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
                {isLoading && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <SkeletonBlock className="h-24" />
                            <SkeletonBlock className="h-24" />
                        </div>
                        <SkeletonBlock className="h-40" />
                        <SkeletonBlock className="h-20" />
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !result && (
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
                {!isLoading && result && (
                    <div className="space-y-5">
                        {/* Scores */}
                        <div className="grid grid-cols-2 gap-3">
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

                      

                        <ScoredSentence words={result.caption_error} />
                        <PitchContour userPitch={result.user_pitch} referencePitch={result.reference_pitch}/>


                        

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