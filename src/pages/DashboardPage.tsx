import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChartData, getDashboardStatistics } from "../api/dashboard";
import { useAuth } from "../authContext";
import { Modal } from "../components/common/Modal";
import type { ChartVariant } from "../components/dashboard/Chart";
import Chart from "../components/dashboard/Chart";
import StatisticsBox from "../components/dashboard/StatisticsBox";
import { chartVariantConfig } from "../config/dashboard";
import type { DashboardChartData, DashboardStatistics } from "../types/dashboard";


function DashboardPage() {
    const [ statistics, setStatistics] = useState<DashboardStatistics | null>(null);
    const [ dashboardChartData, setDashboardChartData ] = useState<DashboardChartData>({});
    const [ chartOptions, setChartOptions] = useState<ChartVariant>('study_seconds');
    const [ chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'all_time'>('week');
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate()

    const handleVariantChange = (variant: ChartVariant) => {
        setChartOptions(variant);
    };

    const handlePeriodChange = (period: 'week' | 'month' | 'all_time') => {
        setChartPeriod(period);
    };

    useEffect(() => {
        if (!user) return;
        getDashboardStatistics(user.id).then((response) => {
            setStatistics(response.data);
        }).catch((error) => {
            console.error("Error fetching dashboard statistics:", error);
        });
    }, [user])

    useEffect(() => {
        if (!user) return;
        const queryParams = chartVariantConfig[chartOptions].queryParams;
        for (const param of queryParams) {
            getChartData(user.id, param as ChartVariant, chartPeriod).then((response) => {
                setDashboardChartData((prevData) => ({
                    ...prevData,
                    [param]: response.data,
                }));
            }).catch((error) => {
                console.error("Error fetching chart data:", error);
            });
        }
    }, [user, chartOptions, chartPeriod]);
    
    if (!isAuthenticated) {
        return         <>
            <Modal
                isOpen={true}
                onClose={() => navigate("/")}
                message="Log in to access this feature."
                title="Log In Required!"
                confirmText="Log In"
                onConfirm={() => {
                    navigate("/login")
                }}
                closeOnConfirm={false}
            />
        </>
    }
    // change box color to more calm tone and slightly transparent and add a border to each box, and add a hover effect that slightly enlarges the box and changes the background color to a lighter shade of the original color.
    return (
        <div>
            <h1 className="text-4xl font-bold text-white p-4">Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {statistics ? (
                    <>
                        <StatisticsBox
                            title="Study Time"
                            value={statistics.study_seconds}
                            bgColor="bg-sky-400/75"
                        />
                        <StatisticsBox
                            title="Videos Watched"
                            value={statistics.total_videos_watched}
                            bgColor="bg-emerald-400/75"
                        />
                        <StatisticsBox
                            title="Streak Days"
                            value={statistics.streak}
                            bgColor="bg-rose-500/75"
                        />
                        <StatisticsBox
                            title="Vocabulary Seen"
                            value={statistics.total_vocab_seen}
                            bgColor="bg-amber-500/75"
                        />
                        <StatisticsBox
                            title="Vocabulary Known"
                            value={statistics.total_vocab_known}
                            bgColor="bg-violet-500/75"
                        />
                    </>
                ) : (
                    <p>Loading statistics...</p>
                )}
            </div>
            <div className="p-4">
                {dashboardChartData ? (
                    <Chart 
                    data={dashboardChartData}
                    variant={chartOptions}
                    period={chartPeriod}
                    onVariantChange={handleVariantChange}
                    onPeriodChange={handlePeriodChange}
                    />
                ) : (
                    <p>Loading chart data...</p>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;