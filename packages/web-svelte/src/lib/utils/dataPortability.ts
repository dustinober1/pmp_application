/**
 * Data Portability Utility
 * Enables exporting and importing all user progress data as JSON
 * Useful for backing up data or transferring between devices
 */

import { STORAGE_KEYS } from '$lib/constants/storageKeys';
import type { DomainProgressStats, RecentActivity } from '@pmp/shared';

/**
 * All data that can be exported/imported
 */
export interface PortableData {
	version: string;
	exportDate: string;
	data: {
		domainProgress: {
			domains: DomainProgressStats[];
			lastUpdated: string | null;
		};
		recentActivity: {
			activities: RecentActivity[];
			lastUpdated: string | null;
		};
		studyStats: {
			totalStudyTime: number;
			studyStreak: number;
			lastStudyDate: string | null;
			studySessions: unknown[];
		};
		flashcards: {
			masteredCount: number;
			mastered: string[];
			recentReviews: unknown[];
		};
		mockExams: {
			scores: unknown[];
		};
		userSettings: {
			locale: string | null;
			userName: string | null;
		};
	};
}

// Storage keys used by dashboard store (internal)
const DASHBOARD_STORAGE_KEYS = {
	DOMAIN_PROGRESS: 'pmp_domain_progress_2026',
	RECENT_ACTIVITY: 'pmp_recent_activity'
};

/**
 * Helper to safely get localStorage item
 */
function getStorageItem<T>(key: string, defaultValue: T): T {
	if (typeof window === 'undefined') return defaultValue;
	try {
		const item = localStorage.getItem(key);
		return item ? (JSON.parse(item) as T) : defaultValue;
	} catch {
		return defaultValue;
	}
}

/**
 * Helper to safely set localStorage item
 */
function setStorageItem<T>(key: string, value: T): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(`Error saving to localStorage (${key}):`, error);
	}
}

/**
 * Gather all localStorage data and export as JSON blob
 * Returns the data object (for testing) or triggers download if filename provided
 */
export function exportProgress(filename?: string): PortableData {
	const portableData: PortableData = {
		version: '1.0.0',
		exportDate: new Date().toISOString(),
		data: {
			domainProgress: getStorageItem(DASHBOARD_STORAGE_KEYS.DOMAIN_PROGRESS, {
				domains: [],
				lastUpdated: null
			}),
			recentActivity: getStorageItem(DASHBOARD_STORAGE_KEYS.RECENT_ACTIVITY, {
				activities: [],
				lastUpdated: null
			}),
			studyStats: {
				totalStudyTime: parseInt(
					localStorage.getItem(STORAGE_KEYS.TOTAL_STUDY_TIME) || '0',
					10
				),
				studyStreak: parseInt(localStorage.getItem(STORAGE_KEYS.STUDY_STREAK) || '0', 10),
				lastStudyDate: localStorage.getItem(STORAGE_KEYS.LAST_STUDY_DATE),
				studySessions: getStorageItem(STORAGE_KEYS.STUDY_SESSIONS, [])
			},
			flashcards: {
				masteredCount: parseInt(
					localStorage.getItem(STORAGE_KEYS.FLASHCARDS_MASTERED_COUNT) || '0',
					10
				),
				mastered: getStorageItem<string[]>(STORAGE_KEYS.FLASHCARDS_MASTERED, []),
				recentReviews: getStorageItem(STORAGE_KEYS.FLASHCARDS_RECENT_REVIEWS, [])
			},
			mockExams: {
				scores: getStorageItem(STORAGE_KEYS.MOCK_EXAM_SCORES, [])
			},
			userSettings: {
				locale: localStorage.getItem(STORAGE_KEYS.LOCALE),
				userName: localStorage.getItem('pmp_user_name')
			}
		}
	};

	// If filename provided, trigger download
	if (filename && typeof window !== 'undefined') {
		const blob = new Blob([JSON.stringify(portableData, null, 2)], {
			type: 'application/json'
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	return portableData;
}

/**
 * Default filename for export
 */
export const DEFAULT_EXPORT_FILENAME = 'pmp_progress_backup.json';

/**
 * Export progress with default filename
 */
export function downloadProgressBackup(): void {
	const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
	exportProgress(`pmp_progress_backup_${timestamp}.json`);
}

/**
 * Import data from a JSON file and restore to localStorage
 * @param file The File object to import
 * @returns Promise that resolves with success status and message
 */
export async function importProgress(file: File): Promise<{ success: boolean; message: string }> {
	try {
		// Validate file type
		if (!file.name.endsWith('.json')) {
			return {
				success: false,
				message: 'Invalid file type. Please select a JSON file.'
			};
		}

		// Read and parse file
		const text = await file.text();
		const importedData: PortableData = JSON.parse(text);

		// Validate structure
		if (!importedData.version || !importedData.data) {
			return {
				success: false,
				message: 'Invalid backup file format.'
			};
		}

		// Restore data to localStorage
		const { data } = importedData;

		// Domain progress
		if (data.domainProgress) {
			setStorageItem(DASHBOARD_STORAGE_KEYS.DOMAIN_PROGRESS, data.domainProgress);
		}

		// Recent activity
		if (data.recentActivity) {
			setStorageItem(DASHBOARD_STORAGE_KEYS.RECENT_ACTIVITY, data.recentActivity);
		}

		// Study stats
		if (data.studyStats) {
			localStorage.setItem(
				STORAGE_KEYS.TOTAL_STUDY_TIME,
				data.studyStats.totalStudyTime.toString()
			);
			localStorage.setItem(STORAGE_KEYS.STUDY_STREAK, data.studyStats.studyStreak.toString());
			if (data.studyStats.lastStudyDate) {
				localStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, data.studyStats.lastStudyDate);
			}
			setStorageItem(STORAGE_KEYS.STUDY_SESSIONS, data.studyStats.studySessions);
		}

		// Flashcards
		if (data.flashcards) {
			localStorage.setItem(
				STORAGE_KEYS.FLASHCARDS_MASTERED_COUNT,
				data.flashcards.masteredCount.toString()
			);
			setStorageItem(STORAGE_KEYS.FLASHCARDS_MASTERED, data.flashcards.mastered);
			setStorageItem(STORAGE_KEYS.FLASHCARDS_RECENT_REVIEWS, data.flashcards.recentReviews);
		}

		// Mock exams
		if (data.mockExams) {
			setStorageItem(STORAGE_KEYS.MOCK_EXAM_SCORES, data.mockExams.scores);
		}

		// User settings
		if (data.userSettings) {
			if (data.userSettings.locale) {
				localStorage.setItem(STORAGE_KEYS.LOCALE, data.userSettings.locale);
			}
			if (data.userSettings.userName) {
				localStorage.setItem('pmp_user_name', data.userSettings.userName);
			}
		}

		// Trigger storage event to update reactive stores
		window.dispatchEvent(new Event('storage'));

		return {
			success: true,
			message: `Progress imported successfully from ${new Date(importedData.exportDate).toLocaleDateString()}`
		};
	} catch (error) {
		console.error('Failed to import progress:', error);
		return {
			success: false,
			message: `Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}
