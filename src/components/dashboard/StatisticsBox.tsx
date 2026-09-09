interface StatisticsBoxProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    accent?: string;      // text-color class for the icon accent
    hint?: string;
    // Kept for backward-compat with existing callers (e.g. ReviewSummary); unused for the surface.
    bgColor?: string;
    textColor?: string;
}

function StatisticsBox({ title, value, icon, accent = "text-teal-400", hint }: StatisticsBoxProps) {
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

    const displayValue = typeof value === 'number' && title === 'Study Time' ? formatTime(value) : value;
    return (
        <div className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-white/50">{title}</h2>
                {icon && <span className={accent}>{icon}</span>}
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums">{displayValue}</p>
            {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
        </div>
    );
}

export default StatisticsBox;
