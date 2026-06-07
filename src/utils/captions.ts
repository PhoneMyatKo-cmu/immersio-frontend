import type { Caption } from "../components/videoPlayer/CaptionBar";

export function getCaptionText(caption: Caption | null): string {
  if (!caption) return "";
  // Prefer tokens.surface joined together, fallback to text field if available
  return caption.tokens?.map((t) => t.surface).join("") || caption.text || "";
}
