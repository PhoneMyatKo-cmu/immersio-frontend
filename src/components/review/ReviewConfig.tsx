import { useState } from "react";

interface ReviewConfigProps {
    dueCount: number;
    onStart: (count: number) => void;
}

export function ReviewConfig({ dueCount, onStart }: ReviewConfigProps) {
    const [count, setCount] = useState(Math.min(dueCount, 20));

    if (dueCount === 0) {
        return (
            <div className="flex flex-col items-center gap-2 p-8 bg-gray-800/70 rounded-lg border border-gray-600 text-white text-center">
                <p className="text-lg font-semibold">No cards due right now</p>
                <p className="text-white/60 text-sm">Check back later once more of your saved vocabulary is due for review.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 p-8 bg-gray-800/70 rounded-lg border border-gray-600 text-white w-full max-w-sm">
            <p className="text-lg font-semibold">{dueCount} card{dueCount === 1 ? "" : "s"} due for review</p>
            <label className="flex flex-col gap-1 w-full text-sm text-white/70">
                Number of cards to review
                <input
                    type="number"
                    min={1}
                    max={dueCount}
                    value={count}
                    onChange={(e) => {
                        const value = Number(e.target.value);
                        setCount(Math.min(dueCount, Math.max(1, Number.isNaN(value) ? 1 : value)));
                    }}
                    className="bg-gray-700 rounded-sm px-3 py-2 text-white"
                />
            </label>
            <button
                onClick={() => onStart(count)}
                className="w-full rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-teal-700"
            >
                Start Review
            </button>
        </div>
    );
}
