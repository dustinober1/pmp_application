/**
 * LocalStorage utility for flashcard progress
 * Stores mastered card count and recent reviews locally
 */

const STORAGE_KEYS = {
  MASTERED_COUNT: 'pmp_flashcards_mastered_count',
  RECENT_REVIEWS: 'pmp_flashcards_recent_reviews',
} as const;

export interface FlashcardReview {
  cardId: string;
  cardFront: string;
  rating: 'know_it' | 'learning' | 'dont_know';
  timestamp: string;
}

export interface FlashcardProgress {
  masteredCount: number;
  recentReviews: FlashcardReview[];
}

/**
 * Get the current mastered card count from localStorage
 */
export function getMasteredCount(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MASTERED_COUNT);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Set the mastered card count in localStorage
 */
export function setMasteredCount(count: number): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.MASTERED_COUNT, count.toString());
  } catch (error) {
    console.error('Failed to save mastered count to localStorage:', error);
  }
}

/**
 * Increment the mastered card count
 */
export function incrementMasteredCount(): number {
  const current = getMasteredCount();
  const newCount = current + 1;
  setMasteredCount(newCount);
  return newCount;
}

/**
 * Decrement the mastered card count
 */
export function decrementMasteredCount(): number {
  const current = getMasteredCount();
  const newCount = Math.max(0, current - 1);
  setMasteredCount(newCount);
  return newCount;
}

/**
 * Get recent reviews from localStorage
 * Returns the most recent 20 reviews, sorted by timestamp (newest first)
 */
export function getRecentReviews(): FlashcardReview[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_REVIEWS);
    if (!stored) return [];

    const reviews = JSON.parse(stored) as FlashcardReview[];
    // Sort by timestamp descending and limit to 20
    return reviews
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  } catch {
    return [];
  }
}

/**
 * Add a review to the recent reviews list
 * Maintains a maximum of 50 reviews in storage (displays 20)
 */
export function addRecentReview(review: FlashcardReview): void {
  if (typeof window === 'undefined') return;

  try {
    const reviews = getRecentReviews();
    reviews.push(review);

    // Keep only the most recent 50 reviews in storage
    const trimmedReviews = reviews
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    localStorage.setItem(STORAGE_KEYS.RECENT_REVIEWS, JSON.stringify(trimmedReviews));
  } catch (error) {
    console.error('Failed to save recent review to localStorage:', error);
  }
}

/**
 * Clear all flashcard progress from localStorage
 */
export function clearFlashcardProgress(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.MASTERED_COUNT);
    localStorage.removeItem(STORAGE_KEYS.RECENT_REVIEWS);
  } catch (error) {
    console.error('Failed to clear flashcard progress from localStorage:', error);
  }
}

/**
 * Get all flashcard progress data
 */
export function getFlashcardProgress(): FlashcardProgress {
  return {
    masteredCount: getMasteredCount(),
    recentReviews: getRecentReviews(),
  };
}
