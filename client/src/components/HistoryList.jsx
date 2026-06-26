import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function HistoryList({ activeId, refreshKey, onSelect, onDeleted }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/materials");
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function remove(e, id) {
    e.stopPropagation(); // don't trigger onSelect
    if (!confirm("Delete this study material? This cannot be undone.")) return;
    try {
      await api.delete(`/materials/${id}`);
      setItems((prev) => prev.filter((m) => m._id !== id));
      onDeleted?.(id);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">📚 History</h2>
        <button onClick={load} className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
          Refresh
        </button>
      </div>

      {loading && <p className="text-xs text-slate-400">Loading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!loading && items.length === 0 && (
        <p className="text-xs text-slate-400">No uploads yet. Your materials will appear here.</p>
      )}

      <ul className="space-y-1">
        {items.map((m) => {
          const isActive = m._id === activeId;
          return (
            <li key={m._id}>
              <div
                onClick={() => onSelect(m)}
                className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.topicName}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(m.createdAt).toLocaleDateString()}
                    {m.quizAttempts?.length
                      ? ` · best ${Math.max(...m.quizAttempts.map((a) => a.percentage))}% (${m.quizAttempts.length}×)`
                      : m.quizData?.length
                      ? ` · ${m.quizData.length}Q`
                      : " · no quiz"}
                  </p>
                </div>
                <button
                  onClick={(e) => remove(e, m._id)}
                  className="ml-2 shrink-0 text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
