import { Bookmark } from "lucide-react";
import type { SavedVocab, SRSState, Vocab } from "../../types/vocab";
import PronunciationButton from "../common/PronunciationButton";

interface VocabCardProps {
    vocab: Vocab | SavedVocab;
    showRemove?: boolean;
    onRemove?: (vocabId: number) => void;
}

const srsPill: Record<SRSState, { label: string; className: string }> = {
    not_studied: { label: "Not studied", className: "bg-white/10 text-white/60" },
    studying: { label: "Studying", className: "bg-amber-500/15 text-amber-400" },
    mastered: { label: "Mastered", className: "bg-teal-500/15 text-teal-400" },
};

const statusLabel: Record<Vocab["status"], string> = {
    SEEN: "Seen while watching",
    KNOW: "Known",
};

function formatDue(date: Date | string): { text: string; urgent: boolean } {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return { text: "", urgent: false };
    const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diffDays = Math.round((startOfDay(d) - startOfDay(new Date())) / 86_400_000);
    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day${diffDays === -1 ? "" : "s"}`, urgent: true };
    if (diffDays === 0) return { text: "Due today", urgent: true };
    if (diffDays === 1) return { text: "Due tomorrow", urgent: false };
    return { text: `Due in ${diffDays} days`, urgent: false };
}

export default function VocabCard({ vocab, showRemove, onRemove }: VocabCardProps) {
    const isSaved = "srs_state" in vocab;
    const due = isSaved ? formatDue(vocab.next_review_date) : null;

    return (
        <div className="flex flex-col rounded-2xl border border-white/10 bg-[#101c30] p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    {vocab.reading && <div className="text-[13px] text-teal-400">{vocab.reading}</div>}
                    <div className="text-2xl font-medium leading-tight text-white">{vocab.japanese_form}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    <PronunciationButton text={vocab.japanese_form || vocab.reading} size="sm" />
                    {isSaved && showRemove && (
                        <button
                            onClick={() => onRemove?.(vocab.vocab_id)}
                            aria-label="Remove from saved"
                            title="Remove from saved"
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400 transition-colors hover:bg-red-500/15 hover:text-red-400"
                        >
                            <Bookmark size={17} />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-2.5 space-y-1">
                {vocab.meanings.map((m, i) => (
                    <div key={i} className="text-[15px] text-white/85">
                        {m.pos && (
                            <span className="mr-1.5 rounded bg-teal-500/12 px-1.5 py-0.5 text-[11px] text-teal-200">
                                {m.pos}
                            </span>
                        )}
                        {m.meanings.join(", ")}
                    </div>
                ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {vocab.estimated_level && (
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs capitalize text-white/60">
                        {vocab.estimated_level}
                    </span>
                )}
                {isSaved ? (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${srsPill[vocab.srs_state].className}`}>
                        {srsPill[vocab.srs_state].label}
                    </span>
                ) : (
                    <span className="text-xs text-white/50">{statusLabel[vocab.status]}</span>
                )}
                {due?.text && (
                    <span className={`ml-auto text-xs ${due.urgent ? "text-amber-400" : "text-white/45"}`}>
                        {due.text}
                    </span>
                )}
            </div>
        </div>
    );
}
