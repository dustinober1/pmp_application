'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { practiceApi } from '@/lib/api';
import type { PracticeQuestion } from '@pmp/shared';
import { useToast } from '@/components/ToastProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { FullPageSkeleton } from '@/components/FullPageSkeleton';
import {
  MockExamFooter,
  MockExamHeader,
  MockExamQuestionCard,
  MockExamReviewScreen,
  MockExamSideNav,
} from './MockExamComponents';

interface SessionProgress {
  total: number;
  answered: number;
}

interface SessionData {
  id: string;
  totalQuestions: number;
  progress: SessionProgress;
  timeRemainingMs?: number;
  timeLimitMs?: number;
  startedAt?: string;
}

interface QuestionsResponse {
  questions: PracticeQuestion[];
  total: number;
  hasMore: boolean;
}

const FALLBACK_SECONDS_PER_QUESTION = 75;
const BATCH_SIZE = 20;
const PREFETCH_THRESHOLD = 5;

export default function MockExamSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [questions, setQuestions] = useState<(PracticeQuestion & { userAnswerId?: string })[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exam specific state
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [showReview, setShowReview] = useState(false);
  const [examComplete, setExamComplete] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentBatch, setCurrentBatch] = useState(0);
  const prefetchTriggeredRef = useRef(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const finishExam = useCallback(async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      await practiceApi.completeSession(sessionId);
      setExamComplete(true);
      router.push('/dashboard'); // Or a results page
    } catch (error) {
      console.error('Failed to complete exam', error);
      setIsSubmitting(false);
      toast.error('Failed to submit exam. Please try again.');
    }
  }, [sessionId, router, toast]);

  // Initialize session
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const response = await practiceApi.getSession(sessionId);

      if (response.data) {
        const sessionData = response.data as SessionData;
        setSession(sessionData);
        setTotalQuestions(sessionData.totalQuestions);

        const timeRemainingMs =
          typeof sessionData.timeRemainingMs === 'number'
            ? sessionData.timeRemainingMs
            : sessionData.totalQuestions * FALLBACK_SECONDS_PER_QUESTION * 1000;
        setTimeLeft(Math.max(0, Math.floor(timeRemainingMs / 1000)));
      }
    } catch (error) {
      console.error('Failed to fetch session', error);
      toast.error('Failed to load mock exam session.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, toast]);

  // Fetch questions in batches
  const fetchQuestions = useCallback(async (batchNumber: number) => {
    try {
      const offset = batchNumber * BATCH_SIZE;
      const response = await practiceApi.getSessionQuestions(sessionId, offset, BATCH_SIZE);
      
      if (response.data) {
        const data = response.data as QuestionsResponse;
        setQuestions(prev => [...prev, ...data.questions]);
        setTotalQuestions(data.total);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      toast.error('Failed to load questions. Please try again.');
    }
  }, [sessionId, toast]);

  useEffect(() => {
    if (canAccess) {
      const initSession = async () => {
        await Promise.all([
          fetchSession(),
          fetchQuestions(0),
        ]);
      };
      initSession();
    }
  }, [canAccess, fetchSession, fetchQuestions]);

  // Prefetch next batch when approaching end of current batch
  useEffect(() => {
    const questionsInCurrentBatch = (currentBatch + 1) * BATCH_SIZE;
    const remainingInBatch = questionsInCurrentBatch - currentIndex;
    
    if (hasMore && remainingInBatch <= PREFETCH_THRESHOLD && !prefetchTriggeredRef.current) {
      prefetchTriggeredRef.current = true;
      setIsLoadingMore(true);
      fetchQuestions(currentBatch + 1).then(() => {
        setCurrentBatch(prev => prev + 1);
        setIsLoadingMore(false);
        prefetchTriggeredRef.current = false;
      });
    }
  }, [currentIndex, currentBatch, hasMore, fetchQuestions]);

  // Timer Tick
  // CRITICAL-004: Pause timer when in review mode (showReview is true)
  useEffect(() => {
    if (loading || examComplete || !session || showReview) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          void finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, examComplete, session, showReview, finishExam]);

  // Sync current selection when index changes
  useEffect(() => {
    if (questions && questions[currentIndex]) {
      setSelectedOptionId(questions[currentIndex].userAnswerId || null);
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentIndex, questions]);

  const handleOptionSelect = async (optionId: string) => {
    setSelectedOptionId(optionId);

    // Optimistically update local state
    setQuestions(prev => {
      const updatedQuestions = [...prev];
      const currentQ = updatedQuestions[currentIndex];

      if (!currentQ) return prev;
      // Only update if changed
      if (currentQ.userAnswerId === optionId) return prev;

      updatedQuestions[currentIndex] = { ...currentQ, userAnswerId: optionId };
      return updatedQuestions;
    });

    // Silently sync with backend
    // We don't wait for this to resolve to let user move fast
    // We assume success, or retries could be handled in a more robust queue system in future
    if (questions && questions[currentIndex]) {
      try {
        await practiceApi.submitAnswer({
          sessionId,
          questionId: questions[currentIndex].id,
          selectedOptionId: optionId,
          timeSpentMs: 0, // We could track per-question time but global timer is more important here
        });
      } catch (err) {
        console.error('Failed to sync answer', err);
        const message = err instanceof Error ? err.message : 'Failed to submit answer';
        if (message.toLowerCase().includes('time expired')) {
          toast.error('Time is up — submitting your exam.');
          void finishExam();
        } else {
          toast.error('Failed to submit answer. Please try again.');
        }
      }
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowReview(false);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowReview(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (authLoading || loading) {
    return <FullPageSkeleton />;
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-white">
        Session not found.{' '}
        <button onClick={() => router.push('/practice')} className="text-primary-400 underline">
          Back
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  // Safe guard access
  if (!currentQuestion) return <FullPageSkeleton />;
  
  const answeredCount = questions.filter(q => q.userAnswerId).length;
  const totalCount = totalQuestions;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  // Review Screen
  if (showReview) {
    return (
      <MockExamReviewScreen
        questions={questions}
        timeLeftSeconds={timeLeft}
        onJumpToQuestion={jumpToQuestion}
        onReturnToExam={() => setShowReview(false)}
        onSubmitExam={finishExam}
        isSubmitting={isSubmitting}
        formatTime={formatTime}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
      {/* Header Bar */}
      <MockExamHeader
        currentIndex={currentIndex}
        totalCount={totalCount}
        progressPercent={progressPercent}
        timeLeftSeconds={timeLeft}
        onShowReview={() => setShowReview(true)}
        formatTime={formatTime}
      />

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Main Question Area */}
        <div className="flex-1 flex flex-col overflow-y-auto pr-2 custom-scrollbar" ref={scrollRef}>
          <MockExamQuestionCard
            question={currentQuestion}
            selectedOptionId={selectedOptionId}
            onSelectOption={handleOptionSelect}
          />
        </div>

        {/* Side Navigation (Desktop) */}
        <MockExamSideNav
          questions={questions}
          currentIndex={currentIndex}
          onSelectIndex={setCurrentIndex}
        />
      </div>

      {/* Footer Controls */}
      <MockExamFooter
        canGoPrev={currentIndex > 0}
        onPrev={handlePrev}
        onNext={handleNext}
        nextLabel={currentIndex === totalCount - 1 ? 'Review Exam' : 'Next Question'}
      />
    </div>
  );
}
