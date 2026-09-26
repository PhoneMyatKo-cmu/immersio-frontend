import type { RecommendationDifficulty } from "../../types/recommendation";

export function formatDuration(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m % 60)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}

export const difficultyLabel: Record<RecommendationDifficulty, string> = {
    best_fit: "Just right for you",
    stretch: "A stretch",
    comfortable: "Comfortable",
    too_advanced: "Too advanced",
};

// Teal when comfortably understandable, amber when it's more of a stretch.
export function comprehensionColor(percent: number): string {
    return percent >= 80 ? "#13b7a5" : "#ef9f27";
}
