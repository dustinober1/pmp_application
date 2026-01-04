/**
* Data Portability Utility
* Handles exporting and importing PMP study progress data
* Allows users to backup and restore their progress between devices
*/

import { STORAGE_KEYS } from '$lib/constants/storageKeys';
import type { DomainProgressStats, RecentActivity } from '@pmp/shared';

// Dashboard store keys (from lib/stores/dashboard.ts)
const DASHBOARD_STORAGE_KEYS = {
	DOMAIN_PROGRESS: 'pmp_domain_progress_2026',
	RECENT_ACTIVITY: 'pmp_recent_activity',
	OVERALL_PROGRESS: 'pmp_overall_progress'
};

/**
 * Flashcard review data structure (from flashcardStorage.ts)
 */
export interface FlashcardReview {
	cardId: string;
	cardFront: string;
	rating: 'know_it' | 'learning' | 'dont_know';
	timestamp: string;
}

/**
 * Flashcard progress data structure
 */
export interface FlashcardProgress {
	masteredCount: number;
	masteredSet: string[] | null; // IDs of mastered cards
	recentReviews: FlashcardReview[];
}

/**
 * Mock exam score data structure (from mockExamStorage.ts)
 */
export interface MockExamScore {
	sessionId: string;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
	date: string;
}

/**
 * Complete PMP progress data structure for export/import
 * Contains all user study data from localStorage
 */
export interface PMPProgressData {
	// Storage keys version (for future compatibility)
	version: string;
	exportDate: string;

	// Dashboard domain progress
	domainProgress: {
		domains: DomainProgressStats[];
		lastUpdated: string | null;
	} | null;

	// Recent activity
	recentActivity: {
		activities: RecentActivity[];
		lastUpdated: string | null;
	} | null;

	// Study tracking stats
	studyStats: {
		totalStudyTime: number | null;
		studyStreak: number | null;
		lastStudyDate: string | null;
		studySessions: unknown[] | null;
	};

	// Flashcard progress
	flashcardProgress: {
		masteredCount: number;
		masteredSet: string[] | null;
		recentReviews: FlashcardReview[];
	};

	// Mock exam scores
	mockExamScores: MockExamScore[];

	// User preferences
	preferences: {
		locale: string | null;
		userName: string | null;
	};
}

/**
 * Result type for import operations
 */
export interface ImportResult {
	success: boolean;
	message: string;
	importedItems: string[];
	errors: string[];
}

/**
 * Export all PMP progress data to a JSON file
 * Downloads the file as pmp_progress_backup_YYYY-MM-DD.json
 */
export function downloadProgressBackup(): void {
	if (typeof window === 'undefined') return;

	try {
		// Gather all data from localStorage
		const progressData: PMPProgressData = {
			version: '1.0.0',
			exportDate: new Date().toISOString(),

			// Dashboard domain progress
			domainProgress: getStorageItem(DASHBOARD_STORAGE_KEYS.DOMAIN_PROGRESS),

			// Recent activity
			recentActivity: getStorageItem(DASHBOARD_STORAGE_KEYS.RECENT_ACTIVITY),

			// Study tracking stats
			studyStats: {
				totalStudyTime: getStorageItem<number>(STORAGE_KEYS.TOTAL_STUDY_TIME),
				studyStreak: getStorageItem<number>(STORAGE_KEYS.STUDY_STREAK),
				lastStudyDate: getStorageItem<string>(STORAGE_KEYS.LAST_STUDY_DATE),
				studySessions: getStorageItem<unknown[]>(STORAGE_KEYS.STUDY_SESSIONS)
			},

			// Flashcard progress
			flashcardProgress: {
				masteredCount: getStorageItem<number>(STORAGE_KEYS.FLASHCARDS_MASTERED_COUNT) || 0,
				masteredSet: getStorageItem<string[]>(STORAGE_KEYS.FLASHCARDS_MASTERED),
				recentReviews: getStorageItem<FlashcardReview[]>(STORAGE_KEYS.FLASHCARDS_RECENT_REVIEWS) || []
			},

			// Mock exam scores
			mockExamScores: getStorageItem<MockExamScore[]>(STORAGE_KEYS.MOCK_EXAM_SCORES) || [],

			// User preferences
			preferences: {
				locale: getStorageItem<string>(STORAGE_KEYS.LOCALE),
				userName: getStorageItem<string>('pmp_user_name')
			}
		};

		// Create JSON blob
		const jsonString = JSON.stringify(progressData, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });

		// Generate filename with date
		const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
		const filename = `pmp_progress_backup_${date}.json`;

		// Create download link and trigger download
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Failed to export progress:', error);
		throw error;
	}
}

