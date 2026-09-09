import { BookOpen } from "lucide-react";
import type { SavedVocab, Vocab } from "../../types/vocab";
import VocabCard from "./VocabCard";

interface VocabListProps {
    vocabItems: Vocab[] | SavedVocab[] | null;
    showRemove?: boolean;
    onRemove?: (vocabId: number) => void;
    emptyMessage?: string;
}

export function VocabList({ vocabItems, showRemove, onRemove, emptyMessage = "No vocabulary here yet." }: VocabListProps) {
    if (vocabItems && vocabItems.length === 0) {
        return (
            <div className="flex w-full flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                    <BookOpen className="text-white/30" size={26} />
                </div>
                <p className="max-w-sm text-sm text-white/60">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vocabItems?.map((vocab) => (
                <VocabCard key={vocab.vocab_id} vocab={vocab} showRemove={showRemove} onRemove={onRemove} />
            ))}
        </div>
    );
}
