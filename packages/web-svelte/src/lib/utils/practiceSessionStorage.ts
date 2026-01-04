/**
 * LocalStorage utility for practice session stats
 * Tracks practice sessions completed, scores, and weak domains
 */

import { STORAGE_KEYS } from '$lib/constants/storageKeys';

const { PRACTICE_SESSIONS } = STORAGE_KEYS;

export interface PracticeSession {
	sessionId: string;
	date: string; // ISO string
	questionCount: number;
	correctAnswers: number;
	score: number; // percentage
	domainIds?: string[]; // domains practiced
	duration?: number; // seconds
}

export interface PracticeStats {
	totalSessions: number;
	totalQuestions: number;
	bestScore: number;
	weakDomains: string[];
	averageScore: number;
}

/**
 * Get all stored practice sessions
 */
export function getPracticeSessions(): PracticeSession[] {
	if (typeof window === 'undefined') return [];
	try {
		const stored = localStorage.getItem(PRACTICE_SESSIONS);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

/**
 * Save a practice session
 */
export function savePracticeSession(session: PracticeSession): void {
	if (typeof window === 'undefined') return;
	try {
		const sessions = getPracticeSessions();
		sessions.push(session);
		localStorage.setItem(PRACTICE_SESSIONS, JSON.stringify(sessions));
	} catch (err) {
		console.error('Failed to save practice session:', err);
	}
}

/**
 * Get practice statistics for dashboard display
 */
export function getPracticeStatsFromStorage(): PracticeStats {
	const sessions = getPracticeSessions();

	if (sessions.length === 0) {
		return {
			totalSessions: 0,
			totalQuestions: 0,
			bestScore: 0,
			weakDomains: [],
			averageScore: 0
		};
	}

	const totalSessions = sessions.length;
	const totalQuestions = sessions.reduce((sum, s) => sum + s.questionCount, 0);
	const bestScore = Math.max(...sessions.map(s => s.score));
	const averageScore = Math.round(
		sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length
	);

	// Calculate weak domains (domains with lowest accuracy)
	const domainScores = new Map<string, { correct: number; total: number }>();

	sessions.forEach((session) => {
		if (session.domainIds && session.domainIds.length > 0) {
			const scorePerDomain = session.correctAnswers / session.domainIds.length;
			session.domainIds.forEach((domainId) => {
				const current = domainScores.get(domainId) || { correct: 0, total: 0 };
				domainScores.set(domainId, {
					correct: current.correct + scorePerDomain,
					total: current.total + 1
				});
			});
		}
	});

	// Get domains with below-average accuracy
	const weakDomains: string[] = [];
	domainScores.forEach((stats, domainId) => {
		const accuracy = (stats.correct / stats.total) * 100;
		if (accuracy < 70) {
			// Below 70% is considered weak
			weakDomains.push(domainId);
		}
	});

	return {
		totalSessions,
		totalQuestions,
		bestScore,
		weakDomains,
		averageScore
	};
}

/**
 * Get rolling average of last N practice sessions
 */
export function getPracticeRollingAverage(lastN: number = 5): number {
	const sessions = getPracticeSessions();
	if (sessions.length === 0) return 0;

	const recentSessions = sessions.slice(-lastN);
	const total = recentSessions.reduce((sum, s) => sum + s.score, 0);
	return Math.round(total / recentSessions.length);
}

/**
 * Clear all practice sessions (for testing/reset purposes)
 */
export function clearPracticeSessions(): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(PRACTICE_SESSIONS);
	} catch (err) {
		console.error('Failed to clear practice sessions:', err);
	}
}
