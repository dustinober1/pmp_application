"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { loadFlashcards, type FlashcardCard } from "@/lib/flashcards";
import { getJson, setJson } from "@/lib/storage";
import {
  createInitialProgress,
  updateProgress,
  getDueCards,
  type FlashcardProgress,
  type CardRating,
} from "@/lib/spaced";
import { PMP_EXAM_CONTENT } from "@/data/pmpExamContent";

const STORAGE_KEY_PROGRESS = "flashcard_progress";

function FlashcardsPlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "all";
  const domainParam = searchParams.get("domain");
  const taskParam = searchParams.get("task");

  const [cards, setCards] = useState<FlashcardCard[]>([]);
  const [progress, setProgress] = useState<Record<string, FlashcardProgress>>(
    {},
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    reviewed: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load flashcards and progress
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all flashcards
        const allCards = await loadFlashcards();
        let filteredCards: FlashcardCard[] = [];

        // Get or initialize progress
        const savedProgress = getJson<Record<string, FlashcardProgress>>(
          STORAGE_KEY_PROGRESS,
          {},
        );

        // Initialize progress for any new cards
        for (const card of allCards) {
          if (!(card.id in savedProgress)) {
            savedProgress[card.id] = createInitialProgress();
          }
        }

        // Filter cards based on mode
        if (mode === "review") {
          // Get due cards only
          const dueCardIds = getDueCards(savedProgress);
          filteredCards = allCards.filter((c) => dueCardIds.includes(c.id));
        } else if (mode === "focused" && domainParam) {
          // Filter by domain and optionally task
          const domain = PMP_EXAM_CONTENT.find((d) => d.id === domainParam);
          if (domain) {
            filteredCards = allCards.filter((c) => c.domain === domain.name);
            if (taskParam) {
              const task = domain.tasks.find((t) => t.id === taskParam);
              if (task) {
                filteredCards = filteredCards.filter(
                  (c) => c.task === task.name,
                );
              }
            }
          }
        } else {
          // All cards - shuffle them
          filteredCards = [...allCards].sort(() => Math.random() - 0.5);
        }

        // Limit session size for non-focused modes
        if (mode !== "focused" && filteredCards.length > 30) {
          filteredCards = filteredCards.slice(0, 30);
        }

        setCards(filteredCards);
        setProgress(savedProgress);
        setSessionStats({ total: filteredCards.length, reviewed: 0 });

        // Check if session is complete (no cards)
        if (filteredCards.length === 0) {
          setSessionComplete(true);
        }
      } catch (error) {
        console.error("Failed to load flashcards:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mode, domainParam, taskParam]);

  const currentCard = cards[currentIndex];

  const handleRate = useCallback(
    (rating: CardRating) => {
      if (!currentCard) return;

      // Update progress in state
      const currentProgress =
        progress[currentCard.id] || createInitialProgress();
      const newProgress = updateProgress(currentProgress, rating);

      const updatedProgress = {
        ...progress,
        [currentCard.id]: newProgress,
      };
      setProgress(updatedProgress);

      // Save to localStorage
      setJson(STORAGE_KEY_PROGRESS, updatedProgress);

      // Reset flip state
      setIsFlipped(false);

      // Update session stats
      setSessionStats((prev) => ({ ...prev, reviewed: prev.reviewed + 1 }));

      // Move to next card or complete session
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionComplete(true);
      }
    },
    [currentCard, progress, currentIndex, cards.length],
  );

  const handleSkip = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setSessionComplete(true);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-md-primary mx-auto mb-4"></div>
          <p className="text-md-on-surface-variant">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

        <Navbar />

        <main className="max-w-2xl mx-auto px-4 py-12 relative z-10">
          <div className="card text-center">
            <div className="w-20 h-20 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-md-on-surface">
              Session Complete!
            </h1>
            <p className="text-lg text-md-on-surface-variant mb-8">
              You reviewed {sessionStats.reviewed} of {sessionStats.total}{" "}
              cards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/flashcards" className="btn btn-primary">
                Back to Flashcards
              </Link>
              <button onClick={() => router.back()} className="btn btn-outline">
                Start Another Session
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="blur-shape bg-md-primary w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="blur-shape bg-md-tertiary w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>

      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-md-on-surface-variant mb-2">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span>
              {Math.round((sessionStats.reviewed / cards.length) * 100)}%
              complete
            </span>
          </div>
          <div className="h-2 bg-md-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-md-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Category badge */}
        <div className="mb-4">
          <span className="text-sm text-md-primary font-medium">
            {currentCard.category}
          </span>
        </div>

        {/* Flashcard */}
        <div
          className="card relative min-h-[400px] cursor-pointer perspective-1000 mb-6"
          onClick={handleFlip}
          onKeyDown={(e) => e.key === "Enter" && handleFlip()}
          role="button"
          tabIndex={0}
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Front */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${
                isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-sm text-md-on-surface-variant mb-4">Front</p>
              <p className="text-xl text-center text-md-on-surface">
                {currentCard.front}
              </p>
            </div>

            {/* Back */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${
                isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-sm text-md-on-surface-variant mb-4">Back</p>
              <p className="text-xl text-center text-md-on-surface">
                {currentCard.back}
              </p>
            </div>
          </div>

          {/* Flip hint */}
          {!isFlipped && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-md-on-surface-variant">
              Click to flip
            </div>
          )}
        </div>

        {/* Rating buttons */}
        {isFlipped && (
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRate("again");
              }}
              className="btn bg-md-error text-md-on-error hover:bg-md-error/90"
            >
              Again
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRate("hard");
              }}
              className="btn bg-md-secondary-container text-md-on-secondary-container"
            >
              Hard
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRate("good");
              }}
              className="btn bg-md-tertiary-container text-md-on-tertiary-container"
            >
              Good
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRate("easy");
              }}
              className="btn bg-md-primary-container text-md-on-primary-container"
            >
              Easy
            </button>
          </div>
        )}

        {/* Skip button */}
        {!isFlipped && (
          <div className="flex justify-center mt-6">
            <button onClick={handleSkip} className="btn btn-outline">
              Skip Card
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function FlashcardsPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-md-primary mx-auto mb-4"></div>
            <p className="text-md-on-surface-variant">Loading...</p>
          </div>
        </div>
      }
    >
      <FlashcardsPlayContent />
    </Suspense>
  );
}
