import { Volume2, VolumeX } from "lucide-react"
import { useSpeech } from "../../hooks/useSpeech"

interface PronunciationButtonProps {
    text:      string   // what to speak — surface form or reading
    size?:     "sm" | "md"
    label?:    string   // accessible label
}

export default function PronunciationButton({
    text,
    size  = "md",
    label = "Play pronunciation",
}: PronunciationButtonProps) {
    const { speak, stop, isSpeaking, isSupported } = useSpeech({
        lang: "ja-JP",
        rate: 0.75,  // slightly slower than natural — clearer for learners
    })

    if (!isSupported) return null

    const sizeClasses = size === "sm"
        ? "w-6 h-6 text-xs min-w-[44px] min-h-[44px]"
        : "w-7 h-7 text-sm min-w-[44px] min-h-[44px]"

    return (
        <button
            onClick={() => isSpeaking ? stop() : speak(text)}
            className={`
                ${sizeClasses}
                flex items-center justify-center rounded-full
                border border-white/15 text-white/50
                hover:text-white hover:border-white/30
                transition-all duration-150
                ${isSpeaking
                    ? "bg-teal/20 border-teal/40 text-teal animate-pulse"
                    : "bg-white/5"
                }
            `}
            aria-label={label}
            title={label}
        >
            {isSpeaking ? <VolumeX size={size === "sm" ? 12 : 14} /> : <Volume2 size={size === "sm" ? 12 : 14} />}
        </button>
    )
}