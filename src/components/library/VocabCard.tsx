import type { SavedVocab, Vocab } from "../../types/vocab";


export default function VocabCard({ vocab, headers }: { vocab: Vocab | SavedVocab; headers: { [key: string]: string } }) {
    const meanings = vocab.meanings.flatMap((meaning) => meaning.meanings);

    return (
        <div key={vocab.vocab_id} className="flex flex-row gap-0.5 p-1 bg-gray-800 text-white">
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
        </div>
    );
}