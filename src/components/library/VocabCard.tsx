import { Trash2 } from "lucide-react";
import type { SavedVocab, Vocab } from "../../types/vocab";


interface VocabCardProps {
    vocab: Vocab | SavedVocab;
    headers: { [key: string]: string };
    rowNumber: number;
    showRemove?: boolean;
    onRemove?: (vocabId: number) => void;
}

export default function VocabCard({ vocab, headers, rowNumber, showRemove, onRemove }: VocabCardProps) {
    return (
        <div key={vocab.vocab_id} className="flex flex-row gap-0.5 p-1 bg-gray-800 text-white">
            <div className="flex flex-col w-10 shrink-0">
                <p className="bg-gray-700 rounded-sm h-full p-2 mx-0.5 text-center">{rowNumber}</p>
            </div>
            {Object.entries(headers).map(([header, key]) => (
                <div key={key} className="flex flex-col flex-1">
                    {key === 'meanings' ? (
                        <p className="bg-gray-700 rounded-sm h-full p-2 mx-0.5">{(vocab as Vocab | SavedVocab).meanings.map((meaning) => meaning.meanings.join(', ')).join('; ')}</p>
                    ) : key === 'next_review_date' ? (
                        <p className="bg-gray-700 rounded-sm h-full p-2 mx-0.5">{new Date((vocab as SavedVocab).next_review_date).toLocaleDateString()}</p>
                    ) : (
                        <p className="bg-gray-700 rounded-sm h-full p-2 mx-0.5">{(vocab as any)[key]}</p> // eslint-disable-line @typescript-eslint/no-explicit-any
                    )}
                </div>
            ))}
            {showRemove && (
                <div className="flex flex-col w-28 shrink-0">
                    <div className="flex bg-gray-700 rounded-sm h-full p-2 mx-0.5 justify-center items-center">
                        <button
                            onClick={() => onRemove?.(vocab.vocab_id)}
                            className="h-7 lg:h-10 mx-0.5 rounded-sm bg-red-600 px-2 py-1 text-sm font-medium text-white transition-all hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 lg:h-5 lg:w-5" />
                        </button>
                    </div>
                    
                </div>
            )}
        </div>
    );
}