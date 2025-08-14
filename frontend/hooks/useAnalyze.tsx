// hooks/useAnalyze.ts
import { useMutation } from "@tanstack/react-query";

type Evidence = { doc_id: string; chunk_id: number; snippet: string };

export type AnalyzeResponse = {
  label: string;                 // "Fake" | "Real" | etc.
  score: number;                 // 0..1
  evidence?: Evidence[];
  explanation?: unknown;         // object or string
};

export function useAnalyze() {
  return useMutation({
    mutationFn: async (payload: { text: string; title?: string; k?: number }) => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // If your backend expects {text, title, k}, this covers all
        body: JSON.stringify(payload),
        // optional: keep Vercel from caching
        cache: "no-store",
      });

      // friendlier error surface
      if (!res.ok) {
        let detail = await res.text().catch(() => "");
        try {
          const j = JSON.parse(detail);
          detail = j.detail || j.error || detail;
        } catch {}
        throw new Error(`Server error ${res.status}: ${detail || res.statusText}`);
      }

      return (await res.json()) as AnalyzeResponse;
    },
  });
}
