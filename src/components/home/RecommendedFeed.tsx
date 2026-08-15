import type { RecommendationSection } from "../../types/recommendation";
import { RecommendationRow } from "./RecommendationRow";

interface RecommendedFeedProps {
    sections: RecommendationSection[];
}

export function RecommendedFeed({ sections }: RecommendedFeedProps) {
    // Cold-start / new-user: no eligible videos yet.
    if (sections.length === 0) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span className="text-3xl text-white/20">✨</span>
                </div>
                <p className="text-white/60 text-base font-medium mb-1">
                    Set your level and start watching to get personalized picks
                </p>
                <p className="text-white/40 text-sm">
                    As you watch and save words, we'll recommend videos tuned to you.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            {sections.map((section) => (
                <RecommendationRow key={section.key} section={section} />
            ))}
        </div>
    );
}
