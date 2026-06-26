import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Volume2, Square, Sparkles } from "lucide-react";
import api from "../api/axios.js";
import { SkeletonLines, AIProgressSteps } from "./ui/Skeleton.jsx";

export default function SummaryView({ material, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);

  // Stop any speech if the material changes or component unmounts.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [material._id]);

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/generate-summary", { materialId: material._id });
      onUpdated({ ...material, summary: data.summary });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleSpeak() {
    const synth = window.speechSynthesis;
    if (!synth) return setError("Text-to-speech not supported in this browser.");
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    // strip markdown symbols for cleaner speech
    const text = material.summary.replace(/[#*_`>-]/g, " ");
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.onend = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles size={18} className="text-indigo-500" /> AI Summary
        </h2>
        <div className="flex items-center gap-2">
          {material.summary && (
            <button
              onClick={toggleSpeak}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title={speaking ? "Stop" : "Listen"}
            >
              {speaking ? <Square size={15} /> : <Volume2 size={15} />}
              {speaking ? "Stop" : "Listen"}
            </button>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Generating…" : material.summary ? "Regenerate" : "Generate Summary"}
          </button>
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <>
          <AIProgressSteps steps={["Reading material", "Finding key points", "Writing summary"]} />
          <SkeletonLines lines={5} />
        </>
      ) : material.summary ? (
        <div className="prose prose-slate max-w-none dark:prose-invert prose-li:my-0.5">
          <ReactMarkdown>{material.summary}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No summary yet. Click “Generate Summary” for a bulleted overview of your material.
        </p>
      )}
    </div>
  );
}
