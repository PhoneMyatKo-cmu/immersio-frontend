import type { EstimatedLevel } from "./user";

export type RecommendationDifficulty = "best_fit" | "stretch" | "comfortable" | "too_advanced";

// Raw scoring breakdown — debug only, may be null in normal responses. Never shown to users.
export type RecommendationReasons = {
  coverage: number;
  comprehension_fit: number;
  learning_value: number;
  srs_bonus: number;
  recency_penalty: number;
  new_word_count: number;
  review_word_count: number;
};

export type RecommendedVideo = {
  id: number;
  video: {
    youtube_video_id: string;
    title: string;
    thumbnail_url: string;
    channel_name: string;
    duration_seconds: number;
  };
  // Internal rank value — never displayed to users.
  score: number;
  understand_percent: number;
  difficulty: RecommendationDifficulty;
  new_word_count: number;
  review_word_count: number;
  reasons: RecommendationReasons | null;
};

export type RecommendationSection = {
  // Stable id (top_picks / best_fit / stretch / comfortable) — for keys/logic, not display.
  key: string;
  title: string;
  // Full count in this bucket; show "See all (total)" when total > items.length.
  total: number;
  // Already best-first ordered — never re-sort client-side.
  items: RecommendedVideo[];
};

export type RecommendationFeed = {
  user_level: EstimatedLevel;
  // Pre-ordered rows; empty rows are already stripped by the backend.
  sections: RecommendationSection[];
};
