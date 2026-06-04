import { AlertCircle, Loader2, Mic, Play, RotateCcw, Square } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

type RecorderState =
    | "idle"
    | "requesting"
    | "recording"
    | "processing"
    | "done"
    | "error"

export interface ShadowingRecorderProps {
    /**
     * Identity of the current sentence (e.g. the caption index or id).
     * When this changes, the recorder fully resets and discards any take.
     */
    captionKey: string | number
    /**
     * Hand the recorded audio to the parent for scoring.
     * Resolve with whatever your scoring API returns.
     */
    submitRecording: (audio: Blob) => Promise<unknown>
    /** Fired the instant scoring begins — open / set-loading on the feedback panel here. */
    onScoringStart?: () => void
    /** Fired with the scoring result — populate the feedback panel here. */
    onScoringComplete?: (result: unknown) => void
    /** Fired on mic-permission or scoring failure. */
    onError?: (error: unknown) => void
    /** Disable while the model audio is mid-playback, etc. */
    disabled?: boolean
    /** Safety cap — auto-stops the take after this many ms. Default 15s. */
    maxDurationMs?: number
}

const NUM_BARS = 5
const METER_THROTTLE_MS = 80

export default function ShadowingRecorder({
    captionKey,
    submitRecording,
    onScoringStart,
    onScoringComplete,
    onError,
    disabled = false,
    maxDurationMs = 15000,
}: ShadowingRecorderProps) {
    const [state, setState] = useState<RecorderState>("idle")
    const [elapsedMs, setElapsedMs] = useState(0)
    const [levels, setLevels] = useState<number[]>(() => Array(NUM_BARS).fill(0))
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const audioCtxRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const rafRef = useRef<number | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const startedAtRef = useRef<number>(0)
    const recordedUrlRef = useRef<string | null>(null)

    // ── teardown helpers ──────────────────────────────────────────────────────

    const stopMeter = useCallback(() => {
        if (rafRef.current != null) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {})
            audioCtxRef.current = null
        }
        analyserRef.current = null
    }, [])

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const releaseStream = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
    }, [])

    const teardown = useCallback(() => {
        stopMeter()
        stopTimer()
        releaseStream()
        mediaRecorderRef.current = null
    }, [stopMeter, stopTimer, releaseStream])

    // ── reset whenever the sentence changes ────────────────────────────────────

    useEffect(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            try { mediaRecorderRef.current.stop() } catch { /* noop */ }
        }
        teardown()
        chunksRef.current = []
        if (recordedUrlRef.current) {
            URL.revokeObjectURL(recordedUrlRef.current)
            recordedUrlRef.current = null
        }
        setState("idle")
        setElapsedMs(0)
        setLevels(Array(NUM_BARS).fill(0))
        setErrorMsg(null)
        // captionKey is the only trigger; helpers are stable.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [captionKey])

    // ── cleanup on unmount ──────────────────────────────────────────────────────

    useEffect(
        () => () => {
            teardown()
            if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current)
        },
        [teardown]
    )

    // ── live level meter (throttled to ~12fps to limit re-renders) ──────────────

    const runMeter = useCallback(() => {
        const analyser = analyserRef.current
        if (!analyser) return
        const data = new Uint8Array(analyser.frequencyBinCount)
        const band = Math.floor(data.length / NUM_BARS)
        let lastUpdate = 0

        const tick = (now: number) => {
            if (now - lastUpdate >= METER_THROTTLE_MS) {
                analyser.getByteFrequencyData(data)
                const next: number[] = []
                for (let i = 0; i < NUM_BARS; i++) {
                    let sum = 0
                    for (let j = 0; j < band; j++) sum += data[i * band + j]
                    next.push(Math.min(1, sum / band / 180))
                }
                setLevels(next)
                lastUpdate = now
            }
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
    }, [])

    // ── stop / finalize ─────────────────────────────────────────────────────────

    const stopRecording = useCallback(() => {
        const mr = mediaRecorderRef.current
        if (mr && mr.state !== "inactive") {
            try { mr.stop() } catch { /* noop */ }
        }
    }, [])

    const finalize = useCallback(async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        chunksRef.current = []
        if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current)
        recordedUrlRef.current = URL.createObjectURL(blob)

        setState("processing")
        onScoringStart?.()
        try {
            const result = await submitRecording(blob)
            onScoringComplete?.(result)
            setState("done")
        } catch (err) {
            setErrorMsg("Scoring failed. Try again.")
            setState("error")
            onError?.(err)
        }
    }, [submitRecording, onScoringStart, onScoringComplete, onError])

    // ── start ─────────────────────────────────────────────────────────────────

    const startRecording = useCallback(async () => {
        setErrorMsg(null)
        setState("requesting")
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            const Ctx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
            const ctx = new Ctx()
            audioCtxRef.current = ctx
            const source = ctx.createMediaStreamSource(stream)
            const analyser = ctx.createAnalyser()
            analyser.fftSize = 256
            source.connect(analyser)
            analyserRef.current = analyser

            const mr = new MediaRecorder(stream)
            mediaRecorderRef.current = mr
            chunksRef.current = []
            mr.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }
            mr.onstop = () => {
                stopMeter()
                stopTimer()
                releaseStream()
                void finalize()
            }
            mr.start()

            startedAtRef.current = Date.now()
            setElapsedMs(0)
            timerRef.current = setInterval(() => {
                const ms = Date.now() - startedAtRef.current
                setElapsedMs(ms)
                if (ms >= maxDurationMs) stopRecording()
            }, 100)

            setState("recording")
            runMeter()
        } catch (err) {
            releaseStream()
            stopMeter()
            setErrorMsg("Microphone access denied.")
            setState("error")
            onError?.(err)
        }
    }, [finalize, maxDurationMs, runMeter, stopMeter, stopTimer, releaseStream, stopRecording, onError])

    // ── playback of the last take ───────────────────────────────────────────────

    const playBack = useCallback(() => {
        if (!recordedUrlRef.current) return
        const audio = new Audio(recordedUrlRef.current)
        audio.play().catch(() => {})
    }, [])

    const fmt = (ms: number) => {
        const total = Math.floor(ms / 1000)
        const m = Math.floor(total / 60)
        const s = total % 60
        return `${m}:${String(s).padStart(2, "0")}`
    }

    // ── render ──────────────────────────────────────────────────────────────────

    // Reserve a stable height so swapping states never shifts the layout.
    return (
        <div className="flex min-h-[44px] items-center justify-center">
            {(state === "idle") && (
                <button
                    type="button"
                    onClick={startRecording}
                    disabled={disabled}
                    aria-label="Start recording"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Mic className="h-4 w-4" />
                    Record
                </button>
            )}

            {state === "requesting" && (
                <div className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 bg-darkgrey px-5 text-sm text-white/70">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Allow mic…
                </div>
            )}

            {state === "recording" && (
                <button
                    type="button"
                    onClick={stopRecording}
                    aria-label="Stop recording"
                    className="inline-flex min-h-[44px] items-center gap-3 rounded-full bg-red-500 px-4 text-sm font-medium text-white transition-colors hover:bg-red-600"
                >
                    <Square className="h-3.5 w-3.5 fill-white" />
                    <span className="tabular-nums">{fmt(elapsedMs)}</span>
                    <span className="flex h-4 items-center gap-0.5" aria-hidden="true">
                        {levels.map((l, i) => (
                            <span
                                key={i}
                                className="w-0.5 rounded-full bg-white/80 transition-[height] duration-75"
                                style={{ height: `${Math.max(15, l * 100)}%` }}
                            />
                        ))}
                    </span>
                </button>
            )}

            {state === "processing" && (
                <div className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 bg-darkgrey px-5 text-sm text-white/70">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scoring…
                </div>
            )}

            {state === "done" && (
                <div className="inline-flex items-center gap-2">
                    <button
                        type="button"
                        onClick={startRecording}
                        disabled={disabled}
                        aria-label="Record again"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 bg-darkgrey px-5 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Re-record
                    </button>
                    <button
                        type="button"
                        onClick={playBack}
                        aria-label="Play your recording"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-darkgrey text-white/70 transition-colors hover:text-teal"
                    >
                        <Play className="h-4 w-4" />
                    </button>
                </div>
            )}

            {state === "error" && (
                <div className="inline-flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {errorMsg}
                    </span>
                    <button
                        type="button"
                        onClick={startRecording}
                        aria-label="Try again"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 bg-darkgrey px-4 text-sm font-medium text-white transition-colors hover:bg-white/5"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Retry
                    </button>
                </div>
            )}
        </div>
    )
}