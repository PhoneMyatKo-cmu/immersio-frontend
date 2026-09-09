
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartPeriodConfig, chartVariantConfig } from "../../config/dashboard";
import type { ChartData, DashboardChartData } from "../../types/dashboard";
import Tab from "../common/Tab";

export type ChartVariant = 'study_seconds' | 'videos_watched' | 'vocab' | 'srs_state';

export type SrsStateDatum = { name: string; value: number };

// Shared styling to lift the charts out of the raw Recharts default look.
const AXIS_TICK = { fill: 'rgba(255,255,255,0.4)', fontSize: 12 };
const TOOLTIP_STYLE = { background: '#101c30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 };
const TOOLTIP_LABEL_STYLE = { color: 'rgba(255,255,255,0.6)' };
const TOOLTIP_CURSOR = { fill: 'rgba(255,255,255,0.05)' };
const LEGEND_STYLE = { color: 'rgba(255,255,255,0.6)', fontSize: 12 };

interface ChartProps {
    data: DashboardChartData;
    variant: ChartVariant;
    period?: 'week' | 'month' | 'all_time';
    onVariantChange: (variant: ChartVariant) => void;
    onPeriodChange: (period: 'week' | 'month' | 'all_time') => void;
    srsStateData?: SrsStateDatum[];
}

function Chart(props: ChartProps) {
    const chartVariants = ['study_seconds', 'videos_watched', 'vocab', 'srs_state'] as ChartVariant[];
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

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

            <Tab
                className="flex space-x-2 mb-4 justify-around text-sm sm:text-lg md:text-xl font-semibold w-full"
                titles={chartVariants.map((variant) => ({
                    title: chartVariantConfig[variant].title,
                    id: variant
                }))}
                activeTab={props.variant}
                onClick={props.onVariantChange}
            />

            {props.variant !== 'srs_state' && (
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Tab
                        className="flex space-x-2 text-md w-full sm:w-[45%]"
                        titles={periods.map((period) => ({
                            title: chartPeriodConfig[period].title,
                            id: period
                        }))}
                        activeTab={props.period}
                        onClick={props.onPeriodChange}
                    />

                    <Tab
                        className="flex space-x-2 text-md w-full sm:w-[40%]"
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
            )}

            <div className="h-64">
                {props.variant === 'srs_state' ? (
                    !props.srsStateData || props.srsStateData.every((entry) => entry.value === 0) ? (
                        <div className="flex h-full items-center justify-center text-white/60">
                            No saved vocabulary yet.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={props.srsStateData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={64}
                                    outerRadius={96}
                                    paddingAngle={2}
                                    stroke="none"
                                >
                                    {props.srsStateData.map((entry, index) => (
                                        <Cell key={entry.name} fill={config.color ? config.color[index] : '#13b7a5'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={{ color: '#fff' }} />
                                <Legend wrapperStyle={LEGEND_STYLE} />
                            </PieChart>
                        </ResponsiveContainer>
                    )
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                    {
                        lineType === 'line' ? (
                            <AreaChart data={combinedChartData}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                                {props.variant === 'study_seconds' ? (
                                        <YAxis tickFormatter={formatTime} tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} />
                                    ) : (
                                        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
                                    )
                                }
                                {props.variant === 'study_seconds' ? (
                                    <Tooltip formatter={(value) => formatTime(Number(value))} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={TOOLTIP_CURSOR} />
                                ) : (
                                    <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={TOOLTIP_CURSOR} />
                                )}
                                <Legend wrapperStyle={LEGEND_STYLE} />
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
                                    stroke={config.color ? config.color[charts.indexOf(chart)] : '#13b7a5'}
                                    fill={config.color ? config.color[charts.indexOf(chart)] : '#13b7a5'}
                                    strokeWidth={2}
                                    fillOpacity={0.18}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                    />
                                )})}
                            </AreaChart>
                        ) : (
                            <BarChart data={combinedChartData}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} cursor={TOOLTIP_CURSOR} />
                                <Legend wrapperStyle={LEGEND_STYLE} />
                                {charts.map((chart) => {
                                    if (chart == 'total_videos_watched') {
                                        return null; // Skip rendering this chart if it's total_videos_watched
                                    }
                                    return (
                                        <Bar
                                            key={chart}
                                            dataKey={chart}
                                            fill={config.color ? config.color[charts.indexOf(chart)] : '#13b7a5'}
                                            name={config.legend ? config.legend[charts.indexOf(chart)] : chartVariantConfig[props.variant].title}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    );
                                })}
                            </BarChart>
                        )
                    }
                </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default Chart;