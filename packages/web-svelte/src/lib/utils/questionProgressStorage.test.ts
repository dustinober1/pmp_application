
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    toggleQuestionFlag,
    isQuestionFlagged,
    getFlaggedQuestions,
    saveQuestionProgress,
    clearAllQuestionProgress,
    getQuestionProgress
} from './questionProgressStorage';
import { STORAGE_KEYS } from '$lib/constants/storageKeys';

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

describe('questionProgressStorage - Flagging', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.restoreAllMocks();
        global.localStorage = localStorageMock as any;
        clearAllQuestionProgress();
    });

    it('should toggle flag on a simplified question', () => {
        const qId = 'q-101';

        // Initially not flagged
        expect(isQuestionFlagged(qId)).toBe(false);

        // Toggle on
        const isFlagged = toggleQuestionFlag(qId);
        expect(isFlagged).toBe(true);
        expect(isQuestionFlagged(qId)).toBe(true);

        const progress = getQuestionProgress(qId);
        expect(progress?.flagged).toBe(true);

        // Toggle off
        const isFlaggedAgain = toggleQuestionFlag(qId);
        expect(isFlaggedAgain).toBe(false);
        expect(isQuestionFlagged(qId)).toBe(false);
    });

    it('should retrieve all flagged questions', () => {
        saveQuestionProgress('q-1', { cardId: 'q-1', flagged: true } as any);
        saveQuestionProgress('q-2', { cardId: 'q-2', flagged: false } as any);
        saveQuestionProgress('q-3', { cardId: 'q-3', flagged: true } as any);

        const flagged = getFlaggedQuestions();
        expect(flagged).toHaveLength(2);
        expect(flagged).toContain('q-1');
        expect(flagged).toContain('q-3');
        expect(flagged).not.toContain('q-2');
    });

    it('should handle uninitialized questions gracefully', () => {
        expect(isQuestionFlagged('non-existent')).toBe(false);

        // Toggling non-existent should initialize it
        toggleQuestionFlag('non-existent');
        expect(isQuestionFlagged('non-existent')).toBe(true);
    });
});
