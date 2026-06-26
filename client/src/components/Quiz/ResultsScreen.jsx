import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Lightbulb } from "lucide-react";
import api from "../../api/axios.js";
import CircularScore from "./CircularScore.jsx";
import AttemptHistoryChart from "./AttemptHistoryChart.jsx";
import { SkeletonLines } from "../ui/Skeleton.jsx";

export default function ResultsScreen({
  questions,
  answers,
  score,
  material,
  difficulty,
  onAttemptSaved,
  onRetake,
}) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [explain, setExplain] = useState({}); // index -> { loading, text, error }

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

  async function saveAttempt() {
    if (!material?._id) return;
    try {
      const { data } = await api.post(`/materials/${material._id}/attempts`, {
        score,
        total: questions.length,
        difficulty,
      });
      setAttempts(data.quizAttempts);
      onAttemptSaved?.();
    } catch {
      setAttempts(material.quizAttempts || []);
    }
  }

  async function getExplanation(i) {
    const q = questions[i];
    setExplain((e) => ({ ...e, [i]: { loading: true } }));
    try {
      const { data } = await api.post("/explain-answer", {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: answers[i] ?? null,
      });
      setExplain((e) => ({ ...e, [i]: { text: data.explanation } }));
    } catch (err) {
      setExplain((e) => ({ ...e, [i]: { error: err.message } }));
    }
  }

  useEffect(() => {
    saveAttempt();
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Animated score + confetti */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-center text-lg font-semibold">Quiz Results</h2>
        <CircularScore score={score} total={questions.length} />

        {attempts.length > 1 && (
          <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              📈 Score History ({attempts.length} attempts)
            </h4>
            <AttemptHistoryChart attempts={attempts} />
          </div>
        )}
      </div>

      {/* Smart review */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-semibold">Review</h3>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const picked = answers[i];
            const correct = picked === q.correctAnswer;
            const ex = explain[i];
            return (
              <div key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="font-medium">
                  {i + 1}. {q.question}
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  {q.options.map((opt) => {
                    const isCorrect = opt === q.correctAnswer;
                    const isPicked = opt === picked;
                    let cls =
                      "rounded-md px-2 py-1 text-slate-600 dark:text-slate-300";
                    if (isCorrect) cls = "rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
                    else if (isPicked) cls = "rounded-md bg-red-50 px-2 py-1 text-red-600 line-through dark:bg-red-500/15 dark:text-red-300";
                    return (
                      <p key={opt} className={cls}>
                        {isCorrect ? "✓ " : isPicked ? "✗ " : "• "}
                        {opt}
                      </p>
                    );
                  })}
                </div>

                {!correct && (
                  <div className="mt-3">
                    {!ex && (
                      <button
                        onClick={() => getExplanation(i)}
                        className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        <Lightbulb size={15} /> Explain this
                      </button>
                    )}
                    {ex?.loading && <p className="text-xs text-slate-400">Thinking…</p>}
                    {ex?.error && <p className="text-xs text-red-500">{ex.error}</p>}
                    {ex?.text && (
                      <div className="mt-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                        <span className="font-medium">💡 </span>
                        {ex.text}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI study-focus report */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/5">
        <h3 className="mb-3 text-lg font-semibold text-indigo-900 dark:text-indigo-300">
          📌 Your Study Focus
        </h3>
        {loading && <SkeletonLines lines={4} />}
        {error && (
          <div className="text-sm">
            <p className="text-red-600">{error}</p>
            <button onClick={loadFeedback} className="mt-2 font-medium text-indigo-600 hover:underline">
              Retry analysis
            </button>
          </div>
        )}
        {!loading && !error && feedback && (
          <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:mt-4 prose-headings:mb-1 prose-p:my-1 prose-li:my-0.5">
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
