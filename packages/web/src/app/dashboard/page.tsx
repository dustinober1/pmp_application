"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getJson } from "@/lib/storage";
import {
  getFlashcardStats,
  getPracticeStats,
  createEmptyPracticeHistory,
  createEmptyStreak,
  type FlashcardStats,
  type PracticeStats,
  type Streak,
  type PracticeHistory,
} from "@/lib/stats";
import { createInitialProgress, type FlashcardProgress } from "@/lib/spaced";
import { formatDate } from "@/lib/dateUtils";
import { truncateAtWordBoundary } from "@/lib/stringUtils";

const STORAGE_KEY_PROGRESS = "flashcard_progress";
const STORAGE_KEY_HISTORY = "practice_history";
const STORAGE_KEY_STREAK = "streak";

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [flashcardStats, setFlashcardStats] = useState<FlashcardStats | null>(
    null,
  );
  const [practiceStats, setPracticeStats] = useState<PracticeStats | null>(
    null,
  );
  const [streak, setStreak] = useState<Streak | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(() => {
    try {
      // Load flashcard progress
      const flashcardProgress = getJson<Record<string, FlashcardProgress>>(
        STORAGE_KEY_PROGRESS,
        {},
      );

      // Initialize progress for any new cards
      for (const cardId of Object.keys(flashcardProgress)) {
        if (!(cardId in flashcardProgress)) {
          flashcardProgress[cardId] = createInitialProgress();
        }
      }

      const fcStats = getFlashcardStats(flashcardProgress);
      setFlashcardStats(fcStats);

      // Load practice history
      const history = getJson<PracticeHistory>(
        STORAGE_KEY_HISTORY,
        createEmptyPracticeHistory(),
      );
      const prStats = getPracticeStats(history);
      setPracticeStats(prStats);

      // Load streak
      const streakData = getJson<Streak>(
        STORAGE_KEY_STREAK,
        createEmptyStreak(),
      );
      setStreak(streakData);

      // Build recent activity from practice history and flashcard progress
      const activities: RecentActivity[] = [];

      // Add practice attempts
      for (const attempt of history.attempts.slice(-5).reverse()) {
        activities.push({
          id: attempt.id,
          type: "practice",
          description: `Completed practice quiz: ${attempt.scorePercent}% (${attempt.correctCount}/${attempt.questionCount} correct)`,
          timestamp: attempt.timestampISO,
        });
      }

      // Add flashcard reviews (most recently reviewed cards)
      const cardEntries = Object.entries(flashcardProgress);
      cardEntries.sort(
        (a, b) =>
          new Date(b[1].lastReviewedISO).getTime() -
          new Date(a[1].lastReviewedISO).getTime(),
      );

      for (const [cardId, progress] of cardEntries.slice(0, 5)) {
        if (progress.repetitions > 0) {
          activities.push({
            id: cardId,
            type: "flashcard",
            description: `Reviewed flashcard: Rated "${progress.lastRating}"`,
            timestamp: progress.lastReviewedISO,
          });
        }
      }

      // Sort by timestamp descending
      activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-md-primary mx-auto mb-4"></div>
          <p className="text-md-on-surface-variant">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate weak areas based on practice stats
  const weakAreas =
    practiceStats && practiceStats.avgScore < 70
      ? [
          {
            taskId: "practice",
            taskName: "Practice Questions",
            domainName: "All",
            accuracy: practiceStats.avgScore,
            recommendation: "Keep practicing!",
          },
        ]
      : [];

  // Domain progress - simplified for static mode
  const domainProgress = flashcardStats
    ? [
        {
          domainId: "flashcards",
          domainName: "Flashcard Mastery",
          domainCode: "FC",
          progress: flashcardStats.masteryPercentage,
          questionsAnswered: flashcardStats.totalSeen,
          accuracy: flashcardStats.masteryPercentage,
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome to PMP Study Pro! <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-[var(--foreground-muted)]">
            Here&apos;s your study progress at a glance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-[var(--foreground-muted)]">
              Current Streak
            </p>
            <p className="text-3xl font-bold mt-1">
              {streak?.current || 0} <span aria-hidden="true">🔥</span>
            </p>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              Best: {streak?.longest || 0} days
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-[var(--foreground-muted)]">
              Flashcard Mastery
            </p>
            <p className="text-3xl font-bold mt-1">
              {flashcardStats?.masteryPercentage || 0}%
            </p>
            <div className="progress mt-2">
              <div
                className="progress-bar"
                style={{ width: `${flashcardStats?.masteryPercentage || 0}%` }}
              ></div>
            </div>
          </div>
          <div className="card">
            <p className="text-sm text-[var(--foreground-muted)]">
              Cards to Review
            </p>
            <p className="text-3xl font-bold mt-1">
              {flashcardStats?.dueTodayCount || 0}
            </p>
            <Link
              href="/flashcards/play?mode=review"
              className="text-xs text-[var(--primary)] mt-1 hover:underline"
            >
              Start review →
            </Link>
          </div>
          <div className="card">
            <p className="text-sm text-[var(--foreground-muted)]">
              Practice Avg
            </p>
            <p className="text-3xl font-bold mt-1">
              {practiceStats?.avgScore || 0}%
            </p>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              Best: {practiceStats?.bestScore || 0}%
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Domain Progress */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="font-semibold mb-4">Learning Progress</h2>
              <div className="space-y-4">
                {domainProgress.map((domain) => (
                  <div key={domain.domainId}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        {domain.domainName}
                      </span>
                      <span className="text-sm text-[var(--foreground-muted)]">
                        {domain.progress}%
                      </span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${domain.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">
                      {domain.questionsAnswered} cards reviewed •{" "}
                      {domain.accuracy}% mastered
                    </p>
                  </div>
                ))}
                {domainProgress.length === 0 && (
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Start studying to see your progress!
                  </p>
                )}
              </div>
            </div>

            {/* Weak Areas */}
            {weakAreas && weakAreas.length > 0 && (
              <div className="card mt-6">
                <h2 className="font-semibold mb-4">Areas to Improve</h2>
                <div className="space-y-3">
                  {weakAreas.map((area, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg"
                    >
                      <div>
                        <p
                          className="font-medium text-sm"
                          title={area.taskName}
                        >
                          {truncateAtWordBoundary(area.taskName, 50)}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {area.domainName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-warning">
                          {area.accuracy}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions & Activity */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/study"
                  className="btn btn-primary w-full justify-start gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Study Content
                </Link>
                <Link
                  href="/flashcards"
                  className="btn btn-secondary w-full justify-start gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Flashcards
                </Link>
                <Link
                  href="/practice"
                  className="btn btn-secondary w-full justify-start gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Practice Questions
                </Link>
                <Link
                  href="/donate"
                  className="btn btn-secondary w-full justify-start gap-2 text-md-on-surface-variant hover:text-md-primary"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Support Us
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2"></div>
                    <div>
                      <p title={activity.description}>
                        {truncateAtWordBoundary(activity.description, 80)}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-[var(--foreground-muted)]">
                    No recent activity yet. Start studying!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
