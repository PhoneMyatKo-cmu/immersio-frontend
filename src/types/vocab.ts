export type Vocab = {
    vocab_id: number;
    japanese_form: string;
    lemma: string;
    reading: string;
    meanings: VocabMeaning[];
    estimated_level: string;
    status: 'SEEN' | 'KNOW';
}

export type SavedVocab = {
    vocab_id: number;
    japanese_form: string;
    lemma: string;
    reading: string;
    meanings: VocabMeaning[];
    estimated_level: string;
    srs_state: SRSState;
    next_review_date: Date;
}

export type SRSState = "not_studied" | "studying" | "mastered";

export type VocabMeaning = {
    pos: string;
    meanings: string[];
}
