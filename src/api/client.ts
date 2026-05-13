// api/client.ts — shared config
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

//Sample Usage

// import { apiClient } from './client';
// import { Video, Sentence } from '@/types/video';

// export const videoApi = {
//     process: (videoId: string) =>
//         apiClient.post<Video>('/api/videos/process', { video_id: videoId }),

//     getSentences: (videoId: string) =>
//         apiClient.get<Sentence[]>(`/api/videos/${videoId}/sentences`),

//     getCaptions: (videoId: string) =>
//         apiClient.get(`/api/videos/${videoId}/captions`),
// };
