'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { apiRequest } from '../../../../lib/api';
import { PracticeQuestion } from '@pmp/shared';

interface SessionProgress {
  total: number;
  answered: number;
}

interface SessionData {
  sessionId: string;
  questions: (PracticeQuestion & { userAnswerId?: string })[];
  progress: SessionProgress;
}

export default function PracticeSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    correctOptionId: string;
  } | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) return;
      try {
        setLoading(true);
        const response = await apiRequest<SessionData>(`/practice/sessions/${sessionId}`);

        if (response.data) {
          setSession(response.data);

          // Find first unanswered question
          const firstUnanswered = response.data.questions.findIndex(q => !q.userAnswerId);
          setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);

          if (
            response.data.progress.answered >= response.data.progress.total &&
            response.data.progress.total > 0
          ) {
            setSessionComplete(true);
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

  // Reset state when question changes
  useEffect(() => {
    setSelectedOptionId(null);
    setFeedback(null);
    setStartTime(Date.now());
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  const handleSubmitAnswer = async () => {
    if (!session || !sessionId || !selectedOptionId) return;

    const currentQuestion = session.questions[currentIndex];
    if (!currentQuestion) return;

    const timeSpentMs = Date.now() - startTime;
    setIsSubmitting(true);

    try {
      const response = await apiRequest<{
        result: { isCorrect: boolean; explanation: string; correctOptionId: string };
      }>(`/practice/sessions/${sessionId}/answers/${currentQuestion.id}`, {
        method: 'POST',
        body: {
          selectedOptionId,
          timeSpentMs,
        },
      });

      // Show feedback
      if (response.data) {
        setFeedback(response.data.result);
      }

      // Update local session state
      setSession(prev => {
        if (!prev) return null;
        const updatedQuestions = [...prev.questions];
        const questionToUpdate = updatedQuestions[currentIndex];
        updatedQuestions[currentIndex] = {
          ...questionToUpdate,
          userAnswerId: selectedOptionId,
        } as PracticeQuestion & { userAnswerId?: string };
        return {
          ...prev,
          questions: updatedQuestions,
          progress: { ...prev.progress, answered: prev.progress.answered + 1 },
        };
      });
    } catch (error) {
      console.error('Failed to submit answer', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!session) return;

    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await finishSession();
    }
  };

  const finishSession = async () => {
    if (!sessionId) return;
    try {
      await apiRequest(`/practice/sessions/${sessionId}/complete`, { method: 'POST' });
      setSessionComplete(true);
    } catch (error) {
      console.error('Failed to complete session', error);
    }
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
      <div className="max-w-4xl mx-auto px-4 py-8 text-center bg-gray-900 border border-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Session Not Found</h1>
        <button
          onClick={() => router.push('/practice')}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
        >
          Back to Practice
        </button>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-white mb-4">Practice Complete!</h1>
          <p className="text-gray-400 mb-8">
            You've completed {session.questions.length} questions. Check the dashboard for detailed
            analytics.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/practice')}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Overview
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIndex];
  // Calculate progress safely
  const progressPercent =
    session.questions.length > 0 ? Math.round((currentIndex / session.questions.length) * 100) : 0;

  if (!currentQuestion) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/practice')}
            className="text-gray-400 hover:text-white transition"
          >
            &larr; Exit
          </button>
          <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 font-mono">
            Q{currentIndex + 1}/{session.questions.length}
          </div>
          {currentQuestion.difficulty && (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium uppercase border ${
                currentQuestion.difficulty === 'easy'
                  ? 'border-green-800 text-green-400 bg-green-900/20'
                  : currentQuestion.difficulty === 'medium'
                    ? 'border-yellow-800 text-yellow-400 bg-yellow-900/20'
                    : 'border-red-800 text-red-400 bg-red-900/20'
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          )}
        </div>
        <div className="flex-1 max-w-md mx-auto w-full">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        <div className="w-20 hidden md:block"></div>
      </div>

      {/* Question Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 mb-6">
          <h2 className="text-xl md:text-2xl text-white font-medium mb-8 leading-relaxed">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map(option => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = feedback?.correctOptionId === option.id;
              const isWrong = feedback && isSelected && !feedback.isCorrect;

              let containerClasses =
                'w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start group relative';

              if (feedback) {
                if (isCorrect) containerClasses += ' bg-green-900/30 border-green-500/50';
                else if (isWrong) containerClasses += ' bg-red-900/30 border-red-500/50';
                else containerClasses += ' border-gray-800 opacity-60';
              } else {
                if (isSelected) containerClasses += ' bg-primary-900/20 border-primary-500';
                else
                  containerClasses +=
                    ' bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => !feedback && setSelectedOptionId(option.id)}
                  disabled={!!feedback || isSubmitting}
                  className={containerClasses}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                      feedback
                        ? isCorrect
                          ? 'border-green-500 bg-green-500'
                          : isWrong
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-600'
                        : isSelected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-500 group-hover:border-gray-400'
                    }`}
                  >
                    {(feedback && (isCorrect || isWrong)) || isSelected ? (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    ) : null}
                  </div>
                  <span
                    className={`text-base ${
                      feedback && (isCorrect || isWrong) ? 'text-white' : 'text-gray-300'
                    }`}
                  >
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-xl p-6 mb-6 border animate-in fade-in slide-in-from-bottom-4 duration-300 ${
              feedback.isCorrect
                ? 'bg-green-900/20 border-green-800'
                : 'bg-red-900/20 border-red-800'
            }`}
          >
            <div className="flex items-center mb-3">
              <span
                className={`text-2xl mr-3 ${feedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}
              >
                {feedback.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>
            <div className="text-gray-300 leading-relaxed">
              <span className="font-semibold text-white block mb-1">Explanation:</span>
              {feedback.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-gray-800 flex justify-end">
        {!feedback ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedOptionId || isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium transition-all transform active:scale-95 ${
              !selectedOptionId || isSubmitting
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed hidden' // Hide if not actionable
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-primary-900/20'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-900/20 flex items-center"
          >
            {currentIndex === session.questions.length - 1 ? 'Finish Session' : 'Next Question'}
            <span className="ml-2">&rarr;</span>
          </button>
        )}
      </div>
    </div>
  );
}
