import type { ContextRequest } from "../types/vocabContext";
import { apiClient } from "./client";

export const vocabApi = {
  getVocabAndContextSentence: (token, videoId: number, timestamp: number) =>
    apiClient.post("/get-vocab", {
      vocab_surface_form: token.surface,
      video_id: videoId,
      timestamp: timestamp,
    }),

  getContextualExplanation: (contextRequest: ContextRequest) =>
    apiClient.post("/context-explanation", contextRequest),
};
