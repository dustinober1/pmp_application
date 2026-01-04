/**
 * LocalStorage utility for mock exam scores
 */

export interface MockExamScore {
	sessionId: string;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
	date: string;
}

const STORAGE_KEY = 'pmp_mock_exam_scores';

/**
 * Get all stored mock exam scores
 */
export function getMockExamScores(): MockExamScore[] {
	if (typeof window === 'undefined') return [];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

/**
 * Save a mock exam score
 */
export function saveMockExamScore(score: MockExamScore): void {
	if (typeof window === 'undefined') return;
	try {
		const scores = getMockExamScores();
		scores.push(score);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
	} catch (err) {
		console.error('Failed to save mock exam score:', err);
	}
}

/**
 * Calculate rolling average of last N mock exam scores
 */
export function getRollingAverage(lastN: number = 5): number {
	const scores = getMockExamScores();
	if (scores.length === 0) return 0;

	// Get the last N scores
	const recentScores = scores.slice(-lastN);
	const total = recentScores.reduce((sum, s) => sum + s.score, 0);
	return Math.round(total / recentScores.length);
}

/**
 * Get all scores for display
 */
export function getAllScores(): MockExamScore[] {
	return getMockExamScores();
}

/**
 * Clear all scores (for testing purposes)
 */
export function clearMockExamScores(): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (err) {
		console.error('Failed to clear mock exam scores:', err);
	}
}
