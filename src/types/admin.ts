import type { EstimatedLevel, Role } from "./user";

// Shared enums (mirror AdminAPI.md)
export type VideoSource = "curated" | "user_submitted";

// ── Videos ────────────────────────────────────────────────────────────────

export type AdminVideoItem = {
  id: number;
  youtube_video_id: string;
  title: string;
  thumbnail_url: string;
  channel_name: string;
  duration_seconds: number;
  is_shadowing_ready: boolean;
  source: VideoSource;
  is_active: boolean;
  added_by: number;
  created_at: string;
};

export type VideoStats = {
  total: number;
  active: number;
  inactive: number;
  by_source: { curated: number; user_submitted: number };
  shadowing_ready: number;
  shadowing_not_ready: number;
  added_last_7_days: number;
  added_last_30_days: number;
  top_contributors: { added_by: number; name: string; count: number }[];
};

export type VideoListParams = {
  search?: string;
  source?: VideoSource;
  is_active?: boolean;
  added_by?: number;
  page?: number;
  page_size?: number;
};

// ── Users ─────────────────────────────────────────────────────────────────

export type UserAdminRead = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  estimated_level: EstimatedLevel;
  role: Role;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};

export type UserStats = {
  total: number;
  active: number;
  inactive: number;
  // by_role: { admin: number; learner: number };
  by_level: { beginner: number; intermediate: number; advanced: number };
  signups_last_7_days: number;
  signups_last_30_days: number;
  active_last_7_days: number;
  active_last_30_days: number;
};

export type UserListParams = {
  search?: string;
  role?: Role;
  estimated_level?: EstimatedLevel;
  is_active?: boolean;
  page?: number;
  page_size?: number;
};

// ── Shared paginated envelope ───────────────────────────────────────────────

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};
