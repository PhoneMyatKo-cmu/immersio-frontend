import { Sparkles } from "lucide-react";
import type { RecommendationSection } from "../../types/recommendation";
import type { EstimatedLevel } from "../../types/user";
import { RankedPickRow } from "./RankedPickRow";
import { RecommendedHeroCard } from "./RecommendedHeroCard";

interface RecommendedFeedProps {
    sections: RecommendationSection[];
    // When true, cards show a rough "may know %" estimate instead of comprehension stats.
    isColdStart?: boolean;
    isAuthenticated?: boolean;
    level?: EstimatedLevel;
}

const levelLabel: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
};

function EmptyState({ message, hint }: { message: string; hint?: string }) {
    return (
        <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <span className="text-3xl text-white/20">✨</span>
            </div>
            <p className="mb-1 text-base font-medium text-white/60">{message}</p>
            {hint && <p className="text-sm text-white/40">{hint}</p>}
        </div>
    );
}

export function RecommendedFeed({ sections, isColdStart = false, isAuthenticated, level }: RecommendedFeedProps) {
    if (!isAuthenticated) {
        return <EmptyState message="Log in and start watching videos to get personalized picks" />;
    }

    // The ranked "for you" list. Difficulty-filtered rows are intentionally not shown.
    const primary = sections.find((s) => s.key === "top_picks") ?? sections[0];
    const items = primary?.items ?? [];

    if (items.length === 0) {
        return (
            <EmptyState
                message="Start watching videos to get personalized picks"
                hint="As you watch and save words, we'll recommend videos tuned to you."
            />
        );
    }

    const [hero, ...rest] = items;

    return (
        <div className="mt-5 pb-8">
            {isColdStart && level && (
                <div className="mb-4 flex justify-end">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/12 px-3 py-1.5 text-xs text-teal-300">
                        <Sparkles size={13} />
                        tuned for <span className="font-semibold">{levelLabel[level] ?? level}</span>
                    </span>
                </div>
            )}

            <RecommendedHeroCard rec={hero} isColdStart={isColdStart} />

            {rest.length > 0 && (
                <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold text-white/55">More picks for you</h3>
                    <div className="flex flex-col gap-2">
                        {rest.map((rec, i) => (
                            <RankedPickRow key={rec.id} rec={rec} rank={i + 2} isColdStart={isColdStart} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
