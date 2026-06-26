import { useState } from "react";
import api from "../../api/axios.js";

const LEVELS = ["Easy", "Medium", "Hard"];
const COUNTS = [3, 5, 10, 15, 20];

export default function DifficultySelector({ material, onQuizReady }) {
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/generate-quiz", {
        materialId: material._id,
        difficulty,
        count,
      });
      onQuizReady(data.quizData, difficulty);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-semibold">Generate a Quiz</h2>
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300">Difficulty</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600 dark:text-slate-300"># Questions</span>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {COUNTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Building quiz…" : `Generate ${count} Questions`}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
