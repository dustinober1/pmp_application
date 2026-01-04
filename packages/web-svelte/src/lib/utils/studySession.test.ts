/**
 * Tests for studySession.ts
 * Tests cover: session creation, start/end tracking, duration calculation,
 * localStorage persistence, and edge cases
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
	getStudySessions,
	saveStudySession,
	createStudySessionTracker,
	getTaskStudyTime,
	getTotalStudyTime,
	type StudySession
} from './studySession';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
})();

// Mock window object
Object.defineProperty(global, 'window', {
	value: {
		localStorage: localStorageMock
	}
});

describe('studySession', () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	describe('getStudySessions', () => {
		it('should return empty array when localStorage is empty', () => {
			const sessions = getStudySessions();
			expect(sessions).toEqual([]);
		});

		it('should return empty array when window is undefined', () => {
			// @ts-expect-error - testing undefined window
			const originalWindow = global.window;
			// @ts-expect-error - testing undefined window
			delete global.window;

			const sessions = getStudySessions();
			expect(sessions).toEqual([]);

			// Restore window
			global.window = originalWindow;
		});

		it('should parse and return stored sessions', () => {
			const mockSessions: StudySession[] = [
				{
					taskId: 'task-1',
					startTime: 1000000,
					endTime: 1000050,
					duration: 50,
					taskCompleted: true
				},
				{
					taskId: 'task-2',
					startTime: 1000100,
					endTime: 1000200,
					duration: 100,
					taskCompleted: false
				}
			];

			localStorageMock.setItem('pmp_study_sessions', JSON.stringify(mockSessions));

			const sessions = getStudySessions();
			expect(sessions).toHaveLength(2);
			expect(sessions[0]).toEqual(mockSessions[0]);
			expect(sessions[1]).toEqual(mockSessions[1]);
		});

		it('should handle corrupted localStorage data gracefully', () => {
			localStorageMock.setItem('pmp_study_sessions', 'invalid json');

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const sessions = getStudySessions();
			expect(sessions).toEqual([]);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe('saveStudySession', () => {
		it('should save a valid session to localStorage', () => {
			const session: StudySession = {
				taskId: 'task-1',
				startTime: Date.now(),
				endTime: Date.now() + 5000,
				duration: 5,
				taskCompleted: true
			};

			saveStudySession(session);

			const stored = getStudySessions();
			expect(stored).toHaveLength(1);
			expect(stored[0]).toEqual(session);
		});

		it('should append session to existing sessions', () => {
			const session1: StudySession = {
				taskId: 'task-1',
				startTime: 1000000,
				endTime: 1000050,
				duration: 50,
				taskCompleted: true
			};

			const session2: StudySession = {
				taskId: 'task-2',
				startTime: 1000100,
				endTime: 1000200,
				duration: 100,
				taskCompleted: false
			};

			saveStudySession(session1);
			saveStudySession(session2);

			const stored = getStudySessions();
			expect(stored).toHaveLength(2);
			expect(stored[0]).toEqual(session1);
			expect(stored[1]).toEqual(session2);
		});

		it('should handle localStorage errors gracefully', () => {
			const session: StudySession = {
				taskId: 'task-1',
				startTime: Date.now(),
				endTime: Date.now() + 5000,
				duration: 5,
				taskCompleted: true
			};

			// Mock localStorage.setItem to throw
			const setItemSpy = vi
				.spyOn(localStorageMock, 'setItem')
				.mockImplementation(() => {
					throw new Error('Storage quota exceeded');
				});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// Should not throw, just log error
			expect(() => saveStudySession(session)).not.toThrow();
			expect(consoleSpy).toHaveBeenCalled();

			setItemSpy.mockRestore();
			consoleSpy.mockRestore();
		});

		it('should return early when window is undefined', () => {
			const session: StudySession = {
				taskId: 'task-1',
				startTime: Date.now(),
				endTime: Date.now() + 5000,
				duration: 5,
				taskCompleted: true
			};

			// @ts-expect-error - testing undefined window
			const originalWindow = global.window;
			// @ts-expect-error - testing undefined window
			delete global.window;

			// Should not throw
			expect(() => saveStudySession(session)).not.toThrow();

			// Restore window
			global.window = originalWindow;
		});
	});

	describe('createStudySessionTracker', () => {
		it('should create a tracker with start and end functions', () => {
			const tracker = createStudySessionTracker('task-1');

			expect(tracker).toHaveProperty('startSession');
			expect(tracker).toHaveProperty('endSession');
			expect(typeof tracker.startSession).toBe('function');
			expect(typeof tracker.endSession).toBe('function');
		});

		it('should track session start and end times', () => {
			const tracker = createStudySessionTracker('task-1');

			tracker.startSession();

			// Fast forward 1 second
			vi.advanceTimersByTime(1000);

			tracker.endSession(true);

			const sessions = getStudySessions();
			expect(sessions).toHaveLength(1);
			expect(sessions[0].taskId).toBe('task-1');
			expect(sessions[0].duration).toBeGreaterThan(0);
			expect(sessions[0].taskCompleted).toBe(true);
		});

		it('should calculate duration in seconds', () => {
			const tracker = createStudySessionTracker('task-1');

			const startTime = Date.now();
			tracker.startSession();

			// Simulate 5.5 seconds passing
			const endTime = startTime + 5500;
			vi.spyOn(Date, 'now').mockReturnValue(startTime);
			tracker.startSession();
			vi.spyOn(Date, 'now').mockReturnValue(endTime);

			tracker.endSession();

			const sessions = getStudySessions();
			expect(sessions[0].duration).toBe(5); // Should floor to 5 seconds
		});

		it('should handle endSession called before startSession', () => {
			const tracker = createStudySessionTracker('task-1');

			// End before starting
			tracker.endSession(true);

			const sessions = getStudySessions();
			expect(sessions).toHaveLength(0);
		});

		it('should allow multiple sequential sessions with same tracker', () => {
			const tracker = createStudySessionTracker('task-1');

			// First session
			tracker.startSession();
			vi.advanceTimersByTime(1000);
			tracker.endSession(true);

			// Second session
			tracker.startSession();
			vi.advanceTimersByTime(2000);
			tracker.endSession(false);

			const sessions = getStudySessions();
			expect(sessions).toHaveLength(2);
			expect(sessions[0].taskCompleted).toBe(true);
			expect(sessions[1].taskCompleted).toBe(false);
		});

		it('should default taskCompleted to false when not provided', () => {
			const tracker = createStudySessionTracker('task-1');

			tracker.startSession();
			tracker.endSession(); // No argument provided

			const sessions = getStudySessions();
			expect(sessions).toHaveLength(1);
			expect(sessions[0].taskCompleted).toBe(false);
		});
	});

	describe('getTaskStudyTime', () => {
		beforeEach(() => {
			// Setup test data
			const sessions: StudySession[] = [
				{ taskId: 'task-1', startTime: 1000, endTime: 2000, duration: 1000, taskCompleted: true },
				{ taskId: 'task-1', startTime: 2000, endTime: 3500, duration: 1500, taskCompleted: false },
				{ taskId: 'task-2', startTime: 3000, endTime: 4000, duration: 1000, taskCompleted: true },
				{ taskId: 'task-3', startTime: 4000, endTime: 6000, duration: 2000, taskCompleted: true }
			];

			sessions.forEach(saveStudySession);
		});

		it('should return total study time for a specific task', () => {
			const totalTime = getTaskStudyTime('task-1');
			expect(totalTime).toBe(2500); // 1000 + 1500
		});

		it('should return zero for non-existent task', () => {
			const totalTime = getTaskStudyTime('non-existent');
			expect(totalTime).toBe(0);
		});

		it('should only include sessions for the specified task', () => {
			const task2Time = getTaskStudyTime('task-2');
			const task3Time = getTaskStudyTime('task-3');

			expect(task2Time).toBe(1000);
			expect(task3Time).toBe(2000);
		});

		it('should handle empty sessions list', () => {
			localStorageMock.clear();
			const totalTime = getTaskStudyTime('task-1');
			expect(totalTime).toBe(0);
		});
	});

	describe('getTotalStudyTime', () => {
		it('should return sum of all session durations', () => {
			const sessions: StudySession[] = [
				{ taskId: 'task-1', startTime: 1000, endTime: 2000, duration: 1000, taskCompleted: true },
				{ taskId: 'task-2', startTime: 2000, endTime: 3500, duration: 1500, taskCompleted: false },
				{ taskId: 'task-3', startTime: 3000, endTime: 4000, duration: 1000, taskCompleted: true }
			];

			sessions.forEach(saveStudySession);

			const totalTime = getTotalStudyTime();
			expect(totalTime).toBe(3500); // 1000 + 1500 + 1000
		});

		it('should return zero when no sessions exist', () => {
			const totalTime = getTotalStudyTime();
			expect(totalTime).toBe(0);
		});

		it('should handle sessions with zero duration', () => {
			const sessions: StudySession[] = [
				{ taskId: 'task-1', startTime: 1000, endTime: 1000, duration: 0, taskCompleted: true },
				{ taskId: 'task-2', startTime: 2000, endTime: 2000, duration: 0, taskCompleted: false }
			];

			sessions.forEach(saveStudySession);

			const totalTime = getTotalStudyTime();
			expect(totalTime).toBe(0);
		});
	});

	describe('Edge Cases', () => {
		it('should handle session with zero duration', () => {
			const tracker = createStudySessionTracker('task-1');

			// Mock Date.now to return same time for start and end
			const now = Date.now();
			vi.spyOn(Date, 'now').mockReturnValue(now);

			tracker.startSession();
			tracker.endSession();

			const sessions = getStudySessions();
			expect(sessions[0].duration).toBe(0);
		});

		it('should handle very long duration sessions', () => {
			const tracker = createStudySessionTracker('task-1');

			const startTime = Date.now();
			vi.spyOn(Date, 'now').mockReturnValue(startTime);
			tracker.startSession();

			// 24 hours later
			vi.spyOn(Date, 'now').mockReturnValue(startTime + 24 * 60 * 60 * 1000);
			tracker.endSession();

			const sessions = getStudySessions();
			expect(sessions[0].duration).toBe(24 * 60 * 60); // 86400 seconds
		});

		it('should handle rapid start/stop cycles', () => {
			const tracker = createStudySessionTracker('task-1');

			for (let i = 0; i < 10; i++) {
				tracker.startSession();
				tracker.endSession();
			}

			const sessions = getStudySessions();
			expect(sessions).toHaveLength(10);
		});

		it('should handle concurrent trackers for different tasks', () => {
			const tracker1 = createStudySessionTracker('task-1');
			const tracker2 = createStudySessionTracker('task-2');
			const tracker3 = createStudySessionTracker('task-3');

			tracker1.startSession();
			tracker2.startSession();
			tracker3.startSession();

			vi.advanceTimersByTime(1000);

			tracker1.endSession(true);
			tracker2.endSession(false);
			tracker3.endSession(true);

			const sessions = getStudySessions();
			expect(sessions).toHaveLength(3);

			const task1Time = getTaskStudyTime('task-1');
			const task2Time = getTaskStudyTime('task-2');
			const task3Time = getTaskStudyTime('task-3');

			expect(task1Time).toBeGreaterThan(0);
			expect(task2Time).toBeGreaterThan(0);
			expect(task3Time).toBeGreaterThan(0);
		});

		it('should handle sessions with very long task IDs', () => {
			const longTaskId = 'a'.repeat(1000);
			const tracker = createStudySessionTracker(longTaskId);

			tracker.startSession();
			tracker.endSession();

			const sessions = getStudySessions();
			expect(sessions[0].taskId).toBe(longTaskId);
		});

		it('should handle special characters in task IDs', () => {
			const specialTaskId = 'task-with-special-chars-<>-"\'-测试';
			const tracker = createStudySessionTracker(specialTaskId);

			tracker.startSession();
			tracker.endSession();

			const sessions = getStudySessions();
			expect(sessions[0].taskId).toBe(specialTaskId);
		});
	});

	describe('localStorage Persistence', () => {
		it('should persist data across multiple calls to getStudySessions', () => {
			const session: StudySession = {
				taskId: 'task-1',
				startTime: Date.now(),
				endTime: Date.now() + 5000,
				duration: 5,
				taskCompleted: true
			};

			saveStudySession(session);

			const sessions1 = getStudySessions();
			const sessions2 = getStudySessions();

			expect(sessions1).toEqual(sessions2);
			expect(sessions2).toHaveLength(1);
		});

		it('should handle localStorage being cleared externally', () => {
			const tracker = createStudySessionTracker('task-1');

			tracker.startSession();
			tracker.endSession();

			expect(getStudySessions()).toHaveLength(1);

			// Simulate external clear
			localStorageMock.clear();

			expect(getStudySessions()).toHaveLength(0);
		});

		it('should handle corrupted data and recover gracefully', () => {
			// Start with valid data
			const session: StudySession = {
				taskId: 'task-1',
				startTime: Date.now(),
				endTime: Date.now() + 5000,
				duration: 5,
				taskCompleted: true
			};

			saveStudySession(session);
			expect(getStudySessions()).toHaveLength(1);

			// Corrupt the data
			localStorageMock.setItem('pmp_study_sessions', 'invalid json');

			// Should return empty array and log error
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const sessions = getStudySessions();

			expect(sessions).toEqual([]);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it('should maintain data integrity with multiple saves', () => {
			const sessions: StudySession[] = Array.from({ length: 100 }, (_, i) => ({
				taskId: `task-${i}`,
				startTime: Date.now() + i * 1000,
				endTime: Date.now() + (i + 1) * 1000,
				duration: 1,
				taskCompleted: i % 2 === 0
			}));

			sessions.forEach(saveStudySession);

			const retrieved = getStudySessions();
			expect(retrieved).toHaveLength(100);
			expect(retrieved).toEqual(sessions);
		});
	});
});
