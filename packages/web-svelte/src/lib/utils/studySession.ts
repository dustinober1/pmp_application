/**
 * Study Session Tracking Utility
 * Tracks and saves study sessions to localStorage
 */

export interface StudySession {
	taskId: string;
	startTime: number;
	endTime: number;
	duration: number; // in seconds
	taskCompleted: boolean;
}

const STORAGE_KEY = 'pmp_study_sessions';

/**
 * Get all study sessions from localStorage
 */
export function getStudySessions(): StudySession[] {
	if (typeof window === 'undefined') return [];
	try {
		const data = localStorage.getItem(STORAGE_KEY);
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
		localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
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
