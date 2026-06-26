import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Moon, Sun, BookOpen, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
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
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
        pathname === to
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      <Icon size={16} /> {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
          <BookOpen size={20} /> StudyAI
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <>
              {navLink("/", "Study", BookOpen)}
              {navLink("/analytics", "Analytics", BarChart3)}
            </>
          )}

          <button
            onClick={toggle}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <LogOut size={16} /> Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
