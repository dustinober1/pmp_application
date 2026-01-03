"use client";

/**
 * Admin Analytics Dashboard
 * Comprehensive analytics for PMP Study Pro
 */

import { useEffect, useState } from "react";

interface AnalyticsData {
  learning: {
    overview: {
      totalUsers: number;
      activeUsers: number;
      engagementRate: number;
      avgStudyTimeMs: number;
    };
    domainProgress: Array<{
      sectionId: string;
      completionCount: number;
    }>;
    activityTrends: Record<string, unknown[]>;
    topPerformers: Array<{
      id: string;
      name: string;
      email: string;
      memberSince: Date;
      studyProgressCount: number;
      flashcardReviewsCount: number;
      questionAttemptsCount: number;
    }>;
    strugglingUsers: Array<{
      id: string;
      name: string;
      email: string;
      memberSince: Date;
      incompleteProgressCount: number;
      activityCount: number;
    }>;
  };
  flashcards: {
    sessionStats: {
      totalSessions: number;
      avgSessionDurationMs: number;
      avgCardsPerSession: number;
      avgKnowIt: number;
      avgLearning: number;
      avgDontKnow: number;
      avgAccuracyRate: number;
    };
    ratingDistribution: Array<{
      rating: string;
      count: number;
    }>;
    sm2Metrics: {
      avgEaseFactor: number;
      avgInterval: number;
      avgRepetitions: number;
      minEaseFactor: number;
      maxEaseFactor: number;
      maxInterval: number;
    };
    reviewStats: {
      cardsDue: number;
      cardsOverdue: number;
    };
    retentionTrends: Array<{
      date: Date;
      accuracyRate: number;
    }>;
  };
  questions: {
    overview: {
      totalAttempts: number;
      avgTimeSpentMs: number;
      correctCount: number;
      incorrectCount: number;
      accuracyRate: number;
    };
    difficultQuestions: Array<{
      id: string;
      questionText: string;
      domain: string;
      task: string;
      difficulty: string;
      totalAttempts: number;
      correctAttempts: number;
      accuracyRate: number;
      avgTimeSpentMs: number;
    }>;
    flaggedQuestions: Array<{
      id: string;
      questionText: string;
      domain: string;
      task: string;
      flagCount: number;
    }>;
  };
  system: {
    database: {
      userCount: number;
      userCountChange: {
        current: number;
        previous: number;
        changePercent: number;
      };
      activityCount: number;
      activityRate: number;
      flashcardSessionCount: number;
      practiceSessionCount: number;
    };
    endpointUsage: Array<{
      endpoint: string;
      requestCount: number;
    }>;
    performance: {
      avgResponseTimeMs: number;
      minResponseTimeMs: number;
      maxResponseTimeMs: number;
      errorRate: number;
      errorCount: number;
    };
    subscriptions: {
      statusBreakdown: Array<{
        status: string;
        count: number;
      }>;
      tierDistribution: Array<{
        tierName: string;
        displayName: string;
        count: number;
      }>;
    };
    storage: {
      totalUsers: number;
      totalFlashcards: number;
      totalQuestions: number;
      totalStudyGuides: number;
    };
  };
}

