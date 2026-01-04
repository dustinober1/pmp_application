/**
 * LocalStorage utility for card-level progress tracking
 * Implements SM-2 spaced repetition algorithm data storage
 */

import { STORAGE_KEYS } from '$lib/constants/storageKeys';
import type { CardReviewData } from '@pmp/shared';
import { SM2_DEFAULTS } from '@pmp/shared';

/**
 * Card progress data stored in localStorage (simplified from CardReviewData)
 */
export interface CardProgress {
	cardId: string;
	easeFactor: number; // SM-2 ease factor (default 2.5)
	interval: number; // Days until next review
	nextReviewDate: string; // ISO date string
	lastReviewDate?: string; // ISO date string
}

/**
 * Get all card progress from localStorage
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
 * Returns undefined if card has no progress data
 */
export function getCardProgress(cardId: string): CardProgress | undefined {
	const allProgress = getAllCardProgress();
	return allProgress[cardId];
}

/**
 * Set or update progress for a specific card
 */
export function setCardProgress(cardId: string, progress: CardProgress): void {
	const allProgress = getAllCardProgress();
	allProgress[cardId] = progress;
	saveAllCardProgress(allProgress);
}

/**
 * Initialize progress for a new card with default SM-2 values
 */
export function initializeCardProgress(cardId: string): CardProgress {
	const progress: CardProgress = {
		cardId,
		easeFactor: SM2_DEFAULTS.INITIAL_EASE_FACTOR,
		interval: SM2_DEFAULTS.INITIAL_INTERVAL,
		nextReviewDate: new Date().toISOString(),
	};
	setCardProgress(cardId, progress);
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
 * Update card progress after a review
 * Uses SM-2 algorithm parameters provided by the caller
 */
export function updateCardProgress(
	cardId: string,
	easeFactor: number,
	interval: number,
	nextReviewDate: Date
): CardProgress {
	const progress: CardProgress = {
		cardId,
		easeFactor,
		interval,
		nextReviewDate: nextReviewDate.toISOString(),
		lastReviewDate: new Date().toISOString(),
	};
	setCardProgress(cardId, progress);
	return progress;
}

/**
 * Get cards due for review
 * Returns card IDs where nextReviewDate is in the past
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
	const cardsWithProgress = Object.keys(allProgress);
	const now = new Date();

	let totalEaseFactor = 0;
	let cardsDue = 0;

	for (const cardId of allCardIds) {
		const progress = allProgress[cardId];
		if (progress) {
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
		cardsWithProgress.length > 0
			? totalEaseFactor / cardsWithProgress.length
			: SM2_DEFAULTS.INITIAL_EASE_FACTOR;

	return {
		totalCards: allCardIds.length,
		cardsWithProgress: cardsWithProgress.length,
		cardsDue,
		averageEaseFactor,
	};
}
