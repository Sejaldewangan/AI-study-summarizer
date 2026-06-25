import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell as BarCell,
} from "recharts";

const GREEN = "#10b981";
const RED = "#ef4444";

export default function ResultsChart({ score, total, items }) {
  const wrong = total - score;
  const pct = Math.round((score / total) * 100);

  const donutData = [
    { name: "Correct", value: score },
    { name: "Incorrect", value: wrong },
  ];

  // Per-question bar: 1 = correct (green), 0 = incorrect (red).
  const barData = items.map((it, i) => ({
    name: `Q${i + 1}`,
    value: it.correct ? 1 : 0,
    correct: it.correct,
  }));

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Donut: correct vs incorrect with % in the center */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-semibold text-slate-700">Correct vs Incorrect</h4>
        <div className="relative h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill={GREEN} />
                <Cell fill={RED} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-800">{pct}%</span>
            <span className="text-xs text-slate-500">
              {score}/{total} correct
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: GREEN }} /> Correct ({score})
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: RED }} /> Incorrect ({wrong})
          </span>
        </div>
      </div>

      {/* Per-question bars */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-semibold text-slate-700">Per-Question Result</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 0, left: -28 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis ticks={[0, 1]} domain={[0, 1]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => (v ? "Correct" : "Incorrect")}
                labelFormatter={(l) => l}
              />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {barData.map((d, i) => (
                  <BarCell key={i} fill={d.correct ? GREEN : RED} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-center text-xs text-slate-400">Green = correct · Red = incorrect</p>
      </div>
    </div>
  );
}
