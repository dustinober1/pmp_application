import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashcardService } from '../services/flashcardService';
import type { ReviewDifficulty } from '../services/flashcardService';
import { questionService } from '../services/questionService';
import type { Domain } from '../types';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';

type TabType = 'study' | 'browse';

const FlashcardsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('study');

  // Study mode state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  // Browse mode state
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [browseCardIndex, setBrowseCardIndex] = useState(0);
  const [browseFlipped, setBrowseFlipped] = useState(false);

  // Fetch study stats
  const { data: studyStats } = useQuery({
    queryKey: ['flashcard-stats'],
    queryFn: flashcardService.getStudyStats,
    staleTime: 30000,
  });

  // Fetch due cards for study mode
  const {
    data: dueCardsData,
    isLoading: isLoadingDue,
    error: dueError,
    refetch: refetchDue
  } = useQuery({
    queryKey: ['flashcards-due', selectedDomain],
    queryFn: () => flashcardService.getDueCards({ limit: 30, domain: selectedDomain }),
    enabled: activeTab === 'study',
  });

  // Fetch cards for browse mode
  const { data: flashcardsData, isLoading: isLoadingFlashcards } = useQuery({
    queryKey: ['flashcards', selectedDomain],
    queryFn: () => flashcardService.getFlashcards({
      domain: selectedDomain,
      limit: 100,
    }),
    enabled: activeTab === 'browse',
  });

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: questionService.getDomains,
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: ({ cardId, difficulty }: { cardId: string; difficulty: ReviewDifficulty }) =>
      flashcardService.reviewCard(cardId, difficulty),
    onSuccess: () => {
      setReviewedCount(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['flashcard-stats'] });

      // Move to next card
      if (dueCardsData && currentCardIndex < dueCardsData.cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setSessionComplete(true);
      }
    },
  });

  // Reset when changing tabs or domain
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setReviewedCount(0);
    setBrowseCardIndex(0);
    setBrowseFlipped(false);
  }, [activeTab, selectedDomain]);

  const handleReview = (difficulty: ReviewDifficulty) => {
    if (dueCardsData?.cards[currentCardIndex]) {
      reviewMutation.mutate({
        cardId: dueCardsData.cards[currentCardIndex].id,
        difficulty,
      });
    }
  };

  const handleStartNewSession = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setReviewedCount(0);
    refetchDue();
  };

  const currentStudyCard = dueCardsData?.cards[currentCardIndex];
  const currentBrowseCard = flashcardsData?.flashcards[browseCardIndex];

  // Loading states
  if ((activeTab === 'study' && isLoadingDue) || (activeTab === 'browse' && isLoadingFlashcards)) {
    return <LoadingState message="Loading flashcards..." />;
  }

  if (dueError) {
    return (
      <ErrorMessage
        title="Failed to load flashcards"
        message="Please check your connection and try again."
        onRetry={() => refetchDue()}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Flashcard Study</h1>
        <p className="text-lg text-gray-600">Master PMP concepts with spaced repetition</p>
      </div>

      {/* Stats Bar */}
      {studyStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-2">
              <div className="text-2xl font-bold text-red-500">{studyStats.overview.dueToday}</div>
              <div className="text-xs text-gray-500">Due Today</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-bold text-blue-500">{studyStats.overview.newCards}</div>
              <div className="text-xs text-gray-500">New Cards</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-bold text-amber-500">{studyStats.mastery.learning}</div>
              <div className="text-xs text-gray-500">Learning</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-bold text-purple-500">{studyStats.mastery.reviewing}</div>
              <div className="text-xs text-gray-500">Reviewing</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-bold text-green-500">{studyStats.mastery.mastered}</div>
              <div className="text-xs text-gray-500">Mastered</div>
            </div>
          </div>

          {/* Daily Goal Progress */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Daily Goal: {studyStats.dailyGoal.cardsReviewedToday} / {studyStats.dailyGoal.flashcardGoal}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((studyStats.dailyGoal.cardsReviewedToday / studyStats.dailyGoal.flashcardGoal) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (studyStats.dailyGoal.cardsReviewedToday / studyStats.dailyGoal.flashcardGoal) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('study')}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'study'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            🎯 Study Mode
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'browse'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            📋 Browse All
          </button>
        </div>
      </div>

      {/* Domain Filter */}
      <div className="flex justify-center">
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Domains</option>
          {domains?.map((domain: Domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </select>
      </div>

      {/* Study Mode */}
      {activeTab === 'study' && (
        <div className="max-w-2xl mx-auto">
          {sessionComplete ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
              <p className="text-gray-600 mb-6">
                You reviewed {reviewedCount} cards. Great job!
              </p>
              <button
                onClick={handleStartNewSession}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
              >
                Start New Session
              </button>
            </div>
          ) : !dueCardsData?.cards.length ? (
            <EmptyState
              title="No cards due!"
              message="You're all caught up. Come back later or browse all cards."
              icon={<span className="text-4xl">🎊</span>}
            />
          ) : currentStudyCard && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Progress */}
              <div className="px-4 py-3 bg-gray-50 border-b">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Card {currentCardIndex + 1} of {dueCardsData.cards.length}</span>
                  <span>{reviewedCount} reviewed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentCardIndex + 1) / dueCardsData.cards.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Card Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{
                    backgroundColor: `${currentStudyCard.domain.color}20`,
                    color: currentStudyCard.domain.color,
                  }}
                >
                  {currentStudyCard.domain.name}
                </span>
                <div className="flex items-center gap-2">
                  {currentStudyCard.reviewInfo ? (
                    <span className="text-xs text-gray-500">
                      Review #{currentStudyCard.reviewInfo.reviewCount + 1}
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">New</span>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div
                className="p-8 min-h-[280px] flex items-center justify-center cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="text-center">
                  {!isFlipped ? (
                    <>
                      <div className="text-indigo-500 text-sm font-medium mb-4">Question</div>
                      <p className="text-xl text-gray-800 leading-relaxed">
                        {currentStudyCard.frontText}
                      </p>
                      <p className="text-gray-400 text-sm mt-6">Click to reveal answer</p>
                    </>
                  ) : (
                    <>
                      <div className="text-green-500 text-sm font-medium mb-4">Answer</div>
                      <p className="text-xl text-gray-800 leading-relaxed">
                        {currentStudyCard.backText}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isFlipped && (
                <div className="px-4 py-4 bg-gray-50 border-t">
                  <p className="text-center text-sm text-gray-600 mb-3">How well did you know this?</p>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleReview('AGAIN')}
                      disabled={reviewMutation.isPending}
                      className="flex flex-col items-center p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      <span className="text-lg">😓</span>
                      <span className="text-xs font-medium">Again</span>
                      <span className="text-xs opacity-80">&lt;1min</span>
                    </button>
                    <button
                      onClick={() => handleReview('HARD')}
                      disabled={reviewMutation.isPending}
                      className="flex flex-col items-center p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      <span className="text-lg">🤔</span>
                      <span className="text-xs font-medium">Hard</span>
                      <span className="text-xs opacity-80">1-2 days</span>
                    </button>
                    <button
                      onClick={() => handleReview('GOOD')}
                      disabled={reviewMutation.isPending}
                      className="flex flex-col items-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      <span className="text-lg">😊</span>
                      <span className="text-xs font-medium">Good</span>
                      <span className="text-xs opacity-80">3-7 days</span>
                    </button>
                    <button
                      onClick={() => handleReview('EASY')}
                      disabled={reviewMutation.isPending}
                      className="flex flex-col items-center p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      <span className="text-lg">🎯</span>
                      <span className="text-xs font-medium">Easy</span>
                      <span className="text-xs opacity-80">10+ days</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Browse Mode */}
      {activeTab === 'browse' && (
        <div className="max-w-2xl mx-auto">
          {!flashcardsData?.flashcards.length ? (
            <EmptyState
              title="No flashcards found"
              message="Try selecting a different domain."
              icon={
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />
          ) : currentBrowseCard && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{
                    backgroundColor: `${currentBrowseCard.domain.color}20`,
                    color: currentBrowseCard.domain.color,
                  }}
                >
                  {currentBrowseCard.domain.name}
                </span>
                <span className="text-sm text-gray-500">
                  {browseCardIndex + 1} / {flashcardsData.flashcards.length}
                </span>
              </div>

              {/* Card Content */}
              <div
                className="p-8 min-h-[280px] flex items-center justify-center cursor-pointer"
                onClick={() => setBrowseFlipped(!browseFlipped)}
              >
                <div className="text-center">
                  {!browseFlipped ? (
                    <>
                      <div className="text-indigo-500 text-sm font-medium mb-4">Front</div>
                      <p className="text-xl text-gray-800 leading-relaxed">
                        {currentBrowseCard.frontText}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-green-500 text-sm font-medium mb-4">Back</div>
                      <p className="text-xl text-gray-800 leading-relaxed">
                        {currentBrowseCard.backText}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="px-4 py-4 bg-gray-50 border-t flex justify-between">
                <button
                  onClick={() => { setBrowseCardIndex(prev => prev - 1); setBrowseFlipped(false); }}
                  disabled={browseCardIndex === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => { setBrowseCardIndex(prev => prev + 1); setBrowseFlipped(false); }}
                  disabled={browseCardIndex === flashcardsData.flashcards.length - 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;