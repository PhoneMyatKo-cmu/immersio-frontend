import { useMemo } from "react";

interface PitchContourProps {
    referencePitch: number[]
    userPitch: number[]
}

const W = 700, H = 170, PAD = 14, SMOOTH = 10

// keep voiced frames, smooth, center on the speaker's own mean
function clean(raw: number[]): { x: number; y: number }[] {
    const voiced = raw.map((v, i) => ({ v, i })).filter(p => Number.isFinite(p.v) && p.v >= 0)
    if (!voiced.length) return []
    const mean = voiced.reduce((s, p) => s + p.v, 0) / voiced.length
    const maxIdx = raw.length - 1 || 1
    return voiced.map((p, k) => {
        let sum = 0, n = 0
        for (let j = Math.max(0, k - SMOOTH); j <= Math.min(voiced.length - 1, k + SMOOTH); j++) {
            sum += voiced[j].v; n++
        }
        return { x: p.i / maxIdx, y: sum / n - mean }   // centered = relative shape
    })
}

export default function PitchContour({ referencePitch, userPitch }: PitchContourProps) {
    const { refPts, userPts, yMin, yMax } = useMemo(() => {
        const refPts = clean(referencePitch)
        const userPts = clean(userPitch)
        const ys = [...refPts, ...userPts].map(p => p.y)
        return { refPts, userPts, yMin: Math.min(...ys, -1), yMax: Math.max(...ys, 1) }
    }, [referencePitch, userPitch])

    const path = (pts: { x: number; y: number }[]) => {
        if (!pts.length) return ""
        const sx = (x: number) => PAD + x * (W - 2 * PAD)
        const sy = (y: number) => H - PAD - ((y - yMin) / (yMax - yMin || 1)) * (H - 2 * PAD)
        return pts.map((p, i) => `${i ? "L" : "M"} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ")
    }

    return (
        <div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke="rgba(255,255,255,0.07)" />
                <path d={path(refPts)} fill="none" stroke="#14B8A6" strokeWidth={2.5}
                      strokeLinejoin="round" strokeLinecap="round" />
                <path d={path(userPts)} fill="none" stroke="#f87171" strokeWidth={2.5}
                      strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <div className="mt-2 flex gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-teal-500" />Reference</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-red-400" />You</span>
            </div>
        </div>
    )
}