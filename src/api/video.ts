import { apiClient } from "./client";

export const getFeedVideos = async (search = "", page = 1, limit = 6) => {
  const response = await apiClient.get("/video", {
    params: { search, page, limit },
  });
  return response.data;
};

export const getVideosByDifficulty = async (
  difficulty_level: string,
  search: string = "",
  page: number = 1,
  limit: number = 6,
) => {
  const response = await apiClient.get(
    "/video/difficulty/" + difficulty_level,
    { params: { search, page, limit } },
  );
  return response.data;
};

export const getVideoMetaDataApi = {
  get: (video_id: number) => apiClient.get("/video/" + video_id),
};
