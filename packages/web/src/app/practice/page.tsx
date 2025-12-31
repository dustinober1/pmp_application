'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { practiceApi, contentApi } from '@/lib/api';

interface PracticeStats {
  totalSessions: number;
  totalQuestions: number;
  averageScore: number;
  bestScore: number;
  weakDomains: string[];
}

interface Domain {
  id: string;
  name: string;
  code: string;
}

export default function PracticePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [statsRes, domainsRes] = await Promise.all([
        practiceApi.getStats(),
        contentApi.getDomains(),
      ]);
      setStats((statsRes as any).data?.stats);
      setDomains((domainsRes as any).data?.domains || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    setStarting(true);
    try {
      const response = await practiceApi.startSession({
        domainIds: selectedDomains.length > 0 ? selectedDomains : undefined,
        questionCount,
      });
      const sessionId = (response as any).data?.sessionId;
      if (sessionId) {
        router.push(`/practice/session/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setStarting(false);
    }
  };

  const startMockExam = async () => {
    setStarting(true);
    try {
      const response = await practiceApi.startMockExam();
      const sessionId = (response as any).data?.sessionId;
      if (sessionId) {
        router.push(`/practice/session/${sessionId}?mock=true`);
      }
    } catch (error) {
      console.error('Failed to start mock exam:', error);
    } finally {
      setStarting(false);
    }
  };

  const toggleDomain = (domainId: string) => {
    setSelectedDomains(prev =>
      prev.includes(domainId) ? prev.filter(id => id !== domainId) : [...prev, domainId]
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--foreground-muted)]">Loading...</div>
      </div>
    );
  }

  const canTakeMockExam = user?.tier === 'high-end' || user?.tier === 'corporate';

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Practice Questions</h1>
          <p className="text-[var(--foreground-muted)]">
            Test your knowledge with realistic PMP exam questions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-3xl font-bold">{stats?.totalSessions || 0}</p>
            <p className="text-sm text-[var(--foreground-muted)]">Sessions</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold">{stats?.totalQuestions || 0}</p>
            <p className="text-sm text-[var(--foreground-muted)]">Questions Answered</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-[var(--primary)]">{stats?.averageScore || 0}%</p>
            <p className="text-sm text-[var(--foreground-muted)]">Average Score</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-[var(--success)]">{stats?.bestScore || 0}%</p>
            <p className="text-sm text-[var(--foreground-muted)]">Best Score</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Practice Configuration */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="font-semibold mb-4">Configure Practice Session</h2>

              {/* Domain Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Select Domains (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {domains.map(domain => (
                    <button
                      key={domain.id}
                      onClick={() => toggleDomain(domain.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedDomains.includes(domain.id)
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'
                      }`}
                    >
                      {domain.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[var(--foreground-muted)] mt-2">
                  Leave empty to include all domains
                </p>
              </div>

              {/* Question Count */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Number of Questions</label>
                <div className="flex gap-2">
                  {[10, 20, 30, 50].map(count => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        questionCount === count
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={startSession} disabled={starting} className="btn btn-primary w-full">
                {starting ? 'Starting...' : 'Start Practice Session'}
              </button>
            </div>

            {/* Weak Areas */}
            {stats?.weakDomains && stats.weakDomains.length > 0 && (
              <div className="card mt-6">
                <h2 className="font-semibold mb-4">Focus Areas</h2>
                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                  Based on your practice history, focus on these areas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.weakDomains.map((domain, i) => (
                    <span key={i} className="badge badge-warning">
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Mock Exam Card */}
            <div className="card">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Full Mock Exam</h2>
              <p className="text-sm text-[var(--foreground-muted)] mt-2">
                Simulate the real PMP exam with 180 questions and a 3h 50min time limit.
              </p>
              {canTakeMockExam ? (
                <button
                  onClick={startMockExam}
                  disabled={starting}
                  className="btn btn-primary w-full mt-4"
                >
                  Start Mock Exam
                </button>
              ) : (
                <div className="mt-4">
                  <p className="text-xs text-[var(--foreground-muted)] mb-2">
                    Available for High-End and Corporate tiers
                  </p>
                  <Link href="/pricing" className="btn btn-secondary w-full">
                    Upgrade to Access
                  </Link>
                </div>
              )}
            </div>

            {/* Flagged Questions */}
            <div className="card">
              <h2 className="font-semibold mb-2">Flagged Questions</h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                Review questions you've flagged for later.
              </p>
              <Link href="/practice/flagged" className="btn btn-secondary w-full mt-4">
                View Flagged
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
