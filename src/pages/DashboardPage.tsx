import { Bookmark, ChevronDown, ChevronUp, Clock, Eye, Flame, GraduationCap, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChartData, getDashboardStatistics } from "../api/dashboard";
import { userVocabApi } from "../api/user_vocab";
import { useAuth } from "../authContext";
import { Modal } from "../components/common/Modal";
import type { ChartVariant, SrsStateDatum } from "../components/dashboard/Chart";
import Chart from "../components/dashboard/Chart";
import StatisticsBox from "../components/dashboard/StatisticsBox";
import { chartVariantConfig } from "../config/dashboard";
import type { DashboardChartData, DashboardStatistics } from "../types/dashboard";
import type { SavedVocab } from "../types/vocab";

const SRS_STATE_LABELS: Record<SavedVocab["srs_state"], string> = {
    not_studied: "Not Studied",
    studying: "Studying",
    mastered: "Mastered",
};

function streakMessage(streak: number): string {
    if (streak <= 0) return "Watch or review today to start your streak.";
    if (streak === 1) return "Great start — come back tomorrow to keep it going.";
    return "You're on a roll. Keep it alive today!";
}

function DashboardPage() {
    const [ statistics, setStatistics] = useState<DashboardStatistics | null>(null);
    const [ dashboardChartData, setDashboardChartData ] = useState<DashboardChartData>({});
    const [ chartOptions, setChartOptions] = useState<ChartVariant>('study_seconds');
    const [ chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'all_time'>('week');
    const [ savedVocabCount, setSavedVocabCount ] = useState<number | null>(null);
    const [ srsStateData, setSrsStateData ] = useState<SrsStateDatum[]>([]);
    const [ showCharts, setShowCharts ] = useState(false);
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
        userVocabApi.getSavedVocab(user.id).then((response) => {
            const savedVocab: SavedVocab[] = response.data['saved_vocab'];
            setSavedVocabCount(savedVocab.length);

            const counts: Record<SavedVocab["srs_state"], number> = { not_studied: 0, studying: 0, mastered: 0 };
            for (const vocab of savedVocab) {
                counts[vocab.srs_state] = (counts[vocab.srs_state] ?? 0) + 1;
            }
            setSrsStateData(
                (Object.keys(SRS_STATE_LABELS) as SavedVocab["srs_state"][]).map((state) => ({
                    name: SRS_STATE_LABELS[state],
                    value: counts[state],
                }))
            );
        }).catch((error) => {
            console.error("Error fetching saved vocab:", error);
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
    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
            <h1 className="text-3xl font-bold text-white">Progress</h1>
            <p className="mt-1 mb-6 text-sm text-white/50">
                Here's how your Japanese is coming along{user?.first_name ? `, ${user.first_name}` : ""}.
            </p>

            {statistics ? (
                <>
                    {/* Hero — streak leads the page */}
                    <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                                <Flame size={28} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold tabular-nums text-white">
                                    {statistics.streak} day{statistics.streak === 1 ? "" : "s"} streak
                                </div>
                                <div className="mt-0.5 text-sm text-white/60">
                                    {streakMessage(statistics.streak)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* At-a-glance tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatisticsBox
                            title="Study Time"
                            value={statistics.study_seconds}
                            icon={<Clock size={18} />}
                            accent="text-sky-400"
                        />
                        <StatisticsBox
                            title="Videos Watched"
                            value={statistics.total_videos_watched}
                            icon={<Video size={18} />}
                            accent="text-emerald-400"
                        />
                        <StatisticsBox
                            title="Vocabulary Seen"
                            value={statistics.total_vocab_seen}
                            icon={<Eye size={18} />}
                            accent="text-amber-400"
                        />
                        <StatisticsBox
                            title="Vocabulary Known"
                            value={statistics.total_vocab_known}
                            icon={<GraduationCap size={18} />}
                            accent="text-violet-400"
                        />
                        <StatisticsBox
                            title="Vocabulary Saved"
                            value={savedVocabCount ?? 0}
                            icon={<Bookmark size={18} />}
                            accent="text-teal-400"
                        />
                    </div>
                </>
            ) : (
                <p className="py-8 text-center text-white/40">Loading statistics...</p>
            )}

            {/* Detailed charts — opt-in, so the default view stays learner-first */}
            <div className="mt-6">
                <button
                    onClick={() => setShowCharts((v) => !v)}
                    aria-expanded={showCharts}
                    className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white"
                >
                    {showCharts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showCharts ? "Hide detailed charts" : "View detailed charts"}
                </button>

                {showCharts && (
                    <div className="mt-3">
                        {dashboardChartData ? (
                            <Chart
                                data={dashboardChartData}
                                variant={chartOptions}
                                period={chartPeriod}
                                onVariantChange={handleVariantChange}
                                onPeriodChange={handlePeriodChange}
                                srsStateData={srsStateData}
                            />
                        ) : (
                            <p className="text-white/40">Loading chart data...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;