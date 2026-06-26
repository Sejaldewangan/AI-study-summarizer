import { useState } from "react";
import { ListChecks, Layers } from "lucide-react";
import FileUploadZone from "../components/FileUploadZone.jsx";
import SummaryView from "../components/SummaryView.jsx";
import KeyTopicsView from "../components/KeyTopicsView.jsx";
import HistoryList from "../components/HistoryList.jsx";
import FlashcardDeck from "../components/FlashcardDeck.jsx";
import AskAIDrawer from "../components/AskAIDrawer.jsx";
import DifficultySelector from "../components/Quiz/DifficultySelector.jsx";
import QuizEngine from "../components/Quiz/QuizEngine.jsx";

export default function Dashboard() {
  const [material, setMaterial] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [difficulty, setDifficulty] = useState("Medium");
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState("quiz"); // quiz | flashcards

  function startQuiz(questions, level) {
    setQuiz(questions);
    setDifficulty(level || "Medium");
  }
  function handleUploaded(doc) {
    setMaterial(doc);
    setQuiz(null);
    setTab("quiz");
    setRefreshKey((k) => k + 1);
  }
  function openFromHistory(doc) {
    setMaterial(doc);
    setQuiz(doc.quizData?.length ? doc.quizData : null);
    setTab("quiz");
  }
  function reset() {
    setMaterial(null);
    setQuiz(null);
  }
  function handleDeleted(id) {
    if (material?._id === id) reset();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Study Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Upload a PDF, Word doc, or photo — study and test yourself side-by-side.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <HistoryList
          activeId={material?._id}
          refreshKey={refreshKey}
          onSelect={openFromHistory}
          onDeleted={handleDeleted}
        />

        {!material ? (
          <FileUploadZone onUploaded={handleUploaded} />
        ) : (
          <div className="space-y-4">
            {/* Material header */}
            <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-500/10">
              <div className="min-w-0">
                <p className="truncate font-medium text-indigo-900 dark:text-indigo-200">
                  {material.topicName}
                </p>
                <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70">
                  {material.extractedText.length.toLocaleString()} characters extracted
                </p>
              </div>
              <button
                onClick={reset}
                className="shrink-0 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
              >
                + New upload
              </button>
            </div>

            {/* Split-screen workspace */}
            <div className="grid gap-6 xl:grid-cols-2">
              {/* Left: study material */}
              <div className="space-y-6">
                <SummaryView material={material} onUpdated={setMaterial} />
                <KeyTopicsView material={material} onUpdated={setMaterial} />
              </div>

              {/* Right: test yourself (tabs) */}
              <div className="space-y-4">
                <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  <TabButton active={tab === "quiz"} onClick={() => setTab("quiz")} icon={ListChecks}>
                    Quiz
                  </TabButton>
                  <TabButton active={tab === "flashcards"} onClick={() => setTab("flashcards")} icon={Layers}>
                    Flashcards
                  </TabButton>
                </div>

                {tab === "quiz" ? (
                  quiz ? (
                    <>
                      <QuizEngine
                        questions={quiz}
                        material={material}
                        difficulty={difficulty}
                        onAttemptSaved={() => setRefreshKey((k) => k + 1)}
                        onRestart={() => {}}
                      />
                      <button
                        onClick={() => setQuiz(null)}
                        className="text-sm font-medium text-slate-500 hover:underline dark:text-slate-400"
                      >
                        ← Generate a different quiz
                      </button>
                    </>
                  ) : (
                    <DifficultySelector material={material} onQuizReady={startQuiz} />
                  )
                ) : (
                  <FlashcardDeck material={material} onUpdated={setMaterial} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {material && <AskAIDrawer material={material} />}
    </main>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300"
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      }`}
    >
      <Icon size={16} /> {children}
    </button>
  );
}
