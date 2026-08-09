import type { DashboardChartResponse, DashboardStatistics } from '../types/dashboard';
import { apiClient } from './client';

export function getDashboardStatistics(userId: number): Promise<{ data: DashboardStatistics }> {
    return apiClient.get(`/learning-progress/${userId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
}

export function getChartData(userId: number, chartType: string, period: string): Promise<{ data: DashboardChartResponse }> {
    return apiClient.get(`/learning-progress/chart/${userId}/${chartType}`, {
        params: {
            period_days: period,
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
}