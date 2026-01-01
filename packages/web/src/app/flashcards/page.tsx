'use client';

import { useEffect, useState, useCallback } from 'react';
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

  const fetchData = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    if (canAccess) {
      fetchData();
    }
  }, [canAccess, fetchData]);

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Organic Blur Shapes */}
      <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-md-on-background">Flashcards</h1>
          <p className="text-xl text-md-on-surface-variant max-w-2xl mx-auto">
            Master key concepts with spaced repetition learning.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card text-center hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-bold text-md-primary mb-2">{stats?.mastered || 0}</p>
            <p className="text-sm font-medium text-md-on-surface-variant">Mastered</p>
          </div>
          <div className="card text-center hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-bold text-md-tertiary mb-2">{stats?.learning || 0}</p>
            <p className="text-sm font-medium text-md-on-surface-variant">Learning</p>
          </div>
          <div className="card text-center hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-bold text-md-error mb-2">{dueCards}</p>
            <p className="text-sm font-medium text-md-on-surface-variant">Due Today</p>
          </div>
          <div className="card text-center hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-bold text-md-on-surface mb-2">{stats?.totalCards || 0}</p>
            <p className="text-sm font-medium text-md-on-surface-variant">Total Cards</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Review Due Cards */}
          <div className="card group hover:shadow-lg transition-all duration-300 border border-transparent hover:border-md-primary/20">
            <div className="w-14 h-14 rounded-2xl bg-md-primary-container text-md-on-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-3 text-md-on-surface">Review Due Cards</h2>
            <p className="text-md-on-surface-variant mb-6 min-h-[3rem]">
              {dueCards > 0
                ? `You have ${dueCards} cards due for review. Keep your streak going!`
                : 'No cards due right now. Great job staying on top of your reviews!'}
            </p>
            <button
              onClick={() => startSession('review')}
              disabled={dueCards === 0 || starting !== null}
              className="btn btn-primary w-full"
            >
              {starting === 'review' ? 'Starting...' : 'Start Review'}
            </button>
          </div>

          {/* Study All Cards */}
          <div className="card group hover:shadow-lg transition-all duration-300 border border-transparent hover:border-md-secondary/20">
            <div className="w-14 h-14 rounded-2xl bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-3 text-md-on-surface">Study Session</h2>
            <p className="text-md-on-surface-variant mb-6 min-h-[3rem]">
              Start a new study session with a mix of new and review cards.
            </p>
            <button
              onClick={() => startSession('all')}
              disabled={starting !== null}
              className="btn btn-secondary w-full"
            >
              {starting === 'all' ? 'Starting...' : 'Start Session'}
            </button>
          </div>

          {/* Create Custom */}
          <div className="card group hover:shadow-lg transition-all duration-300 border border-transparent hover:border-md-tertiary/20">
            <div className="w-14 h-14 rounded-2xl bg-md-tertiary-container text-md-on-tertiary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-3 text-md-on-surface">Create Custom Card</h2>
            <p className="text-md-on-surface-variant mb-6 min-h-[3rem]">
              Create your own flashcards for concepts you want to remember.
            </p>
            <Link href="/flashcards/create" className="btn btn-outline w-full justify-center">
              Create Card
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="card mt-12 bg-md-surface-container-low border-none">
          <h2 className="text-xl font-bold mb-8 text-center text-md-on-surface">
            How Spaced Repetition Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-md-primary/10 text-md-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold">1</span>
              </div>
              <p className="font-bold text-lg mb-2 text-md-on-surface">Know It</p>
              <p className="text-md-on-surface-variant">
                Cards you know well are shown less frequently.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-md-secondary/10 text-md-secondary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold">2</span>
              </div>
              <p className="font-bold text-lg mb-2 text-md-on-surface">Learning</p>
              <p className="text-md-on-surface-variant">
                Cards you{"'"}re learning are shown more often.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-md-tertiary/10 text-md-tertiary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold">3</span>
              </div>
              <p className="font-bold text-lg mb-2 text-md-on-surface">Don{"'"}t Know</p>
              <p className="text-md-on-surface-variant">
                Cards you don{"'"}t know are shown again soon.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
