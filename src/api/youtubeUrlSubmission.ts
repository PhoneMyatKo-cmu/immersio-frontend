import { apiClient } from "./client";

export const youtubeUrlSubmissionApi = {
  submit: (youtubeUrl: string) =>
    apiClient.post("/add-video", { youtube_url: youtubeUrl }),
};

export const getVideoMetaDataApi = {
  get: (video_id) => apiClient.get("/video/get-by-id?id=" + video_id),
};
