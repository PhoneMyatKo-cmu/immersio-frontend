import type { SRSState, VocabMeaning } from "./vocab";

export type ReviewGrade = 0 | 3 | 4 | 5;

export const REVIEW_GRADES: { label: string; value: ReviewGrade }[] = [
    { label: "Again", value: 0 },
    { label: "Hard", value: 3 },
    { label: "Good", value: 4 },
    { label: "Easy", value: 5 },
];

export type ReviewVocabItem = {
    vocab_id: number;
    user_vocab_id: number;
    japanese_form: string;
    reading: string;
    lemma: string;
    meanings: VocabMeaning[];
    estimated_level: string;
    srs_state: SRSState;
    youtube_video_id: string | null;
    caption: string | null;
    caption_translation: string | null;
    start_time: number | null;
    end_time: number | null;
};

export type ReviewLogEntry = {
    user_vocab_id: number;
    vocab_id: number;
    grade: ReviewGrade;
};
