import type { ContextRequest, SaveVocab } from "../types/vocabContext";
import { apiClient } from "./client";

export const vocabApi = {
  getVocabAndContextSentence: (
    token,
    videoId: number,
    captionId: number,
    captionText: string,
  ) =>
    apiClient.post("/vocab", {
      vocab_surface_form: token.surface,
      video_id: videoId,
      caption: {
        id: captionId,
        text: captionText,
      },
    }),

  getContextualExplanation: (contextRequest: ContextRequest) =>
    apiClient.post("/context-explanation", contextRequest),

  checkSavedVocab: (vocabId: number) =>
    apiClient.get("/vocab/check-duplicate", {
      params: {
        vocab_id: vocabId,
      },
    }),

  saveVocabForUser: (saveVocab: SaveVocab) => {
    console.log(saveVocab);
    return apiClient.post("/vocab/save", saveVocab);
  },
};
