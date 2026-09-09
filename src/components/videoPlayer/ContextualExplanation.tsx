import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { vocabApi } from "../../api/vocab_context"
import type { ContextResponse, ContextualExplanationProps, ExampleSentence } from "../../types/vocabContext"
import { Modal } from "../common/Modal"



// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
            {children}
        </p>
    )
}

function ExampleCard({
    example,
    surfaceForm,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index,
}: {
    example:     ExampleSentence
    surfaceForm: string
    index:       number
}) {
    // Highlight the target word in the example sentence
    const parts = example.japanese.split(surfaceForm)
    const hasHighlight = parts.length > 1

    return (
        <div className="bg-white/4 rounded-lg px-3 py-2.5 border border-white/6">
            <p className="text-sm font-japanese text-white/90 leading-relaxed mb-1">
                {hasHighlight
                    ? parts.map((part, i) => (
                        <span key={i}>
                            {part}
                            {i < parts.length - 1 && (
                                <span className="text-teal-500 font-medium">
                                    {surfaceForm}
                                </span>
                            )}
                        </span>
                    ))
                    : example.japanese
                }
            </p>
            {/* {example.reading && (
                <p className="text-[11px] text-white/35 font-japanese mb-1">
                    {example.reading}
                </p>
            )} */}
            <p className="text-xs text-white/45 leading-relaxed border-t border-white/6 pt-1.5 mt-1">
                {example.english}
            </p>
        </div>
    )
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
    const styles = {
        high:   "bg-green-900/30 text-green-400 border-green-500/20",
        medium: "bg-yellow-900/30 text-yellow-400 border-yellow-500/20",
        low:    "bg-red-900/30 text-red-400 border-red-500/20",
    }
    const labels = {
        high:   "High confidence",
        medium: "Medium confidence",
        low:    "Low confidence",
    }

    const style = styles[confidence as keyof typeof styles] ?? styles.medium
    const label = labels[confidence as keyof typeof labels] ?? confidence

    return (
        <span className={`
            text-[10px] px-2 py-0.5 rounded border font-medium
            ${style}
        `}>
            {label}
        </span>
    )
}

function LoadingState() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="h-3 w-28 bg-white/6 rounded" />
            <div className="space-y-2">
                <div className="h-4 bg-white/8 rounded w-full" />
                <div className="h-4 bg-white/8 rounded w-4/5" />
                <div className="h-4 bg-white/8 rounded w-3/5" />
            </div>
            <div className="h-3 w-24 bg-white/6 rounded mt-4" />
            <div className="h-16 bg-white/4 rounded-lg border border-white/6" />
            <div className="h-16 bg-white/4 rounded-lg border border-white/6" />
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ContextualExplanation({
    request,
    surfaceForm,
}: ContextualExplanationProps) {
    const [data,      setData]      = useState<ContextResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error,     setError]     = useState<string | null>(null)
    const [hasFetched, setHasFetched] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    async function handleFetch() {
        if (hasFetched || isLoading) return

        setIsLoading(true)
        setError(null)

        vocabApi.getContextualExplanation(request).then(response => {
            setData(response.data)
            setHasFetched(true)
        }).catch(e => {
            const status = e?.response?.status

            if (status === 401) {
                setIsModalOpen(true)
                setError("Please log in to use this feature.")
                return
            }

            setError(
                status === 503
                    ? "AI explanation is temporarily unavailable. Please try again later."
                    : "Something went wrong. Please try again."
            )
        }).finally(() => {
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
                    <p className="text-sm text-white/40 leading-relaxed">
                        {error}
                    </p>
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
                Explain in context
            </button>
        )
    } else if (data) {
        content = (
            <div className="border-t border-white/6 pt-4 space-y-4">

            {/* ── Contextual explanation ── */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <SectionLabel>Contextual explanation</SectionLabel>
                    <ConfidenceBadge confidence={data.confidence} />
                </div>

                {/* Dictionary mismatch warning */}
                {data.dictionary_mismatche_detected && (
                    <div className="mb-2 px-3 py-2 bg-amber-900/20 border border-amber-500/20 rounded-lg">
                        <p className="text-[11px] text-amber-400/80 leading-relaxed">
                            The dictionary meaning may not match this context —
                            the explanation below is based on contextual usage.
                        </p>
                    </div>
                )}

                <p className="text-sm text-white/75 leading-relaxed">
                    {data.explanation}
                </p>
            </div>

            {/* ── Example sentences ── */}
            {data.examples.length > 0 && (
                <div>
                    <SectionLabel>Example sentences</SectionLabel>
                    <div className="space-y-2">
                        {data.examples.map((ex, i) => (
                            <ExampleCard
                                key={i}
                                example={ex}
                                surfaceForm={surfaceForm}
                                index={i}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Low confidence note */}
            {data.confidence === "low" && (
                <p className="text-[10px] text-white/25 text-center leading-relaxed">
                    This word may have been incorrectly analysed.
                    Use the explanation as a guide only.
                </p>
            )}
            </div>
        )
    }

    return (
        <>
            {content}
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
