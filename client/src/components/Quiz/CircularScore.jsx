import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

// Animated circular progress that counts up to the final %, with a confetti
// burst on a great score.
export default function CircularScore({ score, total }) {
  const target = Math.round((score / total) * 100);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 1100;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setPct(Math.round(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Celebrate strong scores once the count-up finishes.
    let timer;
    if (target >= 80) {
      timer = setTimeout(() => burst(target === 100), dur);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const R = 54;
  const C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;
  const color = target >= 80 ? "#10b981" : target >= 50 ? "#6366f1" : "#f59e0b";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-700" />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            strokeWidth="10"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {pct}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {score}/{total}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        {target === 100 ? "Perfect! 🎉" : target >= 80 ? "Great job! 🌟" : target >= 50 ? "Keep going! 💪" : "Review & retry 📚"}
      </p>
    </div>
  );
}

function burst(perfect) {
  const base = { spread: 70, startVelocity: 45, ticks: 200, zIndex: 9999 };
  confetti({ ...base, particleCount: perfect ? 160 : 90, origin: { y: 0.6 } });
  if (perfect) {
    setTimeout(() => confetti({ ...base, particleCount: 80, angle: 60, origin: { x: 0 } }), 200);
    setTimeout(() => confetti({ ...base, particleCount: 80, angle: 120, origin: { x: 1 } }), 200);
  }
}