/**
 * Safely get a value from localStorage
 */
function getStorageItem<T>(key: string): T | null {
	if (typeof window === 'undefined') return null;
	try {
		const item = localStorage.getItem(key);
		return item ? (JSON.parse(item) as T) : null;
	} catch {
		return null;
	}
}

/**
 * Safely set a value in localStorage
 */
function setStorageItem<T>(key: string, value: T): boolean {
	if (typeof window === 'undefined') return false;
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch (error) {
		console.error(`Failed to save to localStorage (${key}):`, error);
		return false;
	}
}

/**
 * Validate the structure of imported PMP progress data
 * Checks for required fields and valid data types
 */
function validateImportData(data: unknown): data is PMPProgressData {
	if (!data || typeof data !== 'object') {
		return false;
	}

	const d = data as Record<string, unknown>;

	// Check version field
	if (typeof d.version !== 'string') {
		return false;
	}

	// Check exportDate
	if (typeof d.exportDate !== 'string') {
		return false;
	}

	// Validate domainProgress if present
	if (d.domainProgress !== null && d.domainProgress !== undefined) {
		const dp = d.domainProgress as Record<string, unknown>;
		if (!Array.isArray(dp.domains)) {
			return false;
		}
	}

	// Validate recentActivity if present
	if (d.recentActivity !== null && d.recentActivity !== undefined) {
		const ra = d.recentActivity as Record<string, unknown>;
		if (!Array.isArray(ra.activities)) {
			return false;
		}
	}

	// Validate studyStats
	if (!d.studyStats || typeof d.studyStats !== 'object') {
		return false;
	}

	// Validate flashcardProgress
	if (!d.flashcardProgress || typeof d.flashcardProgress !== 'object') {
		return false;
	}

	// Validate mockExamScores
	if (!Array.isArray(d.mockExamScores)) {
		return false;
	}

	// Validate preferences
	if (!d.preferences || typeof d.preferences !== 'object') {
		return false;
	}

	return true;
}

/**
 * Import progress data from a JSON file
 * Reads the file, validates data structure, and restores all values to localStorage
 *
 * @param file - The File object to read and import
 * @returns Promise<ImportResult> with success status, message, and details
 */
