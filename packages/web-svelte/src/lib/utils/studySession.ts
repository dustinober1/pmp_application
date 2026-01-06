/**
 * Study Session Tracking Utility
 * Tracks and saves study sessions to localStorage
 */

import { STORAGE_KEYS } from '$lib/constants/storageKeys';

const { STUDY_SESSIONS } = STORAGE_KEYS;

export interface StudySession {
	taskId: string;
	startTime: number;
	endTime: number;
	duration: number; // in seconds
	taskCompleted: boolean;
}

/**
 * Get all study sessions from localStorage
 */
export function getStudySessions(): StudySession[] {
	if (typeof window === 'undefined') return [];
	try {
		const data = localStorage.getItem(STUDY_SESSIONS);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.error('Failed to read study sessions:', error);
		return [];
	}
}

/**
 * Save a study session to localStorage
 */
export function saveStudySession(session: StudySession): void {
	if (typeof window === 'undefined') return;
	try {
		const sessions = getStudySessions();
		sessions.push(session);
		localStorage.setItem(STUDY_SESSIONS, JSON.stringify(sessions));
	} catch (error) {
		console.error('Failed to save study session:', error);
	}
}

/**
 * Create a new study session tracker
 * Returns functions to start and end the session
 */
export function createStudySessionTracker(taskId: string) {
	let startTime: number | null = null;

	/**
	 * Start tracking a study session
	 */
	function startSession(): void {
		if (typeof window === 'undefined') return;
		startTime = Date.now();
		console.log(`[Study Session] Started tracking for task: ${taskId}`);
	}

	/**
	 * End tracking and save the study session
	 */
	function endSession(taskCompleted = false): void {
		if (typeof window === 'undefined' || startTime === null) return;

		const endTime = Date.now();
		const duration = Math.floor((endTime - startTime) / 1000); // Convert to seconds

		const session: StudySession = {
			taskId,
			startTime,
			endTime,
			duration,
			taskCompleted
		};

		saveStudySession(session);
		console.log(`[Study Session] Saved session for task ${taskId}:`, session);
		startTime = null;
	}

	return {
		startSession,
		endSession
	};
}

/**
 * Get total study time for a specific task
 */
export function getTaskStudyTime(taskId: string): number {
	const sessions = getStudySessions();
	return sessions
		.filter((s) => s.taskId === taskId)
		.reduce((total, s) => total + s.duration, 0);
}

/**
 * Get total study time across all tasks
 */
export function getTotalStudyTime(): number {
	const sessions = getStudySessions();
	return sessions.reduce((total, s) => total + s.duration, 0);
}

/**
 * Updates the daily study streak.
 * Should be called whenever a significant study action is completed (e.g., answering a question).
 */
export function updateStudyStreak(): void {
	if (typeof window === 'undefined') return;

	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const lastStudyDateStr = localStorage.getItem(STORAGE_KEYS.LAST_STUDY_DATE);
		let currentStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STUDY_STREAK) || '0', 10);

		if (!lastStudyDateStr) {
			// First ever study session
			currentStreak = 1;
			localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, '1');
			localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, today.toISOString());
			return;
		}

		const lastStudyDate = new Date(lastStudyDateStr);
		lastStudyDate.setHours(0, 0, 0, 0);

		const diffTime = Math.abs(today.getTime() - lastStudyDate.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			// Already studied today, do nothing to streak
			// But ensure date is current (though it matches)
		} else if (diffDays === 1) {
			// Consecutive day
			currentStreak += 1;
			localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, currentStreak.toString());
			localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, today.toISOString());
		} else {
			// Streak broken
			currentStreak = 1;
			localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, '1');
			localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, today.toISOString());
		}
	} catch (error) {
		console.error('Failed to update study streak:', error);
	}
}
