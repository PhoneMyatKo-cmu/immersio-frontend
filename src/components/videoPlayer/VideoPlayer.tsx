import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"

interface VideoPlayerProps {
    videoId:       string
    onTimeUpdate?: (currentTime: number) => void
    onReady?:      () => void
    onEnded?:      () => void
    onPlayingChange?: (isPlaying: boolean) => void
    showControls?: boolean
    enableOverlayClick?: boolean
}

export interface VideoPlayerHandle {
    play: () => void
    pause: () => void
    togglePlay: () => void
    seekTo: (seconds: number) => void
    getCurrentTime: () => number
    isPlaying: () => boolean
}

declare global {
    interface Window {
        YT:                      typeof YT
        onYouTubeIframeAPIReady: () => void
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
    const s = Math.floor(seconds)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    if (h > 0) {
        return `${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
    }
    return `${m}:${String(s % 60).padStart(2, "0")}`
}

// ── Component ─────────────────────────────────────────────────────────────────

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer({
    videoId,
    onTimeUpdate,
    onReady,
    onEnded,
    onPlayingChange,
    showControls: shouldShowControls = true,
    enableOverlayClick = true,
}: VideoPlayerProps, ref) {
    const containerRef   = useRef<HTMLDivElement>(null)
    const playerRef = useRef < YT.Player | null>(null)
    const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null)
    const progressRef    = useRef<HTMLDivElement>(null)
    const isDragging     = useRef(false)

    const [isAPILoaded,  setIsAPILoaded]  = useState(false)
    const [isReady,      setIsReady]      = useState(false)
    const [isPlaying,    setIsPlaying]    = useState(false)
    const [isMuted,      setIsMuted]      = useState(false)
    const [volume,       setVolume]       = useState(100)
    const [currentTime,  setCurrentTime]  = useState(0)
    const [duration,     setDuration]     = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const controlsTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
    const wrapperRef     = useRef<HTMLDivElement>(null)

    // ── Load API ──────────────────────────────────────────────────────────────

    useEffect(() => {
        if (window.YT?.Player) { setIsAPILoaded(true); return }

        if (document.getElementById("yt-api")) {
            const prev = window.onYouTubeIframeAPIReady
            window.onYouTubeIframeAPIReady = () => { prev?.(); setIsAPILoaded(true) }
            return
        }

        window.onYouTubeIframeAPIReady = () => setIsAPILoaded(true)
        const s   = document.createElement("script")
        s.id      = "yt-api"
        s.src     = "https://www.youtube.com/iframe_api"
        s.async   = true
        document.body.appendChild(s)
    }, [])

    // ── Init player ───────────────────────────────────────────────────────────

    useEffect(() => {
        if (!isAPILoaded || !containerRef.current) return

        playerRef.current?.destroy()

        playerRef.current = new window.YT.Player(containerRef.current, {
            videoId,
            width: "100%",     // add
            height:"100%",  
            playerVars: {
                autoplay:       0,
                controls:       0,   // hide YouTube controls — we render our own
                rel:            0,
                modestbranding: 1,
                iv_load_policy: 3,
                cc_load_policy: 0,
                playsinline:    1,
                fs:             0,
                disablekb:      1,   // disable keyboard — we handle it
            },
            events: {
                onReady: (e: any) => {
                    setIsReady(true)
                    setDuration(e.target.getDuration())
                    setVolume(e.target.getVolume())
                    onReady?.()
                },
                onStateChange: (e: any) => {
                    const playing = e.data === 1
                    setIsPlaying(playing)
                    onPlayingChange?.(playing)
                    if (playing) startTracking()
                    else         stopTracking()
                    if (e.data === 0) onEnded?.()
                },
            },
        })

        return () => {
            stopTracking()
            playerRef.current?.destroy()
            playerRef.current = null
            setIsReady(false)
        }
    }, [isAPILoaded, videoId])

    // ── Time tracking ─────────────────────────────────────────────────────────

    const startTracking = useCallback(() => {
        if (intervalRef.current) return
        intervalRef.current = setInterval(() => {
            try {
                const t = playerRef.current?.getCurrentTime() ?? 0
                setCurrentTime(t)
                onTimeUpdate?.(t)
            } catch {
                console.log("Problem accessing current time!")
            }
        }, 100)
    }, [onTimeUpdate])

    const stopTracking = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    }, [])

    // ── Controls auto-hide ────────────────────────────────────────────────────

    const resetControlsTimer = useCallback(() => {
        setShowControls(true)
        if (controlsTimer.current) clearTimeout(controlsTimer.current)
        if (isPlaying) {
            controlsTimer.current = setTimeout(() => setShowControls(false), 3000)
        }
    }, [isPlaying])

    // ── Playback controls ─────────────────────────────────────────────────────

    const togglePlay = useCallback(() => {
        if (!playerRef.current) return
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
    }, [isPlaying])

    const play = useCallback(() => {
        playerRef.current?.playVideo()
    }, [])

    const pause = useCallback(() => {
        playerRef.current?.pauseVideo()
    }, [])

    const toggleMute = useCallback(() => {
        if (!playerRef.current) return
        if (isMuted) { playerRef.current.unMute();  setIsMuted(false) }
        else         { playerRef.current.mute();    setIsMuted(true)  }
    }, [isMuted])

    const handleVolumeChange = useCallback((v: number) => {
        if (!playerRef.current) return
        playerRef.current.setVolume(v)
        setVolume(v)
        if (v === 0) setIsMuted(true)
        else { playerRef.current.unMute(); setIsMuted(false) }
    }, [])

    const seekTo = useCallback((seconds: number) => {
        playerRef.current?.seekTo(seconds, true)
        setCurrentTime(seconds)
    }, [])

    useImperativeHandle(ref, () => ({
        play,
        pause,
        togglePlay,
        seekTo,
        getCurrentTime: () => playerRef.current?.getCurrentTime() ?? currentTime,
        isPlaying: () => isPlaying,
    }), [play, pause, togglePlay, seekTo, currentTime, isPlaying])

    // ── Progress bar interaction ───────────────────────────────────────────────

    const calcSeekTime = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const bar = progressRef.current
        if (!bar) return 0
        const rect = bar.getBoundingClientRect()
        const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        return pct * duration
    }, [duration])

    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        seekTo(calcSeekTime(e))
    }, [calcSeekTime, seekTo])

    const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        isDragging.current = true
        seekTo(calcSeekTime(e))
    }, [calcSeekTime, seekTo])

    useEffect(() => {
        const up = () => { isDragging.current = false }
        const move = (e: MouseEvent) => {
            if (!isDragging.current || !progressRef.current) return
            const rect = progressRef.current.getBoundingClientRect()
            const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            seekTo(pct * duration)
        }
        window.addEventListener("mouseup",   up)
        window.addEventListener("mousemove", move)
        return () => {
            window.removeEventListener("mouseup",   up)
            window.removeEventListener("mousemove", move)
        }
    }, [duration, seekTo])

    // ── Fullscreen ────────────────────────────────────────────────────────────

    const toggleFullscreen = useCallback(async () => {
        if (!wrapperRef.current) return
        if (!document.fullscreenElement) {
            await wrapperRef.current.requestFullscreen()
            setIsFullscreen(true)
        } else {
            await document.exitFullscreen()
            setIsFullscreen(false)
        }
    }, [])

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", handler)
        return () => document.removeEventListener("fullscreenchange", handler)
    }, [])

    // ── Keyboard shortcuts ────────────────────────────────────────────────────

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!isReady) return
            if ((e.target as HTMLElement).tagName === "INPUT") return
            switch (e.code) {
                case "Space":       e.preventDefault(); togglePlay(); break
                case "ArrowLeft":   seekTo(Math.max(0, currentTime - 5));         break
                case "ArrowRight":  seekTo(Math.min(duration, currentTime + 5));  break
                case "KeyM":        toggleMute(); break
                case "KeyF":        toggleFullscreen(); break
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [isReady, togglePlay, toggleMute, toggleFullscreen, seekTo, currentTime, duration])

    // ── Derived values ────────────────────────────────────────────────────────

    const progress    = duration > 0 ? (currentTime / duration) * 100 : 0
    const volumeIcon  = isMuted || volume === 0 ? "🔇" : volume < 50 ? "🔉" : "🔊"
    const playIcon    = isPlaying ? "⏸" : "▶"

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div
            ref={wrapperRef}
            className="relative w-full bg-black select-none overflow-hidden"
            style={{ aspectRatio: "16/9" }}
            onMouseMove={resetControlsTimer}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* IFrame container — clipped to hide YouTube UI overlays */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{
                    // top: "calc(-1 * clamp(16px, 3.5vw, 50px))",
                    // bottom: "calc(-1 * clamp(14px, 3vw, 40px))",
                    left: 0,
                    right: 0,
                      }}
            >
                <div
                    ref={containerRef}
                    style={{
                        // // position: "absolute",
                        // top: "clamp(16px, 3.5vw, 50px)",
                        bottom: "clamp(14px, 3vw, 40px)",
                        left: 0,
                        right: 0,
                    }}
                />
            </div>

            {/* Transparent overlays — block YouTube title/logo clicks */}
            {/* <div className="absolute top-0 left-0 right-0 h-12 z-10 bg-black pointer-events-none" /> */}
            <div className="absolute bottom-0 left-0 right-0 h-20 z-10 pointer-events-none bg-linear-to-t from-black/70 to-transparent" />

            {/* Click to play/pause — centre area only */}
            {enableOverlayClick && (
                <div
                    className="absolute inset-0 z-20 cursor-pointer"
                    style={{ top: "48px", bottom: "48px" }}
                    onClick={togglePlay}
                />
            )}

            {/* Loading state */}
            {!isReady && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90">
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full border-2 border-white/10 border-t-teal animate-spin"
                            style={{ borderTopColor: "#14B8A6" }}
                        />
                        <p className="text-white/40 text-sm tracking-wide">Loading</p>
                    </div>
                </div>
            )}

            {shouldShowControls && (
                <div
                    className="absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300"
                    style={{ opacity: showControls || !isPlaying ? 1 : 0 }}
                >
                    {/* Progress bar */}
                    <div
                        ref={progressRef}
                        className="relative h-1 mx-3 mb-2 cursor-pointer group"
                        style={{ height: "4px" }}
                        onClick={handleProgressClick}
                        onMouseDown={handleProgressMouseDown}
                    >
                        {/* Track */}
                        <div className="absolute inset-0 rounded-full bg-white/20" />
                        {/* Filled */}
                        <div
                            className="absolute inset-y-0 left-0 rounded-full transition-none"
                            style={{ width: `${progress}%`, background: "#14B8A6" }}
                        />
                        {/* Thumb */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `calc(${progress}% - 6px)` }}
                        />
                    </div>

                    {/* Controls row */}
                    <div
                        className="flex items-center gap-3 px-4 py-3 md:py-4"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
                    >
                        {/* Play/pause */}
                        <button
                            onClick={togglePlay}
                            className="text-white text-base leading-none hover:text-teal transition-colors"
                            style={{ color: "white", minWidth: "20px" }}
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {playIcon}
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={toggleMute}
                                className="text-white text-sm leading-none hover:text-teal transition-colors"
                                aria-label="Toggle mute"
                            >
                                {volumeIcon}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={isMuted ? 0 : volume}
                                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                className="w-16 accent-teal"
                                style={{ accentColor: "#14B8A6" }}
                                aria-label="Volume"
                            />
                        </div>

                        {/* Time */}
                        <span className="text-white/60 text-xs tabular-nums ml-1">
                            {formatTime(currentTime)}
                            <span className="text-white/30 mx-1">/</span>
                            {formatTime(duration)}
                        </span>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Speed */}
                        <select
                            onChange={(e) => playerRef.current?.setPlaybackRate(Number(e.target.value))}
                            className="text-xs text-white/60 bg-transparent border-none outline-none cursor-pointer hover:text-white transition-colors"
                            defaultValue={1}
                            aria-label="Playback speed"
                        >
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                                <option key={r} value={r} style={{ background: "#1e2a2a" }}>
                                    {r === 1 ? "1×" : `${r}×`}
                                </option>
                            ))}
                        </select>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="text-white/60 text-sm hover:text-white transition-colors"
                            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                            {isFullscreen ? "⛶" : "⛶"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
})

export default VideoPlayer
