import type { UserStats } from "../../types/admin";

type LevelKey = keyof UserStats["by_level"];

const LEVEL_LABELS: Record<LevelKey, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
};

// Ranked tones — the largest level reads most distinct, fading down the list.
const RANK_TONES = [
    { bar: "bg-teal-400", text: "text-white" },
    { bar: "bg-teal-500/60", text: "text-white/80" },
    { bar: "bg-teal-500/30", text: "text-white/60" },
];

export function LevelBreakdownCard({ byLevel }: { byLevel: UserStats["by_level"] }) {
    // Sort levels by count, most users first.
    const rows = (Object.keys(byLevel) as LevelKey[])
        .map((key) => ({ key, count: byLevel[key] }))
        .sort((a, b) => b.count - a.count);

    const max = Math.max(1, ...rows.map((r) => r.count));

    return (
        <div className="col-span-2 rounded-xl border border-white/10 bg-[#0a1628] p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-white/40">
                Learners by level
            </div>
            <div className="mt-3 space-y-2.5">
                {rows.map((row, i) => {
                    const tone = RANK_TONES[Math.min(i, RANK_TONES.length - 1)];
                    return (
                        <div key={row.key}>
                            <div className="mb-1 flex items-baseline justify-between">
                                <span className={`text-sm font-medium ${tone.text}`}>
                                    {LEVEL_LABELS[row.key]}
                                </span>
                                <span className={`text-sm font-bold tabular-nums ${tone.text}`}>
                                    {row.count}
                                </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                <div
                                    className={`h-full rounded-full ${tone.bar} transition-all`}
                                    style={{ width: `${(row.count / max) * 100}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
