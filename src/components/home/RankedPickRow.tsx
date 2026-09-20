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

    return (
        <Link
            to={`/video/${rec.id}`}
            className="group flex items-center gap-3 rounded-xl border border-white/8 bg-[#101c30] px-3 py-2.5 transition-colors hover:border-white/20"
        >
            <span className="w-5 shrink-0 text-center text-sm font-semibold tabular-nums text-white/35">{rank}</span>

            <div className="relative h-[50px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-[#1b2942]">
                <img src={rec.video.thumbnail_url} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-px text-[10px] text-white">
                    {formatDuration(rec.video.duration_seconds)}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white transition-colors group-hover:text-teal-200">{rec.video.title}</p>
                <p className="truncate text-xs text-white/45">
                    {rec.video.channel_name}
                    {meta ? ` · ${meta}` : ""}
                </p>
            </div>

            <div className="w-24 shrink-0">
                <div className="mb-1 flex justify-between text-[11px] text-white/50">
                    <span>{isColdStart ? "may know" : "understand"}</span>
                    <span style={{ color }}>{pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
            </div>
        </Link>
    );
}
