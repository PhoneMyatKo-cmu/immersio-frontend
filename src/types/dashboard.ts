export type DashboardStatistics = {
    study_seconds: number;
    total_videos_watched: number;
    total_vocab_seen: number;
    total_vocab_known: number;
    streak: number;
}

export type ChartData = {
    day: Date;
    value: number;
}[]

export type DashboardChartResponse = {
    chart_data: ChartData;
    previous_summary: DashboardStatistics;
    chart_type: string;
}

export type DashboardChartData = Record<string, DashboardChartResponse>;
