import { apiClient } from "./client";

export const shadowingApi = {
  sendAudioForScore: async (form: FormData) => {
    return apiClient.post("/shadowing/pronunciation_score", form, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },
};
