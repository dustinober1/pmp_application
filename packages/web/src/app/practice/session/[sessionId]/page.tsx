"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useToast } from "@/components/ToastProvider";
import { FullPageSkeleton } from "@/components/FullPageSkeleton";
import { practiceApi } from "@/lib/api";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import { StreakCounter } from "@/components/StreakCounter";
import { LoadingOverlay } from "@/components/QuestionSkeleton";

interface PracticeQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  domain: string;
  task: string;
  difficulty: "easy" | "medium" | "hard";
  isFlagged: boolean;
}

interface PracticeSession {
  id: string;
  totalQuestions: number;
  progress: number;
  completedAt?: Date;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalAnswered: number;
  correctCount: number;
}

interface QuestionsResponse {
  questions: PracticeQuestion[];
  total: number;
  hasMore: boolean;
}

const BATCH_SIZE = 20;
const PREFETCH_THRESHOLD = 5;

export default function PracticeSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_session, setSession] = useState<PracticeSession | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const prefetchTriggeredRef = useRef(false);

  const fetchSession = useCallback(async () => {
    try {
      const response = await practiceApi.getSession(sessionId);
      if (response.data) {
        setSession(response.data as PracticeSession);
        setTotalQuestions((response.data as PracticeSession).totalQuestions);
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
      toast.error("Failed to load session. Please try again.");
    }
  }, [sessionId, toast]);

  const fetchQuestions = useCallback(
    async (batchNumber: number) => {
      try {
        const offset = batchNumber * BATCH_SIZE;
        const response = await practiceApi.getSessionQuestions(
          sessionId,
          offset,
          BATCH_SIZE,
        );

        if (response.data) {
          const data = response.data as QuestionsResponse;
          setQuestions((prev) => [...prev, ...data.questions]);
          setTotalQuestions(data.total);
          setHasMore(data.hasMore);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        toast.error("Failed to load questions. Please try again.");
      }
    },
    [sessionId, toast],
  );

  const fetchStreak = useCallback(async () => {
    try {
      const response = await practiceApi.getSessionStreak(sessionId);
      if (response.data) {
        setStreak(response.data as StreakData);
      }
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    }
  }, [sessionId]);

  useEffect(() => {
    if (canAccess && sessionId) {
      const initSession = async () => {
        setLoading(true);
        await Promise.all([fetchSession(), fetchQuestions(0), fetchStreak()]);
        setLoading(false);
      };
      initSession();
    }
  }, [canAccess, sessionId, fetchSession, fetchQuestions, fetchStreak]);

  useEffect(() => {
    // Prefetch next batch when approaching end of current batch
    const questionsInCurrentBatch = (currentBatch + 1) * BATCH_SIZE;
    const remainingInBatch = questionsInCurrentBatch - currentIndex;

    if (
      hasMore &&
      remainingInBatch <= PREFETCH_THRESHOLD &&
      !prefetchTriggeredRef.current
    ) {
      prefetchTriggeredRef.current = true;
      setIsLoadingMore(true);
      fetchQuestions(currentBatch + 1).then(() => {
        setCurrentBatch((prev) => prev + 1);
        setIsLoadingMore(false);
        prefetchTriggeredRef.current = false;
      });
    }
  }, [currentIndex, currentBatch, hasMore, fetchQuestions]);

  const handleOptionSelect = (optionId: string) => {
    if (showExplanation) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOptionId || submitting) return;

    setSubmitting(true);
    const question = questions[currentIndex];
    if (!question) {
      setSubmitting(false);
      return;
    }

    try {
      await practiceApi.submitAnswer({
        sessionId,
        questionId: question.id,
        selectedOptionId,
        timeSpentMs: 0, // TODO: Track actual time
      });

      setAnsweredQuestions((prev) => new Set(prev).add(question.id));

      await fetchStreak();
      setShowExplanation(true);
    } catch (error) {
      console.error("Failed to submit answer:", error);
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedOptionId(null);
      setShowExplanation(false);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setSelectedOptionId(null);
    setShowExplanation(false);
  };

  const handleFlag = async () => {
    const question = questions[currentIndex];
    if (!question) return;

    const isFlagged = flaggedQuestions.has(question.id);

    try {
      if (isFlagged) {
        await practiceApi.unflagQuestion(question.id);
        setFlaggedQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(question.id);
          return newSet;
        });
        toast.success("Question unflagged");
      } else {
        await practiceApi.flagQuestion(question.id);
        setFlaggedQuestions((prev) => new Set(prev).add(question.id));
        toast.success("Question flagged");
      }
    } catch (error) {
      console.error("Failed to flag question:", error);
      toast.error("Failed to flag question. Please try again.");
    }
  };

  const handleCompleteSession = async () => {
    try {
      await practiceApi.completeSession(sessionId);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to complete session:", error);
      toast.error("Failed to complete session. Please try again.");
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  if (authLoading || loading || !currentQuestion) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {/* Question Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {currentQuestion.domain}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    {currentQuestion.task}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <button
                  onClick={handleFlag}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    flaggedQuestions.has(currentQuestion.id)
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {flaggedQuestions.has(currentQuestion.id)
                    ? "🚩 Flagged"
                    : "Flag"}
                </button>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const showCorrect = showExplanation && option.isCorrect;
                  const showIncorrect =
                    showExplanation && isSelected && !option.isCorrect;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      disabled={showExplanation}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : showIncorrect
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                      } ${showExplanation ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            showCorrect
                              ? "border-green-500 bg-green-500"
                              : showIncorrect
                                ? "border-red-500 bg-red-500"
                                : isSelected
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {isSelected && !showExplanation && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                          {showCorrect && (
                            <span className="text-white text-xs">✓</span>
                          )}
                          {showIncorrect && (
                            <span className="text-white text-xs">✗</span>
                          )}
                        </div>
                        <span className="flex-1">{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2">Explanation</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-6 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {!showExplanation ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedOptionId || submitting}
                      className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Submit Answer"}
                    </button>
                  ) : (
                    <>
                      {isLastQuestion ? (
                        <button
                          onClick={handleCompleteSession}
                          className="px-6 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
                        >
                          Complete Session
                        </button>
                      ) : (
                        <button
                          onClick={handleNext}
                          className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Next Question
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streak Counter */}
            {streak && (
              <StreakCounter
                currentStreak={streak.currentStreak}
                longestStreak={streak.longestStreak}
                totalAnswered={streak.totalAnswered}
                correctCount={streak.correctCount}
              />
            )}

            {/* Question Navigator */}
            <QuestionNavigator
              totalQuestions={totalQuestions}
              currentIndex={currentIndex}
              answeredQuestions={answeredQuestions}
              flaggedQuestions={flaggedQuestions}
              onJumpToQuestion={handleJumpToQuestion}
              questionsPerPage={25}
            />
          </div>
        </div>

        {/* Loading Overlay for batch loading */}
        {isLoadingMore && <LoadingOverlay />}
      </main>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
