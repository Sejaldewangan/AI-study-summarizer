import { useState } from "react";
import { motion } from "framer-motion";
import { ListChecks, Layers, History, ChevronDown } from "lucide-react";
import FileUploadZone from "../components/FileUploadZone.jsx";
import SummaryView from "../components/SummaryView.jsx";
import KeyTopicsView from "../components/KeyTopicsView.jsx";
import StudyFocusView from "../components/StudyFocusView.jsx";
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
  const [tab, setTab] = useState("quiz");
  const [studyFocus, setStudyFocus] = useState(null);
  const [showHistory, setShowHistory] = useState(false); // mobile drawer

  function startQuiz(questions, level) {
    setQuiz(questions);
    setDifficulty(level || "Medium");
    setStudyFocus(null);
  }
  function handleUploaded(doc) {
    setMaterial(doc);
    setQuiz(null);
    setTab("quiz");
    setStudyFocus(null);
    setRefreshKey((k) => k + 1);
  }
  function openFromHistory(doc) {
    setMaterial(doc);
    setQuiz(doc.quizData?.length ? doc.quizData : null);
    setTab("quiz");
    setStudyFocus(null);
    setShowHistory(false);
  }
  function reset() {
    setMaterial(null);
    setQuiz(null);
    setStudyFocus(null);
  }
  function handleDeleted(id) {
    if (material?._id === id) reset();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl font-bold sm:text-2xl">Study Dashboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          Upload a PDF, Word doc, or photo — study and test yourself side-by-side.
        </p>
      </div>

      {/* Mobile history toggle */}
      <button
        onClick={() => setShowHistory((s) => !s)}
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm font-medium shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <History size={16} /> History
        </span>
        <ChevronDown size={16} className={`transition ${showHistory ? "rotate-180" : ""}`} />
      </button>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* History — collapsible on mobile, always on lg */}
        <div className={`${showHistory ? "block" : "hidden"} lg:block`}>
          <HistoryList
            activeId={material?._id}
            refreshKey={refreshKey}
            onSelect={openFromHistory}
            onDeleted={handleDeleted}
          />
        </div>

        {!material ? (
          <FileUploadZone onUploaded={handleUploaded} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Material header */}
            <div className="glass-soft flex items-center justify-between rounded-xl px-4 py-3">
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
                + New
              </button>
            </div>

            {/* Split-screen workspace */}
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-6">
                <SummaryView material={material} onUpdated={setMaterial} />
                <KeyTopicsView material={material} onUpdated={setMaterial} />
                <StudyFocusView state={studyFocus} />
              </div>

              <div className="space-y-4">
                <div className="glass-soft flex gap-1 rounded-xl p-1">
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
                        onFeedback={setStudyFocus}
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
          </motion.div>
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
