import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Trophy, Target, ListChecks, Flame } from "lucide-react";
import api from "../api/axios.js";
import StreakHeatmap from "../components/StreakHeatmap.jsx";

export default function Analytics() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/materials")
      .then(({ data }) => setMaterials(data))
      .finally(() => setLoading(false));
  }, []);

  // Flatten every attempt across all materials.
  const attempts = useMemo(() => {
    const all = [];
    materials.forEach((m) =>
      (m.quizAttempts || []).forEach((a) =>
        all.push({ ...a, topic: m.topicName, t: new Date(a.takenAt).getTime() })
      )
    );
    return all.sort((x, y) => x.t - y.t);
  }, [materials]);

  const stats = useMemo(() => {
    const n = attempts.length;
    const avg = n ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / n) : 0;
    const best = n ? Math.max(...attempts.map((a) => a.percentage)) : 0;
    const streak = currentStreak(attempts);
    return { n, avg, best, streak };
  }, [attempts]);

  const lineData = attempts.map((a, i) => ({
    name: `#${i + 1}`,
    percentage: a.percentage,
    topic: a.topic,
    date: new Date(a.takenAt).toLocaleDateString(),
  }));

  if (loading) return <Shell><p className="text-slate-500 dark:text-slate-400">Loading analytics…</p></Shell>;

  if (attempts.length === 0)
    return (
      <Shell>
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300">
            No quiz attempts yet. Take a quiz and your progress shows up here. 📈
          </p>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={ListChecks} label="Quizzes Taken" value={stats.n} color="text-indigo-600" />
        <StatCard icon={Target} label="Avg Score" value={`${stats.avg}%`} color="text-emerald-600" />
        <StatCard icon={Trophy} label="Best Score" value={`${stats.best}%`} color="text-amber-600" />
        <StatCard icon={Flame} label="Day Streak" value={stats.streak} color="text-orange-600" />
      </div>

      <Card title="Score Over Time">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                formatter={(v) => [`${v}%`, "Score"]}
                labelFormatter={(l, p) =>
                  p?.[0] ? `${l} · ${p[0].payload.topic} · ${p[0].payload.date}` : l
                }
              />
              <Line type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Study Streak">
        <StreakHeatmap attempts={attempts} />
      </Card>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Analytics</h1>
      {children}
    </main>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Icon className={color} size={20} />
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

// Consecutive days (ending today or yesterday) with at least one attempt.
function currentStreak(attempts) {
  if (!attempts.length) return 0;
  const days = new Set(attempts.map((a) => new Date(a.takenAt).toDateString()));
  let streak = 0;
  const d = new Date();
  // allow streak to count if studied today OR yesterday
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
