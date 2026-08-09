import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { Modal } from "../components/common/Modal";
import { ReviewCard } from "../components/review/ReviewCard";
import { ReviewConfig } from "../components/review/ReviewConfig";
import { ReviewSummary } from "../components/review/ReviewSummary";
import { useReviewSession } from "../hooks/useReviewSession";

function ReviewPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const session = useReviewSession(user?.id);

    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        return (
            <Modal
                isOpen={true}
                onClose={() => navigate("/")}
                message="Log in to access this feature."
                title="Log In Required!"
                confirmText="Log In"
                onConfirm={() => navigate("/login")}
                closeOnConfirm={false}
            />
        );
    }

    return (
        <div className="p-4 flex flex-col items-center justify-start min-h-screen w-full">
            <h1 className="text-2xl font-bold mb-4 text-white">Vocabulary Review</h1>

            {session.state === "loading" && null}

            {session.state === "config" && (
                <ReviewConfig dueCount={session.dueVocab.length} onStart={session.startSession} />
            )}

            {(session.state === "in-progress") && session.sessionQueue[session.currentIndex] && (
                <ReviewCard
                    vocab={session.sessionQueue[session.currentIndex]}
                    index={session.currentIndex}
                    total={session.sessionQueue.length}
                    isRevealed={session.isRevealed}
                    onReveal={session.reveal}
                    onGrade={session.grade}
                />
            )}

            {(session.state === "submitting" || session.state === "summary") && (
                <ReviewSummary
                    total={session.sessionQueue.length}
                    gradeCounts={session.gradeCounts}
                    submitResult={session.submitResult}
                    isSubmitting={session.state === "submitting"}
                    onRetryFailed={session.retryFailed}
                    onDone={() => navigate("/library")}
                />
            )}
        </div>
    );
}

export default ReviewPage;
