import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Upload,
  Sparkles,
  Trophy,
  Columns,
  Lightbulb,
  BarChart3,
  Moon,
  Sun,
  Play,
  ArrowRight,
  Star,
  Quote,
  Globe,
  Mail,
  MessageCircle,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const ctaTo = user ? "/dashboard" : "/login";
  const ctaLabel = user ? "Go to Dashboard" : "Get Started";

  return (
    <div className="min-h-dvh overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ───────── Nav ───────── */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
              <BookOpen size={18} />
            </span>
            StudyAI
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Features</a>
            <a href="#how" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">How it Works</a>
            <a href="#pricing" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Pricing</a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to={ctaTo}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </nav>

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/20" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-24">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Sparkles size={13} /> AI-powered studying
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Turn Dense PDFs Into{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Interactive Study Packs
              </span>{" "}
              Instantly
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Upload any PDF, Word doc, or textbook photo and get instant AI summaries,
              flip-card decks, and custom quizzes — tuned to your difficulty, tracked over time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={ctaTo}
                className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30"
              >
                <Upload size={18} /> Upload Your First File
                <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Play size={17} /> Watch Demo
              </a>
            </div>
            <div className="mt-8 flex items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Check size={15} className="text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check size={15} className="text-emerald-500" /> Free to start</span>
            </div>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-300/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
              <div className="mb-3 flex items-center gap-1.5 px-1">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Left: summary */}
                <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={13} /> AI Summary
                  </div>
                  {[90, 75, 85, 60, 80].map((w, i) => (
                    <div key={i} className="h-2 rounded bg-slate-200 dark:bg-slate-700" style={{ width: `${w}%` }} />
                  ))}
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                    <Lightbulb size={13} /> Key Topics
                  </div>
                  {[70, 88].map((w, i) => (
                    <div key={i} className="h-2 rounded bg-slate-200 dark:bg-slate-700" style={{ width: `${w}%` }} />
                  ))}
                </div>
                {/* Right: quiz */}
                <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Question 3 / 5</div>
                  <div className="h-2 w-3/4 rounded bg-slate-300 dark:bg-slate-600" />
                  <div className="space-y-1.5 pt-1">
                    <div className="rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] text-slate-500 dark:border-slate-700">Option A</div>
                    <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">Option B ✓</div>
                    <div className="rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] text-slate-500 dark:border-slate-700">Option C</div>
                  </div>
                  <div className="mt-2 grid place-items-center pt-1">
                    <div className="relative grid h-14 w-14 place-items-center rounded-full bg-indigo-100 dark:bg-indigo-500/15">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">80%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <Trophy size={15} className="text-amber-500" /> 7-day streak 🔥
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────── How it Works ───────── */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeading
          kicker="How it works"
          title="From cramming to mastering in 3 steps"
          subtitle="No setup, no fluff. Upload and start learning in seconds."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Upload, step: "01", title: "Upload", desc: "Drop your PDFs, Word docs, or textbook photos. Vision AI reads even messy pages.", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400" },
            { icon: Sparkles, step: "02", title: "Transform", desc: "AI extracts the text, writes bulleted summaries, pulls key topics, and builds flashcards.", color: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400" },
            { icon: Trophy, step: "03", title: "Master", desc: "Take quizzes at your difficulty, get AI explanations, track scores, and destroy your exams.", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" },
          ].map((s) => (
            <div
              key={s.step}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-7"
            >
              <span className="absolute right-6 top-6 text-4xl font-extrabold text-slate-100 dark:text-slate-800">{s.step}</span>
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${s.color}`}>
                <s.icon size={24} />
              </div>
              <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Features Bento ───────── */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeading
          kicker="Features"
          title="Everything you need to study smarter"
          subtitle="A complete workspace built for focus, retention, and results."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3 md:grid-rows-2">
          <BentoCard
            className="md:col-span-2 md:row-span-2"
            icon={Columns}
            title="Split-Screen Workspace"
            desc="Read your summary and test yourself side-by-side — no tab switching. Quiz and flashcards live right next to your material."
            big
          />
          <BentoCard icon={Lightbulb} title="AI Explanations" desc="Got one wrong? Tap to see exactly why the right answer is right." />
          <BentoCard icon={BarChart3} title="Performance Analytics" desc="Watch your scores climb and your study streak grow on a GitHub-style heatmap." />
          <BentoCard
            className="md:col-span-2"
            icon={Moon}
            title="Dark Mode Ready"
            desc="A sleek dark theme for late-night cramming sessions that's easy on the eyes."
          />
          <BentoCard icon={Sparkles} title="Flip Flashcards" desc="Auto-generated decks with smooth 3D flip animations." />
        </div>
      </section>

      {/* ───────── Social proof ───────── */}
      <section className="border-y border-slate-200 bg-slate-50 py-14 dark:border-slate-800 dark:bg-slate-900/40 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading kicker="Loved by students" title="Studying, but make it effortless" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { quote: "Saved me 4 hours of reading before my biology midterm!", name: "Aanya R.", role: "Pre-med student" },
              { quote: "The flashcards and quizzes feel like a personal tutor. I actually remember stuff now.", name: "Marcus T.", role: "CS major" },
              { quote: "Dark mode + split screen = my new 2am study setup. Scores are up across the board.", name: "Priya S.", role: "Law student" },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <Quote size={22} className="text-indigo-400" />
                <div className="mt-2 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
                </div>
                <p className="mt-3 text-slate-700 dark:text-slate-200">“{t.quote}”</p>
                <div className="mt-4 text-sm">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 px-5 py-12 text-center text-white shadow-2xl shadow-indigo-600/20 sm:px-6 sm:py-16">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <h2 className="text-3xl font-extrabold sm:text-4xl">Start Studying Smarter Today</h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Free to start — no credit card. Turn your first PDF into a study pack in under a minute.
          </p>
          <Link
            to={user ? "/dashboard" : "/register"}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-indigo-700 shadow-lg transition hover:scale-[1.03] hover:shadow-xl"
          >
            {user ? "Go to Dashboard" : "Create Free Account"} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row">
          <div className="flex items-center gap-2 font-extrabold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-white">
              <BookOpen size={15} />
            </span>
            StudyAI
          </div>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <a href="#" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Privacy</a>
            <a href="#" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Terms</a>
            <a href="#features" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Features</a>
          </div>
          <div className="flex gap-3 text-slate-400">
            <a href="#" className="transition hover:text-indigo-600 dark:hover:text-indigo-400"><MessageCircle size={18} /></a>
            <a href="#" className="transition hover:text-indigo-600 dark:hover:text-indigo-400"><Globe size={18} /></a>
            <a href="#" className="transition hover:text-indigo-600 dark:hover:text-indigo-400"><Mail size={18} /></a>
          </div>
        </div>
        <p className="pb-8 text-center text-xs text-slate-400">© {new Date().getFullYear()} StudyAI. Built for students.</p>
      </footer>
    </div>
  );
}

function SectionHeading({ kicker, title, subtitle }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{kicker}</span>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-600 dark:text-slate-300">{subtitle}</p>}
    </div>
  );
}

function BentoCard({ icon: Icon, title, desc, className = "", big }) {
  return (
    <div
      className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50 ${className}`}
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:scale-110 dark:bg-indigo-500/15 dark:text-indigo-400">
        <Icon size={big ? 26 : 22} />
      </div>
      <h3 className={`mt-4 font-bold ${big ? "text-2xl" : "text-lg"}`}>{title}</h3>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{desc}</p>
    </div>
  );
}
