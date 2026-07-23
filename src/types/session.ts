export type LearningSession = {
    id: string;
    video_id: number;
    user_id: number;
    start_time: number;
    end_time: number;
    intervals: { start_time: number; end_time: number }[];
}