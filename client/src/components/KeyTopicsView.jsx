import { useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api/axios.js";

export default function KeyTopicsView({ material, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/generate-key-topics", {
        materialId: material._id,
      });
      onUpdated({ ...material, keyTopics: data.keyTopics });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-900">🔑 Key Topics to Improve</h2>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {loading ? "Finding…" : material.keyTopics ? "Regenerate" : "Get Key Topics"}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {material.keyTopics ? (
        <div className="prose prose-slate max-w-none prose-li:my-0.5">
          <ReactMarkdown>{material.keyTopics}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          Pull out the highest-yield topics from your material, each with a tip on how to
          improve. Click “Get Key Topics”.
        </p>
      )}
    </div>
  );
}
