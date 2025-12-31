'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { contentApi, flashcardApi } from '@/lib/api';
import { Domain, Task } from '@pmp/shared';

export default function CreateFlashcardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [selectedDomainId, setSelectedDomainId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load domains
  useEffect(() => {
    async function loadDomains() {
      try {
        const response = await contentApi.getDomains();
        if (response.data) {
          setDomains(response.data as unknown as Domain[]);
        }
      } catch (err) {
        console.error('Failed to load domains', err);
        setError('Failed to load content domains. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated) {
      loadDomains();
    }
  }, [isAuthenticated]);

  // Load tasks when domain changes
  useEffect(() => {
    async function loadTasks() {
      if (!selectedDomainId) {
        setTasks([]);
        return;
      }

      try {
        const response = await contentApi.getTasks(selectedDomainId);
        if (response.data) {
          setTasks(response.data as unknown as Task[]);
          // Reset task selection if the new list doesn't contain the old one
          // Or just always reset for simplicity
          setSelectedTaskId('');
        }
      } catch (err) {
        console.error('Failed to load tasks', err);
      }
    }

    loadTasks();
  }, [selectedDomainId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!selectedDomainId || !selectedTaskId || !front.trim() || !back.trim()) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      await flashcardApi.createCustom({
        domainId: selectedDomainId,
        taskId: selectedTaskId,
        front: front.trim(),
        back: back.trim(),
      });

      router.push('/flashcards');
    } catch (err: unknown) {
      console.error('Failed to create flashcard', err);
      const message = err instanceof Error ? err.message : 'Failed to create flashcard';
      setError(message);
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--foreground-muted)]">Loading...</div>
      </div>
    );
  }

  // Tier check (optional UI enforcement)
  const canCreate = user?.tier === 'high-end' || user?.tier === 'corporate';

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/flashcards"
            className="text-sm text-[var(--primary)] hover:underline mb-2 inline-block"
          >
            ← Back to Flashcards
          </Link>
          <h1 className="text-2xl font-bold">Create Custom Flashcard</h1>
          <p className="text-[var(--foreground-muted)]">Add your own cards to your study deck.</p>
        </div>

        {!canCreate && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg text-yellow-200">
            <p className="font-semibold">Upgrade Required</p>
            <p className="text-sm mt-1">
              Custom flashcards are available on Pro and Corporate plans.
            </p>
            <Link href="/pricing" className="text-sm underline mt-2 inline-block">
              View Upgrades
            </Link>
          </div>
        )}

        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Domain</label>
                <select
                  value={selectedDomainId}
                  onChange={e => setSelectedDomainId(e.target.value)}
                  className="w-full p-2 rounded-md bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition"
                  disabled={!canCreate || isSubmitting}
                >
                  <option value="">Select Domain</option>
                  {domains.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Task</label>
                <select
                  value={selectedTaskId}
                  onChange={e => setSelectedTaskId(e.target.value)}
                  className="w-full p-2 rounded-md bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition"
                  disabled={!selectedDomainId || !canCreate || isSubmitting}
                >
                  <option value="">Select Task</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.code} {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Front (Question/Term)</label>
              <textarea
                value={front}
                onChange={e => setFront(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-md bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition"
                placeholder="What is..."
                disabled={!canCreate || isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Back (Answer/Definition)</label>
              <textarea
                value={back}
                onChange={e => setBack(e.target.value)}
                rows={5}
                className="w-full p-3 rounded-md bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition"
                placeholder="The answer is..."
                disabled={!canCreate || isSubmitting}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={!canCreate || isSubmitting}
                className="btn btn-primary px-8"
              >
                {isSubmitting ? 'Creating...' : 'Create Flashcard'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
