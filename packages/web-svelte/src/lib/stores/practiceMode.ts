/**
 * Practice mode store for test questions
 * Manages practice sessions with SM-2 spaced repetition
 */

import { writable, derived, get } from 'svelte/store';
import type { PracticeQuestion, AnswerResult, CardProgress, SM2Rating } from '@pmp/shared';
import { getAllQuestionProgress, updateQuestionProgress, isQuestionDue } from '$lib/utils/questionProgressStorage';

// Store state
interface PracticeModeState {
    sessionId: string | null;
    questions: PracticeQuestion[];
    currentIndex: number;
    isComplete: boolean;
    correctCount: number;
    startedAt: string | null;
}

const initialState: PracticeModeState = {
    sessionId: null,
    questions: [],
    currentIndex: 0,
    isComplete: false,
    correctCount: 0,
    startedAt: null,
};

function createPracticeModeStore() {
    const { subscribe, set, update } = writable<PracticeModeState>(initialState);

    return {
        subscribe,

        /**
         * Start a new practice session
         */
        startSession(questions: PracticeQuestion[], options?: { limit?: number; priority?: 'srs' | 'shuffle' | 'none' }) {
            const sessionId = crypto.randomUUID();
            const now = new Date().toISOString();

            // Get all question progress
            const progressRecord = getAllQuestionProgress();

            let selectedQuestions = [...questions];

            // Always shuffle first to ensure randomness among equal priority questions
            for (let i = selectedQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
            }

            // Prioritize questions
            if (options?.priority === 'srs') {
                selectedQuestions.sort((a, b) => {
                    const progA = progressRecord[a.id];
                    const progB = progressRecord[b.id];
                    if (!progA && !progB) return 0;
                    if (!progA) return -1;
                    if (!progB) return 1;
                    return new Date(progA.nextReviewDate).getTime() - new Date(progB.nextReviewDate).getTime();
                });
            }

            // Apply limit
            if (options?.limit && options.limit > 0) {
                selectedQuestions = selectedQuestions.slice(0, options.limit);
            }

            const newState: PracticeModeState = {
                sessionId,
                questions: selectedQuestions,
                currentIndex: 0,
                isComplete: false,
                correctCount: 0,
                startedAt: now,
            };

            set(newState);
            return sessionId;
        },

        /**
         * Submit an answer and update SRS
         */
        submitAnswer(selectedOptionId: string) {
            update((state) => {
                if (!state.sessionId || state.isComplete) return state;

                const currentQuestion = state.questions[state.currentIndex];
                const isCorrect = selectedOptionId === currentQuestion.correctOptionId;

                // Map correct/incorrect to SM-2 rating
                // Correct -> Good (4), Incorrect -> Again (1)
                const rating: SM2Rating = isCorrect ? 'good' : 'again';

                // Update SRS progress
                updateQuestionProgress(currentQuestion.id, rating);

                const newCorrectCount = isCorrect ? state.correctCount + 1 : state.correctCount;

                return {
                    ...state,
                    correctCount: newCorrectCount
                };
            });
        },

        /**
         * Move to the next question
         */
        nextQuestion() {
            update((state) => {
                const nextIndex = state.currentIndex + 1;
                const isComplete = nextIndex >= state.questions.length;

                return {
                    ...state,
                    currentIndex: isComplete ? state.currentIndex : nextIndex,
                    isComplete
                };
            });
        },

        /**
         * Reset the store
         */
        reset() {
            set(initialState);
        }
    };
}

export const practiceMode = createPracticeModeStore();

// Derived stores
export const currentQuestion = derived(practiceMode, ($store) =>
    $store.questions[$store.currentIndex] || null
);

export const practiceProgress = derived(practiceMode, ($store) => {
    if ($store.questions.length === 0) return 0;
    return Math.round(($store.currentIndex / $store.questions.length) * 100);
});

export const sessionStats = derived(practiceMode, ($store) => ({
    total: $store.questions.length,
    current: $store.currentIndex + 1,
    correct: $store.correctCount,
    percentage: $store.questions.length > 0 ? Math.round(($store.correctCount / ($store.currentIndex + 1)) * 100) : 0
}));
