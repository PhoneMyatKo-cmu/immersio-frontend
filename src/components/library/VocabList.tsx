import type { SavedVocab, Vocab } from "../../types/vocab";
import VocabCard from "./VocabCard";

interface VocabListProps {
    vocabItems: Vocab[] | SavedVocab[] | null;
    headers: { [key: string]: string };
    showRemove?: boolean;
    onRemove?: (vocabId: number) => void;
}

export function VocabList({ vocabItems, headers, showRemove, onRemove }: VocabListProps) {
    return (
        <div className="flex flex-col items-center justify-start min-h-screen w-full">
            <div className="w-full">
                <div className="flex flex-row gap-0.5 p-4 bg-gray-800 text-white rounded-t-lg sticky top-25 z-50">
                    <div className="flex flex-col w-10 shrink-0 items-center justify-center">
                        <p className="flex font-bold">#</p>
                    </div>
                    {Object.entries(headers).map(([header, key]) => (
                        <div key={key} className="flex flex-col flex-1 items-center justify-center">
                            <p className="flex font-bold">{header}</p>
                        </div>
                    ))}
                    {showRemove && (
                        <div className="flex flex-col w-28 shrink-0 items-center justify-center">
                            <p className="flex font-bold">Actions</p>
                        </div>
                    )}
                </div>

                {vocabItems && vocabItems.map((vocab, index) => (
                    <VocabCard
                        key={vocab.vocab_id}
                        vocab={vocab}
                        headers={headers}
                        rowNumber={index + 1}
                        showRemove={showRemove}
                        onRemove={onRemove}
                    />
                ))}

                {vocabItems && vocabItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-b-lg">
                        <p className="text-white">No vocabulary items found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
