import { AudioLines, Languages, Mic, X } from "lucide-react"
import ScoreExplanation from "./ScoreExplanation"

/* ============================================================================
 * Internal UI type — STABLE. The panel renders this shape.
 * Do not change it to match the backend. Instead, remap the raw API response
 * into it inside `toShadowingFeedback` below, so the UI never has to change
 * when the backend format is finalized.
 * ========================================================================== */
export interface ShadowingFeedback {
    /** Character-level match, 0–100 (higher is better). Derived from CER. */
    matchScore?: number
    /** Raw character error rate, 0–1 (lower is better). Shown as a hint. */
    cer?: number
    /** Prosodic similarity, 0–100 (higher is better). */
    pitch_score: unknown
    /** URL or data-URI of the server-rendered prosody plot (pitch / energy curve). */
    /** Free-text coaching from the LLM. */
    /** Optional short bullet tips, rendered as a list if present. */
    /** What the learner was asked to say. */
    user_katakana: string
    /** What ASR heard them say. */
    caption_katakana: string

    pitch_comparison_figure: unknown
    
    user_pitch: []
    
    reference_pitch:[]
}

/* ============================================================================
 *  ⬇⬇⬇   EDIT THIS ONE FUNCTION when the real API format lands.   ⬇⬇⬇
 *  It is the single boundary between the (currently unknown) backend shape
 *  and your UI. Right now it guesses common field names and tolerates
 *  missing data. When your friend finalizes the response, just fix the
 *  field names / scales here — the panel below stays untouched.
 * ========================================================================== */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toShadowingFeedback(raw: any): ShadowingFeedback {
    if (!raw || typeof raw !== "object") return {}

    // CER: assumed to be a 0–1 error rate. If it arrives as a 0–100 percentage,
    // scale it down. matchScore = how much matched = (1 - cer).
    let cer: number | undefined =
        raw.cer ?? raw.CER ?? raw.cer_score ?? raw.character_error_rate
    if (typeof cer === "number" && cer > 1) cer = cer / 100
    const matchScore =
        typeof cer === "number" ? Math.round((1 - cer) * 100) : undefined

    // Prosody: assumed 0–100. If it arrives as a 0–1 ratio, scale it up.
    let prosody: number | undefined =
        raw.prosody_score ?? raw.prosodyScore ?? raw.prosodic_similarity ?? raw.prosody
    if (typeof prosody === "number" && prosody <= 1) prosody = prosody * 100
    const prosodyScore =
        typeof prosody === "number" ? Math.round(prosody) : undefined

    return {
        cer,
        matchScore,
        prosodyScore,
        prosodyPlotUrl:
            raw.prosody_plot_url ??
            raw.prosodyPlotUrl ??
            raw.plot_url ??
            raw.prosody_plot ??
            raw.plot,
        feedback: raw.feedback ?? raw.ai_feedback ?? raw.feedback_text ?? raw.llm_feedback,
        feedbackPoints: Array.isArray(raw.feedback_points) ? raw.feedback_points : undefined,
        targetText: raw.target_text ?? raw.reference ?? raw.reference_text ?? raw.targetText,
        recognizedText:
            raw.recognized_text ?? raw.hypothesis ?? raw.transcript ?? raw.recognizedText,
    }
}

/* ========================================================================== */

export interface ShadowingFeedbackPanelProps {
    result: ShadowingFeedback | null
    isLoading: boolean
    onClose?: () => void
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
                <h2 className="text-base font-medium">Feedback</h2>
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

                        {/* Transcript comparison */}
                        {(result.user_katakana || result.caption_katakana) && (
                            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                <div className="mb-2 flex items-center gap-1.5 text-xs text-white/50">
                                    <Languages className="h-3.5 w-3.5" />
                                    Transcript
                                </div>
                                {result.caption_katakana && (
                                    <div className="mb-2">
                                        <p className="text-[11px] text-white/30">Target</p>
                                        <p className="text-sm leading-relaxed text-white/80">
                                            {result.caption_katakana}
                                        </p>
                                    </div>
                                )}
                                {result.user_katakana && (
                                    <div>
                                        <p className="text-[11px] text-white/30">You said</p>
                                        <p className="text-sm leading-relaxed text-white/80">
                                            {result.user_katakana}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Prosody plot */}
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
                        )}

                        {/* AI feedback */}
                        <ScoreExplanation request={
                            {
                                 cer: result.cer,
            pitch_score: result.pitch_score.score,
            caption_katakana: result.caption_katakana,
                                user_katakana: result.user_katakana,
                                user_pitch: result.user_pitch,
                                reference_pitch: result.reference_pitch,
                                caption:result.caption_katakana
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