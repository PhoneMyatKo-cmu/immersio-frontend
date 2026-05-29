import { apiClient } from "./client";

export const captionApi = {
  get: (videoId: number) =>
    apiClient.get("/get-caption/by-video-id?video_id=" + videoId),
};