type TimeRange = "24h" | "7d" | "30d" | "90d" | "all";
type TabType = "overview" | "learning" | "flashcards" | "questions" | "system";

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalyticsData();
    }
  }, [timeRange, isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const userData = await res.json();
        // In production, check if user has admin role
        // For now, we'll check if email contains "admin"
        const isAdminUser =
          userData.data?.user?.email?.includes("admin") || false;
        setIsAdmin(isAdminUser);
      }
    } catch (err) {
      console.error("Failed to check admin status:", err);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/analytics/dashboard?timeRange=${timeRange}`,
      );

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Admin access required");
        }
        throw new Error("Failed to fetch analytics data");
      }

      const result = await res.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
          <p className="text-gray-400">
            Admin access required to view this page
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md rounded-lg bg-red-900/20 p-8 text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold">Error</h1>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-400">
              Monitor student learning, flashcard performance, and system
              metrics
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="rounded-lg bg-gray-800 px-4 py-2 text-white border border-gray-700"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`rounded-t-lg px-6 py-3 font-semibold transition-colors ${
              activeTab === "overview"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("learning")}
            className={`rounded-t-lg px-6 py-3 font-semibold transition-colors ${
              activeTab === "learning"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Learning Analytics
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`rounded-t-lg px-6 py-3 font-semibold transition-colors ${
              activeTab === "flashcards"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Flashcard Performance
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`rounded-t-lg px-6 py-3 font-semibold transition-colors ${
              activeTab === "questions"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Question Insights
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`rounded-t-lg px-6 py-3 font-semibold transition-colors ${
              activeTab === "system"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            System Performance
          </button>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg bg-gray-800 p-6">
          {activeTab === "overview" && <OverviewTab data={data} />}
          {activeTab === "learning" && <LearningTab data={data.learning} />}
          {activeTab === "flashcards" && (
            <FlashcardsTab data={data.flashcards} />
          )}
          {activeTab === "questions" && <QuestionsTab data={data.questions} />}
          {activeTab === "system" && <SystemTab data={data.system} />}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-2xl font-bold">Overview</h2>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={data.learning.overview.totalUsers}
          change={data.system.database.userCountChange.changePercent}
          icon="👥"
        />
        <MetricCard
          title="Active Users"
          value={data.learning.overview.activeUsers}
          icon="📊"
        />
        <MetricCard
          title="Engagement Rate"
          value={`${data.learning.overview.engagementRate.toFixed(1)}%`}
          icon="📈"
        />
        <MetricCard
          title="Avg Study Time"
          value={`${Math.round(data.learning.overview.avgStudyTimeMs / 60000)}m`}
          icon="⏱️"
        />
      </div>

      {/* Subscription Distribution */}
      <div className="rounded-lg bg-gray-900 p-6">
        <h3 className="mb-4 text-xl font-bold">Subscription Distribution</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {data.system.subscriptions.tierDistribution.map((tier) => (
            <div key={tier.tierName} className="rounded-lg bg-gray-800 p-4">
              <div className="mb-2 text-sm text-gray-400">
                {tier.displayName}
              </div>
              <div className="text-2xl font-bold">{tier.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Learning Analytics Tab Component
function LearningTab({ data }: { data: AnalyticsData["learning"] }) {
  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-2xl font-bold">Learning Analytics</h2>

      {/* Top Performers */}
      <div className="rounded-lg bg-gray-900 p-6">
        <h3 className="mb-4 text-xl font-bold">Top Performers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Study Progress</th>
                <th className="px-4 py-2 text-left">Flashcard Reviews</th>
                <th className="px-4 py-2 text-left">Question Attempts</th>
              </tr>
            </thead>
            <tbody>
              {data.topPerformers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{user.studyProgressCount}</td>
                  <td className="px-4 py-3">{user.flashcardReviewsCount}</td>
                  <td className="px-4 py-3">{user.questionAttemptsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Struggling Users */}
      {data.strugglingUsers.length > 0 && (
        <div className="rounded-lg bg-gray-900 p-6">
          <h3 className="mb-4 text-xl font-bold">Users Needing Attention</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Incomplete Items</th>
                  <th className="px-4 py-2 text-left">Activity Count</th>
                </tr>
              </thead>
              <tbody>
                {data.strugglingUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.incompleteProgressCount}
                    </td>
                    <td className="px-4 py-3">{user.activityCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Flashcards Tab Component
function FlashcardsTab({ data }: { data: AnalyticsData["flashcards"] }) {
  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-2xl font-bold">Flashcard Performance</h2>

      {/* Session Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Sessions"
          value={data.sessionStats.totalSessions}
          icon="📚"
        />
        <StatCard
          title="Avg Accuracy"
          value={`${data.sessionStats.avgAccuracyRate.toFixed(1)}%`}
          icon="🎯"
        />
        <StatCard
          title="Cards Due"
          value={data.reviewStats.cardsDue}
          icon="⏰"
        />
      </div>

      {/* Rating Distribution */}
      <div className="rounded-lg bg-gray-900 p-6">
        <h3 className="mb-4 text-xl font-bold">Rating Distribution</h3>
        <div className="space-y-4">
          {data.ratingDistribution.map((item) => (
            <div key={item.rating}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="capitalize">
                  {item.rating.replace("_", " ")}
                </span>
                <span>{item.count}</span>
              </div>
              <div className="h-3 rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${(item.count / data.sessionStats.totalSessions) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SM-2 Metrics */}
      <div className="rounded-lg bg-gray-900 p-6">
        <h3 className="mb-4 text-xl font-bold">SM-2 Algorithm Metrics</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-sm text-gray-400">Avg Ease Factor</div>
            <div className="text-2xl font-bold">
              {data.sm2Metrics.avgEaseFactor.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Avg Interval (Days)</div>
            <div className="text-2xl font-bold">
              {data.sm2Metrics.avgInterval.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Avg Repetitions</div>
            <div className="text-2xl font-bold">
              {data.sm2Metrics.avgRepetitions.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Questions Tab Component
function QuestionsTab({ data }: { data: AnalyticsData["questions"] }) {
  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-2xl font-bold">Practice Question Insights</h2>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Total Attempts"
          value={data.overview.totalAttempts}
          icon="📝"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${data.overview.accuracyRate.toFixed(1)}%`}
          icon="🎯"
        />
        <StatCard
          title="Avg Time"
          value={`${Math.round(data.overview.avgTimeSpentMs / 1000)}s`}
          icon="⏱️"
        />
        <StatCard
          title="Flagged Questions"
          value={data.flaggedQuestions.length}
          icon="🚩"
        />
      </div>

      {/* Most Difficult Questions */}
      <div className="rounded-lg bg-gray-900 p-6">
        <h3 className="mb-4 text-xl font-bold">Most Difficult Questions</h3>
        <div className="space-y-4">
          {data.difficultQuestions.slice(0, 10).map((q) => (
            <div key={q.id} className="rounded-lg bg-gray-800 p-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 text-sm text-gray-400">
                    {q.domain} - {q.task}
                  </div>
                  <div className="font-semibold">{q.questionText}</div>
                </div>
                <span className="ml-4 rounded bg-red-900/50 px-2 py-1 text-sm">
                  {q.accuracyRate.toFixed(1)}% Acc
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-400">
                <span>{q.totalAttempts} attempts</span>
                <span>{q.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// System Tab Component
function SystemTab({ data }: { data: AnalyticsData["system"] }) {
  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-2xl font-bold">System Performance</h2>

      {/* Database Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-gray-900 p-6">
          <h3 className="mb-4 text-xl font-bold">Database</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Users</span>
              <span className="font-semibold">{data.database.userCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Change</span>
              <span
                className={`font-semibold ${
                  data.database.userCountChange.changePercent >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {data.database.userCountChange.changePercent >= 0 ? "+" : ""}
                {data.database.userCountChange.changePercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-900 p-6">
          <h3 className="mb-4 text-xl font-bold">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Response</span>
              <span className="font-semibold">
                {data.performance.avgResponseTimeMs.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Error Rate</span>
              <span className="font-semibold">
                {data.performance.errorRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="rounded-lg bg-gray-900 p-6">
        <h3 className="mb-4 text-xl font-bold">Storage</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <div className="text-sm text-gray-400">Users</div>
            <div className="text-2xl font-bold">{data.storage.totalUsers}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Flashcards</div>
            <div className="text-2xl font-bold">
              {data.storage.totalFlashcards}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Questions</div>
            <div className="text-2xl font-bold">
              {data.storage.totalQuestions}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Study Guides</div>
            <div className="text-2xl font-bold">
              {data.storage.totalStudyGuides}
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint Usage */}
      <div className="rounded-lg bg-gray-900 p-6">
        <h3 className="mb-4 text-xl font-bold">API Endpoint Usage</h3>
        <div className="space-y-3">
          {data.endpointUsage.slice(0, 10).map((endpoint) => (
            <div key={endpoint.endpoint}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-mono text-gray-400">
                  {endpoint.endpoint}
                </span>
                <span>{endpoint.requestCount}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${(endpoint.requestCount / (data.endpointUsage[0]?.requestCount || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon?: string;
}) {
  return (
    <div className="rounded-lg bg-gray-900 p-6">
      <div className="mb-2 text-sm text-gray-400">{title}</div>
      <div className="mb-1 flex items-baseline justify-between">
        <div className="text-3xl font-bold">{value}</div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      {change !== undefined && (
        <div
          className={`text-sm ${
            change >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon?: string;
}) {
  return (
    <div className="rounded-lg bg-gray-900 p-6">
      <div className="mb-2 text-sm text-gray-400">{title}</div>
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-bold">{value}</div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  );
}
