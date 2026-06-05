import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { shadowingApi } from "../../api/shadowing"
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
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
            {children}
        </p>
    )
}

function FeedbackList({
    label,
    items,
    tone = "neutral",
}: {
    label: string
    items?: string[]
    tone?: "neutral" | "good" | "improve"
}) {
    if (!items?.length) return null
    const dot =
        tone === "good" ? "bg-teal" : tone === "improve" ? "bg-amber-400" : "bg-white/40"
    return (
        <div>
            <SectionLabel>{label}</SectionLabel>
            <ul className="space-y-1.5">
                {items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/75 leading-relaxed">
                        <span className={`mt-1.5 h-1 w-1 flex-shrink-0 rounded-full ${dot}`} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="space-y-2">
                <div className="h-4 bg-white/8 rounded w-full" />
                <div className="h-4 bg-white/8 rounded w-4/5" />
            </div>
            <div className="space-y-2">
                <div className="h-3 w-24 bg-white/6 rounded" />
                <div className="h-3 bg-white/6 rounded w-5/6" />
                <div className="h-3 bg-white/6 rounded w-3/4" />
            </div>
            <div className="space-y-2">
                <div className="h-3 w-24 bg-white/6 rounded" />
                <div className="h-3 bg-white/6 rounded w-4/5" />
            </div>
        </div>
    )
}

// ── Main component ──────────────────────────────────────────────────────────────

export default function ScoreExplanation({ request }: ScoreExplanationProps) {
    const [data, setData] = useState<FeedbackSummary | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasFetched, setHasFetched] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    function handleFetch() {
        if (hasFetched || isLoading) return

        setIsLoading(true)
        setError(null)

        getScoreFeedback(request)
            .then((response) => {
                setData(response.data)
                setHasFetched(true)
            })
            .catch((e) => {
                const status = e?.response?.status

                if (status === 401) {
                    setIsModalOpen(true)
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
        content = (
            <div className="border-t border-white/6 pt-4">
                <LoadingState />
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
                {data.summary && (
                    <p className="text-sm text-white/75 leading-relaxed">{data.summary}</p>
                )}
                <FeedbackList label="Strengths" items={data.strengths} tone="good" />
                <FeedbackList label="Pronunciation" items={data.pronunciation_feedback} />
                <FeedbackList label="Pitch & intonation" items={data.pitch_feedback} />
                <FeedbackList label="Work on next" items={data.improvements} tone="improve" />
            </div>
        )
    }

    return (
        <>
            {content}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message="Log in to use this feature!"
                title="Log In?"
                confirmText="Log In"
                onConfirm={() => {
                    navigate("/login")
                }}
            />
        </>
    )
}