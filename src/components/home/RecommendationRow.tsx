import type { RecommendationSection } from "../../types/recommendation";
import { RecommendedVideoCard } from "./RecommendedVideoCard";

// A single recommendation section. Items are already best-first ordered — never re-sort.
// The difficulty badge is only meaningful in the mixed `top_picks` row; the other rows
// are difficulty-homogeneous, so the heading already conveys it.
export function RecommendationRow({ section }: { section: RecommendationSection }) {
    const hasMore = section.total > section.items.length;
    const showDifficulty = section.key === "top_picks";

    return (
        <section className="mb-8">
            <div className="mb-3 flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                {hasMore && (
                    <span className="whitespace-nowrap text-sm text-teal-400">
                        See all ({section.total})
                    </span>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((rec) => (
                    <RecommendedVideoCard key={rec.id} rec={rec} showDifficulty={showDifficulty} />
                ))}
            </div>
        </section>
    );
}
