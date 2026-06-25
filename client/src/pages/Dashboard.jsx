import { useState } from "react";
import FileUploadZone from "../components/FileUploadZone.jsx";
import SummaryView from "../components/SummaryView.jsx";
import KeyTopicsView from "../components/KeyTopicsView.jsx";
import HistoryList from "../components/HistoryList.jsx";
import DifficultySelector from "../components/Quiz/DifficultySelector.jsx";
import QuizEngine from "../components/Quiz/QuizEngine.jsx";

export default function Dashboard() {
  const [material, setMaterial] = useState(null); // active StudyMaterial
  const [quiz, setQuiz] = useState(null); // generated question array
  const [refreshKey, setRefreshKey] = useState(0); // bump to reload history

  function handleUploaded(doc) {
    setMaterial(doc);
    setQuiz(null);
    setRefreshKey((k) => k + 1); // new item → refresh history
  }

  // Open a past material; its saved summary/topics/quiz come with the doc.
  function openFromHistory(doc) {
    setMaterial(doc);
    setQuiz(doc.quizData?.length ? doc.quizData : null);
  }

  function reset() {
    setMaterial(null);
    setQuiz(null);
  }

  function handleDeleted(id) {
    if (material?._id === id) reset(); // deleted the open one → clear view
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Study Dashboard</h1>
        <p className="text-slate-600">
          Upload a PDF, Word doc, or photo — then generate a summary, key topics, and a quiz.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* History sidebar */}
        <HistoryList
          activeId={material?._id}
          refreshKey={refreshKey}
          onSelect={openFromHistory}
          onDeleted={handleDeleted}
        />

        {/* Main column */}
        <div className="space-y-6">
          {!material ? (
            <FileUploadZone onUploaded={handleUploaded} />
          ) : (
            <>
              <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3">
                <div>
                  <p className="font-medium text-indigo-900">{material.topicName}</p>
                  <p className="text-xs text-indigo-700">
                    {material.extractedText.length.toLocaleString()} characters extracted
                  </p>
                </div>
                <button onClick={reset} className="text-sm font-medium text-indigo-600 hover:underline">
                  + New upload
                </button>
              </div>

              <SummaryView material={material} onUpdated={setMaterial} />

              <KeyTopicsView material={material} onUpdated={setMaterial} />

              {quiz ? (
                <QuizEngine questions={quiz} material={material} onRestart={() => {}} />
              ) : (
                <DifficultySelector material={material} onQuizReady={setQuiz} />
              )}

              {quiz && (
                <button
                  onClick={() => setQuiz(null)}
                  className="text-sm font-medium text-slate-500 hover:underline"
                >
                  ← Generate a different quiz
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