export async function importProgress(file: File): Promise<ImportResult> {
	const result: ImportResult = {
		success: false,
		message: '',
		importedItems: [],
		errors: []
	};

	try {
		// Validate file type
		if (!file.name.endsWith('.json')) {
			result.errors.push('Invalid file type. Please select a JSON file.');
			result.message = 'Import failed: Invalid file type';
			return result;
		}

		// Read and parse file
		const text = await file.text();
		const data = JSON.parse(text);

		// Validate data structure
		if (!validateImportData(data)) {
			result.errors.push('Invalid data structure. Please ensure you are importing a valid PMP progress backup file.');
			result.message = 'Import failed: Invalid data structure';
			return result;
		}

		const importData = data as PMPProgressData;

		// Import domain progress
		if (importData.domainProgress) {
			if (setStorageItem(DASHBOARD_STORAGE_KEYS.DOMAIN_PROGRESS, importData.domainProgress)) {
				result.importedItems.push('Domain progress');
			} else {
				result.errors.push('Failed to save domain progress');
			}
		}

		// Import recent activity
		if (importData.recentActivity) {
			if (setStorageItem(DASHBOARD_STORAGE_KEYS.RECENT_ACTIVITY, importData.recentActivity)) {
				result.importedItems.push('Recent activity');
			} else {
				result.errors.push('Failed to save recent activity');
			}
		}

		// Import study stats
		const { studyStats } = importData;
		if (studyStats.totalStudyTime !== null) {
			if (setStorageItem(STORAGE_KEYS.TOTAL_STUDY_TIME, studyStats.totalStudyTime)) {
				result.importedItems.push('Total study time');
			}
		}
		if (studyStats.studyStreak !== null) {
			if (setStorageItem(STORAGE_KEYS.STUDY_STREAK, studyStats.studyStreak)) {
				result.importedItems.push('Study streak');
			}
		}
		if (studyStats.lastStudyDate !== null) {
			if (setStorageItem(STORAGE_KEYS.LAST_STUDY_DATE, studyStats.lastStudyDate)) {
				result.importedItems.push('Last study date');
			}
		}
		if (studyStats.studySessions !== null) {
			if (setStorageItem(STORAGE_KEYS.STUDY_SESSIONS, studyStats.studySessions)) {
				result.importedItems.push('Study sessions');
			}
		}

		// Import flashcard progress
		const { flashcardProgress } = importData;
		if (setStorageItem(STORAGE_KEYS.FLASHCARDS_MASTERED_COUNT, flashcardProgress.masteredCount)) {
			result.importedItems.push('Flashcard mastered count');
		}
		if (flashcardProgress.masteredSet !== null) {
			if (setStorageItem(STORAGE_KEYS.FLASHCARDS_MASTERED, flashcardProgress.masteredSet)) {
				result.importedItems.push('Mastered flashcard set');
			}
		}
		if (setStorageItem(STORAGE_KEYS.FLASHCARDS_RECENT_REVIEWS, flashcardProgress.recentReviews)) {
			result.importedItems.push('Recent flashcard reviews');
		}

		// Import mock exam scores
		if (setStorageItem(STORAGE_KEYS.MOCK_EXAM_SCORES, importData.mockExamScores)) {
			result.importedItems.push('Mock exam scores');
		} else {
			result.errors.push('Failed to save mock exam scores');
		}

		// Import preferences
		const { preferences } = importData;
		if (preferences.locale !== null) {
			if (setStorageItem(STORAGE_KEYS.LOCALE, preferences.locale)) {
				result.importedItems.push('Locale preference');
			}
		}
		if (preferences.userName !== null) {
			if (setStorageItem('pmp_user_name', preferences.userName)) {
				result.importedItems.push('User name');
			}
		}

		// Determine overall success
		if (result.errors.length === 0 || result.importedItems.length > 0) {
			result.success = true;
			const dateStr = new Date(importData.exportDate).toLocaleDateString();
			result.message = `Successfully imported ${result.importedItems.length} items from backup created on ${dateStr}`;
			if (result.errors.length > 0) {
				const errSuffix = result.errors.length > 1 ? 's' : '';
				result.message += ` (with ${result.errors.length} error${errSuffix})`;
			}
		} else {
			result.message = 'Import failed: No data could be imported';
		}
	} catch (error) {
		result.success = false;
		result.message = 'Import failed: An unexpected error occurred';
		result.errors.push(error instanceof Error ? error.message : String(error));
	}

	return result;
}

/**
 * Read and parse a JSON file, then import the progress data
 * Convenience function for handling file uploads
 *
 * @param file - The File object to read and import
 * @returns Promise<ImportResult> with the import outcome
 */
export async function importProgressFromFile(file: File): Promise<ImportResult> {
	// Validate file type
	if (!file.name.endsWith('.json')) {
		return {
			success: false,
			message: 'Import failed: Invalid file type. Please select a JSON file.',
			importedItems: [],
			errors: ['Invalid file type']
		};
	}

	try {
		const text = await file.text();
		const jsonData = JSON.parse(text);
		return importProgress(jsonData);
	} catch (error) {
		return {
			success: false,
			message: 'Import failed: Unable to read or parse the file',
			importedItems: [],
			errors: [error instanceof Error ? error.message : String(error)]
		};
	}
}
