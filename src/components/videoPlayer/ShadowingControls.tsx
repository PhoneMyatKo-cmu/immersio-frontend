import { Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { useMemo } from "react"
import { getCaptionText } from "../../utils/captions"
import type { Caption } from "./CaptionBar"
import type { ShadowingSentence } from "../../types/shadowing"
import type { RecorderState } from "./ShadowingRecorder"

interface ShadowingControlsProps {
    currentSentence: Caption | ShadowingSentence | null
    isPlaying: boolean
    onPlayPause: () => void
    onPreviousSentence: () => void
    onNextSentence: () => void
    currentSentenceIndex: number
    totalSentences: number
    playbackSpeed: number
    onPlaybackSpeedChange: (speed: number) => void
    /** True while the latest take is being scored — makes the sentence glow. */
    isScoring?: boolean
    /** Recorder phase — drives the karaoke fill while recording. */
    recordingPhase?: RecorderState
    /** Milliseconds of detected speech in the current take. */
    voicedMs?: number
    /** Word-level result of the last take ([surface, isCorrect]) — wrong words turn red. */
    wordResults?: [string, boolean][] | null
}

// Learners' voiced time is shorter than the native sentence window (which includes
// pauses between phrases), so the fill completes at ~80% of it, scaled by practice speed.
const VOICED_SHARE = 0.8

/** For each character: the order of the wrong word it belongs to, or null if fine. */
function wrongCharOrder(chars: string[], words: [string, boolean][]): (number | null)[] {
    const order: (number | null)[] = new Array(chars.length).fill(null)
    let cursor = 0
    let wrongCount = 0
    for (const [surface, isCorrect] of words) {
        const target = Array.from(surface)
        if (!target.length) continue
        // Find this word at or after the cursor (punctuation in the text is skipped over).
        let at = -1
        for (let k = cursor; k + target.length <= chars.length; k++) {
            if (target.every((ch, t) => chars[k + t] === ch)) { at = k; break }
        }
        if (at === -1) continue
        if (!isCorrect) {
            for (let t = 0; t < target.length; t++) order[at + t] = wrongCount
            wrongCount++
        }
        cursor = at + target.length
    }
    return order
}

function getSentenceText(sentence: Caption | ShadowingSentence | null): string {
    if (!sentence) return ""
    // Check if it's a ShadowingSentence (has text property)
    if ('text' in sentence && typeof sentence.text === 'string') {
        return sentence.text
    }
    // Otherwise it's a Caption (has tokens array)
    return getCaptionText(sentence as Caption)
}

function IconButton({
    label,
    onClick,
    disabled,
    children,
}: {
    label: string
    onClick: () => void
    disabled?: boolean
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            disabled={disabled}
            className={`
                flex h-10 w-10 items-center justify-center rounded-md
                border border-white/10 bg-white/5 text-white/75
                transition-colors hover:border-teal/50 hover:bg-teal/15 hover:text-white
                disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/10
                disabled:hover:bg-white/5 disabled:hover:text-white/75
            `}
        >
            {children}
        </button>
    )
}

const speeds = [0.75, 1, 1.25] as const

export default function ShadowingControls({
    currentSentence,
    isPlaying,
    onPlayPause,
    onPreviousSentence,
    onNextSentence,
    currentSentenceIndex,
    totalSentences,
    playbackSpeed,
    onPlaybackSpeedChange,
    isScoring = false,
    recordingPhase = "idle",
    voicedMs = 0,
    wordResults = null,
}: ShadowingControlsProps) {
    const hasSentence = Boolean(currentSentence)

    const text = getSentenceText(currentSentence)
    const chars = useMemo(() => Array.from(text), [text])

    // Karaoke fill: advances only while the learner is audibly speaking.
    const isKaraoke = recordingPhase === "checking" || recordingPhase === "recording"
    const windowMs = currentSentence ? (currentSentence.end_time - currentSentence.start_time) * 1000 : 0
    const expectedVoicedMs = Math.max(600, (windowMs * VOICED_SHARE) / (playbackSpeed || 1))
    const filled = isKaraoke
        ? Math.min(chars.length, Math.floor((voicedMs / expectedVoicedMs) * chars.length))
        : chars.length

    // Red words only once the new score is in (not during a fresh take / while scoring).
    const showResults = recordingPhase === "done" && Boolean(wordResults?.length)
    const wrongOrder = useMemo(
        () => (showResults && wordResults ? wrongCharOrder(chars, wordResults) : null),
        [showResults, wordResults, chars],
    )
    const useCharSpans = isKaraoke || Boolean(wrongOrder)

    return (
        <div className="border-t border-white/5 bg-darkgrey px-4 py-4 text-white">
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                        Shadowing sentence
                    </p>
                    <p className="text-xs font-medium text-teal-400">
                        {currentSentenceIndex + 1}/{totalSentences}
                    </p>
                </div>
                <p className={`relative min-h-12 overflow-hidden rounded-md border px-3 py-2 text-lg text-teal-500 text-center leading-relaxed tracking-widest transition-[border-color,box-shadow] duration-300 ${
                    isScoring
                        ? "border-teal-500/40 bg-white/4 shadow-[0_0_24px_-8px_rgba(20,184,166,0.6)]"
                        : "border-white/8 bg-white/4"
                }`}>
                    {!text ? (
                        "Waiting for the current sentence..."
                    ) : !useCharSpans ? (
                        text
                    ) : (
                        <>
                            <span className="sr-only">{text}</span>
                            <span aria-hidden="true">
                                {chars.map((ch, i) => {
                                    const wrong = wrongOrder?.[i]
                                    if (wrong != null) {
                                        return (
                                            <span
                                                key={i}
                                                className="inline-block text-red-400 underline decoration-red-400/60 decoration-2 underline-offset-4 transition-colors duration-200 motion-safe:animate-shake-x"
                                                style={{ animationDelay: `${wrong * 90}ms` }}
                                            >
                                                {ch}
                                            </span>
                                        )
                                    }
                                    const lit = i < filled
                                    return (
                                        <span
                                            key={i}
                                            className={`transition-colors duration-150 ${
                                                isKaraoke
                                                    ? lit
                                                        ? `text-teal-100 ${i === filled - 1 ? "drop-shadow-[0_0_6px_rgba(94,234,212,0.8)]" : ""}`
                                                        : "text-teal-500/25"
                                                    : ""
                                            }`}
                                        >
                                            {ch}
                                        </span>
                                    )
                                })}
                            </span>
                        </>
                    )}
                    {/* While scoring: a light sweep across the sentence being analysed */}
                    {isScoring && (
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-teal-300/15 to-transparent motion-safe:animate-scoring-sweep motion-reduce:hidden"
                        />
                    )}
                </p>
            </div>

            {/* Playback speed */}
            <div className="flex items-center justify-center gap-1 mb-3">
                {speeds.map((speed) => (
                    <button
                        key={speed}
                        type="button"
                        onClick={() => onPlaybackSpeedChange(speed)}
                        className={`
                            px-3 py-1 rounded text-xs font-medium transition-all
                            ${playbackSpeed === speed
                                ? 'bg-teal-500 text-white'
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                            }
                        `}
                    >
                        {speed}x
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-center gap-2">
                <IconButton
                    label="Previous sentence"
                    onClick={onPreviousSentence}
                    disabled={!hasSentence}
                >
                    <SkipBack size={18} />
                </IconButton>

                <IconButton
                    label={isPlaying ? "Pause" : "Play"}
                    onClick={onPlayPause}
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </IconButton>

                <IconButton
                    label="Next sentence"
                    onClick={onNextSentence}
                    disabled={!hasSentence}
                >
                    <SkipForward size={18} />
                </IconButton>
            </div>
        </div>
    )
}
