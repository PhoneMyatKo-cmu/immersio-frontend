import { Sparkles } from "lucide-react";
import type { EstimatedLevel } from "../../types/user";

const levelLabels: Record<EstimatedLevel, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
};

interface LevelChipProps {
    level: EstimatedLevel;
}

// Read-only: reflects the level the backend scored against. There is no endpoint
// to change it from here, so no edit affordance.
export function LevelChip({ level }: LevelChipProps) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 px-3 py-1.5 text-sm text-teal-300">
            <Sparkles size={14} />
            Recommendations tuned for: <span className="font-semibold">{levelLabels[level]}</span>
        </span>
    );
}
