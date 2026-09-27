import { Link } from "react-router-dom";
import type { RecommendedVideo } from "../../types/recommendation";
import { comprehensionColor, formatDuration } from "./recHelpers";

interface RankedPickRowProps {
    rec: RecommendedVideo;
    rank: number;
    isColdStart?: boolean;
}

export function RankedPickRow({ rec, rank, isColdStart = false }: RankedPickRowProps) {
    const pct = Math.round(isColdStart ? rec.may_know_percent ?? 0 : rec.understand_percent ?? 0);
    const newWords = rec.new_word_count ?? 0;
    const reviewWords = rec.review_word_count ?? 0;
    const color = comprehensionColor(pct);
    const meta = isColdStart
        ? ""
        : `${newWords} new${reviewWords > 0 ? ` · ${reviewWords} due` : ""}`;
    const pctLabel = isColdStart ? "may know" : "understand";

    const bar = (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
    );

    return (
        <Link
            to={`/video/${rec.id}`}
            className="group flex items-center gap-3 rounded-xl border border-white/8 bg-[#101c30] px-3 py-2.5 transition-colors hover:border-white/20"
        >
            <span className="w-4 shrink-0 text-center text-sm font-semibold tabular-nums text-white/35 sm:w-5">{rank}</span>

            <div className="relative aspect-video w-[112px] shrink-0 overflow-hidden rounded-lg bg-[#1b2942] sm:w-[88px]">
                <img src={rec.video.thumbnail_url} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-px text-[10px] text-white">
                    {formatDuration(rec.video.duration_seconds)}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                {/* Mobile: 2-line title — a single truncated line leaves only a few characters visible */}
                <p className="line-clamp-2 text-sm leading-snug text-white transition-colors group-hover:text-teal-200 sm:line-clamp-1">
                    {rec.video.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-white/45">
                    {rec.video.channel_name}
                    {meta ? ` · ${meta}` : ""}
                </p>

                {/* Mobile: comprehension bar sits under the text so the title gets the full width */}
                <div className="mt-2 flex items-center gap-2 sm:hidden">
                    <div className="flex-1">{bar}</div>
                    <span className="shrink-0 text-[11px] tabular-nums" style={{ color }}>
                        {pct}% <span className="text-white/45">{pctLabel}</span>
                    </span>
                </div>
            </div>

            <div className="hidden w-24 shrink-0 sm:block">
                <div className="mb-1 flex justify-between text-[11px] text-white/50">
                    <span>{pctLabel}</span>
                    <span style={{ color }}>{pct}%</span>
                </div>
                {bar}
            </div>
        </Link>
    );
}
