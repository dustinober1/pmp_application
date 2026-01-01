'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { FullPageSkeleton } from '@/components/FullPageSkeleton';

interface FlashcardStats {
  mastered: number;
  learning: number;
  dueForReview: number;
  totalCards: number;
}

export default function FlashcardsPage() {
  const router = useRouter();
  const { canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [dueCards, setDueCards] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<'review' | 'all' | null>(null);

  useEffect(() => {
    if (canAccess) {
      fetchData();
    }
  }, [canAccess]);

  const fetchData = async () => {
    try {
      const [statsRes, dueRes] = await Promise.all([
        apiRequest<{ stats: FlashcardStats }>('/flashcards/stats'),
        apiRequest<{ flashcards: unknown[] }>('/flashcards/review?limit=10'),
      ]);
      setStats(statsRes.data?.stats ?? null);
      setDueCards(dueRes.data?.flashcards?.length ?? 0);
    } catch (error) {
      console.error('Failed to fetch flashcard data:', error);
      toast.error('Failed to load flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (mode: 'review' | 'all') => {
    try {
      setStarting(mode);
      const options =
        mode === 'review' ? { prioritizeReview: true, cardCount: 20 } : { cardCount: 20 };
      const response = await apiRequest<{ sessionId: string }>('/flashcards/sessions', {
        method: 'POST',
        body: options,
      });
      const sessionId = response.data?.sessionId;
      if (sessionId) {
        router.push(`/flashcards/session/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error('Failed to start session. Please try again.');
    } finally {
      setStarting(null);
    }
  };

  if (authLoading || loading) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-[var(--foreground-muted)]">
            Master key concepts with spaced repetition learning.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-3xl font-bold text-[var(--success)]">{stats?.mastered || 0}</p>
            <p className="text-sm text-[var(--foreground-muted)]">Mastered</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-[var(--warning)]">{stats?.learning || 0}</p>
            <p className="text-sm text-[var(--foreground-muted)]">Learning</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-[var(--primary)]">{dueCards}</p>
            <p className="text-sm text-[var(--foreground-muted)]">Due Today</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold">{stats?.totalCards || 0}</p>
            <p className="text-sm text-[var(--foreground-muted)]">Total Cards</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Review Due Cards */}
          <div className="card hover:border-[var(--primary)] transition-colors">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Review Due Cards</h2>
            <p className="text-sm text-[var(--foreground-muted)] mt-2">
              {dueCards > 0
                ? `You have ${dueCards} cards due for review. Keep your streak going!`
                : 'No cards due right now. Great job staying on top of your reviews!'}
            </p>
            <button
              onClick={() => startSession('review')}
              disabled={dueCards === 0 || starting !== null}
              className="btn btn-primary w-full mt-4"
            >
              {starting === 'review' ? 'Starting...' : 'Start Review'}
            </button>
          </div>

          {/* Study All Cards */}
          <div className="card hover:border-[var(--primary)] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Study Session</h2>
            <p className="text-sm text-[var(--foreground-muted)] mt-2">
              Start a new study session with a mix of new and review cards.
            </p>
            <button
              onClick={() => startSession('all')}
              disabled={starting !== null}
              className="btn btn-secondary w-full mt-4"
            >
              {starting === 'all' ? 'Starting...' : 'Start Session'}
            </button>
          </div>

          {/* Create Custom */}
          <div className="card hover:border-[var(--primary)] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Create Custom Card</h2>
            <p className="text-sm text-[var(--foreground-muted)] mt-2">
              Create your own flashcards for concepts you want to remember.
            </p>
            <Link href="/flashcards/create" className="btn btn-secondary w-full mt-4">
              Create Card
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="card mt-8">
          <h2 className="font-semibold mb-4">How Spaced Repetition Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--success-light)] text-[var(--success)] flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">1</span>
              </div>
              <p className="font-medium">Know It</p>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                Cards you know well are shown less frequently.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--warning-light)] text-[var(--warning)] flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">2</span>
              </div>
              <p className="font-medium">Learning</p>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                Cards you’re learning are shown more often.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--error-light)] text-[var(--error)] flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold">3</span>
              </div>
              <p className="font-medium">Don’t Know</p>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                Cards you don’t know are shown again soon.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
