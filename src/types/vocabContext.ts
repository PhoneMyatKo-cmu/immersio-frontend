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
  caption_id: number;
  surface_form: string;
  pos: string[];
  meanings: string[];
  context_caption: string;
}

export interface ContextualExplanationProps {
  request: ContextRequest;
  surfaceForm: string;
}

export interface SaveVocab {
  vocab_id: number;
  video_id: number;
  caption_id: number;
  timestamp: number;
}
