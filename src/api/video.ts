import { apiClient } from "./client";

export const getFeedVideos = async (search='') => {
    const response = await apiClient.get("/feed", { params: { search } });
    return response.data;
};

export const getVideosByDifficulty = async (difficulty_level: string) => {
    const response = await apiClient.get("/feed/difficulty/" + difficulty_level);
    return response.data;
}