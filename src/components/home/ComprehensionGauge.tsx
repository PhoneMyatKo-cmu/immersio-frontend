import { useEffect, useState } from "react";
import { comprehensionColor } from "./recHelpers";

interface ComprehensionGaugeProps {
    percent: number;
    label?: string;
    size?: number;
}

// A radial "how much you'll understand" meter — the signature of the recommendation feed.
export function ComprehensionGauge({ percent, label = "you'll get", size = 76 }: ComprehensionGaugeProps) {
    const pct = Math.max(0, Math.min(100, Math.round(percent)));
    const stroke = 7;
    const r = (size - stroke) / 2 - 1;
    const circumference = 2 * Math.PI * r;
    const color = comprehensionColor(pct);
    const center = size / 2;

    // Start empty, then animate the arc to its target once mounted.
    const [offset, setOffset] = useState(circumference);
    useEffect(() => {
        const id = requestAnimationFrame(() => setOffset(circumference * (1 - pct / 100)));
        return () => cancelAnimationFrame(id);
    }, [circumference, pct]);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}% understandable`}>
            <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${center} ${center})`}
                style={{ transition: "stroke-dashoffset 1s ease" }}
            />
            <text x={center} y={center - 1} textAnchor="middle" fill="#F5F1E8" fontWeight={700} fontSize={size * 0.26}>
                {pct}%
            </text>
            <text x={center} y={center + size * 0.17} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={size * 0.115}>
                {label}
            </text>
        </svg>
    );
}
