import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AttemptHistoryChart({ attempts }) {
  const data = attempts.map((a, i) => ({
    name: `#${i + 1}`,
    percentage: a.percentage,
    label: `${a.score}/${a.total} · ${a.difficulty}`,
    date: a.takenAt ? new Date(a.takenAt).toLocaleDateString() : "",
  }));

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <Tooltip
            formatter={(v) => [`${v}%`, "Score"]}
            labelFormatter={(l, p) => {
              const d = p?.[0]?.payload;
              return d ? `${l} — ${d.label}${d.date ? " · " + d.date : ""}` : l;
            }}
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4, fill: "#6366f1" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-slate-400">
        Your score % across attempts — watch it climb
      </p>
    </div>
  );
}
