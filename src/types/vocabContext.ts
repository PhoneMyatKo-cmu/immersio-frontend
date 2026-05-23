export interface ExampleSentence {
  japanese: string;
  reading: string;
  english: string;
}

export interface ContextResponse {
  explanation: string;
  examples: ExampleSentence[];
  confidence: "high" | "medium" | "low";
  dictionary_mismatche_detected: boolean;
}

export interface ContextRequest {
  vocab_id: number;
  sentence_id: number;
  surface_form: string;
  pos: string[];
  meanings: string[];
  context_sentence: string;
}

export interface ContextualExplanationProps {
  request: ContextRequest;
  surfaceForm: string;
}
