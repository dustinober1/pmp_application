/**
 * Data Portability Utility
 * Handles exporting and importing PMP study progress data
 * Allows users to backup and restore their progress between devices
 */

import { STORAGE_KEYS } from "$lib/constants/storageKeys";
import type { DomainProgressStats, RecentActivity } from "@pmp/shared";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

// Dashboard store keys (from lib/stores/dashboard.ts)
const DASHBOARD_STORAGE_KEYS = {
  DOMAIN_PROGRESS: "pmp_domain_progress_2026",
  RECENT_ACTIVITY: "pmp_recent_activity",
  OVERALL_PROGRESS: "pmp_overall_progress",
};

// =============================================================================
// SECURITY: Zod Schemas for Import Validation
// These schemas provide strict type validation and sanitization for imported data
// =============================================================================

/**
 * Sanitize a string value to prevent XSS when rendered
 */
function sanitizeString(value: string): string {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Schema for sanitized strings - strips all HTML tags
 */
const SafeStringSchema = z.string().transform(sanitizeString);

/**
 * Schema for flashcard review data
 */
const FlashcardReviewSchema = z.object({
  cardId: SafeStringSchema,
  cardFront: SafeStringSchema,
  rating: z.enum(["know_it", "learning", "dont_know"]),
  timestamp: z.string(),
});

/**
 * Schema for mock exam scores
 */
const MockExamScoreSchema = z.object({
  sessionId: SafeStringSchema,
  score: z.number().min(0).max(100),
  totalQuestions: z.number().int().min(0),
  correctAnswers: z.number().int().min(0),
  date: z.string(),
});

/**
 * Schema for domain progress stats
 */
const DomainProgressStatsSchema = z.object({
  domainId: SafeStringSchema,
  domainName: SafeStringSchema,
  totalCards: z.number().int().min(0),
  masteredCards: z.number().int().min(0),
  learningCards: z.number().int().min(0),
  newCards: z.number().int().min(0),
  percentComplete: z.number().min(0).max(100),
}).passthrough(); // Allow additional fields for forward compatibility

/**
 * Schema for recent activity
 */
const RecentActivitySchema = z.object({
  id: SafeStringSchema,
  type: SafeStringSchema,
  title: SafeStringSchema,
  timestamp: z.string(),
}).passthrough(); // Allow additional fields

/**
 * Main schema for PMP progress data import
 * SECURITY: All string fields are sanitized to prevent XSS attacks
 */
const PMPProgressDataSchema = z.object({
  // Required metadata
  version: z.string(),
  exportDate: z.string(),

  // Dashboard domain progress
  domainProgress: z.object({
    domains: z.array(DomainProgressStatsSchema),
    lastUpdated: z.string().nullable(),
  }).nullable(),

  // Recent activity
  recentActivity: z.object({
    activities: z.array(RecentActivitySchema),
    lastUpdated: z.string().nullable(),
  }).nullable(),

  // Study tracking stats
  studyStats: z.object({
    totalStudyTime: z.number().min(0).nullable(),
    studyStreak: z.number().int().min(0).nullable(),
    lastStudyDate: z.string().nullable(),
    studySessions: z.array(z.unknown()).nullable(),
  }),

  // Flashcard progress
  flashcardProgress: z.object({
    masteredCount: z.number().int().min(0),
    masteredSet: z.array(SafeStringSchema).nullable(),
    recentReviews: z.array(FlashcardReviewSchema),
    cardProgress: z.record(z.unknown()).nullable(),
  }),

  // Question progress
  questionProgress: z.object({
    cardProgress: z.record(z.unknown()).nullable(),
  }).optional().default({ cardProgress: null }),

  // Mock exam scores
  mockExamScores: z.array(MockExamScoreSchema),

  // User preferences - sanitize user-provided strings
  preferences: z.object({
    locale: SafeStringSchema.nullable(),
    userName: SafeStringSchema.nullable(),
  }),
});

// Export the inferred type from the schema
export type PMPProgressData = z.infer<typeof PMPProgressDataSchema>;

// =============================================================================
// Legacy Type Definitions (kept for backward compatibility)
// =============================================================================

/**
 * Flashcard review data structure (from flashcardStorage.ts)
 */
export interface FlashcardReview {
  cardId: string;
  cardFront: string;
  rating: "know_it" | "learning" | "dont_know";
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
  if (typeof window === "undefined") return;

  try {
    // Gather all data from localStorage
    const progressData: PMPProgressData = {
      version: "1.0.0",
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
        studySessions: getStorageItem<unknown[]>(STORAGE_KEYS.STUDY_SESSIONS),
      },

      // Flashcard progress
      flashcardProgress: {
        masteredCount:
          getStorageItem<number>(STORAGE_KEYS.FLASHCARDS_MASTERED_COUNT) || 0,
        masteredSet: getStorageItem<string[]>(STORAGE_KEYS.FLASHCARDS_MASTERED),
        recentReviews:
          getStorageItem<FlashcardReview[]>(
            STORAGE_KEYS.FLASHCARDS_RECENT_REVIEWS,
          ) || [],
        cardProgress: getStorageItem<Record<string, any>>(
          STORAGE_KEYS.FLASHCARDS_CARD_PROGRESS,
        ),
      },

      // Question progress
      questionProgress: {
        cardProgress: getStorageItem<Record<string, any>>(
          STORAGE_KEYS.QUESTIONS_CARD_PROGRESS,
        ),
      },

      // Mock exam scores
      mockExamScores:
        getStorageItem<MockExamScore[]>(STORAGE_KEYS.MOCK_EXAM_SCORES) || [],

      // User preferences
      preferences: {
        locale: getStorageItem<string>(STORAGE_KEYS.LOCALE),
        userName: getStorageItem<string>(STORAGE_KEYS.USER_NAME),
      },
    };

    // Create JSON blob
    const jsonString = JSON.stringify(progressData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    // Generate filename with date
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const filename = `pmp_progress_backup_${date}.json`;

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export progress:", error);
    throw error;
  }
}

/**
 * Safely get a value from localStorage
 */
function getStorageItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
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
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Validate and sanitize imported PMP progress data using Zod
 * SECURITY: This function validates structure AND sanitizes all string values
 * to prevent XSS attacks from malicious import files
 *
 * @param data - Raw parsed JSON data
 * @returns Validated and sanitized data, or null if validation fails
 */
function validateAndSanitizeImportData(
  data: unknown,
): { success: true; data: PMPProgressData } | { success: false; errors: string[] } {
  const result = PMPProgressDataSchema.safeParse(data);

  if (!result.success) {
    // Extract user-friendly error messages from Zod errors
    const errors = result.error.errors.map((err) => {
      const path = err.path.join(".");
      return `Invalid ${path || "data"}: ${err.message}`;
    });
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

/**
 * @deprecated Use validateAndSanitizeImportData instead
 * Kept for backward compatibility - validates but doesn't sanitize
 */
function validateImportData(data: unknown): data is PMPProgressData {
  const result = PMPProgressDataSchema.safeParse(data);
  return result.success;
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
    message: "",
    importedItems: [],
    errors: [],
  };

  try {
    // Validate file type
    if (!file.name.endsWith(".json")) {
      result.errors.push("Invalid file type. Please select a JSON file.");
      result.message = "Import failed: Invalid file type";
      return result;
    }

    // Read and parse file
    const text = await file.text();
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(text);
    } catch {
      result.errors.push("Invalid JSON format. The file could not be parsed.");
      result.message = "Import failed: Invalid JSON format";
      return result;
    }

    // SECURITY: Validate AND sanitize data structure using Zod
    // This prevents XSS attacks from malicious import files
    const validationResult = validateAndSanitizeImportData(parsedData);
    if (!validationResult.success) {
      result.errors.push(
        "Invalid data structure. Please ensure you are importing a valid PMP progress backup file.",
        ...validationResult.errors.slice(0, 3), // Include first 3 specific errors
      );
      result.message = "Import failed: Invalid data structure";
      return result;
    }

    // Use the sanitized data from Zod validation
    const importData = validationResult.data;

    // Import domain progress
    if (importData.domainProgress) {
      if (
        setStorageItem(
          DASHBOARD_STORAGE_KEYS.DOMAIN_PROGRESS,
          importData.domainProgress,
        )
      ) {
        result.importedItems.push("Domain progress");
      } else {
        result.errors.push("Failed to save domain progress");
      }
    }

    // Import recent activity
    if (importData.recentActivity) {
      if (
        setStorageItem(
          DASHBOARD_STORAGE_KEYS.RECENT_ACTIVITY,
          importData.recentActivity,
        )
      ) {
        result.importedItems.push("Recent activity");
      } else {
        result.errors.push("Failed to save recent activity");
      }
    }

    // Import study stats
    const { studyStats } = importData;
    if (studyStats.totalStudyTime !== null) {
      if (
        setStorageItem(STORAGE_KEYS.TOTAL_STUDY_TIME, studyStats.totalStudyTime)
      ) {
        result.importedItems.push("Total study time");
      }
    }
    if (studyStats.studyStreak !== null) {
      if (setStorageItem(STORAGE_KEYS.STUDY_STREAK, studyStats.studyStreak)) {
        result.importedItems.push("Study streak");
      }
    }
    if (studyStats.lastStudyDate !== null) {
      if (
        setStorageItem(STORAGE_KEYS.LAST_STUDY_DATE, studyStats.lastStudyDate)
      ) {
        result.importedItems.push("Last study date");
      }
    }
    if (studyStats.studySessions !== null) {
      if (
        setStorageItem(STORAGE_KEYS.STUDY_SESSIONS, studyStats.studySessions)
      ) {
        result.importedItems.push("Study sessions");
      }
    }

    // Import flashcard progress
    const { flashcardProgress } = importData;
    if (
      setStorageItem(
        STORAGE_KEYS.FLASHCARDS_MASTERED_COUNT,
        flashcardProgress.masteredCount,
      )
    ) {
      result.importedItems.push("Flashcard mastered count");
    }
    if (flashcardProgress.masteredSet !== null) {
      if (
        setStorageItem(
          STORAGE_KEYS.FLASHCARDS_MASTERED,
          flashcardProgress.masteredSet,
        )
      ) {
        result.importedItems.push("Mastered flashcard set");
      }
    }
    if (
      setStorageItem(
        STORAGE_KEYS.FLASHCARDS_RECENT_REVIEWS,
        flashcardProgress.recentReviews,
      )
    ) {
      result.importedItems.push("Recent flashcard reviews");
    }
    if (flashcardProgress.cardProgress) {
      if (
        setStorageItem(
          STORAGE_KEYS.FLASHCARDS_CARD_PROGRESS,
          flashcardProgress.cardProgress,
        )
      ) {
        result.importedItems.push("Detailed flashcard SRS progress");
      }
    }

    // Import question progress
    const { questionProgress } = importData;
    if (questionProgress && questionProgress.cardProgress) {
      if (
        setStorageItem(
          STORAGE_KEYS.QUESTIONS_CARD_PROGRESS,
          questionProgress.cardProgress,
        )
      ) {
        result.importedItems.push("Detailed question SRS progress");
      }
    }

    // Import mock exam scores
    if (
      setStorageItem(STORAGE_KEYS.MOCK_EXAM_SCORES, importData.mockExamScores)
    ) {
      result.importedItems.push("Mock exam scores");
    } else {
      result.errors.push("Failed to save mock exam scores");
    }

    // Import preferences
    const { preferences } = importData;
    if (preferences.locale !== null) {
      if (setStorageItem(STORAGE_KEYS.LOCALE, preferences.locale)) {
        result.importedItems.push("Locale preference");
      }
    }
    if (preferences.userName !== null) {
      if (setStorageItem(STORAGE_KEYS.USER_NAME, preferences.userName)) {
        result.importedItems.push("User name");
      }
    }

    // Determine overall success
    if (result.errors.length === 0 || result.importedItems.length > 0) {
      result.success = true;
      const dateStr = new Date(importData.exportDate).toLocaleDateString();
      result.message = `Successfully imported ${result.importedItems.length} items from backup created on ${dateStr}`;
      if (result.errors.length > 0) {
        const errSuffix = result.errors.length > 1 ? "s" : "";
        result.message += ` (with ${result.errors.length} error${errSuffix})`;
      }
    } else {
      result.message = "Import failed: No data could be imported";
    }
  } catch (error) {
    result.success = false;
    result.message = "Import failed: An unexpected error occurred";
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
export async function importProgressFromFile(
  file: File,
): Promise<ImportResult> {
  // Validate file type
  if (!file.name.endsWith(".json")) {
    return {
      success: false,
      message: "Import failed: Invalid file type. Please select a JSON file.",
      importedItems: [],
      errors: ["Invalid file type"],
    };
  }

  // The actual import is handled by importProgress function
  // This function is kept for API compatibility but delegates to importProgress
  return importProgress(file);
}
