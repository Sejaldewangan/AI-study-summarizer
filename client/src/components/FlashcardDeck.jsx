import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, Sparkles } from "lucide-react";
import api from "../api/axios.js";
import { SkeletonLines, AIProgressSteps } from "./ui/Skeleton.jsx";

export default function FlashcardDeck({ material, onUpdated }) {
  const cards = material.flashcards || [];
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/generate-flashcards", {
        materialId: material._id,
        count: 10,
      });
      onUpdated({ ...material, flashcards: data.flashcards });
      setIndex(0);
      setFlipped(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function go(dir) {
    setFlipped(false);
    setIndex((i) => (i + dir + cards.length) % cards.length);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <AIProgressSteps steps={["Reading material", "Designing cards", "Writing fronts & backs"]} />
        <SkeletonLines lines={5} />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <Sparkles className="mx-auto mb-2 text-indigo-500" />
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Turn this material into a deck of flip-cards.
        </p>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button
          onClick={generate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Generate Flashcards
        </button>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          Card {index + 1} / {cards.length}
        </span>
        <button onClick={generate} className="flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400">
          <RotateCw size={14} /> Regenerate
        </button>
      </div>

      {/* Flip card */}
      <div
        className="relative h-56 cursor-pointer select-none [perspective:1200px]"
        onClick={() => setFlipped((f) => !f)}
      >
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center [backface-visibility:hidden] dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-400">Question</span>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{card.front}</p>
            <span className="mt-4 text-xs text-slate-400">Click to flip</span>
          </div>
          {/* Back */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center [transform:rotateY(180deg)] [backface-visibility:hidden] dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-500">Answer</span>
            <p className="text-base text-slate-800 dark:text-slate-100">{card.back}</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Flip
        </button>
        <button
          onClick={() => go(1)}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
