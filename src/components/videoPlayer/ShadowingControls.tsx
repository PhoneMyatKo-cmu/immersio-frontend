import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react"
import type { Caption } from "./CaptionBar"

interface ShadowingControlsProps {
    currentCaption: Caption | null
    isPlaying: boolean
    onPlayPause: () => void
    onPreviousSentence: () => void
    onNextSentence: () => void
    onRepeatSentence: () => void
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
    currentCaption,
    isPlaying,
    onPlayPause,
    onPreviousSentence,
    onNextSentence,
    onRepeatSentence,
}: ShadowingControlsProps) {
    const hasCaption = Boolean(currentCaption)

    return (
        <div className="border-t border-white/5 bg-darkgrey px-4 py-4 text-white">
            <div className="mb-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                    Shadowing sentence
                </p>
                <p className="min-h-12 rounded-md border border-white/8 bg-white/4 px-3 py-2 text-sm leading-relaxed text-white/85">
                    {currentCaption?.text ?? "Waiting for the current caption..."}
                </p>
            </div>

            <div className="flex items-center justify-center gap-2">
                <IconButton
                    label="Previous sentence"
                    onClick={onPreviousSentence}
                    disabled={!hasCaption}
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
                    label="Repeat current sentence"
                    onClick={onRepeatSentence}
                    disabled={!hasCaption}
                >
                    <RotateCcw size={18} />
                </IconButton>

                <IconButton
                    label="Next sentence"
                    onClick={onNextSentence}
                    disabled={!hasCaption}
                >
                    <SkipForward size={18} />
                </IconButton>
            </div>
        </div>
    )
}
