"use client";

import { useEffect } from "react";

const STORAGE_KEY = "pmp_theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

export function getStoredTheme(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === "dark" || value === "light") return value;
  return null;
}

export function setStoredTheme(theme: "light" | "dark") {
  if (typeof window === "undefined") return;
  applyTheme(theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      applyTheme(stored);
      return;
    }

    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)",
    )?.matches;
    applyTheme(prefersDark ? "dark" : "light");
  }, []);

  return children;
}
