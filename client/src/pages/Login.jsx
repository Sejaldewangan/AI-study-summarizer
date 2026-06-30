import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-3.75rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/20" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-600/20" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="glass relative w-full max-w-sm rounded-2xl p-6 shadow-xl sm:p-8"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <BookOpen size={18} />
          </span>
          <h1 className="text-2xl font-bold">Welcome back</h1>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:shadow-indigo-600/40 active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          No account?{" "}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
