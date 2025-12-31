'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { apiRequest } from '../../../../lib/api';
import { Flashcard, FlashcardRating } from '@pmp/shared';

interface SessionData {
  sessionId: string;
  cards: Flashcard[];
  progress: {
    total: number;
    answered: number;
  };
}

export default function FlashcardSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) return;
      try {
        setLoading(true);
        const response = await apiRequest<SessionData>(`/flashcards/sessions/${sessionId}`);
        if (response.data) {
          setSession(response.data);

          // Resume from first unanswered card if possible, or 0
          // Since API doesn't filter answered yet in my quick implementation,
          // we start at 0 or saved progress index if passed.
          // For now, start at 0.
          setCurrentIndex(response.data.progress.answered);
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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = async (rating: FlashcardRating) => {
    if (!session || !sessionId) return;

    const currentCard = session.cards[currentIndex];
    if (!currentCard) return;

    const timeSpentMs = Date.now() - startTime;

    try {
      await apiRequest(`/flashcards/sessions/${sessionId}/responses/${currentCard.id}`, {
        method: 'POST',
        body: {
          rating,
          timeSpentMs,
        },
      });

      // Move to next card
      if (currentIndex < session.cards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
        setStartTime(Date.now());
      } else {
        // Session complete
        await completeSession();
      }
    } catch (error) {
      console.error('Failed to record response', error);
    }
  };

  const completeSession = async () => {
    try {
      await apiRequest(`/flashcards/sessions/${sessionId}/complete`, { method: 'POST' });
      setSessionComplete(true);
    } catch (error) {
      console.error('Failed to complete session', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" role="status" aria-label="Loading session">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center bg-gray-900 border border-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Session Not Found</h1>
        <button
          onClick={() => router.push('/flashcards')}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
        >
          Back to Flashcards
        </button>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-4">Session Complete!</h1>
          <p className="text-gray-400 mb-8">
            Great job! You've reviewed {session.cards.length} cards.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/flashcards')}
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

  const currentCard = session.cards[currentIndex];
  const progress =
    session.cards.length > 0 ? Math.round((currentIndex / session.cards.length) * 100) : 0;

  if (!currentCard) {
    return <div>Loading card...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-[80vh] flex flex-col">
      {/* Header / Progress */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => router.push('/flashcards')}
          className="text-gray-400 hover:text-white transition"
        >
          &larr; Exit
        </button>
        <div className="flex-1 mx-8">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>
              Card {currentIndex + 1} of {session.cards.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="w-10"></div> {/* Spacer for balance */}
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center mb-8">
        <div
          className="w-full max-w-2xl aspect-[3/2] perspective-1000 cursor-pointer group"
          onClick={handleFlip}
        >
          <div
            className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
          >
            {/* Front */}
            <div className="absolute w-full h-full backface-hidden bg-gray-800 border-2 border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg group-hover:border-primary-500/50 transition-colors">
              <span className="text-gray-500 text-sm uppercase tracking-wider mb-4">Question</span>
              <h2 className="text-2xl md:text-3xl font-medium text-white">{currentCard.front}</h2>
              <div className="absolute bottom-4 text-gray-500 text-xs">Click to flip</div>
            </div>

            {/* Back */}
            <div className="absolute w-full h-full backface-hidden bg-gray-800 border-2 border-primary-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg rotate-y-180">
              <span className="text-primary-400 text-sm uppercase tracking-wider mb-4">Answer</span>
              <p className="text-xl md:text-2xl text-gray-100 leading-relaxed">
                {currentCard.back}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-24">
        {isFlipped ? (
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto w-full">
            <button
              onClick={() => handleRate('dont_know')}
              className="py-4 bg-red-900/30 border border-red-800 text-red-200 rounded-xl hover:bg-red-900/50 transition"
            >
              <div className="font-bold mb-1">Again</div>
              <div className="text-xs opacity-70">&lt; 1 min</div>
            </button>
            <button
              onClick={() => handleRate('learning')}
              className="py-4 bg-yellow-900/30 border border-yellow-800 text-yellow-200 rounded-xl hover:bg-yellow-900/50 transition"
            >
              <div className="font-bold mb-1">Hard</div>
              <div className="text-xs opacity-70">2 days</div>
            </button>
            <button
              onClick={() => handleRate('know_it')}
              className="py-4 bg-green-900/30 border border-green-800 text-green-200 rounded-xl hover:bg-green-900/50 transition"
            >
              <div className="font-bold mb-1">Easy</div>
              <div className="text-xs opacity-70">4 days</div>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleFlip}
              className="px-8 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition shadow-lg font-medium"
            >
              Show Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
