<script lang="ts">
 import { onMount } from 'svelte';
 import { goto } from '$app/navigation';
 import { base } from '$app/paths';
 import { page } from '$app/stores';
 import { studyMode } from '$lib/stores/studyMode';
 import { getFlashcardsByDomain, prefetchDomains, type Flashcard } from '$lib/utils/flashcardsData';
 import { updateStudyStreak } from '$lib/utils/studySession';
 import FlashcardStudyCard from '$lib/components/FlashcardStudyCard.svelte';
 import FlashcardRatingButtons from '$lib/components/FlashcardRatingButtons.svelte';
 import LoadingState from '$lib/components/LoadingState.svelte';
 import ErrorState from '$lib/components/ErrorState.svelte';

 // Page state
 let loading = $state(true);
 let error = $state<string | null>(null);
 let allFlashcards: Flashcard[] = $state([]);

 // Study mode state
 let studyStarted = $state(false);

 // Session stats when complete
 let sessionStats = $state<{
 total: number;
 reviewed: number;
 correct: number;
 ratings: { again: number; hard: number; good: number; easy: number };
 } | null>(null);

 // Subscribe to store changes
 let storeState = $state(studyMode.getState());
 $effect(() => {
 const unsub = studyMode.subscribe((state) => {
 storeState = state;

 if (state.isComplete && state.session?.completedAt) {
 sessionStats = state.session.stats;
 }
 });

 return unsub;
 });

 // Load flashcards on mount
 onMount(async () => {
 try {
 // Load all domains to have a full pool for SRS selection
 const [peopleCards, processCards, businessCards] = await Promise.all([
 getFlashcardsByDomain('people'),
 getFlashcardsByDomain('process'),
 getFlashcardsByDomain('business')
 ]);
 
 allFlashcards = [...peopleCards, ...processCards, ...businessCards];
 loading = false;

 // Automatically start practice session with 25 questions prioritized by SRS
 startPractice();
 } catch (err) {
 console.error('Failed to load flashcards:', err);
 error = err instanceof Error ? err.message : 'Failed to load flashcards';
 loading = false;
 }
 });

 // Start practice session
 function startPractice() {
 if (allFlashcards.length === 0) {
 error = 'No cards available for practice';
 return;
 }

 // Get limit from URL query params, default to 25
 const limitParam = $page.url.searchParams.get('limit');
 const limit = limitParam ? parseInt(limitParam, 10) : 25;

 // Start the session with requested questions, prioritized by SRS
 studyMode.startSession(allFlashcards, {
 dueOnly: false, // Include all cards but prioritize due ones
 priority: 'srs',
 limit: isNaN(limit) ? 25 : limit
 });

 studyStarted = true;
 error = null;
 }

 // Handle card flip
 function handleFlip() {
 studyMode.flipCard();
 }

 // Handle card rating
 function handleRate(rating: 'again' | 'hard' | 'good' | 'easy') {
 studyMode.rateCard(rating);
 updateStudyStreak();
 }

 // End session early
 function endSession() {
 studyMode.endSession();
 studyStarted = false;
 }

 // Go back to flashcards home
 function goBack() {
 studyMode.reset();
 goto(`${base}/flashcards`);
 }

 // Calculate accuracy percentage
 function getAccuracyPercent(): number {
 if (!sessionStats || sessionStats.reviewed === 0) return 0;
 return Math.round((sessionStats.correct / sessionStats.reviewed) * 100);
 }

 // Computed values from store
 let currentIndex = $derived(storeState?.session?.currentIndex ?? 0);
 let totalCards = $derived(storeState?.session?.cards.length ?? 0);
 let currentCard = $derived(storeState?.currentCard ?? null);
 let isFlipped = $derived(storeState?.isFlipped ?? false);
 let isComplete = $derived(storeState?.isComplete ?? false);

 // Global keyboard shortcuts
 function handleKeydown(event: KeyboardEvent) {
 if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
 if (!studyStarted || isComplete) return;

 if (event.key === 'ArrowRight') {
 event.preventDefault();
 studyMode.nextCard();
 } else if (event.key === 'Escape') {
 event.preventDefault();
 endSession();
 }
 }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
 <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

 <!-- Header -->
 <div class="mb-8 flex items-center justify-between">
 <div>
 <button
 onclick={goBack}
 class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-2"
 >
 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
 </svg>
 Back to Flashcards
 </button>
 <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
 SRS Practice Mode
 </h1>
 </div>
 
 {#if studyStarted && !isComplete}
 <div class="text-right">
 <div class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Progress</div>
 <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
 {currentIndex + 1} <span class="text-gray-400 dark:text-gray-600">/</span> {totalCards}
 </div>
 </div>
 {/if}
 </div>

 {#if loading}
 <div class="flex flex-col items-center justify-center py-20">
 <LoadingState message="Preparing your practice session..." />
 </div>
 {:else if error}
 <ErrorState title="Practice Error" message={error} />
 <div class="mt-8 text-center">
 <button
 onclick={goBack}
 class="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
 >
 Return to Flashcards
 </button>
 </div>
 {:else if isComplete && sessionStats}
 <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8 text-center max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div class="mb-6">
 <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
 <svg class="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
 </svg>
 </div>
 <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Practice Complete!</h2>
 <p class="text-gray-600 dark:text-gray-400">You've completed your 25-question SRS session.</p>
 </div>

 <div class="grid grid-cols-2 gap-4 mb-8">
 <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
 <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{sessionStats.reviewed}</p>
 <p class="text-sm text-gray-600 dark:text-gray-400">Questions</p>
 </div>
 <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
 <p class="text-3xl font-bold text-green-600 dark:text-green-400">{getAccuracyPercent()}%</p>
 <p class="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
 </div>
 </div>

 <div class="flex flex-col sm:flex-row gap-4 justify-center">
 <button
 onclick={() => { studyMode.reset(); startPractice(); }}
 class="py-3 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
 >
 Practice Again
 </button>
 <button
 onclick={goBack}
 class="py-3 px-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all"
 >
 Finish
 </button>
 </div>
 </div>
 {:else if studyStarted}
 <div class="flex flex-col items-center gap-8 animate-in fade-in duration-500">
 <FlashcardStudyCard
 card={currentCard}
 isFlipped={isFlipped}
 onFlip={handleFlip}
 currentIndex={currentIndex}
 totalCards={totalCards}
 />

 <div class="w-full max-w-xl">
 <FlashcardRatingButtons
 visible={isFlipped}
 onRate={handleRate}
 />
 </div>

 <button
 onclick={endSession}
 class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
 >
 End Session Early
 </button>
 </div>
 {/if}

 </div>
</div>
