import type { LearningSession } from "../types/session";
import { apiClient } from "./client";

export const flushSessionData = async (sessionData: LearningSession) => {
    const response = await apiClient.post("/session/", sessionData, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.data;
}

export const flushSessionDataWithBeacon = (sessionData: LearningSession) => {
    const blob = new Blob(
        [JSON.stringify(sessionData)], { type: "application/json" }
    )
    const success = navigator.sendBeacon(`${apiClient.defaults.baseURL}/session/`, blob);
    return success;
}