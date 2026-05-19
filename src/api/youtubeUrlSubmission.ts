import { apiClient } from "./client";

export const youtubeUrlSubmissionApi = {
  submit: (youtubeUrl: string) =>
    apiClient.post("/add-video", { youtube_url: youtubeUrl }),
};
