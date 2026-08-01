import { useCallback, useEffect, useRef, useState } from "react";
import { reviewApi } from "../api/review";
import type { ReviewGrade, ReviewLogEntry, ReviewVocabItem } from "../types/review";

export type ReviewSessionState = "loading" | "config" | "in-progress" | "submitting" | "summary";

export function useReviewSession(userId: number | undefined) {
    const [state, setState] = useState<ReviewSessionState>("loading");
    const [dueVocab, setDueVocab] = useState<ReviewVocabItem[]>([]);
    const [sessionQueue, setSessionQueue] = useState<ReviewVocabItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [gradeCounts, setGradeCounts] = useState<Record<ReviewGrade, number>>({ 0: 0, 3: 0, 4: 0, 5: 0 });
    const [submitResult, setSubmitResult] = useState<{ succeeded: number; failed: number }>({ succeeded: 0, failed: 0 });

    const logsRef = useRef<ReviewLogEntry[]>([]);
    const failedLogsRef = useRef<ReviewLogEntry[]>([]);

    useEffect(() => {
        if (!userId) return;
        reviewApi.getDueVocab(userId)
            .then((response) => {
                setDueVocab(response.data);
                setState("config");
            })
            .catch((error) => {
                console.error("Error fetching due vocab:", error);
                setDueVocab([]);
                setState("config");
            });
    }, [userId]);

    useEffect(() => {
        if (state !== "in-progress" && state !== "submitting") return;
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [state]);

    const submitLogs = useCallback(async (userId: number, logs: ReviewLogEntry[]) => {
        setState("submitting");
        const results = await Promise.allSettled(
            logs.map((log) => reviewApi.submitGrade(userId, log.vocab_id, log.grade))
        );
        const failedLogs = logs.filter((_, i) => results[i].status === "rejected");
        failedLogsRef.current = failedLogs;
        setSubmitResult((prev) => ({
            succeeded: prev.succeeded + (results.length - failedLogs.length),
            failed: failedLogs.length,
        }));
        setState("summary");
    }, []);

    const startSession = useCallback((count: number) => {
        const queue = dueVocab.slice(0, count);
        setSessionQueue(queue);
        setCurrentIndex(0);
        setIsRevealed(false);
        setGradeCounts({ 0: 0, 3: 0, 4: 0, 5: 0 });
        setSubmitResult({ succeeded: 0, failed: 0 });
        logsRef.current = [];
        setState("in-progress");
    }, [dueVocab]);

    const reveal = useCallback(() => setIsRevealed(true), []);

    const grade = useCallback((value: ReviewGrade) => {
        const card = sessionQueue[currentIndex];
        if (!card || !userId) return;

        logsRef.current.push({ user_vocab_id: card.user_vocab_id, vocab_id: card.vocab_id, grade: value });
        setGradeCounts((prev) => ({ ...prev, [value]: prev[value] + 1 }));

        const nextIndex = currentIndex + 1;
        if (nextIndex >= sessionQueue.length) {
            submitLogs(userId, logsRef.current);
            return;
        }
        setCurrentIndex(nextIndex);
        setIsRevealed(false);
    }, [currentIndex, sessionQueue, userId, submitLogs]);

    const retryFailed = useCallback(() => {
        if (!userId) return;
        submitLogs(userId, failedLogsRef.current);
    }, [userId, submitLogs]);

    const reset = useCallback(() => setState("config"), []);

    return {
        state,
        dueVocab,
        sessionQueue,
        currentIndex,
        isRevealed,
        gradeCounts,
        submitResult,
        startSession,
        reveal,
        grade,
        retryFailed,
        reset,
    };
}
