'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="glass border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">PMP Study Pro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition"
              >
                Dashboard
              </Link>
              <Link
                href="/study"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition"
              >
                Study
              </Link>
              <Link
                href="/flashcards"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition"
              >
                Flashcards
              </Link>
              <Link
                href="/practice"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition"
              >
                Practice
              </Link>
              <Link
                href="/formulas"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition"
              >
                Formulas
              </Link>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-[var(--foreground-muted)] text-xs capitalize">
                    {user?.tier} Tier
                  </p>
                </div>
                <button onClick={logout} className="btn btn-secondary text-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn btn-secondary text-sm">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[var(--foreground-muted)]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden py-4 border-t border-[var(--border)]">
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="px-4 py-2 hover:bg-[var(--secondary)] rounded-lg">
                Dashboard
              </Link>
              <Link href="/study" className="px-4 py-2 hover:bg-[var(--secondary)] rounded-lg">
                Study
              </Link>
              <Link href="/flashcards" className="px-4 py-2 hover:bg-[var(--secondary)] rounded-lg">
                Flashcards
              </Link>
              <Link href="/practice" className="px-4 py-2 hover:bg-[var(--secondary)] rounded-lg">
                Practice
              </Link>
              <Link href="/formulas" className="px-4 py-2 hover:bg-[var(--secondary)] rounded-lg">
                Formulas
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
