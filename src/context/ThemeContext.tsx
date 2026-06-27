"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "warm" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const savedTheme = localStorage.getItem("gallery-theme") as Theme;
    if (savedTheme && ["light", "warm", "dark"].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("gallery-theme", newTheme);
  };

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    // Remove all theme classes first
    root.classList.remove("theme-warm", "theme-dark");

    // Apply the active theme class
    if (theme === "warm") {
      root.classList.add("theme-warm");
    } else if (theme === "dark") {
      root.classList.add("theme-dark");
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
