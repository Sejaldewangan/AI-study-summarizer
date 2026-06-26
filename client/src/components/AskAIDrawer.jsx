import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../api/axios.js";

// Floating chat drawer. Answers questions using the material's text as context.
export default function AskAIDrawer({ material }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // {role, text}
  const [loading, setLoading] = useState(false);

  async function send(e) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const { data } = await api.post("/ask", { materialId: material._id, question: q });
      setMessages((m) => [...m, { role: "ai", text: data.answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "ai", text: `⚠️ ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-indigo-700"
      >
        <MessageCircle size={18} /> Ask AI
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed bottom-0 right-0 z-50 flex h-[80vh] w-full max-w-md flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-4 sm:right-4 sm:h-[70vh] sm:rounded-2xl dark:border-slate-700 dark:bg-slate-900"
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <div>
                  <h3 className="font-semibold">Ask about this material</h3>
                  <p className="truncate text-xs text-slate-400">{material.topicName}</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Ask anything about the uploaded material — e.g. “Explain the third bullet
                    point” or “Give me an example of this.”
                  </p>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "ml-auto bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {m.role === "ai" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                    ) : (
                      m.text
                    )}
                  </div>
                ))}
                {loading && <p className="text-sm text-slate-400">Thinking…</p>}
              </div>

              <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question…"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
