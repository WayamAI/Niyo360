import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Theme.
 *
 * This is the same light/dark mechanism the app has always used — the state,
 * the localStorage key and the `.dark` class on <html> — lifted out of
 * AppContext so it can wrap the whole tree.
 *
 * It had to move because AppProvider only wraps the authenticated Shell, so
 * the `.dark` class was never applied on the sign-in screen: a user with a
 * dark preference got a light sign-in page, then the app switched underneath
 * them once they signed in. Keeping the logic here and re-exposing `theme` and
 * `toggleTheme` through useApp() means no call site changes and there is still
 * exactly one theme system.
 */

export type Theme = "light" | "dark";

/** Namespaced to the current product; the two older keys are read as fallbacks. */
const THEME_KEY = "parivart.theme";
const LEGACY_THEME_KEYS = ["niyo360.theme", "regiq-theme"];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function readStoredTheme(): Theme | null {
  for (const key of [THEME_KEY, ...LEGACY_THEME_KEYS]) {
    const value = localStorage.getItem(key);
    if (value === "light" || value === "dark") return value;
  }
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (
      readStoredTheme() ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
