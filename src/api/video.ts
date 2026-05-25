import { apiClient } from "./client";

export const getFeedVideos = async (search='') => {
    const response = await apiClient.get("/feed", { params: { search } });
    return response.data;
};