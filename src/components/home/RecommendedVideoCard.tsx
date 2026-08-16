import { Link } from "react-router-dom";
import type { RecommendationDifficulty, RecommendedVideo } from "../../types/recommendation";

const difficultyBadge: Record<RecommendationDifficulty, { label: string; className: string }> = {
    best_fit: { label: "Just Right", className: "bg-green-500/15 text-green-400" },
    stretch: { label: "A little Challenge", className: "bg-orange-500/15 text-orange-400" },
    comfortable: { label: "Easy", className: "bg-gray-500/20 text-gray-300" },
    too_advanced: { label: "Challenging", className: "bg-red-500/15 text-red-400" },
};

// `difficulty` may be missing/unknown while the backend catches up (it's a documented
// TODO). Fall back to a neutral badge rather than crashing on an undefined lookup.
const fallbackBadge = { label: "Recommended", className: "bg-teal-500/15 text-teal-300" };

const formatDuration = (seconds: number): string => {
    const s = Math.max(0, Math.floor(seconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

interface RecommendedVideoCardProps {
    rec: RecommendedVideo;
    // Only the mixed `top_picks` row shows the difficulty badge; the difficulty-named
    // rows already convey it via their heading.
    showDifficulty?: boolean;
    // Cold start: the user has no vocab history yet, so the per-video word/difficulty
    // stats aren't meaningful. Show only a rough "may know %" estimate.
    isColdStart?: boolean;
}

export function RecommendedVideoCard({ rec, showDifficulty = false, isColdStart = false }: RecommendedVideoCardProps) {
    const badge = difficultyBadge[rec.difficulty] ?? fallbackBadge;
    // Use the top-level fields — `reasons` is debug-only and usually null. Coalesce
    // so badges never read "undefined" if a count is absent.
    const understandPercent = rec.understand_percent ?? 0;
    const mayKnowPercent = rec.may_know_percent ?? 0;
    const newWords = rec.new_word_count ?? 0;
    const reviewWords = rec.review_word_count ?? 0;

    return (
        <div className="flex h-full flex-col rounded-lg bg-gray-800 p-4 transition hover:bg-gray-700/80">
            <Link to={`/video/${rec.id}`} className="block">
                <div className="relative mb-4">
                    <img
                        className="w-full aspect-video object-cover rounded-md"
                        src={rec.video.thumbnail_url}
                        alt={rec.video.title}
                    />
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                        {formatDuration(rec.video.duration_seconds)}
                    </span>
                </div>
                <h2 className="text-lg font-semibold mb-1 line-clamp-2">{rec.video.title}</h2>
                <p className="text-sm text-gray-400">{rec.video.channel_name}</p>
            </Link>

            {isColdStart ? (
                // Cold start: only a rough "may know %" tag — the word/difficulty stats
                // aren't meaningful without vocab history.
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-medium text-teal-300">
                        You may know ~{mayKnowPercent}%
                    </span>
                </div>
            ) : (
                <>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {showDifficulty && (
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
                                {badge.label}
                            </span>
                        )}
                        <span className="rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-medium text-teal-300">
                            {newWords} new word{newWords === 1 ? "" : "s"}
                        </span>
                        {reviewWords > 0 && (
                            <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-300">
                                Reviews {reviewWords} word{reviewWords === 1 ? "" : "s"} you're studying
                            </span>
                        )}
                    </div>

                    <p className="mt-3 text-sm text-white/70">
                        You may understand ~{understandPercent}%
                    </p>
                </>
            )}
        </div>
    );
}
