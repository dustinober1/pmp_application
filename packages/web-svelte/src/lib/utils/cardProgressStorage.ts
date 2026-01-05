/**
 * LocalStorage utility for card-level progress tracking
 * Implements SM-2 spaced repetition algorithm data storage
 *
 * This module provides the storage layer for card progress data.
 * Use spacedRepetition.ts for SM-2 algorithm calculations and business logic.
 */

import { STORAGE_KEYS } from '$lib/constants/storageKeys';
import type { CardProgress } from '@pmp/shared';
import { SM2_DEFAULTS } from '@pmp/shared';

/**
 * Get all card progress from localStorage
 * Returns a Record for better localStorage compatibility and Object-based access pattern
 */
export function getAllCardProgress(): Record<string, CardProgress> {
	if (typeof window === 'undefined') return {};

	try {
		const stored = localStorage.getItem(STORAGE_KEYS.FLASHCARDS_CARD_PROGRESS);
		if (!stored) return {};

		return JSON.parse(stored) as Record<string, CardProgress>;
	} catch {
		return {};
	}
}

/**
 * Save all card progress to localStorage
 * Accepts a Record for direct JSON serialization
 */
function saveAllCardProgress(progress: Record<string, CardProgress>): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(STORAGE_KEYS.FLASHCARDS_CARD_PROGRESS, JSON.stringify(progress));
	} catch (error) {
		console.error('Failed to save card progress to localStorage:', error);
	}
}

/**
 * Get progress for a specific card
 * Returns null if card has no progress data
 */
export function getCardProgress(cardId: string): CardProgress | null {
	const allProgress = getAllCardProgress();
	return allProgress[cardId] || null;
}

/**
 * Save card progress to localStorage
 * Updates or creates progress for a specific card
 */
export function saveCardProgress(cardId: string, progress: CardProgress): void {
	if (typeof window === 'undefined') return;

	try {
		const progressRecord = getAllCardProgress();
		progressRecord[cardId] = progress;
		saveAllCardProgress(progressRecord);
	} catch (error) {
		console.error('Failed to save card progress:', error);
	}
}

/**
 * Initialize progress for a new card with default SM-2 values
 */
export function initializeCardProgress(cardId: string): CardProgress {
	const progress: CardProgress = {
		cardId,
		easeFactor: SM2_DEFAULTS.INITIAL_EASE_FACTOR,
		interval: SM2_DEFAULTS.INITIAL_INTERVAL,
		repetitions: 0,
		nextReviewDate: new Date().toISOString(),
		lastReviewDate: new Date().toISOString(),
		totalReviews: 0,
		ratingCounts: { again: 0, hard: 0, good: 0, easy: 0 },
	};
	saveCardProgress(cardId, progress);
	return progress;
}

/**
 * Get or initialize progress for a card
 */
export function getOrInitializeCardProgress(cardId: string): CardProgress {
	const existing = getCardProgress(cardId);
	if (existing) return existing;
	return initializeCardProgress(cardId);
}

/**
 * Get cards due for review
 * Returns card IDs where nextReviewDate is in the past or now
 */
export function getDueCards(allCardIds: string[]): string[] {
	const now = new Date();
	const allProgress = getAllCardProgress();

	return allCardIds.filter((cardId) => {
		const progress = allProgress[cardId];
		if (!progress) return true; // New cards are due
		return new Date(progress.nextReviewDate) <= now;
	});
}

/**
 * Check if a specific card is due for review
 */
export function isCardDue(cardId: string): boolean {
	const progress = getCardProgress(cardId);
	if (!progress) return true; // New cards are due

	const now = new Date();
	const nextReview = new Date(progress.nextReviewDate);
	return now >= nextReview;
}

/**
 * Delete progress for a specific card
 */
export function deleteCardProgress(cardId: string): void {
	const allProgress = getAllCardProgress();
	delete allProgress[cardId];
	saveAllCardProgress(allProgress);
}

/**
 * Clear all card progress from localStorage
 */
export function clearAllCardProgress(): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(STORAGE_KEYS.FLASHCARDS_CARD_PROGRESS);
	} catch (error) {
		console.error('Failed to clear card progress from localStorage:', error);
	}
}

/**
 * Get statistics about card progress
 */
export interface CardProgressStats {
	totalCards: number;
	cardsWithProgress: number;
	cardsDue: number;
	averageEaseFactor: number;
}

export function getCardProgressStats(allCardIds: string[]): CardProgressStats {
	const allProgress = getAllCardProgress();
	const now = new Date();

	let totalEaseFactor = 0;
	let cardsDue = 0;
	let cardsWithProgress = 0;

	for (const cardId of allCardIds) {
		const progress = allProgress[cardId];
		if (progress) {
			cardsWithProgress++;
			totalEaseFactor += progress.easeFactor;
			if (new Date(progress.nextReviewDate) <= now) {
				cardsDue++;
			}
		} else {
			// Cards without progress count as due (new cards)
			cardsDue++;
		}
	}

	const averageEaseFactor =
		cardsWithProgress > 0
			? totalEaseFactor / cardsWithProgress
			: SM2_DEFAULTS.INITIAL_EASE_FACTOR;

	return {
		totalCards: allCardIds.length,
		cardsWithProgress,
		cardsDue,
		averageEaseFactor,
	};
}
