/**
 * Analytics and Dashboard types
 */

export type ActivityType =
    | 'study_guide_view'
    | 'study_guide_complete'
    | 'flashcard_session'
    | 'flashcard_review'
    | 'practice_session'
    | 'mock_exam'
    | 'formula_practice';

export type ReadinessConfidence = 'low' | 'medium' | 'high';
export type RecommendationType =
    | 'review_flashcards'
    | 'practice_questions'
    | 'study_guide'
    | 'formula_practice';
export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface DashboardData {
    overallProgress: number;
    studyStreak: StudyStreak;
    totalStudyTime: number;
    domainProgress: DomainProgressStats[];
    recentActivity: RecentActivity[];
    upcomingReviews: UpcomingReview[];
    weakAreas: WeakArea[];
    examReadiness?: ReadinessScore;
}

export interface StudyStreak {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date | null;
}

export interface DomainProgressStats {
    domainId: string;
    domainName: string;
    studyGuideProgress: number;
    flashcardsMastered: number;
    flashcardsTotal: number;
    practiceAccuracy: number;
    questionsAttempted: number;
}

export interface RecentActivity {
    id: string;
    type: ActivityType;
    targetId: string;
    targetName: string;
    timestamp: Date;
    duration?: number;
    score?: number;
}

export interface UpcomingReview {
    type: 'flashcard' | 'question';
    id: string;
    title: string;
    domainName: string;
    dueDate: Date;
}

export interface WeakArea {
    domainId: string;
    domainName: string;
    taskId?: string;
    taskName?: string;
    accuracy: number;
    questionsAttempted: number;
    recommendation: string;
}

export interface ReadinessScore {
    score: number; // 0-100
    confidence: ReadinessConfidence;
    breakdown: {
        studyCompletion: number;
        practiceAccuracy: number;
        consistencyScore: number;
        weakAreasCovered: number;
    };
    recommendation: string;
}

export interface StudyRecommendation {
    type: RecommendationType;
    priority: RecommendationPriority;
    targetId: string;
    targetName: string;
    reason: string;
}

export interface StudyActivity {
    id: string;
    userId: string;
    activityType: ActivityType;
    targetId: string;
    durationMs: number;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}

export interface StudyStats {
    totalStudyTime: number;
    studyDays: number;
    averageSessionDuration: number;
    activitiesByType: Record<ActivityType, number>;
}
