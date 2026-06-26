import { useEffect, useState } from "react";

// Animated skeleton text blocks — shown while AI is generating.
export function SkeletonLines({ lines = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
          style={{ width: `${70 + ((i * 37) % 30)}%` }}
        />
      ))}
    </div>
  );
}

const STEPS = ["Reading material", "Thinking", "Writing response"];

// Step-by-step indicator that auto-advances to keep the user engaged.
export function AIProgressSteps({ steps = STEPS, intervalMs = 2200 }) {
  // We can't know real backend progress, so advance optimistically.
  const [active] = useStepTimer(steps.length, intervalMs);
  return (
    <ol className="mb-4 space-y-2">
      {steps.map((s, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <li key={s} className="flex items-center gap-2 text-sm">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                done
                  ? "bg-emerald-500 text-white"
                  : current
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-200 text-slate-500 dark:bg-slate-700"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={
                current
                  ? "font-medium text-indigo-600 dark:text-indigo-300"
                  : done
                  ? "text-slate-500 line-through dark:text-slate-400"
                  : "text-slate-400 dark:text-slate-500"
              }
            >
              {s}
              {current && <AnimatedDots />}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function useStepTimer(count, intervalMs) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setActive((a) => (a < count - 1 ? a + 1 : a)),
      intervalMs
    );
    return () => clearInterval(id);
  }, [count, intervalMs]);
  return [active, setActive];
}

function AnimatedDots() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN((x) => (x % 3) + 1), 400);
    return () => clearInterval(id);
  }, []);
  return <span>{".".repeat(n)}</span>;
}
