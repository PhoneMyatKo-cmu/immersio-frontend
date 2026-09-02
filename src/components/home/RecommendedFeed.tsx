import type { RecommendationSection } from "../../types/recommendation";
import { RecommendationRow } from "./RecommendationRow";

interface RecommendedFeedProps {
    sections: RecommendationSection[];
    // When true, cards show only a rough "may know %" estimate (no word/difficulty stats).
    isColdStart?: boolean;
    isAuthenticated?:boolean
}

export function RecommendedFeed({ sections, isColdStart = false,isAuthenticated }: RecommendedFeedProps) {
    if (!isAuthenticated) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
                <p className="text-white/60 text-base font-medium mb-1">
                    Log In and Start watching videos to get personalized picks
                </p>
                            </div>
        );
    }
    if (sections.length === 0) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span className="text-3xl text-white/20">✨</span>
                </div>
                <p className="text-white/60 text-base font-medium mb-1">
                    Start watching videos to get personalized picks
                </p>
                <p className="text-white/40 text-sm">
                    As you watch and save words, we'll recommend videos tuned to you.
                </p>
            </div>
        );
    }

    const total_count = sections.reduce((n, s) => n + s.total, 0)
    if (total_count === 0) {
 return (
            <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span className="text-3xl text-white/20">✨</span>
                </div>
                <p className="text-white/60 text-base font-medium mb-1">
                    Start watching videos to get personalized picks
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
                <RecommendationRow key={section.key} section={section} isColdStart={isColdStart} />
            ))}
        </div>
    );
}
