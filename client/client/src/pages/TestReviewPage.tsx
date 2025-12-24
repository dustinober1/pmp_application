import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { practiceService } from '../services/practiceService';
import type { SessionReview, DomainBreakdown, ReviewQuestion } from '../types';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';

type FilterType = 'all' | 'incorrect' | 'flagged' | 'correct';

const TestReviewPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<FilterType>('all');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const { data, isLoading, error } = useQuery<SessionReview>({
        queryKey: ['session-review', sessionId],
        queryFn: async () => {
            if (!sessionId) throw new Error('No session ID');
            return practiceService.getSessionReview(sessionId);
        },
        enabled: !!sessionId,
    });

    if (isLoading) {
        return <LoadingState message="Loading review..." />;
    }

    if (error || !data) {
        return (
            <ErrorMessage
                title="Failed to load review"
                message="Session not found or not completed yet."
                onRetry={() => navigate('/practice')}
            />
        );
    }

    const { session, analytics, questions, flaggedQuestions, incorrectQuestions } = data;

    // Filter questions based on selected filter
    const filteredQuestions = filter === 'all'
        ? questions
        : filter === 'incorrect'
            ? incorrectQuestions
            : filter === 'flagged'
                ? flaggedQuestions
                : questions.filter(q => q.isCorrect);

    const currentQuestion = filteredQuestions[currentQuestionIndex];

    const formatTime = (seconds: number) => {
        if (seconds >= 3600) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
        if (seconds >= 60) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}m ${secs}s`;
        }
        return `${seconds}s`;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Results Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.testName} - Review</h1>
                            <p className="text-gray-600">
                                Completed on {new Date(session.completedAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/practice"
                                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                            >
                                Take Another Test
                            </Link>
                        </div>
                    </div>

                    {/* Score and Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className={`p-4 rounded-lg ${session.score >= 70 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className="text-3xl font-bold mb-1" style={{ color: session.score >= 70 ? '#10b981' : '#ef4444' }}>
                                {session.score}%
                            </div>
                            <div className="text-sm text-gray-600">Overall Score</div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                {session.correctAnswers}/{session.totalQuestions}
                            </div>
                            <div className="text-sm text-gray-600">Correct Answers</div>
                        </div>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="text-3xl font-bold text-purple-600 mb-1">
                                {formatTime(analytics.totalTimeSpent)}
                            </div>
                            <div className="text-sm text-gray-600">Total Time</div>
                        </div>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="text-3xl font-bold text-amber-600 mb-1">
                                {formatTime(analytics.avgTimePerQuestion)}
                            </div>
                            <div className="text-sm text-gray-600">Avg. per Question</div>
                        </div>
                    </div>

                    {/* Domain Breakdown */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Performance by Domain</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            {analytics.domainBreakdown.map((domain: DomainBreakdown) => (
                                <div key={domain.name} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: domain.color }}></span>
                                            <span className="font-medium text-gray-800">{domain.name}</span>
                                        </div>
                                        <span className="font-bold" style={{ color: domain.correct / domain.total >= 0.7 ? '#10b981' : '#ef4444' }}>
                                            {Math.round((domain.correct / domain.total) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(domain.correct / domain.total) * 100}%`,
                                                backgroundColor: domain.color,
                                            }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {domain.correct} / {domain.total} correct
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => { setFilter('all'); setCurrentQuestionIndex(0); }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Questions ({questions.length})
                        </button>
                        <button
                            onClick={() => { setFilter('incorrect'); setCurrentQuestionIndex(0); }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'incorrect' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            ❌ Incorrect ({incorrectQuestions.length})
                        </button>
                        <button
                            onClick={() => { setFilter('flagged'); setCurrentQuestionIndex(0); }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'flagged' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🚩 Flagged ({flaggedQuestions.length})
                        </button>
                        <button
                            onClick={() => { setFilter('correct'); setCurrentQuestionIndex(0); }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'correct' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            ✅ Correct ({questions.filter((q: ReviewQuestion) => q.isCorrect).length})
                        </button>
                    </div>
                </div>

                {/* Question Review */}
                {filteredQuestions.length > 0 && currentQuestion ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ← Previous
                            </button>
                            <span className="text-gray-600">
                                Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                            </span>
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex === filteredQuestions.length - 1}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next →
                            </button>
                        </div>

                        {/* Question Header */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${currentQuestion.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {currentQuestion.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                            <span
                                className="px-3 py-1 text-sm font-medium rounded-full"
                                style={{
                                    backgroundColor: `${currentQuestion.domain.color}20`,
                                    color: currentQuestion.domain.color,
                                }}
                            >
                                {currentQuestion.domain.name}
                            </span>
                            {currentQuestion.isFlagged && (
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-700">
                                    🚩 Flagged
                                </span>
                            )}
                            <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
                                ⏱️ {formatTime(currentQuestion.timeSpentSeconds)}
                            </span>
                        </div>

                        {/* Scenario */}
                        {currentQuestion.scenario && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">Scenario</h4>
                                <p className="text-blue-800 leading-relaxed">{currentQuestion.scenario}</p>
                            </div>
                        )}

                        {/* Question Text */}
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                            {currentQuestion.questionText}
                        </h2>

                        {/* Choices with marking */}
                        <div className="space-y-3 mb-6">
                            {currentQuestion.choices.map((choice: string, index: number) => {
                                const isSelected = index === currentQuestion.selectedAnswerIndex;
                                const isCorrect = index === currentQuestion.correctAnswerIndex;

                                let bgColor = 'bg-gray-50 border-gray-200';
                                let textColor = 'text-gray-800';
                                let icon = null;

                                if (isCorrect) {
                                    bgColor = 'bg-green-50 border-green-300';
                                    textColor = 'text-green-800';
                                    icon = <span className="text-green-600 ml-2">✓ Correct Answer</span>;
                                } else if (isSelected && !isCorrect) {
                                    bgColor = 'bg-red-50 border-red-300';
                                    textColor = 'text-red-800';
                                    icon = <span className="text-red-600 ml-2">✗ Your Answer</span>;
                                }

                                return (
                                    <div
                                        key={index}
                                        className={`p-4 border-2 rounded-lg ${bgColor}`}
                                    >
                                        <div className="flex items-start">
                                            <span className={`font-bold mr-3 ${textColor}`}>
                                                {String.fromCharCode(65 + index)}.
                                            </span>
                                            <span className={`flex-1 ${textColor}`}>{choice}</span>
                                            {icon}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Explanation */}
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h4 className="font-semibold text-amber-900 mb-2">📚 Explanation</h4>
                            <p className="text-amber-800 leading-relaxed">{currentQuestion.explanation}</p>
                        </div>

                        {/* Quick Nav */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-3">Quick Navigation</h4>
                            <div className="flex flex-wrap gap-2">
                                {filteredQuestions.map((q: ReviewQuestion, i: number) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(i)}
                                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-all ${i === currentQuestionIndex
                                            ? 'bg-indigo-600 text-white'
                                            : q.isCorrect
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <p className="text-gray-600">No questions match the selected filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestReviewPage;
