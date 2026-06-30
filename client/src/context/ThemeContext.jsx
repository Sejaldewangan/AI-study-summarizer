import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => {
    // Briefly enable a global color transition so the theme switch crossfades.
    const root = document.documentElement;
    root.classList.add("theme-transition");
    setTheme((t) => (t === "dark" ? "light" : "dark"));
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
