/**
 * Shared Type Definitions
 * 
 * Addresses Issue #15: Frontend Type Safety
 */

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'USER' | 'ADMIN';
    createdAt?: string;
}

export interface Domain {
    id: string;
    name: string;
    description: string;
    color: string;
}

export interface PracticeTest {
    id: string;
    name: string;
    description: string;
    totalQuestions: number;
    timeLimitMinutes: number;
    isActive: boolean;
    createdAt: string;
    testQuestions?: TestQuestion[];
    _count?: {
        sessions: number;
    };
}

export interface Question {
    id: string;
    questionText: string;
    scenario?: string;
    choices: string[];
    correctAnswerIndex: number;
    explanation: string;
    domainId: string;
    difficulty: string;
    methodology: string;
    domain?: Domain;
}

export interface TestQuestion {
    id: string;
    testId: string;
    questionId: string;
    orderIndex: number;
    question: Question;
}

export interface UserTestSession {
    id: string;
    userId: string;
    testId: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    startedAt: string;
    completedAt?: string;
    timeLimitMinutes: number;
    score?: number;
    totalQuestions: number;
    correctAnswers?: number;
    test: {
        id: string;
        name: string;
        description: string;
        testQuestions: TestQuestion[];
    };
}

export interface DomainMastery {
    domainId: string;
    name: string;
    questionsAnswered: number;
    correctPercentage: number;
}

export interface UserAnswer {
    id: string;
    sessionId: string;
    questionId: string;
    selectedAnswerIndex: number;
    isCorrect: boolean;
    isFlagged: boolean;
    timeSpentSeconds: number;
    question?: Question;
}

export interface UserStats {
    totalQuestionsAnswered: number;
    averageScore: number;
    testsCompleted: number;
    studyStreak: number;
    domainMastery: DomainMastery[];
}

export interface UserProgress {
    id: string;
    userId: string;
    domainId: string;
    questionsAnswered: number;
    questionsCorrect: number;
    masteryLevel: number;
    lastActivity: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
    refreshToken: string;
}

export interface DomainBreakdown {
    name: string;
    color: string;
    total: number;
    correct: number;
}

export interface ReviewQuestion {
    id: string;
    questionText: string;
    scenario?: string | null;
    choices: string[];
    correctAnswerIndex: number;
    selectedAnswerIndex: number;
    isCorrect: boolean;
    isFlagged: boolean;
    explanation: string;
    timeSpentSeconds: number;
    domain: {
        name: string;
        color: string;
    };
}

export interface SessionReview {
    session: {
        id: string;
        testName: string;
        completedAt: string;
        score: number;
        totalQuestions: number;
        correctAnswers: number;
    };
    analytics: {
        totalTimeSpent: number;
        avgTimePerQuestion: number;
        slowestQuestions: { questionId: string; time: number }[];
        domainBreakdown: DomainBreakdown[];
    };
    questions: ReviewQuestion[];
    flaggedQuestions: ReviewQuestion[];
    incorrectQuestions: ReviewQuestion[];
}

export interface APIError {
    error: {
        message: string;
        code?: string;
        status?: number;
    };
}
