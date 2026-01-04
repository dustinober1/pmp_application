"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { setStoredTheme } from "@/components/ThemeProvider";
import {
  SUPPORTED_LOCALES,
  setLocale,
  type SupportedLocale,
} from "@/i18n/i18n";

const NavbarComponent = () => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  // HIGH-006: Helper function to check if a path is active
  const isActive = useCallback(
    (path: string): boolean => {
      if (path === "/") return pathname === "/";
      // For nested routes, check if pathname starts with the path
      return pathname === path || pathname?.startsWith(`${path}/`);
    },
    [pathname],
  );

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      setStoredTheme(next ? "dark" : "light");
      return next;
    });
  }, []);

  const currentLocale = useMemo(
    () => (i18n.language?.split("-")[0] || "en") as SupportedLocale,
    [i18n.language],
  );
  const nextLocale = useMemo(
    () => (currentLocale === "es" ? "en" : "es"),
    [currentLocale],
  );
  const handleLocaleToggle = useCallback(() => {
    void setLocale(nextLocale);
  }, [nextLocale]);

  return (
    <>
      <nav className="glass border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center">
                  <span
                    className="text-white font-bold text-sm"
                    aria-hidden="true"
                  >
                    PM
                  </span>
                </div>
                <span className="font-semibold text-lg hidden sm:block">
                  PMP Study Pro
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`transition relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary)] after:transition-opacity ${
                  isActive("/dashboard")
                    ? "text-[var(--primary)] after:opacity-100"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] after:opacity-0"
                }`}
              >
                {t("Dashboard")}
              </Link>
              <Link
                href="/study"
                className={`transition relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary)] after:transition-opacity ${
                  isActive("/study")
                    ? "text-[var(--primary)] after:opacity-100"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] after:opacity-0"
                }`}
              >
                {t("Study")}
              </Link>
              <Link
                href="/flashcards"
                className={`transition relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary)] after:transition-opacity ${
                  isActive("/flashcards")
                    ? "text-[var(--primary)] after:opacity-100"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] after:opacity-0"
                }`}
              >
                {t("Flashcards")}
              </Link>
              <Link
                href="/practice"
                className={`transition relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary)] after:transition-opacity ${
                  isActive("/practice")
                    ? "text-[var(--primary)] after:opacity-100"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] after:opacity-0"
                }`}
              >
                {t("Practice")}
              </Link>
              <Link
                href="/formulas"
                className={`transition relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary)] after:transition-opacity ${
                  isActive("/formulas")
                    ? "text-[var(--primary)] after:opacity-100"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] after:opacity-0"
                }`}
              >
                {t("Formulas")}
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {SUPPORTED_LOCALES.length > 1 ? (
                <button
                  type="button"
                  onClick={handleLocaleToggle}
                  className="p-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold"
                  aria-label="Change language"
                  title={nextLocale.toUpperCase()}
                >
                  {currentLocale.toUpperCase()}
                </button>
              ) : null}

              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label={
                  darkMode
                    ? t("Switch to light mode")
                    : t("Switch to dark mode")
                }
              >
                {darkMode ? (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M10 15a5 5 0 100-10 5 5 0 000 10z" />
                    <path
                      fillRule="evenodd"
                      d="M10 1a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1A.75.75 0 0110 1zm0 15.25a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1a.75.75 0 01.75-.75zM3.11 3.11a.75.75 0 011.06 0l.71.71a.75.75 0 11-1.06 1.06l-.71-.71a.75.75 0 010-1.06zm12.01 12.01a.75.75 0 011.06 0l.71.71a.75.75 0 11-1.06 1.06l-.71-.71a.75.75 0 010-1.06zM1 10a.75.75 0 01.75-.75h1a.75.75 0 010 1.5h-1A.75.75 0 011 10zm15.25 0a.75.75 0 01.75-.75h1a.75.75 0 010 1.5h-1a.75.75 0 01-.75-.75zM3.11 16.89a.75.75 0 010-1.06l.71-.71a.75.75 0 011.06 1.06l-.71.71a.75.75 0 01-1.06 0zm12.01-12.01a.75.75 0 010-1.06l.71-.71a.75.75 0 111.06 1.06l-.71.71a.75.75 0 01-1.06 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export const Navbar = memo(NavbarComponent);
Navbar.displayName = "Navbar";
