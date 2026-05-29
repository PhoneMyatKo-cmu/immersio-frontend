import { useEffect, useState } from "react";
import { vocabApi } from "../api/vocab_context";
import { useAuth } from "../authContext";
import type { SaveVocab } from "../types/vocabContext";

export function useVocabSave(vocabId: number | null) {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const onSave = (saveVocab: SaveVocab) => {
    vocabApi
      .saveVocabForUser(saveVocab)
      .then(() => setIsSaved(true))
      .catch(() => setIsSaved(false));
  };
  // Check if already saved when word changes
  useEffect(() => {
    if (!vocabId || !isAuthenticated) {
      setIsSaved(false);
      return;
    }

    vocabApi
      .checkSavedVocab(vocabId)
      .then((res) => {
        console.log("checkSavedVocab:", res.data);
        setIsSaved(res.data.saved);
      })
      .catch(() => setIsSaved(false));
  }, [vocabId, isAuthenticated]);

  return { isSaved, isAuthenticated, onSave };
}
