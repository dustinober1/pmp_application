'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { apiRequest } from '../../../../../lib/api';
import { PracticeQuestion } from '@pmp/shared';

interface SessionProgress {
  total: number;
  answered: number;
}

interface SessionData {
  sessionId: string;
  questions: (PracticeQuestion & { userAnswerId?: string })[];
  progress: SessionProgress;
  timeRemaining?: number; // Optional, if backend tracks it, otherwise we calculate
  totalTimeMinutes?: number;
}

export default function MockExamSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exam specific state
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [showReview, setShowReview] = useState(false);
  const [examComplete, setExamComplete] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize session
  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) return;
      try {
        setLoading(true);
        const response = await apiRequest<SessionData>(`/practice/sessions/${sessionId}`);

        if (response.data) {
          setSession(response.data);

          // Logic to determine time left
          // Assuming 230 minutes for 180 questions (standard PMP) or scaled based on question count
          // For now, let's assume standard PMP timing of ~1.2 mins per question if not provided is safe default
          // But ideally backend provides start time or time remaining.
          // Using a default of 75 seconds per question for now if not explicit.
          const totalSeconds = response.data.questions.length * 75;
          setTimeLeft(totalSeconds);

          // Restore answer for first question if exists
          if (response.data.questions.length > 0) {
            const firstQ = response.data.questions[0];
            if (firstQ) {
              setSelectedOptionId(firstQ.userAnswerId || null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch session', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchSession();
    }
  }, [sessionId, user]);

  // Timer Tick
  useEffect(() => {
    if (loading || examComplete || !session) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, examComplete, session]);

  // Sync current selection when index changes
  useEffect(() => {
    if (session && session.questions[currentIndex]) {
      setSelectedOptionId(session.questions[currentIndex].userAnswerId || null);
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentIndex, session]);

  const handleOptionSelect = async (optionId: string) => {
    setSelectedOptionId(optionId);

    // Optimistically update local state
    setSession(prev => {
      if (!prev) return null;
      const updatedQuestions = [...prev.questions];
      const currentQ = updatedQuestions[currentIndex];

      if (!currentQ) return prev;
      // Only update if changed
      if (currentQ.userAnswerId === optionId) return prev;

      updatedQuestions[currentIndex] = { ...currentQ, userAnswerId: optionId };

      // Update progress count
      const newAnsweredCount = updatedQuestions.filter(q => q.userAnswerId).length;

      return {
        ...prev,
        questions: updatedQuestions,
        progress: { ...prev.progress, answered: newAnsweredCount },
      };
    });

    // Silently sync with backend
    // We don't wait for this to resolve to let user move fast
    // We assume success, or retries could be handled in a more robust queue system in future
    if (session && session.questions[currentIndex]) {
      try {
        await apiRequest(
          `/practice/sessions/${sessionId}/answers/${session.questions[currentIndex].id}`,
          {
            method: 'POST',
            body: {
              selectedOptionId: optionId,
              timeSpentMs: 0, // We could track per-question time but global timer is more important here
            },
          }
        );
      } catch (err) {
        console.error('Failed to sync answer', err);
      }
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowReview(false);
  };

  const handleNext = () => {
    if (!session) return;
    if (currentIndex < session.questions.length - 1) {
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

  const finishExam = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`/practice/sessions/${sessionId}/complete`, { method: 'POST' });
      setExamComplete(true);
      router.push('/dashboard'); // Or a results page
    } catch (error) {
      console.error('Failed to complete exam', error);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
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

  const currentQuestion = session.questions[currentIndex];
  // Safe guard access
  if (!currentQuestion) return <div>Loading...</div>;

  const answeredCount = session.progress.answered;
  const totalCount = session.questions.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  // Review Screen
  if (showReview) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Review Your Answers</h1>
          <div className="text-xl font-mono text-primary-400">{formatTime(timeLeft)}</div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
            {session.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => jumpToQuestion(idx)}
                className={`p-2 rounded text-sm font-medium border transition-colors ${
                  q.userAnswerId
                    ? 'bg-primary-900/40 border-primary-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setShowReview(false)}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Return to Exam
          </button>
          <button
            onClick={finishExam}
            disabled={isSubmitting}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 font-medium">
            Question {currentIndex + 1} <span className="text-gray-600">/ {totalCount}</span>
          </span>
          <div className="h-4 w-32 bg-gray-800 rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-2xl font-mono font-bold text-primary-400 tracking-wider bg-gray-900 px-4 py-1 rounded-lg border border-gray-800 shadow-inner">
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setShowReview(true)}
            className="text-sm text-gray-400 hover:text-white underline"
          >
            Review All
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Main Question Area */}
        <div className="flex-1 flex flex-col overflow-y-auto pr-2 custom-scrollbar" ref={scrollRef}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6 shadow-sm">
            <p className="text-xl md:text-2xl text-white font-medium mb-8 leading-relaxed">
              {currentQuestion.questionText}
            </p>

            <div className="space-y-3">
              {currentQuestion.options.map(option => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start group ${
                      isSelected
                        ? 'bg-primary-900/20 border-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-600 group-hover:border-gray-500'
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <span className={`text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Navigation (Desktop) */}
        <div className="w-20 hidden lg:flex flex-col gap-2 overflow-y-auto custom-scrollbar bg-gray-900/30 p-2 rounded-xl border border-gray-800/50">
          {session.questions.map((q, idx) => {
            const isActive = idx === currentIndex;
            const isAnswered = !!q.userAnswerId;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-full aspect-square rounded flex items-center justify-center text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                    : isAnswered
                      ? 'bg-primary-900/30 text-primary-400 border border-primary-900'
                      : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="border-t border-gray-800 pt-6 mt-2 flex justify-between items-center bg-background py-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-6 py-2.5 rounded-lg border font-medium transition ${
            currentIndex === 0
              ? 'border-gray-800 text-gray-600 cursor-not-allowed'
              : 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          &larr; Previous
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => {
              // Flag logic could go here
            }}
            className="px-4 py-2.5 text-gray-400 hover:text-yellow-400 transition"
          >
            Flag for Review
          </button>
        </div>

        <button
          onClick={handleNext}
          className="px-8 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition shadow-lg hover:shadow-primary-900/20 flex items-center"
        >
          {currentIndex === totalCount - 1 ? 'Review Exam' : 'Next Question'}
          <span className="ml-2">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
