export class UserCreateRequest {

    first_name: string;
    last_name: string;
    email: string;
    password: string;
    estimated_level: EstimatedLevel;

    constructor(
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        estimated_level: EstimatedLevel = EstimatedLevelValues.Beginner
    ) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
        this.estimated_level = estimated_level;
    }
}

export type Role = 'ADMIN' | 'LEARNER';

export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    estimated_level: EstimatedLevel;
    role?: Role;
    created_at: string;
}

export type EstimatedLevel = typeof EstimatedLevelValues[keyof typeof EstimatedLevelValues];

export const EstimatedLevelValues = {
    Beginner: 'beginner',
    Intermediate: 'intermediate',
    Advanced: 'advanced'
} as const;

export type Video = {
    id: number;
    youtube_video_id: string;
    title: string;
    channel_name: string;
    created_at: string;
    duration_seconds: number;
    thumbnail_url: string;
    difficulty_level: EstimatedLevel;
}