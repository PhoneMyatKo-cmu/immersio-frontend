import type { ReviewGrade, ReviewVocabItem } from "../types/review";
import { apiClient } from "./client";

export const reviewApi = {
    getDueVocab: async (userId: number) => {
        return apiClient.get<ReviewVocabItem[]>(`/review/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
    },

    submitGrade: async (userId: number, vocabId: number, grade: ReviewGrade) => {
        return apiClient.post(`/review/update/${userId}/${vocabId}`, null, {
            params: { grade },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
    },
};
