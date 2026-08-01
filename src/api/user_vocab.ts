import { apiClient } from "./client";

export const userVocabApi = {
    get: async (userId: number) => {
        return apiClient.get(`/user-vocab/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
    },

    getSavedVocab: async (userId: number) => {
        return apiClient.get(`/vocab/saved/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
    },
    
    removeSavedVocab: async (userId: number, vocabId: number) => {
        return apiClient.delete(`/vocab/delete/${userId}/${vocabId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
    }
}