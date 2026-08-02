
interface StatisticsBoxProps {
    title: string;
    value: string | number;
    bgColor?: string;
    textColor?: string;
}

function StatisticsBox({ title, value, bgColor, textColor }: StatisticsBoxProps) {
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
        <div className={`p-4 rounded-lg shadow-md border border-gray-600 ${bgColor || 'bg-gray-800/70'} ${textColor || 'text-white'} hover:scale-105 hover:bg-opacity-75 transition-transform duration-200`}>
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <p className="text-2xl font-bold">{displayValue}</p>
        </div>
    );
}

export default StatisticsBox;