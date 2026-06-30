import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Moon, Sun, BookOpen, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Analytics from "./pages/Analytics.jsx";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
        pathname === to
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
    </Link>
  );

  return (
    <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
          <BookOpen size={20} /> StudyAI
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <>
              {navLink("/dashboard", "Study", BookOpen)}
              {navLink("/analytics", "Analytics", BarChart3)}
            </>
          )}

          <button
            onClick={toggle}
            className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-md text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>

          {user && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Log out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// Per-page enter/exit transition on route change.
function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  // Landing page has its own nav + footer; hide the app chrome there.
  const hideAppNav = location.pathname === "/";

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-full overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 dark:text-slate-100">
        {!hideAppNav && <Navbar />}
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/login" element={<Page><Login /></Page>} />
            <Route path="/register" element={<Page><Register /></Page>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Page><Dashboard /></Page>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Page><Analytics /></Page>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
