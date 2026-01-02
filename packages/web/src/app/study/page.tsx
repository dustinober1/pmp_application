'use client';

import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { FullPageSkeleton } from '@/components/FullPageSkeleton';
import type { Domain, Task } from '@/data/pmpExamContent';
import { PMP_EXAM_CONTENT } from '@/data/pmpExamContent';

type ViewMode = 'tasks' | 'enablers';

export default function StudyPage() {
  const { canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');

  const toggleSelectedDomain = useCallback((domainId: string) => {
    setSelectedDomain(prev => {
      const newSelection = prev === domainId ? null : domainId;
      // Reset task selection when domain changes
      if (newSelection !== prev) {
        setSelectedTask(null);
        setViewMode('tasks');
      }
      return newSelection;
    });
  }, []);

  const fetchDomains = useCallback(async () => {
    try {
      const response = await apiRequest<{ domains: Domain[] }>('/domains');
      setDomains(response.data?.domains ?? []);
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      // If API fails, use the static data
      setDomains(PMP_EXAM_CONTENT);
      toast.info('Using offline study content');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (canAccess) {
      fetchDomains();
    }
  }, [canAccess, fetchDomains]);

  // Find selected domain object
  const selectedDomainData = domains.find(d => d.id === selectedDomain);

  if (authLoading || loading) {
    return <FullPageSkeleton />;
  }

  const domainColors: Record<string, string> = {
    PEOPLE: 'from-blue-500 to-indigo-600',
    PROCESS: 'from-emerald-500 to-teal-600',
    BUSINESS_ENVIRONMENT: 'from-orange-500 to-amber-600',
    BUSINESS: 'from-orange-500 to-amber-600',
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Study Guide</h1>
          <p className="text-[var(--foreground-muted)]">
            Master the PMP domains with comprehensive study materials including tasks and enablers.
          </p>
        </div>

        {/* Domain Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {domains.map(domain => (
            <button
              key={domain.id}
              type="button"
              className={`card w-full text-left transition-all hover:scale-[1.02] ${
                selectedDomain === domain.id ? 'ring-2 ring-[var(--primary)]' : ''
              }`}
              onClick={() => toggleSelectedDomain(domain.id)}
              aria-pressed={selectedDomain === domain.id}
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                  domainColors[domain.code] || 'from-gray-500 to-gray-600'
                } flex items-center justify-center mb-4`}
              >
                <span className="text-white font-bold text-lg">{domain.weightPercentage}%</span>
              </div>
              <h2 className="text-lg font-semibold">{domain.name}</h2>
              <p className="text-sm text-[var(--foreground-muted)] mt-2 line-clamp-2">
                {domain.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                <span className="text-sm text-[var(--foreground-muted)]">
                  {domain.tasks?.length || 0} tasks
                </span>
                <span className="text-[var(--primary)] text-sm font-medium">
                  {selectedDomain === domain.id ? 'View Details ↓' : 'Expand →'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Expanded Domain with Tabs */}
        {selectedDomain && selectedDomainData && (
          <div className="card animate-slideUp">
            {/* Domain Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">{selectedDomainData.name}</h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                {selectedDomainData.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <span className="badge badge-primary">
                  {selectedDomainData.weightPercentage}% of Exam
                </span>
                <span className="text-sm text-[var(--foreground-muted)]">
                  {selectedDomainData.tasks?.length ?? 0} Tasks
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-[var(--border)] mb-6">
              <nav className="flex gap-4" aria-label="Tabs">
                <button
                  type="button"
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === 'tasks'
                      ? 'border-[var(--primary)] text-[var(--primary)]'
                      : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                  }`}
                  onClick={() => setViewMode('tasks')}
                  aria-selected={viewMode === 'tasks'}
                  role="tab"
                >
                  Tasks
                </button>
                <button
                  type="button"
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === 'enablers'
                      ? 'border-[var(--primary)] text-[var(--primary)]'
                      : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                  }`}
                  onClick={() => setViewMode('enablers')}
                  aria-selected={viewMode === 'enablers'}
                  role="tab"
                  disabled={!selectedTask}
                >
                  Enablers
                  {selectedTask && (
                    <span className="ml-2 text-xs opacity-75">({selectedTask.code})</span>
                  )}
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {viewMode === 'tasks' && (
              <div className="space-y-3" role="tabpanel">
                {(selectedDomainData.tasks || []).map(task => (
                  <button
                    type="button"
                    key={task.id}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedTask?.id === task.id
                        ? 'border-[var(--primary)] bg-[var(--secondary)]'
                        : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--secondary)]'
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="badge badge-primary">{task.code}</span>
                          <h3 className="font-semibold">{task.name}</h3>
                        </div>
                        <p className="text-sm text-[var(--foreground-muted)] mb-3">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                          <span>{task.enablers?.length || 0} Enabler Categories</span>
                          <span>•</span>
                          <span>
                            {task.enablers?.reduce((sum, e) => sum + (e.items?.length || 0), 0) ||
                              0}{' '}
                            Total Items
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 text-sm bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTask(task);
                            setViewMode('enablers');
                          }}
                        >
                          View Enablers
                        </button>
                        <svg
                          className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${
                            selectedTask?.id === task.id ? 'rotate-90' : ''
                          }`}
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
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {viewMode === 'enablers' && selectedTask && (
              <div className="space-y-6" role="tabpanel">
                {/* Task Header */}
                <div className="pb-4 border-b border-[var(--border)]">
                  <button
                    type="button"
                    className="text-sm text-[var(--primary)] hover:underline mb-3"
                    onClick={() => setViewMode('tasks')}
                  >
                    ← Back to Tasks
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="badge badge-primary">{selectedTask.code}</span>
                    <h3 className="text-xl font-bold">{selectedTask.name}</h3>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Enablers by Category */}
                {selectedTask.enablers?.length > 0 ? (
                  selectedTask.enablers.map((enabler, idx) => (
                    <div
                      key={idx}
                      className="border border-[var(--border)] rounded-lg overflow-hidden mb-4"
                    >
                      <div className="px-4 py-3 bg-[var(--secondary)]">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              enabler.category === 'Key Knowledge and Skills'
                                ? 'bg-blue-500'
                                : enabler.category === 'Tools and Methods'
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                            }`}
                          />
                          <h4 className="font-semibold text-left">{enabler.category}</h4>
                          <span className="badge badge-secondary text-xs">
                            {enabler.items.length} items
                          </span>
                        </div>
                      </div>
                      <div className="px-4 py-3 bg-[var(--background)]">
                        <ul className="space-y-2">
                          {enabler.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-3 text-sm">
                              <span
                                className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  enabler.category === 'Key Knowledge and Skills'
                                    ? 'bg-blue-500'
                                    : enabler.category === 'Tools and Methods'
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500'
                                }`}
                              />
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[var(--foreground-muted)]">
                      No enablers available for this task.
                    </p>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'enablers' && !selectedTask && (
              <div className="text-center py-12">
                <p className="text-[var(--foreground-muted)]">
                  Select a task from the Tasks tab to view its enablers.
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                  onClick={() => setViewMode('tasks')}
                >
                  Go to Tasks
                </button>
              </div>
            )}
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
