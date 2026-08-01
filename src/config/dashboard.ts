import type { ChartVariant } from "../components/dashboard/Chart";

export const chartVariantConfig: Record<ChartVariant, {
    title: string;
    queryParams: string[];
    chartType: {
        'daily': 'line' | 'bar';
        'cumulative': 'line' | 'bar';
    };
    color?: string[];
    legend?: string[];
}> = {
    study_seconds: {
        title: 'Study Time',
        queryParams: ['study_seconds'],
        chartType: {
            'daily': 'line',
            'cumulative': 'line'
        },
        color: ['#4CAF50'], // Green
        legend: ['Study Time'],
    },
    videos_watched: {
        title: 'Videos Watched',
        queryParams: ['videos_watched', 'total_videos_watched'],
        chartType: {
            'daily': 'bar',
            'cumulative': 'line'
        },
        color: ['#2196F3', '#4CAF50'], // Blue and Green
        legend: ['Videos Watched Daily', 'Total Videos Watched'],
    },
    vocab: {
        title: 'Vocabulary',
        queryParams: ['vocab_seen', 'vocab_known'],
        chartType: {
            'daily': 'line',
            'cumulative': 'line'
        },
        color: ['#2196F3', '#00BCD4'], // Sky Blue and Cyan
        legend: ['Vocabulary Seen', 'Vocabulary Known'],
    },
    srs_state: {
        title: 'SRS Progress',
        queryParams: [],
        chartType: {
            'daily': 'bar',
            'cumulative': 'bar'
        },
        color: ['#6B7280', '#F59E0B', '#10B981'], // Gray, Amber, Emerald
        legend: ['Not Studied', 'Studying', 'Mastered'],
    },
}

export const chartPeriodConfig: Record<'week' | 'month' | 'all_time', {
    title: string;
    days: number | null; // null for all_time
}> = {
    week: {
        title: 'Week',
        days: 7,
    },
    month: {
        title: 'Month',
        days: 30,
    },
    all_time: {
        title: 'All Time',
        days: null,
    },
};