import { apiClient } from "./client";

export const youtubeUrlSubmissionApi = {
  submit: (youtubeUrl: string) =>
    apiClient.post("/submit-video", { youtube_url: youtubeUrl }),
};
