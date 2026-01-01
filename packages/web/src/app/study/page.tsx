'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { FullPageSkeleton } from '@/components/FullPageSkeleton';

interface Domain {
  id: string;
  name: string;
  code: string;
  description: string;
  weightPercentage: number;
  tasks: Task[];
}

interface Task {
  id: string;
  code: string;
  name: string;
  description: string;
}

export default function StudyPage() {
  const { canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const toggleSelectedDomain = useCallback((domainId: string) => {
    setSelectedDomain(prev => (prev === domainId ? null : domainId));
  }, []);

  useEffect(() => {
    if (canAccess) {
      fetchDomains();
    }
  }, [canAccess]);

  const fetchDomains = async () => {
    try {
      const response = await apiRequest<{ domains: Domain[] }>('/domains');
      setDomains(response.data?.domains ?? []);
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      toast.error('Failed to load study content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <FullPageSkeleton />;
  }

  const domainColors: Record<string, string> = {
    PEOPLE: 'from-blue-500 to-indigo-600',
    PROCESS: 'from-emerald-500 to-teal-600',
    BUSINESS: 'from-orange-500 to-amber-600',
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Study Guide</h1>
          <p className="text-[var(--foreground-muted)]">
            Master the PMP domains with comprehensive study materials.
          </p>
        </div>

        {/* Domain Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {domains.map(domain => (
            <button
              key={domain.id}
              type="button"
              className={`card w-full text-left transition-all hover:scale-[1.02] ${selectedDomain === domain.id ? 'ring-2 ring-[var(--primary)]' : ''}`}
              onClick={() => toggleSelectedDomain(domain.id)}
              aria-pressed={selectedDomain === domain.id}
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${domainColors[domain.code] || 'from-gray-500 to-gray-600'} flex items-center justify-center mb-4`}
              >
                <span className="text-white font-bold text-lg">{domain.weightPercentage}%</span>
              </div>
              <h2 className="text-lg font-semibold">{domain.name}</h2>
              <p className="text-sm text-[var(--foreground-muted)] mt-2">
                {domain.description?.substring(0, 100)}...
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                <span className="text-sm text-[var(--foreground-muted)]">
                  {domain.tasks?.length || 0} tasks
                </span>
                <span className="text-[var(--primary)] text-sm font-medium">
                  {selectedDomain === domain.id ? 'View Tasks ↓' : 'Expand →'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Expanded Domain Tasks */}
        {selectedDomain && (
          <div className="card animate-slideUp">
            <h2 className="font-semibold mb-4">
              {domains.find(d => d.id === selectedDomain)?.name} - Tasks
            </h2>
            <div className="grid gap-3">
              {domains
                .find(d => d.id === selectedDomain)
                ?.tasks?.map(task => (
                  <Link
                    key={task.id}
                    href={`/study/${task.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="badge badge-primary">{task.code}</span>
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-[var(--foreground-muted)]">
                          {task.description?.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-[var(--foreground-muted)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* No domains message */}
        {domains.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--foreground-muted)]">No study content available yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
