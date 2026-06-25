import { useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api/axios.js";

export default function SummaryView({ material, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/generate-summary", {
        materialId: material._id,
      });
      onUpdated({ ...material, summary: data.summary });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Summary</h2>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Generating…" : material.summary ? "Regenerate" : "Generate Summary"}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {material.summary ? (
        <div className="prose prose-slate max-w-none prose-li:my-0.5">
          <ReactMarkdown>{material.summary}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No summary yet. Click “Generate Summary” to create a bulleted overview from your
          uploaded material.
        </p>
      )}
    </div>
  );
}
