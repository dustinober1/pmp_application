import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { flashcardService } from '../services/flashcardService';
import { questionService } from '../services/questionService';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';

const FlashcardsPage: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const {
    data: flashcardsData,
    isLoading: isLoadingFlashcards,
    error: flashcardsError,
    refetch: refetchFlashcards,
  } = useQuery({
    queryKey: ['flashcards', selectedDomain, selectedCategory, selectedDifficulty],
    queryFn: () => flashcardService.getFlashcards({
      domain: selectedDomain,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      limit: 50,
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ['flashcard-categories'],
    queryFn: flashcardService.getCategories,
  });

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: questionService.getDomains,
  });

  const currentCard = flashcardsData?.flashcards[currentCardIndex];
  const totalCards = flashcardsData?.flashcards.length || 0;

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleFilterChange = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    refetchFlashcards();
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [selectedDomain, selectedCategory, selectedDifficulty]);

  if (isLoadingFlashcards) {
    return <LoadingState message="Loading flashcards..." />;
  }

  if (flashcardsError) {
    return (
      <ErrorMessage
        title="Failed to load flashcards"
        message="Please check your connection and try again."
        onRetry={() => refetchFlashcards()}
      />
    );
  }

  if (totalCards === 0) {
    return (
      <EmptyState
        title="No flashcards found"
        message="Try adjusting your filters to see more content."
        icon={
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Domain Flashcards</h1>
        <p className="text-lg text-gray-600">
          Study key concepts and scenarios with domain-specific flashcards
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Domain Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="all">All Domains</option>
              {domains?.map((domain: any) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {categories?.map((category: any) => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="all">All Levels</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Results Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Results
            </label>
            <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
              <span className="text-indigo-600 font-semibold">{totalCards}</span>
              <span className="text-gray-600 ml-1">cards found</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Progress */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            Card {currentCardIndex + 1} of {totalCards}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      {currentCard && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor: `${currentCard.domain.color}20`,
                      color: currentCard.domain.color,
                    }}
                  >
                    {currentCard.domain.name}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {currentCard.category}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      {currentCard.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div
                className="relative cursor-pointer group"
                onClick={handleCardFlip}
                style={{ minHeight: '320px' }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {/* Front of card */}
                  <div
                    className={`text-center transition-all duration-500 transform-gpu ${
                      isFlipped ? 'opacity-0 rotateY-180' : 'opacity-0 rotateY-0'
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
                      Front
                    </div>
                    <p className="text-lg text-gray-800 leading-relaxed">
                      {currentCard.frontText}
                    </p>
                  </div>

                  {/* Back of card */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center p-8 transition-all duration-500 transform-gpu ${
                      isFlipped ? 'opacity-0 rotateY-0' : 'opacity-0 rotateY-180'
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="bg-green-50 text-green-600 text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
                      Back
                    </div>
                    <p className="text-lg text-gray-800 leading-relaxed">
                      {currentCard.backText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <p className="text-center text-sm text-gray-500 mb-6">
                  Click the card to flip it over
                </p>

                {/* Navigation Controls */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevious}
                    disabled={currentCardIndex === 0}
                    className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">
                      {currentCardIndex + 1} / {totalCards}
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentCardIndex === totalCards - 1}
                    className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={() => {
                      // Mark as known functionality would go here
                      setIsFlipped(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Mark as Known
                  </button>
                  <button
                    onClick={() => {
                      // Mark as unknown functionality would go here
                      setIsFlipped(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Needs Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;