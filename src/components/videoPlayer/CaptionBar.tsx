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

    // Font size is intentionally NOT transitioned: the auto-scroll measures line heights
    // right after render, so heights must already be final (an animating font-size would
    // make the current caption land off-centre).
    return (
        <div
            className={`
                transition-[opacity,transform,color] duration-150 ease-out
                flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1
                px-2 md:px-4 py-1 text-center font-japanese leading-relaxed
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
                                ? `cursor-pointer rounded-sm transition-all duration-150
       hover:text-teal-200 hover:bg-teal-500/20 active:text-teal-200 active:bg-teal-500/25
       after:absolute after:bottom-0 after:left-0 after:right-0
       after:h-px after:bg-teal-300/70 after:scale-x-0
       hover:after:scale-x-100 after:transition-transform after:duration-150
       pointer-coarse:after:scale-x-100 pointer-coarse:after:left-0.5 pointer-coarse:after:right-0.5
       pointer-coarse:after:-bottom-0.5 pointer-coarse:after:h-0.5 pointer-coarse:after:rounded-full
       pointer-coarse:after:bg-teal-400/60`
                            
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
    // Auto-scroll is paused while the user is interacting with the list:
    // - mouse: for as long as the pointer is over the captions
    // - touch: briefly after a touch/scroll (touch has no reliable "leave" event,
    //   so a hover-style flag would get stuck and freeze auto-scroll)
    const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false)
    const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const TOUCH_RESUME_MS = 3000

    const pauseAutoScroll = (resumeAfterMs?: number) => {
        setIsAutoScrollPaused(true)
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
        resumeTimerRef.current = resumeAfterMs
            ? setTimeout(() => setIsAutoScrollPaused(false), resumeAfterMs)
            : null
    }

    const resumeAutoScroll = () => {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
        resumeTimerRef.current = null
        setIsAutoScrollPaused(false)
    }

    useEffect(() => () => {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }, [])

    // Scroll current caption into centre. Scrolls only this list (scrollIntoView would
    // also scroll every scrollable ancestor, nudging the whole page on mobile).
    useEffect(() => {
        if (isAutoScrollPaused) return
        if (currentIndex === null) return

        const container = containerRef.current
        const currentEl = lineRefs.current[currentIndex]
        if (!currentEl || !container) return

        const top = currentEl.offsetTop - (container.clientHeight - currentEl.offsetHeight) / 2
        container.scrollTo({ top, behavior: "smooth" })
    }, [currentIndex, isAutoScrollPaused])

    if (!sortedCaptions.length) {
        return (
            <div className="h-32 flex items-center justify-center">
                <p className="text-white/30 text-sm">No captions available</p>
            </div>
        )
    }

    return (
        <div
            // Taller on mobile: captions wrap to 2–3 lines on narrow screens
            className="relative shrink-0 h-[208px] md:h-[160px] bg-darkgrey/95 border-t border-white/5"
            onPointerEnter={(e) => { if (e.pointerType === "mouse") pauseAutoScroll() }}
            onPointerLeave={(e) => { if (e.pointerType === "mouse") resumeAutoScroll() }}
            onTouchStart={() => pauseAutoScroll()}
            onTouchEnd={() => pauseAutoScroll(TOUCH_RESUME_MS)}
            onTouchCancel={() => pauseAutoScroll(TOUCH_RESUME_MS)}
        >
            {/* Top fade */}
            <div
                className="absolute top-0 left-0 right-0 z-10 pointer-events-none h-6 md:h-10"
                style={{
                    background: "linear-gradient(to bottom, var(--color-darkgrey, #0f172a), transparent)"
                }}
            />

            {/* Bottom fade */}
            <div
                className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none h-6 md:h-10"
                style={{
                    background: "linear-gradient(to top, var(--color-darkgrey, #0f172a), transparent)"
                }}
            />

            {/* Scrollable caption list (relative → line offsetTop is measured against it) */}
            <div
                ref={containerRef}
                className="relative h-full overflow-y-auto scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {/* Top padding (half the viewport) so the first caption can scroll to centre */}
                <div className="h-1/2" />

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

                    // The highlight lives on the current line itself, so it always wraps
                    // the caption no matter how many lines it breaks into.
                    return (
                        <div
                            key={caption.index}
                            ref={(el) => { lineRefs.current[i] = el }}
                            className={`border-y py-0.5 transition-colors duration-150 ${
                                position === 0
                                    ? "border-teal-500/15 bg-teal-500/[0.05]"
                                    : "border-transparent"
                            }`}
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
                <div className="h-1/2" />
            </div>
        </div>
    )
}
