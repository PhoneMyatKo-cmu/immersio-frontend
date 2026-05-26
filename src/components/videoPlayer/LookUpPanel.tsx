import { useState } from "react"
import PronunciationButton from "../common/PronunciationButton"
import ContextualExplanation from "./ContextualExplanation"

// interface Token {
//     surface:         string
//     base_form:       string
//     reading:         string
//     is_content_word: boolean
//     is_foreign:      boolean
//     jlpt_tier:       string | null
// }

interface Sense {
    pos:      string[]
    meanings: string[]
}

interface ContextSentence{
    id:number
    text: string
    start: number
    end: number 
    sentence_index:number
}

export interface LookupResult {
    vocab_id:number
    surface_form:    string
    pronunciation:         string
    jlpt_tier:       string | null
    meanings:          Sense[]
    context_sentence: ContextSentence
    sentence_translation:string
}

interface LookupPanelProps {
    result:          LookupResult | null
    isLoading:       boolean
    isSaved:         boolean
    onSave:          () => void
    onExplain:       () => void
    onClose:         () => void
}

const JLPT_STYLES: Record<string, { bg: string; text: string }> = {
    N5: { bg: "bg-green-900/40",  text: "text-green-400"  },
    N4: { bg: "bg-blue-900/40",   text: "text-blue-400"   },
    N3: { bg: "bg-yellow-900/40", text: "text-yellow-400" },
    N2: { bg: "bg-orange-900/40", text: "text-orange-400" },
    N1: { bg: "bg-red-900/40",    text: "text-red-400"    },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-1.5">
            {children}
        </p>
    )
}

