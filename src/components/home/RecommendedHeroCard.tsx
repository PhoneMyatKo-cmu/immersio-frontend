import { CircleCheck, Play } from "lucide-react";
import { Link } from "react-router-dom";
import type { RecommendedVideo } from "../../types/recommendation";
import { ComprehensionGauge } from "./ComprehensionGauge";
import { difficultyLabel, formatDuration } from "./recHelpers";

interface RecommendedHeroCardProps {
    rec: RecommendedVideo;
    isColdStart?: boolean;
}

export function RecommendedHeroCard({ rec, isColdStart = false }: RecommendedHeroCardProps) {
    const pct = isColdStart ? rec.may_know_percent ?? 0 : rec.understand_percent ?? 0;
    const newWords = rec.new_word_count ?? 0;
    const reviewWords = rec.review_word_count ?? 0;

    return (
        <Link
            to={`/video/${rec.id}`}
            className="group flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#101c30] transition-colors hover:border-white/20 sm:flex-row sm:p-3.5"
        >
            {/* Thumbnail — edge-to-edge on mobile (matches Explore cards), inset frame from sm up */}
            <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#1b2942] sm:w-1/2 sm:rounded-xl">
                <img
                    src={rec.video.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute left-2.5 top-2.5 rounded-md bg-teal-500 px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#04241f]">
                    TOP PICK
                </span>
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
                    {formatDuration(rec.video.duration_seconds)}
                </span>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col px-4 pb-4 sm:px-0 sm:pb-0 sm:py-1.5">
                <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-white">{rec.video.title}</h3>
                <p className="mt-0.5 text-sm text-white/50">{rec.video.channel_name}</p>

                <div className="mt-auto flex items-center gap-4 pt-4">
                    <ComprehensionGauge percent={pct} label={isColdStart ? "you may know" : "you'll get"} />
                    {!isColdStart && (
                        <div className="flex flex-col gap-1.5 text-sm">
                            <span className="inline-flex items-center gap-1.5 text-teal-300">
                                <CircleCheck size={15} />
                                {difficultyLabel[rec.difficulty]}
                            </span>
                            <span className="text-white/60">
                                {newWords} new word{newWords === 1 ? "" : "s"}
                                {reviewWords > 0 ? ` · ${reviewWords} due for review` : ""}
                            </span>
                        </div>
                    )}
                </div>

                <span className="mt-4 inline-flex w-full items-center justify-center gap-2 sm:w-fit sm:justify-start rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-[#04241f] transition-colors group-hover:bg-teal-400">
                    <Play size={16} />
                    Start watching
                </span>
            </div>
        </Link>
    );
}
