// hooks/useAnalyze.ts
import { useMutation } from "@tanstack/react-query";

type AnalyzeResponse = {
  label: string;              // "Fake" | "REAL" | etc.
  score: number;              // 0..1
  evidence?: { doc_id: string; chunk_id: number; snippet: string }[];
  explanation?: any;          // object or string, backend-defined
  // (backend may not send 'snippets' anymore, but we support it in the panel)
};

export function useAnalyze() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return useMutation({
    mutationFn: async (payload: { text: string; title?: string }) => {
      const res = await fetch(`${baseUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Server error ${res.status}: ${msg}`);
      }
      return (await res.json()) as AnalyzeResponse;
    },
  });
}