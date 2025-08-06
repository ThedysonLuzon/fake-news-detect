// hooks/useAnalyze.ts
import { useMutation } from "@tanstack/react-query";

export function useAnalyze() {
  return useMutation({
    // explicitly name the mutation function
    mutationFn: async (text: string) => {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }
      return res.json();
    },
  });
}
