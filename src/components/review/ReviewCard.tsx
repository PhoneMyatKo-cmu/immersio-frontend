import { Fragment, type ReactNode } from "react";
import { REVIEW_GRADES, type ReviewGrade, type ReviewVocabItem } from "../../types/review";
import PronunciationButton from "../common/PronunciationButton";
import { YoutubeClipPlayer } from "./YoutubeClipPlayer";

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

// Both faces share one grid cell so the card auto-sizes to the taller face (no scroll).
const faceBase =
    "[grid-area:1/1] [backface-visibility:hidden] rounded-2xl border border-white/10 bg-[#101c30] p-6 md:p-8";

export function ReviewCard({ vocab, index, total, isRevealed, onReveal, onGrade }: ReviewCardProps) {
    const meaningsText = vocab.meanings.map((m) => m.meanings.join(", ")).join("; ");
    const progress = total > 0 ? ((index + 1) / total) * 100 : 0;

    // Highlight the vocab word where it appears in the context sentence.
    const highlightTarget = (text: string): ReactNode => {
        const word = [vocab.japanese_form, vocab.lemma].find((w) => w && text.includes(w));
        if (!word) return text;
        const parts = text.split(word);
        return parts.map((part, i) => (
            <Fragment key={i}>
                {part}
                {i < parts.length - 1 && <span className="font-medium text-teal-400">{word}</span>}
            </Fragment>
        ));
    };

    return (
        <div className="flex w-full max-w-xl flex-col gap-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
                <span className="whitespace-nowrap text-xs text-white/55">Card {index + 1} / {total}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                        className="h-full rounded-full bg-teal-500 transition-[width] duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Flip card */}
            <div className="[perspective:1600px]">
                <div
                    className={`grid w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                        isRevealed ? "[transform:rotateY(180deg)]" : ""
                    }`}
                >
                    {/* Front — prompt */}
                    <div className={`${faceBase} flex flex-col items-center justify-center gap-5 text-center`}>
                        <span className="text-5xl font-medium leading-tight text-white md:text-6xl">
                            {vocab.japanese_form}
                        </span>
                        {vocab.lemma !== vocab.japanese_form && (
                            <span className="text-white/50">{vocab.lemma}</span>
                        )}
                        {vocab.caption && (
                            <div className="w-full max-w-md rounded-lg bg-white/5 px-4 py-3 text-sm text-white/75">
                                {highlightTarget(vocab.caption)}
                            </div>
                        )}
                        <button
                            onClick={onReveal}
                            className="mt-1 rounded-lg bg-teal-600 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-700"
                        >
                            Show answer
                        </button>
                    </div>

                    {/* Back — answer + grading */}
                    <div
                        className={`${faceBase} [transform:rotateY(180deg)] flex flex-col items-center gap-3 text-center`}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="text-4xl font-medium text-white">{vocab.japanese_form}</span>
                            <PronunciationButton text={vocab.japanese_form} />
                        </div>
                        <span className="text-xl text-white/70">{vocab.reading}</span>
                        <p className="w-full rounded-lg bg-white/[0.06] px-4 py-2.5 text-white">{meaningsText}</p>

                        {vocab.caption && (
                            <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-2.5">
                                <div>
                                    <p className="text-sm text-white/80">{highlightTarget(vocab.caption)}</p>
                                    {vocab.caption_translation && (
                                        <p className="mt-1 text-[13px] text-white/45">{vocab.caption_translation}</p>
                                    )}
                                </div>
                                <PronunciationButton text={vocab.caption} />
                            </div>
                        )}

                        {isRevealed && vocab.youtube_video_id && vocab.start_time != null && vocab.end_time != null && (
                            <YoutubeClipPlayer
                                videoId={vocab.youtube_video_id}
                                startTime={vocab.start_time}
                                endTime={vocab.end_time}
                            />
                        )}

                        <div className="mt-1 flex w-full gap-2">
                            {REVIEW_GRADES.map(({ label, value }) => (
                                <button
                                    key={value}
                                    onClick={() => onGrade(value)}
                                    className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-all ${gradeStyles[value]}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
