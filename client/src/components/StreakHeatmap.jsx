// GitHub-style contribution heatmap of daily quiz activity (last ~17 weeks).
export default function StreakHeatmap({ attempts }) {
  const WEEKS = 17;
  const counts = {}; // 'YYYY-M-D' -> attempts that day
  attempts.forEach((a) => {
    const k = dayKey(new Date(a.takenAt));
    counts[k] = (counts[k] || 0) + 1;
  });

  // Build a grid ending today, going back WEEKS*7 days, aligned to weeks (Sun start).
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay())); // end of current week
  const days = [];
  for (let i = WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    days.push(d);
  }

  // Split into columns of 7 (weeks).
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const shade = (c) => {
    if (!c) return "bg-slate-100 dark:bg-slate-800";
    if (c === 1) return "bg-emerald-200 dark:bg-emerald-900";
    if (c === 2) return "bg-emerald-400 dark:bg-emerald-700";
    if (c <= 4) return "bg-emerald-500 dark:bg-emerald-600";
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((d, di) => {
              const c = counts[dayKey(d)] || 0;
              const future = d > today;
              return (
                <div
                  key={di}
                  title={`${d.toLocaleDateString()} — ${c} quiz${c === 1 ? "" : "zes"}`}
                  className={`h-3 w-3 rounded-sm ${future ? "opacity-0" : shade(c)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        Less
        <span className="h-3 w-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
        <span className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
        <span className="h-3 w-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
        <span className="h-3 w-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
        More
      </div>
    </div>
  );
}

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
