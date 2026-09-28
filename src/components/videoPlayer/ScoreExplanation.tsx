import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { shadowingApi } from "../../api/shadowing"
import { useRotatingMessage } from "../../hooks/useRotatingMessage"
import { revealProps } from "../../utils/reveal"
import { AiThinkingStatus, ShimmerLine } from "../common/AiLoading"
import { Modal } from "../common/Modal"

// ── Types ─────────────────────────────────────────────────────────────────────

/** Request body for POST /shadowing/explain — matches the backend field names. */
export interface ScoreExplanationRequest {
    cer: number
    pitch_score: number
    user_katakana: string
    caption_katakana: string
    user_pitch: number[]
    reference_pitch: number[]
    caption: string
}

export interface FeedbackSummary {
    /** Short overall assessment of the user's spoken performance. */
    summary: string
    /** Feedback points focusing specifically on pronunciation accuracy. */
    pronunciation_feedback: string[]
    /** Feedback points on pitch accent (heiban, odaka, etc.) and intonation. */
    pitch_feedback: string[]
    /** Key areas where the user excelled. */
    strengths: string[]
    /** Actionable suggestions on where the user can improve. */
    improvements: string[]
}

export interface ScoreExplanationProps {
    request: ScoreExplanationRequest
    /** Words the learner mispronounced — named in the loading copy so the wait feels personal. */
    focusWords?: string[]
}

// ── API placeholder ────────────────────────────────────────────────────────────
// TODO: replace this stub with the real call once the endpoint is wired, e.g.:
//
//   import { shadowingApi } from "../../api/shadowing"
//   return shadowingApi.sendScoreForFeedback(request)   // resolves to { data: FeedbackSummary }
//
// Keeping the { data } shape means the component body below won't change.


async function getScoreFeedback(request: ScoreExplanationRequest) {
    return shadowingApi.sendScoreForFeedback(request)
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[12px] font-semibold tracking-widest uppercase text-white mb-2">
            {children}
        </p>
    )
}

function FeedbackList({
    label,
    items,
    tone = "neutral",
    revealDelayMs = 0,
}: {
    label: string
    items?: string[]
    tone?: "neutral" | "good" | "improve"
    revealDelayMs?: number
}) {
    if (!items?.length) return null
    const dot =
        tone === "good" ? "bg-teal-500" : tone === "improve" ? "bg-amber-400" : "bg-white/40"
    return (
        <div {...revealProps(revealDelayMs)}>
            <SectionLabel>{label}</SectionLabel>
            <ul className="space-y-1.5">
                {items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/75 leading-relaxed">
                        <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${dot}`} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

// Answer-shaped skeleton: the section headings are known up front, so show them
// for real and shimmer only the text — the layout barely moves when data lands.
const SKELETON_SECTIONS: { label: string; lines: string[] }[] = [
    { label: "Strengths", lines: ["w-5/6", "w-2/3"] },
    { label: "Pronunciation", lines: ["w-full", "w-3/4"] },
    { label: "Pitch & intonation", lines: ["w-4/5"] },
    { label: "Work on next", lines: ["w-5/6", "w-1/2"] },
]

function LoadingState() {
    let n = 0
    return (
        <div className="space-y-4" aria-hidden="true">
            <div className="space-y-2">
                <ShimmerLine className="h-4 w-full" delayMs={n++ * 90} />
                <ShimmerLine className="h-4 w-4/5" delayMs={n++ * 90} />
            </div>
            {SKELETON_SECTIONS.map((section) => (
                <div key={section.label}>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-widest text-white/35">
                        {section.label}
                    </p>
                    <div className="space-y-1.5">
                        {section.lines.map((w, i) => (
                            <ShimmerLine key={i} className={`h-3 ${w}`} delayMs={n++ * 90} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ── Main component ──────────────────────────────────────────────────────────────

export default function ScoreExplanation({ request, focusWords = [] }: ScoreExplanationProps) {
    const [data, setData] = useState<FeedbackSummary | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasFetched, setHasFetched] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()
    const containerRef = useRef<HTMLDivElement>(null)

    const focusKey = focusWords.slice(0, 2).join("・")
    const steps = useMemo(() => [
        "Reading your transcription…",
        focusKey ? `Looking at ${focusKey}…` : "Comparing each sound…",
        "Checking your pitch pattern…",
        "Writing your tips…",
    ], [focusKey])
    const thinkingMessage = useRotatingMessage(steps, isLoading)

    function handleFetch() {
        if (hasFetched || isLoading) return

        setIsLoading(true)
        setError(null)
        // The button sits low in the panel / bottom sheet — keep the status in view.
        setTimeout(() => containerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50)

        getScoreFeedback(request)
            .then((response) => {
                setData(response.data)
                setHasFetched(true)
            })
            .catch((e) => {
                const status = e?.response?.status

                if (status === 401) {
                    // setIsModalOpen(true)
                    setError("Please log in to use this feature.")
                    return
                }

                setError(
                    status === 503
                        ? "AI feedback is temporarily unavailable. Please try again later."
                        : "Something went wrong. Please try again."
                )
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    let content: React.ReactNode = null

    if (isLoading) {
        // The button's box turns into the status line in place, skeleton below.
        content = (
            <div className="space-y-4">
                <AiThinkingStatus message={thinkingMessage} srLabel="Explaining your score" />
                <div className="border-t border-white/6 pt-4">
                    <LoadingState />
                </div>
            </div>
        )
    } else if (error) {
        content = (
            <div className="border-t border-white/6 pt-4">
                <div className="flex flex-col items-center gap-3 py-3 text-center">
                    <p className="text-sm text-white/40 leading-relaxed">{error}</p>
                    <button
                        onClick={() => {
                            setError(null)
                            setHasFetched(false)
                        }}
                        className="
                            text-xs text-white/40 hover:text-white/70
                            underline underline-offset-2 transition-colors
                        "
                    >
                        Try again
                    </button>
                </div>
            </div>
        )
    } else if (!hasFetched) {
        content = (
            <button
                onClick={handleFetch}
                className="
                    w-full flex items-center justify-center gap-2
                    py-2.5 px-4 rounded-lg border border-white/12
                    text-sm text-white/60 hover:text-white
                    hover:border-white/25 hover:bg-white/4
                    transition-all duration-200 active:scale-[0.98]
                "
            >
                <span className="text-base leading-none">✦</span>
                Explain my score
            </button>
        )
    } else if (data) {
        content = (
            <div className="border-t border-white/6 pt-4 space-y-4">
                <h2 {...revealProps(0)} className={`text-lg font-semibold ${revealProps(0).className}`}>Score Explanation</h2>
                {data.summary && (
                    <p {...revealProps(80)} className={`text-sm text-white/75 leading-relaxed ${revealProps(80).className}`}>{data.summary}</p>
                )}
                <FeedbackList label="Strengths" items={data.strengths} tone="good" revealDelayMs={160} />
                <FeedbackList label="Pronunciation" items={data.pronunciation_feedback} revealDelayMs={240} />
                <FeedbackList label="Pitch & intonation" items={data.pitch_feedback} revealDelayMs={320} />
                <FeedbackList label="Work on next" items={data.improvements} tone="improve" revealDelayMs={400} />
            </div>
        )
    }

    return (
        <>
            <div ref={containerRef} className="scroll-mb-4">{content}</div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Log in required!"
                message="Please log in to access this feature."
                confirmText="Log In"
                onConfirm={() => {
                    navigate("/login")
                }}
            />
        </>
    )
}