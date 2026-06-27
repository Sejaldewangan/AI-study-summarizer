import ReactMarkdown from "react-markdown";
import { SkeletonLines } from "./ui/Skeleton.jsx";

// Shows the AI study-focus report produced after a quiz. Driven by state lifted
// from the quiz results so it can live next to the summary / key topics.
export default function StudyFocusView({ state }) {
  if (!state) return null; // no quiz taken yet
  const { loading, text, error } = state;

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/5">
      <h3 className="mb-3 text-lg font-semibold text-indigo-900 dark:text-indigo-300">
        📌 Your Study Focus
      </h3>
      {loading && <SkeletonLines lines={4} />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && text && (
        <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:mt-4 prose-headings:mb-1 prose-p:my-1 prose-li:my-0.5">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
