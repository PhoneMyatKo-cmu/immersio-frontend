import type {
    AdminVideoItem,
    Paginated,
    VideoListParams,
    VideoStats,
} from "../types/admin";
import { apiClient } from "./client";

export const adminVideosApi = {
    // Add a curated video (reuses the submission pipeline on the backend).
    create: (youtube_url: string) =>
        apiClient.post<{ message: string; video_id: number; video_title: string }>(
            "/admin/videos/",
            { youtube_url },
        ),

    stats: () => apiClient.get<VideoStats>("/admin/videos/stats"),

    list: (params: VideoListParams = {}) =>
        apiClient.get<Paginated<AdminVideoItem>>("/admin/videos/", { params }),

    // Soft delete — sets is_active=false and removes it from the public feed.
    remove: (video_id: number) =>
        apiClient.delete<{ detail: string }>(`/admin/videos/${video_id}`),
};
