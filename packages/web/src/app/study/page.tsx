"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FullPageSkeleton } from "@/components/FullPageSkeleton";
import type { Domain, Enabler } from "@/data/pmpExamContent";
import { PMP_EXAM_CONTENT } from "@/data/pmpExamContent";

const Footer = dynamic(
  () => import("@/components/Footer").then((mod) => mod.Footer),
  {
    ssr: false,
    loading: () => <div className="h-16" />,
  },
);

type TabType = "study" | "flashcards" | "practice";

/**
 * Normalize enablers to consistent format
 */
function normalizeEnablers(
  enablers: string[] | Enabler[] | undefined,
): Enabler[] {
  if (!enablers || enablers.length === 0) return [];
  if (typeof enablers[0] === "string") {
    return [
      {
        category: "Key Knowledge and Skills" as const,
        items: enablers as string[],
      },
    ];
  }
  return enablers as Enabler[];
}

export default function StudyPage() {
  const router = useRouter();
  const { canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedDomainData, setSelectedDomainData] = useState<Domain | null>(
    null,
  );
  const [loadingDomainDetails, setLoadingDomainDetails] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, TabType>>({});
  const [startingSession, setStartingSession] = useState<string | null>(null);

  const toggleSelectedDomain = useCallback(
    async (domainId: string) => {
      const isDeselecting = selectedDomain === domainId;

      setSelectedDomain((prev) => {
        const newSelection = prev === domainId ? null : domainId;
        if (newSelection !== prev) {
          setExpandedTask(null);
          setSelectedDomainData(null);
        }
        return newSelection;
      });

      if (!isDeselecting) {
        setLoadingDomainDetails(true);
        try {
          const response = await apiRequest<{ domain: Domain }>(
            `/domains/${domainId}`,
          );
          setSelectedDomainData(response.data?.domain ?? null);
        } catch (error) {
          console.error("Failed to fetch domain details:", error);
          const staticDomain = PMP_EXAM_CONTENT.find((d) => d.id === domainId);
          setSelectedDomainData(staticDomain ?? null);
        } finally {
          setLoadingDomainDetails(false);
        }
      }
    },
    [selectedDomain],
  );

  const toggleTaskExpanded = useCallback((taskId: string) => {
    setExpandedTask((prev) => (prev === taskId ? null : taskId));
    setActiveTab((prev) => ({ ...prev, [taskId]: "study" }));
  }, []);

  const setTaskTab = useCallback((taskId: string, tab: TabType) => {
    setActiveTab((prev) => ({ ...prev, [taskId]: tab }));
  }, []);

  const startFlashcardSession = useCallback(
    async (domainId: string, taskId: string) => {
      try {
        setStartingSession(`flashcard-${taskId}`);
        const response = await apiRequest<{ sessionId: string }>(
          "/flashcards/sessions",
          {
            method: "POST",
            body: {
              domainIds: [domainId],
              taskIds: [taskId],
              cardCount: 20,
            },
          },
        );
        if (response.data?.sessionId) {
          router.push(`/flashcards/session/${response.data.sessionId}`);
        }
      } catch (error) {
        console.error("Failed to start flashcard session:", error);
        toast.error("Failed to start flashcard session");
      } finally {
        setStartingSession(null);
      }
    },
    [router, toast],
  );

  const startPracticeSession = useCallback(
    async (domainId: string, taskId: string) => {
      try {
        setStartingSession(`practice-${taskId}`);
        const response = await apiRequest<{ sessionId: string }>(
          "/practice/sessions",
          {
            method: "POST",
            body: {
              domainIds: [domainId],
              taskIds: [taskId],
              questionCount: 10,
            },
          },
        );
        if (response.data?.sessionId) {
          router.push(`/practice/session/${response.data.sessionId}`);
        }
      } catch (error) {
        console.error("Failed to start practice session:", error);
        toast.error("Failed to start practice session");
      } finally {
        setStartingSession(null);
      }
    },
    [router, toast],
  );

  const fetchDomains = useCallback(async () => {
    try {
      const response = await apiRequest<{ domains: Domain[] }>("/domains");
      setDomains(response.data?.domains ?? []);
    } catch (error) {
      console.error("Failed to fetch domains:", error);
      setDomains(PMP_EXAM_CONTENT);
      toast.info("Using offline study content");
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

  const domainColors: Record<
    string,
    { gradient: string; bg: string; text: string }
  > = {
    PEOPLE: {
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
    },
    PROCESS: {
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    BUSINESS_ENVIRONMENT: {
      gradient: "from-orange-500 to-amber-600",
      bg: "bg-orange-500/10",
      text: "text-orange-600 dark:text-orange-400",
    },
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "study",
      label: "Study Guide",
      icon: (
        <svg
          className="w-4 h-4"
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
      ),
    },
    {
      id: "flashcards",
      label: "Flashcards",
      icon: (
        <svg
          className="w-4 h-4"
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
      ),
    },
    {
      id: "practice",
      label: "Practice Questions",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="blur-shape bg-md-tertiary w-64 h-64 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slideUp">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-md-on-background">
              PMP <span className="text-gradient">Study Hub</span>
            </h1>
            <p className="text-lg text-md-on-surface-variant max-w-2xl mx-auto">
              Master all three domains with integrated study guides, flashcards,
              and practice questions for each task.
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Domain Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {domains.map((domain) => {
            const colors = domainColors[domain.code] || {
              gradient: "from-gray-500 to-gray-600",
              bg: "bg-gray-500/10",
              text: "text-gray-600",
            };
            const isSelected = selectedDomain === domain.id;

            return (
              <button
                key={domain.id}
                type="button"
                className={`card w-full text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
                  isSelected ? "ring-2 ring-md-primary shadow-lg" : ""
                }`}
                onClick={() => toggleSelectedDomain(domain.id)}
                aria-pressed={isSelected}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-white font-bold text-lg">
                      {domain.weightPercentage}%
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
                    {domain.tasks?.length || 0} Tasks
                  </span>
                </div>
                <h2 className="text-lg font-bold text-md-on-surface mb-2">
                  {domain.name}
                </h2>
                <p className="text-sm text-md-on-surface-variant line-clamp-2">
                  {domain.description}
                </p>
                <div className="flex items-center justify-end mt-4 pt-4 border-t border-md-outline-variant">
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {isSelected ? "Viewing Tasks ↓" : "View Tasks →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Loading state for domain details */}
        {selectedDomain && loadingDomainDetails && (
          <div className="card animate-slideUp">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-md-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-md-on-surface-variant">
                  Loading tasks and study materials...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Domain with Tasks */}
        {selectedDomain && selectedDomainData && !loadingDomainDetails && (
          <div className="animate-slideUp space-y-4">
            {/* Domain Header */}
            <div className="card bg-md-surface-container-low">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-md-on-surface">
                    {selectedDomainData.name}
                  </h2>
                  <p className="text-sm text-md-on-surface-variant mt-1">
                    {selectedDomainData.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge badge-primary">
                    {selectedDomainData.weightPercentage}%
                  </span>
                  <span className="text-sm text-md-on-surface-variant">
                    {selectedDomainData.tasks?.length ?? 0} Tasks
                  </span>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {(selectedDomainData.tasks || []).map((task) => {
                const isExpanded = expandedTask === task.id;
                const currentTab = activeTab[task.id] || "study";
                const normalizedEnablers = normalizeEnablers(task.enablers);
                const colors = domainColors[selectedDomainData.code] || {
                  gradient: "from-gray-500 to-gray-600",
                  bg: "bg-gray-500/10",
                  text: "text-gray-600",
                };

                return (
                  <div
                    key={task.id}
                    className={`card overflow-hidden transition-all duration-300 ${
                      isExpanded
                        ? "ring-2 ring-md-primary shadow-lg"
                        : "hover:shadow-md"
                    }`}
                  >
                    {/* Task Header */}
                    <button
                      type="button"
                      className="w-full text-left p-4"
                      onClick={() => toggleTaskExpanded(task.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`badge ${colors.bg} ${colors.text} font-mono`}
                            >
                              {task.code}
                            </span>
                            <h3 className="font-semibold text-md-on-surface">
                              {task.name}
                            </h3>
                          </div>
                          <p className="text-sm text-md-on-surface-variant line-clamp-2">
                            {task.description}
                          </p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-md-on-surface-variant transition-transform flex-shrink-0 mt-1 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded Content with Tabs */}
                    {isExpanded && (
                      <div className="border-t border-md-outline-variant">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-md-outline-variant bg-md-surface-container-low">
                          {tabs.map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setTaskTab(task.id, tab.id)}
                              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                                currentTab === tab.id
                                  ? "text-md-primary"
                                  : "text-md-on-surface-variant hover:text-md-on-surface"
                              }`}
                            >
                              {tab.icon}
                              <span className="hidden sm:inline">
                                {tab.label}
                              </span>
                              {currentTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-md-primary" />
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-4">
                          {/* Study Guide Tab */}
                          {currentTab === "study" && (
                            <div className="space-y-4 animate-fadeIn">
                              {normalizedEnablers.length > 0 ? (
                                normalizedEnablers.map((enabler, idx) => (
                                  <div
                                    key={idx}
                                    className="border border-md-outline-variant rounded-lg overflow-hidden"
                                  >
                                    <div className="px-4 py-3 bg-md-surface-container-low flex items-center gap-3">
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          enabler.category ===
                                          "Key Knowledge and Skills"
                                            ? "bg-blue-500"
                                            : enabler.category ===
                                                "Tools and Methods"
                                              ? "bg-emerald-500"
                                              : "bg-amber-500"
                                        }`}
                                      />
                                      <h4 className="font-semibold text-md-on-surface">
                                        {enabler.category}
                                      </h4>
                                      <span className="badge badge-secondary text-xs ml-auto">
                                        {enabler.items.length} items
                                      </span>
                                    </div>
                                    <ul className="p-4 space-y-2">
                                      {enabler.items.map((item, itemIdx) => (
                                        <li
                                          key={itemIdx}
                                          className="flex items-start gap-3 text-sm text-md-on-surface-variant"
                                        >
                                          <svg
                                            className="w-4 h-4 text-md-primary flex-shrink-0 mt-0.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-md-on-surface-variant">
                                  <svg
                                    className="w-12 h-12 mx-auto mb-3 opacity-50"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  <p>
                                    Study materials coming soon for this task.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Flashcards Tab */}
                          {currentTab === "flashcards" && (
                            <div className="animate-fadeIn">
                              <div className="text-center py-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-md-primary-container flex items-center justify-center">
                                  <svg
                                    className="w-8 h-8 text-md-on-primary-container"
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
                                <h3 className="text-lg font-semibold text-md-on-surface mb-2">
                                  Flashcards for {task.code}
                                </h3>
                                <p className="text-sm text-md-on-surface-variant mb-6 max-w-md mx-auto">
                                  Study key concepts for &ldquo;{task.name}
                                  &rdquo; with our SM-2 spaced repetition
                                  flashcards.
                                </p>
                                <button
                                  onClick={() =>
                                    startFlashcardSession(
                                      selectedDomainData.id,
                                      task.id,
                                    )
                                  }
                                  disabled={
                                    startingSession === `flashcard-${task.id}`
                                  }
                                  className="btn btn-primary"
                                >
                                  {startingSession ===
                                  `flashcard-${task.id}` ? (
                                    <span className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      Starting...
                                    </span>
                                  ) : (
                                    "Start Flashcard Session"
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Practice Questions Tab */}
                          {currentTab === "practice" && (
                            <div className="animate-fadeIn">
                              <div className="text-center py-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-md-tertiary-container flex items-center justify-center">
                                  <svg
                                    className="w-8 h-8 text-md-on-tertiary-container"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-md-on-surface mb-2">
                                  Practice Questions for {task.code}
                                </h3>
                                <p className="text-sm text-md-on-surface-variant mb-6 max-w-md mx-auto">
                                  Test your knowledge of &ldquo;{task.name}
                                  &rdquo; with exam-style practice questions.
                                </p>
                                <button
                                  onClick={() =>
                                    startPracticeSession(
                                      selectedDomainData.id,
                                      task.id,
                                    )
                                  }
                                  disabled={
                                    startingSession === `practice-${task.id}`
                                  }
                                  className="btn btn-primary"
                                >
                                  {startingSession === `practice-${task.id}` ? (
                                    <span className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      Starting...
                                    </span>
                                  ) : (
                                    "Start Practice Session"
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
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
            <p className="text-md-on-surface-variant">
              No study content available yet.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
