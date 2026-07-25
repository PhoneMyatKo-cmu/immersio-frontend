
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartPeriodConfig, chartVariantConfig } from "../../config/dashboard";
import type { ChartData, DashboardChartData } from "../../types/dashboard";
import Tab from "../common/Tab";

export type ChartVariant = 'study_seconds' | 'videos_watched' | 'vocab';

interface ChartProps {
    data: DashboardChartData;
    variant: ChartVariant;
    period?: 'week' | 'month' | 'all_time';
    onVariantChange: (variant: ChartVariant) => void;
    onPeriodChange: (period: 'week' | 'month' | 'all_time') => void;
}

function Chart(props: ChartProps) {
    const chartVariants = ['study_seconds', 'videos_watched', 'vocab'] as ChartVariant[];
    const periods = ['week', 'month', 'all_time'] as const;

    const config = chartVariantConfig[props.variant];
    const [isCumulative, setIsCumulative] = useState(false);
    const chartData = {} as Record<string, ChartData>;
    
    const lineType = isCumulative ? config.chartType.cumulative : config.chartType.daily;
    const charts = config.queryParams;

    if (isCumulative) {
        for (const chart of charts) {
            const data = props.data[chart]?.chart_data;
            const previousSummary = props.data[chart]?.previous_summary;
            if (!previousSummary || !data) {
                continue; // If previousSummary is not available, skip this chart
            }
            let previousValue = previousSummary ? previousSummary[chart as keyof typeof previousSummary] : 0;
            const cumulativeData = data.map(x => {
                return {
                    day: x.day,
                    value: previousValue += x.value
                };
            });
            chartData[chart] = cumulativeData;
        }
    } else {
        for (const chart of charts) {
            const data = props.data[chart]?.chart_data;
            if (!data) {
                continue; // If data is not available, skip this chart
            }
            chartData[chart] = data;
        }
    }

    const prepareChartData = (chartData: Record<string, ChartData>, charts: string[]) => {
        const dates = chartData[charts[0]]?.map(item => new Date(item.day).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })) || [];
        return dates.map((date, index) => {
            const entry: Record<string, any> = { date }; // eslint-disable-line @typescript-eslint/no-explicit-any
            for (const chart of charts) {
                entry[chart] = chartData[chart]?.[index]?.value || 0;
            }
            return entry;
        });
    };
    let combinedChartData;
    if (props.variant !== 'videos_watched') {
        combinedChartData = prepareChartData(chartData, charts);
    } else if (isCumulative) {
        combinedChartData = props.data['total_videos_watched']?.chart_data.map((item) => {
            return {
                date: new Date(item.day).toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
                total_videos_watched: item.value,
            };
        });
    } else {
        combinedChartData = props.data['videos_watched']?.chart_data.map((item) => {
            return {
                date: new Date(item.day).toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
                videos_watched: item.value,
            };
        });
    }

    const formatTime = (seconds: number): string => {
        if (seconds < 60) {
            return Math.floor(seconds) + 's';
        } else if (seconds < 3600) {
            return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return hours + 'h ' + minutes + 'm';
        }
    };

    console.log('Charts:', charts);
    console.log('Combined Chart Data:', combinedChartData);

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">

            <Tab 
                className="flex space-x-2 mb-4 justify-around text-xl font-semibold w-full"
                titles={chartVariants.map((variant) => ({
                    title: chartVariantConfig[variant].title,
                    id: variant
                }))}
                activeTab={props.variant}
                onClick={props.onVariantChange}
            />

            <div className="flex justify-between items-center mb-4">
                <Tab
                    className="flex space-x-2 mb-4 text-md w-[40%]"
                    titles={periods.map((period) => ({
                        title: chartPeriodConfig[period].title,
                        id: period
                    }))}
                    activeTab={props.period}
                    onClick={props.onPeriodChange}
                />

                <Tab
                    className="flex space-x-2 mb-4 text-md w-[25%]"
                    titles={[
                        { title: 'Daily', id: 'daily' },
                        { title: 'Cumulative', id: 'cumulative' }
                    ]}
                    activeTab={isCumulative ? 'cumulative' : 'daily'}
                    onClick={(id) => {
                        setIsCumulative(id === 'cumulative');
                    }}
                />
            </div>
            
            <div className="h-64">
                <ResponsiveContainer width="100%" height={300}>
                    {
                        lineType === 'line' ? (
                            <AreaChart data={combinedChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                {props.variant === 'study_seconds' ? (
                                        <YAxis tickFormatter={formatTime} />
                                    ) : (
                                        <YAxis />
                                    )
                                }
                                {props.variant === 'study_seconds' &&
                                    <Tooltip formatter={(value: number) => formatTime(value)} />
                                }
                                <Legend />
                                {charts.map((chart) => {
                                    if (chart == 'videos_watched') {
                                        return null; // Skip rendering this chart if it's videos_watched
                                    }
                                    return (
                                    <Area 
                                    key={chart} 
                                    type="monotone" 
                                    dataKey={chart} 
                                    name={config.legend ? config.legend[charts.indexOf(chart)] : chartVariantConfig[props.variant].title}
                                    stroke={config.color ? config.color[charts.indexOf(chart)] : '#8884d8'}
                                    fill={config.color ? config.color[charts.indexOf(chart)] : '#8884d8'}
                                    />
                                )})}
                            </AreaChart>
                        ) : (
                            <BarChart data={combinedChartData}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {charts.map((chart) => {
                                    if (chart == 'total_videos_watched') {
                                        return null; // Skip rendering this chart if it's total_videos_watched
                                    }
                                    return (
                                        <Bar 
                                            key={chart} 
                                            dataKey={chart} 
                                            fill={config.color ? config.color[charts.indexOf(chart)] : '#8884d8'}
                                            name={config.legend ? config.legend[charts.indexOf(chart)] : chartVariantConfig[props.variant].title}
                                        />
                                    );
                                })}
                            </BarChart>
                        )
                    }
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Chart;