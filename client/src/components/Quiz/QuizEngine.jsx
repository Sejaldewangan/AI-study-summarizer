import { useState } from "react";
import ResultsScreen from "./ResultsScreen.jsx";

export default function QuizEngine({ questions, material, onRestart }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null); // current question's pick
  const [answers, setAnswers] = useState([]); // picks per question
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  const isLast = current === questions.length - 1;

  function choose(option) {
    if (selected !== null) return; // lock after first pick
    setSelected(option);
    if (option === q.correctAnswer) setScore((s) => s + 1);
  }

  function next() {
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (isLast) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  function retake() {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setScore(0);
    setFinished(false);
    onRestart?.();
  }

  if (finished) {
    return (
      <ResultsScreen
        questions={questions}
        answers={answers}
        score={score}
        material={material}
        onRetake={retake}
      />
    );
  }

  function optionClass(option) {
    if (selected === null) return "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50";
    if (option === q.correctAnswer) return "border-emerald-500 bg-emerald-50 text-emerald-800";
    if (option === selected) return "border-red-500 bg-red-50 text-red-700";
    return "border-slate-200 opacity-60";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Question {current + 1} of {questions.length}
        </span>
        <span>Score: {score}</span>
      </div>

      <div className="mb-2 h-1.5 w-full rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full bg-indigo-500 transition-all"
          style={{ width: `${((current + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <h3 className="mb-5 mt-4 text-lg font-semibold">{q.question}</h3>

      <div className="space-y-3">
        {q.options.map((option) => (
          <button
            key={option}
            onClick={() => choose(option)}
            disabled={selected !== null}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${optionClass(option)}`}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={next}
        disabled={selected === null}
        className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isLast ? "See Results" : "Next Question"}
      </button>
    </div>
  );
}
