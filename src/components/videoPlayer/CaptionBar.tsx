import { useEffect, useMemo, useRef, useState } from "react"

interface Token {
    surface:         string
    base_form:       string
    reading:         string
    is_content_word: boolean
    is_foreign:      boolean
    jlpt_tier:       string | null
}

export interface Caption {
    id:number
    index: number
    text:           string
    start_time:     number
    end_time:       number
    tokens:         Token[]
}

interface CaptionBarProps {
    captions:    Caption[]
    currentTime: number
    onWordClick: (token: Token,  caption: Caption | null) => void
}

// JLPT tier colours for subtle word highlighting
// const TIER_COLORS: Record<string, string> = {
//     N5: "text-green-400",
//     N4: "text-blue-400",
//     N3: "text-yellow-400",
//     N2: "text-orange-400",
//     N1: "text-red-400",
// }

function getCurrentIndex(captions: Caption[], currentTime: number): number | null {
    if (!captions.length || !Number.isFinite(currentTime)) return null
    if (currentTime < captions[0].start_time) return null

    for (let i = 0; i < captions.length; i++) {
        if (currentTime >= captions[i].start_time && currentTime < captions[i].end_time) {
            return i
        }
    }

    // Between captions — find the next upcoming one
    for (let i = 0; i < captions.length; i++) {
        if (captions[i].start_time > currentTime) {
            return Math.max(0, i - 1)
        }
    }
    return captions.length - 1
}

function CaptionLine({
    caption,
    position,   // -2, -1, 0, 1, 2 relative to current
    onWordClick,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentTime,
}: {
    caption:     Caption
    position:    number
        onWordClick: (token: Token, caption: Caption | null
        
    ) => void
    currentTime: number
}) {
    const isCurrent  = position === 0
    const isAdjacent = Math.abs(position) === 1
    // const isDistant  = Math.abs(position) === 2

    const opacity = isCurrent
        ? "opacity-100"
        : isAdjacent
            ? "opacity-40"
            : "opacity-15"

    const scale = isCurrent
        ? "scale-100"
        : isAdjacent
            ? "scale-95"
            : "scale-90"

    const fontSize = isCurrent
        ? "text-lg sm:text-xl"
        : isAdjacent
            ? "text-base sm:text-lg"
            : "text-sm sm:text-base"

    return (
        <div
            className={`
                transition-all duration-150 ease-out
                flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1
                px-4 py-1 text-center font-japanese leading-relaxed
                ${opacity} ${scale} ${fontSize}
                ${isCurrent ? "text-white" : "text-white/70"}
            `}
        >
            {caption.tokens.map((token, i) => {
                if (!token.is_content_word ) {
                    return (
                        <span key={i} className="select-text">
                            {token.surface}
                        </span>
                    )
                }

                // const tierColor = token.jlpt_tier
                //     ? TIER_COLORS[token.jlpt_tier] ?? ""
                //     : ""

                return (
                    <span
                        key={i}
                        onClick={isCurrent
                            ? () => onWordClick(token, caption)
                            : undefined
                        }
                        className={`
                            relative select-text
                            ${isCurrent
                                ? `cursor-pointer transition-all duration-150
       hover:text-teal-200 hover:bg-teal-500/20
       after:absolute after:bottom-0 after:left-0 after:right-0
       after:h-px after:bg-teal-300/70 after:scale-x-0
       hover:after:scale-x-100 after:transition-transform after:duration-150`
                            
                                : ""
                            }
                        `}
                        style={{ color: isCurrent  ? undefined : undefined }}
                    >
                        {token.surface}
                    </span>
                )
            })}
        </div>
    )
}

export default function CaptionBar({
    captions,
    currentTime,
    onWordClick,
}: CaptionBarProps) {
    const sortedCaptions = useMemo(
        () => [...captions].sort((a, b) => a.start_time - b.start_time),
        [captions]
    )
    const currentIndex    = getCurrentIndex(sortedCaptions, currentTime)
    const containerRef    = useRef<HTMLDivElement>(null)
    const lineRefs        = useRef<(HTMLDivElement | null)[]>([])
    const [isHovered, setIsHovered] = useState(false)

    // Scroll current caption into centre
    useEffect(() => {
        if (isHovered) return
        if (currentIndex === null) return

        const currentEl = lineRefs.current[currentIndex]
        if (!currentEl || !containerRef.current) return

        currentEl.scrollIntoView({
            behavior: "auto",
            block:    "center",
            inline:   "nearest",
        })
    }, [currentIndex, isHovered])

    if (!sortedCaptions.length) {
        return (
            <div className="h-32 flex items-center justify-center">
                <p className="text-white/30 text-sm">No captions available</p>
            </div>
        )
    }

    return (
        <div
            className="relative shrink-0 bg-darkgrey/95 border-t border-white/5"
            style={{ height: "160px" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Top fade */}
            <div
                className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
                style={{
                    height:     "40px",
                    background: "linear-gradient(to bottom, var(--color-darkgrey, #0f172a), transparent)"
                }}
            />

            {/* Bottom fade */}
            <div
                className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
                style={{
                    height:     "40px",
                    background: "linear-gradient(to top, var(--color-darkgrey, #0f172a), transparent)"
                }}
            />

            {/* Current line indicator — centre line */}
            <div
                className="absolute left-0 right-0 z-0 pointer-events-none"
                style={{
                    top:       "50%",
                    transform: "translateY(-50%)",
                    height:    "44px",
                    background: "rgba(20, 184, 166, 0.04)",
                    borderTop:    "1px solid rgba(20, 184, 166, 0.12)",
                    borderBottom: "1px solid rgba(20, 184, 166, 0.12)",
                }}
            />

            {/* Scrollable caption list */}
            <div
                ref={containerRef}
                className="h-full overflow-y-auto scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {/* Top padding so first caption can scroll to centre */}
                <div style={{ height: "60px" }} />

                {sortedCaptions.map((caption, i) => {
                    const position = currentIndex === null ? i + 1 : i - currentIndex

                    // Only render captions near current for performance
                    if (Math.abs(position) > 5) {
                        return (
                            <div
                                key={caption.index}
                                ref={(el) => { lineRefs.current[i] = el }}
                                style={{ height: "40px" }}
                            />
                        )
                    }

                    return (
                        <div
                            key={caption.index}
                            ref={(el) => { lineRefs.current[i] = el }}
                        >
                            <CaptionLine
                                caption={caption}
                                position={position}
                                onWordClick={onWordClick}
                                currentTime={currentTime}
                            />
                        </div>
                    )
                })}

                {/* Bottom padding so last caption can scroll to centre */}
                <div style={{ height: "60px" }} />
            </div>
        </div>
    )
}
