import { REVIEW_GRADES, type ReviewGrade, type ReviewVocabItem } from "../../types/review";
import PronunciationButton from "../common/PronunciationButton";

interface ReviewCardProps {
    vocab: ReviewVocabItem;
    index: number;
    total: number;
    isRevealed: boolean;
    onReveal: () => void;
    onGrade: (grade: ReviewGrade) => void;
}

const gradeStyles: Record<ReviewGrade, string> = {
    0: "bg-red-600 hover:bg-red-700",
    3: "bg-orange-500 hover:bg-orange-600",
    4: "bg-teal-600 hover:bg-teal-700",
    5: "bg-blue-600 hover:bg-blue-700",
};

export function ReviewCard({ vocab, index, total, isRevealed, onReveal, onGrade }: ReviewCardProps) {
    const meaningsText = vocab.meanings.map((m) => m.meanings.join(", ")).join("; ");

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-lg">
            <p className="text-white/60 text-sm">Card {index + 1} / {total}</p>

            <div className="flex flex-col items-center gap-3 p-8 bg-gray-800/70 rounded-lg border border-gray-600 text-white w-full text-center">
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">{vocab.japanese_form}</span>
                    <PronunciationButton text={vocab.japanese_form} />
                </div>
                {vocab.lemma !== vocab.japanese_form && (
                    <span className="text-white/60">{vocab.lemma}</span>
                )}

                {!isRevealed ? (
                    <button
                        onClick={onReveal}
                        className="mt-4 rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-teal-700"
                    >
                        Show Answer
                    </button>
                ) : (
                    <div className="flex flex-col items-center gap-3 w-full mt-2">
                        <span className="text-xl">{vocab.reading}</span>
                        <p className="bg-gray-700 rounded-sm p-2 w-full">{meaningsText}</p>
                        {vocab.caption && (
                            <div className="bg-gray-700/60 rounded-sm p-2 w-full text-sm text-white/80">
                                <p>{vocab.caption}</p>
                                {vocab.caption_translation && (
                                    <p className="text-white/50 mt-1">{vocab.caption_translation}</p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2 w-full mt-2">
                            {REVIEW_GRADES.map(({ label, value }) => (
                                <button
                                    key={value}
                                    onClick={() => onGrade(value)}
                                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium text-white transition-all ${gradeStyles[value]}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
