'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { practiceApi } from '@/lib/api';
import { PracticeQuestion } from '@pmp/shared';

export default function FlaggedQuestionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFlaggedQuestions();
    }
  }, [isAuthenticated]);

  const loadFlaggedQuestions = async () => {
    try {
      const response = await practiceApi.getFlagged();
      if (response.data) {
        // Assert response data shape from backend
        const data = response.data as unknown as { questions: PracticeQuestion[] };
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Failed to load flagged questions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnflag = async (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading(questionId);
    try {
      await practiceApi.unflagQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      if (expandedId === questionId) {
        setExpandedId(null);
      }
    } catch (error) {
      console.error('Failed to unflag question', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartPractice = async () => {
    if (questions.length === 0) return;

    try {
      const response = await practiceApi.startSession({
        questionCount: Math.min(questions.length, 50),
        prioritizeFlagged: true,
      });

      const sessionId = (response.data as { sessionId: string }).sessionId;
      if (sessionId) {
        router.push(`/practice/session/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to start session', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--foreground-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link
              href="/practice"
              className="text-sm text-[var(--primary)] hover:underline mb-2 inline-block"
            >
              ← Back to Practice
            </Link>
            <h1 className="text-2xl font-bold">Flagged Questions</h1>
            <p className="text-[var(--foreground-muted)]">
              Review questions you've flagged for later.
            </p>
          </div>

          {questions.length > 0 && (
            <button onClick={handleStartPractice} className="btn btn-primary">
              Practice These Questions
            </button>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🚩
            </div>
            <h3 className="text-lg font-semibold mb-2">No Flagged Questions</h3>
            <p className="text-[var(--foreground-muted)] mb-6">
              Flags are a great way to mark questions you want to review later. Flag questions
              during any practice session or mock exam.
            </p>
            <Link href="/practice" className="btn btn-secondary">
              Start a Practice Session
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map(question => (
              <div
                key={question.id}
                className={`card transition-all cursor-pointer border hover:border-[var(--primary)] ${expandedId === question.id ? 'ring-2 ring-[var(--primary)]' : ''}`}
                onClick={() => setExpandedId(expandedId === question.id ? null : question.id)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                          question.difficulty === 'hard'
                            ? 'bg-red-100 text-red-700'
                            : question.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {question.difficulty}
                      </span>
                      {/* Ideally we'd map domainId to name, but simpler for now */}
                      <span className="text-xs text-[var(--foreground-muted)]">
                        ID: {question.id.slice(0, 8)}
                      </span>
                    </div>
                    <h3 className="font-medium text-lg leading-snug">{question.questionText}</h3>
                  </div>
                  <button
                    onClick={e => handleUnflag(question.id, e)}
                    disabled={actionLoading === question.id}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                    title="Remove flag"
                  >
                    {actionLoading === question.id ? (
                      <span className="animate-spin inline-block">⌛</span>
                    ) : (
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                      </svg>
                    )}
                  </button>
                </div>

                {expandedId === question.id && (
                  <div className="mt-6 pt-6 border-t border-[var(--border)] animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-3 mb-6">
                      {question.options.map(option => (
                        <div
                          key={option.id}
                          className={`p-3 rounded-lg border ${
                            option.isCorrect
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                option.isCorrect
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-400'
                              }`}
                            >
                              {option.isCorrect && (
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <span
                              className={
                                option.isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'
                              }
                            >
                              {option.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
