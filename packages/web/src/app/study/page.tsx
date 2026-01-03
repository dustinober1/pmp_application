'use client';

import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { FullPageSkeleton } from '@/components/FullPageSkeleton';
import type { Domain, Enabler } from '@/data/pmpExamContent';
import { PMP_EXAM_CONTENT } from '@/data/pmpExamContent';

/**
 * Normalize enablers to consistent format
 * Handles both API format (string[]) and static data format (Enabler[])
 */
function normalizeEnablers(enablers: string[] | Enabler[] | undefined): Enabler[] {
  if (!enablers || enablers.length === 0) return [];

  // Check if first element is a string (API format)
  if (typeof enablers[0] === 'string') {
    // Convert from string[] to Enabler[] format
    return [
      {
        category: 'Other Information' as const,
        items: enablers as string[],
      },
    ];
  }

  // Already in Enabler[] format (static data)
  return enablers as Enabler[];
}

export default function StudyPage() {
  const { canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedDomainData, setSelectedDomainData] = useState<Domain | null>(null);
  const [loadingDomainDetails, setLoadingDomainDetails] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleSelectedDomain = useCallback(
    async (domainId: string) => {
      const isDeselecting = selectedDomain === domainId;

      setSelectedDomain(prev => {
        const newSelection = prev === domainId ? null : domainId;
        // Reset expanded tasks and domain data when domain changes
        if (newSelection !== prev) {
          setExpandedTasks(new Set());
          setSelectedDomainData(null);
        }
        return newSelection;
      });

      // Fetch full domain data with tasks if selecting (not deselecting)
      if (!isDeselecting) {
        setLoadingDomainDetails(true);
        try {
          const response = await apiRequest<{ domain: Domain }>(`/domains/${domainId}`);
          setSelectedDomainData(response.data?.domain ?? null);
        } catch (error) {
          console.error('Failed to fetch domain details:', error);
          // Fallback to static data
          const staticDomain = PMP_EXAM_CONTENT.find(d => d.id === domainId);
          setSelectedDomainData(staticDomain ?? null);
        } finally {
          setLoadingDomainDetails(false);
        }
      }
    },
    [selectedDomain]
  );

  const toggleTaskExpanded = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
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

  if (authLoading || loading) {
    return <FullPageSkeleton />;
  }

  const domainColors: Record<string, string> = {
    PEOPLE: 'from-blue-500 to-indigo-600',
    PROCESS: 'from-emerald-500 to-teal-600',
    BUSINESS_ENVIRONMENT: 'from-orange-500 to-amber-600',
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

        {/* Loading state for domain details */}
        {selectedDomain && loadingDomainDetails && (
          <div className="card animate-slideUp">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-[var(--foreground-muted)]">
                  Loading tasks and enablers...
                </span>
              </div>
            </div>
          </div>
        )}

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

            {/* Tasks with Inline Enablers */}
            <div className="space-y-3">
              {(selectedDomainData.tasks || []).map(task => {
                const isExpanded = expandedTasks.has(task.id);
                const normalizedEnablers = normalizeEnablers(task.enablers);
                const totalEnablerItems = normalizedEnablers.reduce(
                  (sum, e) => sum + e.items.length,
                  0
                );

                return (
                  <div
                    key={task.id}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      isExpanded
                        ? 'border-[var(--primary)] bg-[var(--secondary)]'
                        : 'border-[var(--border)] hover:border-[var(--primary)]'
                    }`}
                  >
                    {/* Task Header - Always Visible */}
                    <button
                      type="button"
                      className="w-full text-left p-4"
                      onClick={() => toggleTaskExpanded(task.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="badge badge-primary">{task.code}</span>
                            <h3 className="font-semibold">{task.name}</h3>
                          </div>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-[var(--foreground-muted)]">
                            <span>{normalizedEnablers.length} Enabler Categories</span>
                            <span>•</span>
                            <span>{totalEnablerItems} Total Items</span>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform flex-shrink-0 mt-1 ${
                            isExpanded ? 'rotate-90' : ''
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
                    </button>

                    {/* Inline Enablers - Shown when expanded */}
                    {isExpanded && task.enablers && task.enablers.length > 0 && (
                      <div className="border-t border-[var(--border)] p-4 bg-[var(--background)]">
                        <div className="space-y-4">
                          {normalizedEnablers.map((enabler, idx) => (
                            <div
                              key={idx}
                              className="border border-[var(--border)] rounded-lg overflow-hidden"
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
                              <div className="px-4 py-3">
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
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
