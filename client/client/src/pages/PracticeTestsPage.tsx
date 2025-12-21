import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { practiceService } from '../services/practiceService';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';

const PracticeTestsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: tests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['practice-tests'],
    queryFn: practiceService.getTests,
  });

  const startSessionMutation = useMutation({
    mutationFn: ({ testId, userId }: { testId: string; userId: string }) =>
      practiceService.startSession(testId, userId),
  });

  const handleStartTest = async (testId: string) => {
    try {
      console.log('Starting test for ID:', testId);
      // For now, use a mock user ID - this would come from authentication
      const userId = 'mock-user-id';
      const session = await startSessionMutation.mutateAsync({ testId, userId });
      console.log('Session created:', session);
      if (session && session.id) {
        console.log('Navigating to session:', session.id);
        navigate(`/practice/session/${session.id}`);
      } else {
        console.warn('Session created but no ID found:', session);
      }
    } catch (error) {
      console.error('Failed to start test session:', error);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading practice tests..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load practice tests"
        message="Please check your connection and try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (!tests || tests.length === 0) {
    return (
      <EmptyState
        title="No practice tests available"
        message="Practice tests will be available soon. Check back later!"
        icon={
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Tests</h1>
        <p className="text-lg text-gray-600">
          Choose a practice test to assess your PMP exam readiness
        </p>
      </div>

      {/* Test Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tests.map((test: any) => (
          <div
            key={test.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
          >
            {/* Test Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {test.name}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {test.description}
                  </p>
                </div>
              </div>

              {/* Test Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {test.totalQuestions}
                  </div>
                  <div className="text-xs text-gray-600">Questions</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {test.timeLimitMinutes}
                  </div>
                  <div className="text-xs text-gray-600">Minutes</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {test._count.sessions}
                  </div>
                  <div className="text-xs text-gray-600">Attempts</div>
                </div>
              </div>
            </div>

            {/* Test Actions */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Ready to start</span>
                </div>
                <button
                  onClick={() => handleStartTest(test.id)}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                >
                  Start Test
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Study Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          📚 Test Taking Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Before the Test</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Find a quiet environment free from distractions</li>
              <li>• Ensure you have stable internet connection</li>
              <li>• Have a calculator and scratch paper ready</li>
              <li>• Take a practice run to familiarize yourself with the interface</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">During the Test</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Read each question carefully before answering</li>
              <li>• Manage your time effectively - about 1.2 minutes per question</li>
              <li>• Mark difficult questions and return to them later</li>
              <li>• Use the process of elimination for multiple-choice questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeTestsPage;