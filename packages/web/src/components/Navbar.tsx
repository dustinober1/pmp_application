"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import SearchDialog from "./SearchDialog";
import { setStoredTheme } from "@/components/ThemeProvider";
import { useTranslation } from "react-i18next";
import {
  setLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/i18n/i18n";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // HIGH-006: Helper function to check if a path is active
  const isActive = (path: string): boolean => {
    if (path === "/") return pathname === "/";
    // For nested routes, check if pathname starts with the path
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    setStoredTheme(next ? "dark" : "light");
  };

  const currentLocale = (i18n.language?.split("-")[0] ||
    "en") as SupportedLocale;
  const nextLocale = currentLocale === "es" ? "en" : "es";

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
            {isAuthenticated && (
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
            )}

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  aria-label={t("Search")}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              {SUPPORTED_LOCALES.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setLocale(nextLocale)}
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

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-sm">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-[var(--foreground-muted)] text-xs capitalize">
                      {user?.tier} Tier
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="btn btn-secondary text-sm"
                  >
                    {t("Logout")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="btn btn-secondary text-sm"
                  >
                    {t("Login")}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn btn-primary text-sm"
                  >
                    {t("Get Started")}
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-[var(--foreground-muted)]"
                  aria-label={
                    mobileMenuOpen
                      ? "Close navigation menu"
                      : "Open navigation menu"
                  }
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {mobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isAuthenticated && mobileMenuOpen && (
            <div
              id="mobile-navigation"
              className="md:hidden py-4 border-t border-[var(--border)]"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-lg transition ${
                    isActive("/dashboard")
                      ? "bg-[var(--primary)]/20 text-[var(--primary)] font-medium"
                      : "hover:bg-[var(--secondary)]"
                  }`}
                >
                  {t("Dashboard")}
                </Link>
                <Link
                  href="/study"
                  className={`px-4 py-2 rounded-lg transition ${
                    isActive("/study")
                      ? "bg-[var(--primary)]/20 text-[var(--primary)] font-medium"
                      : "hover:bg-[var(--secondary)]"
                  }`}
                >
                  {t("Study")}
                </Link>
                <Link
                  href="/flashcards"
                  className={`px-4 py-2 rounded-lg transition ${
                    isActive("/flashcards")
                      ? "bg-[var(--primary)]/20 text-[var(--primary)] font-medium"
                      : "hover:bg-[var(--secondary)]"
                  }`}
                >
                  {t("Flashcards")}
                </Link>
                <Link
                  href="/practice"
                  className={`px-4 py-2 rounded-lg transition ${
                    isActive("/practice")
                      ? "bg-[var(--primary)]/20 text-[var(--primary)] font-medium"
                      : "hover:bg-[var(--secondary)]"
                  }`}
                >
                  {t("Practice")}
                </Link>
                <Link
                  href="/formulas"
                  className={`px-4 py-2 rounded-lg transition ${
                    isActive("/formulas")
                      ? "bg-[var(--primary)]/20 text-[var(--primary)] font-medium"
                      : "hover:bg-[var(--secondary)]"
                  }`}
                >
                  {t("Formulas")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
      <SearchDialog open={searchOpen} setOpen={setSearchOpen} />
    </>
  );
}
