import { apiClient } from "./client";

export const sentenceApi = {
  get: (videoId: number) => apiClient.get(`sentence?video_id=${videoId}`),
};
