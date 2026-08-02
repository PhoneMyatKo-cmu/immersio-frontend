import type { SavedVocab, Vocab } from "../../types/vocab";
import VocabCard from "./VocabCard";

interface VocabListProps {
    vocabItems: Vocab[] | SavedVocab[] | null;
    headers: { [key: string]: string };
}

export function VocabList({ vocabItems, headers }: VocabListProps) {
    return (
        <div className="flex flex-col items-center justify-start min-h-screen w-full">
            <div className="w-full max-w-4xl">
                <div className="flex flex-row gap-0.5 p-4 bg-gray-800 text-white rounded-t-lg sticky top-25 z-50">
                    {Object.entries(headers).map(([header, key]) => (
                        <div key={key} className="flex flex-col flex-1">
                            <p className="flex font-bold">{header}</p>
                        </div>
                    ))}
                </div>

                {vocabItems && vocabItems.map((vocab) => (
                    <VocabCard key={vocab.vocab_id} vocab={vocab} headers={headers} />
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
