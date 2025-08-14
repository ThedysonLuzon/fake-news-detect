"use client";
import { useState } from "react";

export default function AnalyzePage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, text }),
        }
      );
      if (!r.ok) throw new Error(await r.text());
      setResult(await r.json());
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Fake News Analyzer (MVP)</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Optional title / headline"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full h-48 border rounded px-3 py-2"
          placeholder="Paste article text…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <button
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          disabled={loading || !text.trim()}
          type="submit"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      {error && <div className="text-red-600 border border-red-300 p-3 rounded">{error}</div>}

      {result && (
        <div className="space-y-3 border rounded p-4">
          <div className="text-sm">Label</div>
          <div className="text-xl font-medium">
            {result.label}{" "}
            <span className="text-gray-500">
              ({(result.score * 100).toFixed(1)}%)
            </span>
          </div>

          {result.evidence?.length > 0 && (
            <div>
              <div className="text-sm mb-1">Evidence</div>
              <ul className="list-disc ml-6 space-y-1">
                {result.evidence.map((e: any, i: number) => (
                  <li key={i}>
                    <span className="font-mono">{e.doc_id}:{e.chunk_id}</span> — {e.snippet}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.explanation && (
            <div className="space-y-1">
              <div className="text-sm">LLM Explanation</div>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(result.explanation, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
