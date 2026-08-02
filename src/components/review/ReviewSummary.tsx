import StatisticsBox from "../dashboard/StatisticsBox";
import { REVIEW_GRADES, type ReviewGrade } from "../../types/review";

interface ReviewSummaryProps {
    total: number;
    gradeCounts: Record<ReviewGrade, number>;
    submitResult: { succeeded: number; failed: number };
    isSubmitting: boolean;
    onRetryFailed: () => void;
    onDone: () => void;
}

export function ReviewSummary({ total, gradeCounts, submitResult, isSubmitting, onRetryFailed, onDone }: ReviewSummaryProps) {
    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-white">Session Complete</h2>

            <div className="grid grid-cols-2 gap-3 w-full">
                <StatisticsBox title="Reviewed" value={total} />
                {REVIEW_GRADES.map(({ label, value }) => (
                    <StatisticsBox key={value} title={label} value={gradeCounts[value]} />
                ))}
            </div>

            <div className="w-full text-center text-white/80">
                {isSubmitting ? (
                    <p>Saving review results...</p>
                ) : submitResult.failed > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-amber-400">
                            {submitResult.succeeded}/{submitResult.succeeded + submitResult.failed} saved — {submitResult.failed} failed to save.
                        </p>
                        <button
                            onClick={onRetryFailed}
                            className="rounded-md bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-amber-700"
                        >
                            Retry Failed
                        </button>
                    </div>
                ) : (
                    <p className="text-teal-400">All {submitResult.succeeded} results saved.</p>
                )}
            </div>

            <button
                onClick={onDone}
                className="w-full rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-teal-700"
            >
                Done
            </button>
        </div>
    );
}