function Divider() {
    return <div className="border-t border-white/6 my-4" />
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="p-5 space-y-5 animate-pulse">
            {/* Word header */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="h-9 w-32 bg-white/10 rounded-md" />
                    <div className="h-4 w-48 bg-white/6 rounded" />
                </div>
                <div className="h-8 w-16 bg-white/10 rounded-lg" />
            </div>

            <div className="border-t border-white/6" />

            {/* Definition */}
            <div className="space-y-2">
                <div className="h-3 w-20 bg-white/6 rounded" />
                <div className="h-5 w-48 bg-white/10 rounded" />
                <div className="h-5 w-36 bg-white/10 rounded" />
            </div>

            <div className="border-t border-white/6" />

            {/* Sentence */}
            <div className="space-y-2">
                <div className="h-3 w-24 bg-white/6 rounded" />
                <div className="h-16 bg-white/6 rounded-lg" />
            </div>
        </div>
    )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="text-2xl font-japanese text-white/20">字</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
                Click any highlighted word in the captions to look it up
            </p>
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LookupPanel({
    result,
    isLoading,
    isSaved,
    onSave,
    onExplain,
    onClose,
}: LookupPanelProps) {

    const [showAllMeanings, setShowAllMeanings] = useState(false)

    const jlptStyle = result?.jlpt_tier
        ? JLPT_STYLES[result.jlpt_tier]
        : null

    // Flatten all meanings across senses for display
    const allMeanings = result?.meanings.flatMap(s => s.meanings) ?? []
    const displayMeanings = showAllMeanings
        ? allMeanings
        : allMeanings.slice(0, 3)

    // Primary POS from first sense
    const primaryPos = result?.meanings[0]?.pos ?? null
    console.log(primaryPos)
    const tempTranslation=result?.sentence_translation

    return (
        <div className="flex flex-col h-full bg-greygreen">

            {/* ── Header bar ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 shrink-0">
                <span className="text-lg text-white/50 font-medium tracking-wide">
                    Word Lookup
                </span>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto min-h-0">

                {isLoading && <LoadingSkeleton />}

                {!isLoading && !result && <EmptyState />}

                {!isLoading && result && (
                    <div className="p-5">

                        {/* ── Word header ── */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="min-w-0">
                                {/* Surface form — large */}
                                <h2 className="text-3xl font-japanese font-medium text-white leading-none mb-1.5">
                                    {result.surface_form}
                                </h2>

                                 <PronunciationButton
                                    text={result.surface_form}
                                    label={`Pronounce ${result.surface_form}`}
                                 />

                                {/* Reading + base form */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-lg text-white/80 font-japanese">
                                        {result.pronunciation}
                                    </span>
                                    {/* {result.base_form !== result.surface_form && (
                                        <>
                                            <span className="text-white/20">·</span>
                                            <span className="text-xs text-white/40 font-japanese">
                                                {result.base_form}
                                            </span>
                                        </>
                                    )} */}
                                    {primaryPos && (
                                        <>
                                            <span className="text-white/20">·</span>
                                            <span className="text-xs text-white/40 italic">
                                                {primaryPos}    
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right side — JLPT badge + Save */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                {jlptStyle && result.jlpt_tier && (
                                    <span className={`
                                        text-xs font-bold px-2 py-0.5 rounded
                                        ${jlptStyle.bg} ${jlptStyle.text}
                                    `}>
                                        {result.jlpt_tier}
                                    </span>
                                )}
                                <button
                                    onClick={onSave}
                                    disabled={isSaved}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                        text-xs font-medium transition-all duration-200
                                        ${isSaved
                                            ? "bg-teal/20 text-teal cursor-default"
                                            : "bg-teal text-white hover:bg-teal/80 active:scale-95"
                                        }
                                    `}
                                >
                                    {isSaved ? "✓ Saved" : "+ Save"}
                                </button>
                            </div>
                        </div>

                        <Divider />

                        {/* ── Meanings ── */}
                        <div className="mb-4">
                            <SectionLabel>Definition</SectionLabel>

                            {result.meanings.length > 1 ? (
                                // Multiple senses — grouped by POS
                                <div className="space-y-3">
                                    {result.meanings.map((sense, si) => (
                                        <div key={si}>
                                            {sense.pos.length > 0 && (
                                                <p className="text-[10px] text-white/30 italic mb-1">
                                                    {sense.pos}
                                                </p>
                                            )}
                                            <ol className="space-y-0.5">
                                                {sense.meanings
                                                    .slice(0, showAllMeanings ? undefined : 2)
                                                    .map((m, mi) => (
                                                        <li
                                                            key={mi}
                                                            className="text-sm text-white/85 flex gap-2"
                                                        >
                                                            <span className="text-white/25 shrink-0 tabular-nums">
                                                                {mi + 1}.
                                                            </span>
                                                            {m}
                                                        </li>
                                                    ))
                                                }
                                            </ol>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Single sense — flat list
                                <ol className="space-y-1">
                                    {displayMeanings.map((m, i) => (
                                        <li
                                            key={i}
                                            className="text-sm text-white/85 flex gap-2"
                                        >
                                            <span className="text-white/25 shrink-0 tabular-nums">
                                                {i + 1}.
                                            </span>
                                            {m}
                                        </li>
                                    ))}
                                </ol>
                            )}

                            {allMeanings.length > 3 && (
                                <button
                                    onClick={() => setShowAllMeanings(v => !v)}
                                    className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showAllMeanings
                                        ? "Show less"
                                        : `Show complete meanings`
                                    }
                                </button>
                            )}
                        </div>

                        {/* ── Context sentence ── */}
                        {result.context_sentence && (
                            <>
                                <Divider />
                                <div className="mb-4">
                                    <SectionLabel>Context sentence</SectionLabel>
                                    <div className="bg-white/4 rounded-lg px-3 py-2.5 border border-white/6">
                                        {/* Japanese sentence with word highlighted */}
                                        <p className="text-sm font-japanese text-white/90 leading-relaxed mb-2">
                                            {highlightWord(result.context_sentence.text, result.surface_form)}
                                        </p>

                                        {/* Translation */}
                                        {tempTranslation && (
                                            <p className="text-xs text-white/45 leading-relaxed border-t border-white/6 pt-2 mt-1">
                                                {tempTranslation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        <Divider />

                        {/* ── Explain button ── */}
                            {result && (
                                <ContextualExplanation
                                    surfaceForm={result.surface_form}
                                    request={{
                                        vocab_id:         result.vocab_id ?? 0,
                                        sentence_id:      result.context_sentence.id ?? 0,
                                        surface_form:     result.surface_form,
                                        pos:              result.meanings.flatMap(s => s.pos),
                                        meanings:         result.meanings.flatMap(s => s.meanings),
                                        context_sentence: result.context_sentence.text ?? "",
                                    }}
                                />
                            )}

                        {/* Source indicator — subtle */}
                        {result.meanings[0].pos[0]=="web_translate" && (
                            <p className="mt-3 text-center text-[10px] text-white/20">
                                Definition via translation · may be approximate
                            </p>
                        )}

                    </div>
                )}
            </div>
        </div>
    )
}

// ── Highlight matched word in sentence ────────────────────────────────────────

function highlightWord(sentence: string, word: string): React.ReactNode {
    if (!word || !sentence) return sentence

    const parts = sentence.split(word)

    // Word not found — return unchanged
    if (parts.length === 1) return sentence

    return (
        <>
            {parts.map((part, i) => (
                <span key={i}>
                    {part}
                    {i < parts.length - 1 && (
                        <span className="text-teal-500 font-medium">{word}</span>
                    )}
                </span>
            ))}
        </>
    )
}