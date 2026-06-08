import { Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { getCaptionText } from "../../utils/captions"
import type { Caption } from "./CaptionBar"
import type { ShadowingSentence } from "../../types/shadowing"

interface ShadowingControlsProps {
    currentSentence: Caption | ShadowingSentence | null
    isPlaying: boolean
    onPlayPause: () => void
    onPreviousSentence: () => void
    onNextSentence: () => void
    currentSentenceIndex: number
    totalSentences: number
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

export default function ShadowingControls({
    currentSentence,
    isPlaying,
    onPlayPause,
    onPreviousSentence,
    onNextSentence,
    currentSentenceIndex,
    totalSentences,
}: ShadowingControlsProps) {
    const hasSentence = Boolean(currentSentence)

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
                <p className="min-h-12 rounded-md border border-white/8 bg-white/4 px-3 py-2 text-lg text-teal-500 text-center leading-relaxed tracking-widest ">
                    {getSentenceText(currentSentence) || "Waiting for the current sentence..."}
                </p>
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
