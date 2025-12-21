import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { practiceService } from '../services/practiceService';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';

const TestSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [answers, setAnswers] = useState<Record<string, { index: number; time: number }>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerInitialized, setTimerInitialized] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());

  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['test-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      return practiceService.getSessionById(sessionId);
    },
    enabled: !!sessionId,
  });

  // Initialize timer when session loads
  useEffect(() => {
    if (session && session.test.timeLimitMinutes && !timerInitialized) {
      const totalTime = session.test.timeLimitMinutes * 60;
      setTimeRemaining(totalTime);
      setTimerInitialized(true);
    }
  }, [session, timerInitialized]);

  // Timer countdown effect - only runs after timer is initialized
  useEffect(() => {
    if (!timerInitialized) return; // Don't run until timer is properly set

    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      // Timer has run out - complete the test
      handleCompleteTest();
    }
  }, [timeRemaining, timerInitialized]);

  const submitAnswerMutation = useMutation({
    mutationFn: practiceService.submitAnswer,
    onSuccess: () => {
      // Move to next question or complete test
      const totalQuestions = session?.test?.testQuestions?.length || 0;
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setQuestionStartTime(Date.now());
      } else {
        // Complete the test
        handleCompleteTest();
      }
    },
    onError: (error) => {
      console.error('Failed to submit answer:', error);
      // Still move to next question even if submission fails
      const totalQuestions = session?.test?.testQuestions?.length || 0;
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setQuestionStartTime(Date.now());
      }
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: practiceService.completeSession,
    onSuccess: () => {
      // Navigate to results page (for now, just go back to practice tests)
      navigate('/practice');
    },
  });

  const handleSelectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const navigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setSelectedAnswer(null);
    setQuestionStartTime(Date.now());
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !sessionId || !session?.test?.testQuestions?.[currentQuestionIndex]) {
      return;
    }

    const questionId = session.test.testQuestions[currentQuestionIndex].question.id;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    // Store answer locally
    setAnswers(prev => ({
      ...prev,
      [questionId]: { index: selectedAnswer, time: timeSpent }
    }));

    // Submit to backend
    submitAnswerMutation.mutate({
      sessionId,
      questionId,
      selectedAnswerIndex: selectedAnswer,
      timeSpentSeconds: timeSpent,
    });
  };

  const handleCompleteTest = async () => {
    if (!sessionId) return;
    completeSessionMutation.mutate(sessionId);
  };

  useEffect(() => {
    if (session && session.test.testQuestions) {
      setQuestionStartTime(Date.now());
    }
  }, [session, currentQuestionIndex]);

  if (isLoading) {
    return <LoadingState message="Loading test session..." />;
  }

  if (error || !session) {
    return (
      <ErrorMessage
        title="Failed to load test session"
        message="Please check your connection and try again."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const currentQuestion = session.test.testQuestions[currentQuestionIndex]?.question;
  const totalQuestions = session.test.testQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Timer and Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {session.test.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <span>•</span>
                <span>{Math.round(progress)}% Complete</span>
                {markedForReview.has(currentQuestionIndex) && (
                  <span className="flex items-center text-orange-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Marked for Review
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6 mt-4 lg:mt-0">
              {/* Timer */}
              <div className={`text-center px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                }`}>
                <div className={`text-sm font-medium ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                  Time Remaining
                </div>
                <div className={`text-xl font-bold ${timeRemaining < 300 ? 'text-red-700' : 'text-blue-700'
                  }`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>

              {/* End Test Button */}
              <button
                onClick={() => setShowConfirmation(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                End Test
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Question Navigator</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-4">
                {session.test.testQuestions.map((tq: any, i: number) => (
                  <button
                    key={tq.question.id}
                    onClick={() => navigateToQuestion(i)}
                    className={`w-10 h-10 text-sm font-medium rounded-lg transition-all ${i === currentQuestionIndex
                      ? 'bg-indigo-600 text-white'
                      : answers[tq.question.id]
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : markedForReview.has(i)
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-indigo-600 rounded mr-2"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded mr-2"></div>
                  <span className="text-gray-600">Marked for Review</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor: `${currentQuestion.domain.color}20`,
                      color: currentQuestion.domain.color,
                    }}
                  >
                    {currentQuestion.domain.name}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {currentQuestion.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    {currentQuestion.methodology}
                  </span>
                </div>
                <button
                  onClick={handleMarkForReview}
                  className={`flex items-center px-3 py-1 text-sm font-medium rounded-lg transition-all ${markedForReview.has(currentQuestionIndex)
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {markedForReview.has(currentQuestionIndex) ? 'Marked' : 'Mark for Review'}
                </button>
              </div>

              {/* Scenario */}
              {currentQuestion.scenario && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Scenario</h3>
                      <p className="text-blue-800 leading-relaxed">{currentQuestion.scenario}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* Answer Choices */}
              <div className="space-y-4 mb-8">
                {currentQuestion.choices.map((choice: string, index: number) => (
                  <label
                    key={index}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedAnswer === index
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={index}
                      checked={selectedAnswer === index}
                      onChange={() => handleSelectAnswer(index)}
                      className="mt-1 mr-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-3">Option {String.fromCharCode(65 + index)}</span>
                        <span className="text-gray-800 leading-relaxed">{choice}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null || submitAnswerMutation.isPending}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitAnswerMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : currentQuestionIndex === totalQuestions - 1 ? (
                    'Complete Test'
                  ) : (
                    'Next Question'
                  )}
                </button>

                {currentQuestionIndex > 0 && (
                  <button
                    onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                    className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                  >
                    Previous Question
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                End Test Confirmation
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to end this test? You have {Object.keys(answers).length} of {totalQuestions} questions answered.
                Any unanswered questions will be marked as incorrect.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Continue Test
                </button>
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    handleCompleteTest();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  End Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSessionPage;