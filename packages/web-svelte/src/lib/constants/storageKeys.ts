/**
 * Centralized storage keys for localStorage
 * All localStorage keys should be defined here to avoid conflicts and duplication
 */

export const STORAGE_KEYS = {
  // Study tracking
  TOTAL_STUDY_TIME: "pmp_total_study_time_ms",
  STUDY_STREAK: "pmp_study_streak",
  LAST_STUDY_DATE: "pmp_last_study_date",
  STUDY_SESSIONS: "pmp_study_sessions",

  // Flashcard progress
  FLASHCARDS_MASTERED: "pmp_flashcards_mastered",
  FLASHCARDS_MASTERED_COUNT: "pmp_flashcards_mastered_count",
  FLASHCARDS_RECENT_REVIEWS: "pmp_flashcards_recent_reviews",
  FLASHCARDS_CARD_PROGRESS: "pmp_flashcards_card_progress",

  // Mock exams
  MOCK_EXAMS: "pmp_mock_exams",
  MOCK_EXAM_SCORES: "pmp_mock_exam_scores",

  // Practice sessions
  PRACTICE_SESSIONS: "pmp_practice_sessions",

  // Dashboard
  DOMAIN_PROGRESS: "pmp_domain_progress_2026",
  RECENT_ACTIVITY: "pmp_recent_activity",
  OVERALL_PROGRESS: "pmp_overall_progress",

  // Internationalization
  LOCALE: "pmp_locale",

  // User preferences
  USER_NAME: "pmp_user_name",

  // Question progress
  QUESTIONS_CARD_PROGRESS: "pmp_questions_card_progress",
} as const;
