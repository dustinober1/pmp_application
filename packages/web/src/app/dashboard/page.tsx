'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { FullPageSkeleton } from '@/components/FullPageSkeleton';

interface DashboardData {
  streak: { currentStreak: number; longestStreak: number; lastStudyDate: string | null };
  overallProgress: number;
  domainProgress: Array<{
    domainId: string;
    domainName: string;
    domainCode: string;
    progress: number;
    questionsAnswered: number;
    accuracy: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  upcomingReviews: Array<{
    cardId: string;
    cardFront: string;
    taskName: string;
    dueDate: string;
  }>;
  weakAreas: Array<{
    taskId: string;
    taskName: string;
    domainName: string;
    accuracy: number;
    recommendation: string;
  }>;
}

export default function DashboardPage() {
  const { user, canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (canAccess) {
      fetchDashboard();
    }
  }, [canAccess]);

  const fetchDashboard = async () => {
    try {
      const response = await apiRequest<{ dashboard: DashboardData }>('/dashboard');
      setData(response.data?.dashboard ?? null);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      toast.error('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(' ')[0]}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-[var(--foreground-muted)]">Here’s your study progress at a glance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-[var(--foreground-muted)]">Current Streak</p>
            <p className="text-3xl font-bold mt-1">
              {data?.streak?.currentStreak || 0} <span aria-hidden="true">🔥</span>
            </p>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              Best: {data?.streak?.longestStreak || 0} days
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-[var(--foreground-muted)]">Overall Progress</p>
            <p className="text-3xl font-bold mt-1">{data?.overallProgress || 0}%</p>
            <div className="progress mt-2">
              <div
                className="progress-bar"
                style={{ width: `${data?.overallProgress || 0}%` }}
              ></div>
            </div>
          </div>
          <div className="card">
            <p className="text-sm text-[var(--foreground-muted)]">Cards to Review</p>
            <p className="text-3xl font-bold mt-1">{data?.upcomingReviews?.length || 0}</p>
            <Link
              href="/flashcards/review"
              className="text-xs text-[var(--primary)] mt-1 hover:underline"
            >
              Start review →
            </Link>
          </div>
          <div className="card">
            <p className="text-sm text-[var(--foreground-muted)]">Weak Areas</p>
            <p className="text-3xl font-bold mt-1">{data?.weakAreas?.length || 0}</p>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">Topics needing focus</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Domain Progress */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="font-semibold mb-4">Domain Progress</h2>
              <div className="space-y-4">
                {data?.domainProgress?.map(domain => (
                  <div key={domain.domainId}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{domain.domainName}</span>
                      <span className="text-sm text-[var(--foreground-muted)]">
                        {domain.progress}%
                      </span>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${domain.progress}%` }}></div>
                    </div>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">
                      {domain.questionsAnswered} questions • {domain.accuracy}% accuracy
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Areas */}
            {data?.weakAreas && data.weakAreas.length > 0 && (
              <div className="card mt-6">
                <h2 className="font-semibold mb-4">Areas to Improve</h2>
                <div className="space-y-3">
                  {data.weakAreas.map(area => (
                    <div
                      key={area.taskId}
                      className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{area.taskName}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{area.domainName}</p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-warning">{area.accuracy}%</span>
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
                <Link href="/study" className="btn btn-primary w-full justify-start gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Continue Studying
                </Link>
                <Link href="/flashcards" className="btn btn-secondary w-full justify-start gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Review Flashcards
                </Link>
                <Link href="/practice" className="btn btn-secondary w-full justify-start gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Practice Questions
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {data?.recentActivity?.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2"></div>
                    <div>
                      <p>{activity.description}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(!data?.recentActivity || data.recentActivity.length === 0) && (
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
