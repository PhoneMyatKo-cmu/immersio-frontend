import { apiClient } from "./client";

export const captionApi = {
  get: (videoId: number) => apiClient.get(`/caption?video_id=${videoId}`),
};
