import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../../api/axios.js";
import ResultsChart from "./ResultsChart.jsx";

export default function ResultsScreen({ questions, answers, score, material, onRetake }) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Build the per-question result payload once.
  const items = questions.map((q, i) => ({
    question: q.question,
    userAnswer: answers[i] ?? null,
    correctAnswer: q.correctAnswer,
    correct: answers[i] === q.correctAnswer,
  }));

  async function loadFeedback() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/quiz-feedback", {
        topicName: material?.topicName,
        score,
        total: questions.length,
        items,
      });
      setFeedback(data.feedback);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Auto-generate the study-focus report when results appear.
  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Score charts + per-question review */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-center text-lg font-semibold text-slate-800">
          Quiz Results
        </h2>

        <ResultsChart score={score} total={questions.length} items={items} />

        <div className="mt-6 space-y-4">
          {questions.map((q, i) => {
            const picked = answers[i];
            const correct = picked === q.correctAnswer;
            return (
              <div key={i} className="rounded-xl border border-slate-200 p-4">
                <p className="font-medium">
                  {i + 1}. {q.question}
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  {q.options.map((opt) => {
                    const isCorrect = opt === q.correctAnswer;
                    const isPicked = opt === picked;
                    let cls = "text-slate-600";
                    if (isCorrect) cls = "text-emerald-700 font-medium";
                    else if (isPicked) cls = "text-red-600 line-through";
                    return (
                      <p key={opt} className={cls}>
                        {isCorrect ? "✓ " : isPicked ? "✗ " : "• "}
                        {opt}
                      </p>
                    );
                  })}
                </div>
                {!correct && (
                  <p className="mt-1 text-xs text-slate-400">You chose: {picked ?? "—"}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI study-focus report */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-indigo-900">📌 Your Study Focus</h3>

        {loading && (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            Analyzing your answers…
          </div>
        )}

        {error && (
          <div className="text-sm">
            <p className="text-red-600">{error}</p>
            <button onClick={loadFeedback} className="mt-2 font-medium text-indigo-600 hover:underline">
              Retry analysis
            </button>
          </div>
        )}

        {!loading && !error && feedback && (
          <div className="prose prose-slate max-w-none prose-headings:mt-4 prose-headings:mb-1 prose-p:my-1 prose-li:my-0.5">
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        )}
      </div>

      <button
        onClick={onRetake}
        className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700"
      >
        Retake Quiz
      </button>
    </div>
  );
}
