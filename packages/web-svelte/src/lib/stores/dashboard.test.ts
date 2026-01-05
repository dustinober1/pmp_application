
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { domainProgressStore, overallProgress } from './dashboard';
import { STORAGE_KEYS } from '../constants/storageKeys';

// Mock dependencies
vi.mock('../constants/storageKeys', () => ({
    STORAGE_KEYS: {
        DOMAIN_PROGRESS: 'test_pmp_domain_progress',
        FLASHCARDS_CARD_PROGRESS: 'test_pmp_flashcards_card_progress',
        QUESTIONS_CARD_PROGRESS: 'test_pmp_questions_card_progress'
    }
}));

// Mock dynamic import of flashcardsData
vi.mock('../utils/flashcardsData', () => ({
    getFlashcardStats: vi.fn().mockResolvedValue({
        domainBreakdown: [
            { domainId: 'People (33%)', totalFlashcards: 50 },
            { domainId: 'Process (50%)', totalFlashcards: 40 },
            { domainId: 'Business', totalFlashcards: 10 }
        ]
    })
}));

describe('dashboard store', () => {
    beforeEach(() => {
        // Clear storage
        window.localStorage.clear();
        vi.clearAllMocks();
        domainProgressStore.reset();
    });

    it('should initialize with default values', () => {
        const state = get(domainProgressStore);
        expect(state.domains.length).toBe(3);
        expect(state.domains[0].flashcardsTotal).toBe(0); // Before refresh
    });

    it('should update totals from manifest on refresh', async () => {
        // Setup mock data in localStorage for mastered cards
        const cardProgress = {
            'people-task1-1': { repetitions: 2, interval: 1 }, // Mastered
            'people-task1-2': { repetitions: 0, interval: 0 }, // Not mastered
            'process-task1-1': { repetitions: 3, interval: 5 } // Mastered
        };
        window.localStorage.setItem('test_pmp_flashcards_card_progress', JSON.stringify(cardProgress));

        await domainProgressStore.refreshFromActualData();

        const state = get(domainProgressStore);
        const people = state.domains.find(d => d.domainId === 'people');
        const process = state.domains.find(d => d.domainId === 'process');
        const business = state.domains.find(d => d.domainId === 'business');

        // Check dynamic totals from mock
        expect(people?.flashcardsTotal).toBe(50);
        expect(process?.flashcardsTotal).toBe(40);
        expect(business?.flashcardsTotal).toBe(10);

        // Check mastered counts
        expect(people?.flashcardsMastered).toBe(1);
        expect(process?.flashcardsMastered).toBe(1);
        expect(business?.flashcardsMastered).toBe(0);
    });

    it('should calculate overall progress correctly', async () => {
        // Setup mock data
        const cardProgress = {
            // All 50 people cards mastered (100% flashcard progress)
            // Study guide 0%
            // Domain progress = (0 + 100) / 2 = 50%
        };

        // We can just update the domain store directly to test overall calculation logic 
        // without relying on refresh logic complexity for this specific test
        domainProgressStore.updateDomain('people', {
            studyGuideProgress: 50,
            flashcardsMastered: 25,
            flashcardsTotal: 50
        });
        // People: (50 + (25/50)*100) / 2 = (50 + 50) / 2 = 50%

        domainProgressStore.updateDomain('process', {
            studyGuideProgress: 100,
            flashcardsMastered: 40,
            flashcardsTotal: 40
        });
        // Process: (100 + (40/40)*100) / 2 = (100 + 100) / 2 = 100%

        domainProgressStore.updateDomain('business', {
            studyGuideProgress: 0,
            flashcardsMastered: 0,
            flashcardsTotal: 10
        });
        // Business: (0 + 0) / 2 = 0%

        // Overall: (50 + 100 + 0) / 3 = 50%

        const overall = get(overallProgress);
        expect(overall).toBe(50);
    });
});
