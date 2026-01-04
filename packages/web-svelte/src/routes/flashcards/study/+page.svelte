<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { studyMode, type StudyModeStore } from '$lib/stores/studyMode';
  import { getFlashcardsByDomain, type Flashcard } from '$lib/utils/flashcardsData';
  import FlashcardStudyCard from '$lib/components/FlashcardStudyCard.svelte';
  import FlashcardRatingButtons from '$lib/components/FlashcardRatingButtons.svelte';
  import LoadingState from '$lib/components/LoadingState.svelte';
  import ErrorState from '$lib/components/ErrorState.svelte';

  // Page state
  let loading = $state(true);
  let error = $state<string | null>(null);
  let selectedDomain = $state<string>('all');
  let dueOnly = $state<boolean>(true);
  let shuffle = $state<boolean>(false);
  let allFlashcards: Flashcard[] = $state([]);

  // Study mode state
  let studyStarted = $state(false);
  let showOptions = $state(true);

  // Session stats when complete
  let sessionStats = $state<{
    total: number;
    reviewed: number;
    correct: number;
    ratings: { again: number; hard: number; good: number; easy: number };
  } | null>(null);

  // Domain filter options
  interface DomainFilter {
    id: string;
    label: string;
    color: string;
  }

  const DOMAIN_FILTERS: DomainFilter[] = [
    { id: 'all', label: 'All Domains', color: 'gray' },
    { id: 'people', label: 'People', color: 'blue' },
    { id: 'process', label: 'Process', color: 'green' },
    { id: 'business', label: 'Business Environment', color: 'purple' }
  ];

  // Get chip color classes
  function getChipClasses(filterId: string): string {
    const isSelected = selectedDomain === filterId;
    const baseClasses = "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ";

    if (filterId === 'all') {
      return isSelected
        ? baseClasses + "bg-gray-600 text-white shadow-lg shadow-gray-500/30 scale-105"
        : baseClasses + "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105";
    }
    if (filterId === 'people') {
      return isSelected
        ? baseClasses + "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
        : baseClasses + "bg-white/80 dark:bg-gray-800/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-105";
    }
    if (filterId === 'process') {
      return isSelected
        ? baseClasses + "bg-green-600 text-white shadow-lg shadow-green-500/30 scale-105"
        : baseClasses + "bg-white/80 dark:bg-gray-800/80 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 hover:scale-105";
    }
    // business
    return isSelected
      ? baseClasses + "bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
      : baseClasses + "bg-white/80 dark:bg-gray-800/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:scale-105";
  }

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
      const peopleCards = await getFlashcardsByDomain('people');
      const processCards = await getFlashcardsByDomain('process');
      const businessCards = await getFlashcardsByDomain('business');

      allFlashcards = [...peopleCards, ...processCards, ...businessCards];
    } catch (err) {
      console.error('Failed to load flashcards:', err);
      error = err instanceof Error ? err.message : 'Failed to load flashcards';
    } finally {
      loading = false;
    }
  });

  // Start study session
  function startStudy() {
    let cards = allFlashcards;

    // Filter by domain
    if (selectedDomain !== 'all') {
      cards = cards.filter(card => card.domainId === selectedDomain);
    }

    if (cards.length === 0) {
      error = 'No cards available for the selected options';
      return;
    }

    // Start the session
    const session = studyMode.startSession(cards, {
      dueOnly,
      shuffle,
    });

    if (session.cards.length === 0) {
      error = 'No cards due for review! Try disabling "Due only" to study all cards.';
      return;
    }

    studyStarted = true;
    showOptions = false;
    error = null;
  }

  // Handle card flip
  function handleFlip() {
    studyMode.flipCard();
  }

  // Handle card rating
  function handleRate(rating: 'again' | 'hard' | 'good' | 'easy') {
    studyMode.rateCard(rating);
  }

  // End session early
  function endSession() {
    studyMode.endSession();
    studyStarted = false;
    showOptions = true;
  }

  // Start new session
  function startNewSession() {
    studyMode.reset();
    sessionStats = null;
    studyStarted = false;
    showOptions = true;
  }

  // Go back to flashcards home
  function goBack() {
    studyMode.reset();
    goto('/flashcards');
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

  // Show keyboard shortcuts help
  let showShortcuts = $state(false);

  // Global keyboard shortcuts for navigation
  function handleKeydown(event: KeyboardEvent) {
    // Don't handle if typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Only handle during active study session
    if (!studyStarted || isComplete) return;

    switch (event.key) {
      case 'ArrowRight':
        // Skip to next card
        event.preventDefault();
        studyMode.nextCard();
        break;
      case 'Escape':
        // End session early
        event.preventDefault();
        endSession();
        break;
      case '?':
        // Toggle shortcuts help
        event.preventDefault();
        showShortcuts = !showShortcuts;
        break;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if loading}
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <LoadingState message="Loading flashcards..." />
  </div>
{:else if error && !studyStarted}
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <ErrorState
      title="Study Mode Error"
      message={error}
    />
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Header -->
      <div class="mb-8">
        <button
          onclick={goBack}
          class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Flashcards
        </button>

        <h1 class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          Study Mode
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Practice with spaced repetition for long-term retention
        </p>
      </div>

      <!-- Study Options -->
      {#if showOptions}
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Study Options</h2>

          <!-- Domain Filter -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Domain
            </label>
            <div class="flex flex-wrap gap-3">
              {#each DOMAIN_FILTERS as filter}
                <button
                  onclick={() => selectedDomain = filter.id}
                  class={getChipClasses(filter.id)}
                >
                  {filter.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- Additional Options -->
          <div class="space-y-4 mb-8">
            <label class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
              <input
                type="checkbox"
                bind:checked={dueOnly}
                class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div class="flex-1">
                <span class="font-medium text-gray-900 dark:text-gray-100">Due cards only</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">Only study cards that are due for review</p>
              </div>
            </label>

            <label class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
              <input
                type="checkbox"
                bind:checked={shuffle}
                class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div class="flex-1">
                <span class="font-medium text-gray-900 dark:text-gray-100">Shuffle cards</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">Randomize card order for this session</p>
              </div>
            </label>
          </div>

          <!-- Start Button -->
          <button
            onclick={startStudy}
            class="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02]"
          >
            Start Studying
          </button>
        </div>
      {/if}

      <!-- Study Session -->
      {#if studyStarted}
        <div class="flex flex-col items-center gap-8">
          <!-- Keyboard shortcuts hint -->
          {#if !isComplete}
            <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <button
                onclick={() => showShortcuts = !showShortcuts}
                class="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Press ? for shortcuts</span>
              </button>
            </div>
          {/if}

          <!-- Shortcuts modal -->
          {#if showShortcuts}
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onclick={() => showShortcuts = false}>
              <div
                class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
                onclick={(e) => e.stopPropagation()}
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h3>
                  <button
                    onclick={() => showShortcuts = false}
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span class="text-gray-700 dark:text-gray-300">Flip card</span>
                    <kbd class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono">Space</kbd>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span class="text-gray-700 dark:text-gray-300">Rate: Again</span>
                    <kbd class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono">1</kbd>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span class="text-gray-700 dark:text-gray-300">Rate: Hard</span>
                    <kbd class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono">2</kbd>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span class="text-gray-700 dark:text-gray-300">Rate: Good</span>
                    <kbd class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono">3</kbd>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span class="text-gray-700 dark:text-gray-300">Rate: Easy</span>
                    <kbd class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono">4</kbd>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span class="text-gray-700 dark:text-gray-300">Skip card</span>
                    <kbd class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono">→</kbd>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span class="text-gray-700 dark:text-gray-300">End session</span>
                    <kbd class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono">Esc</kbd>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span class="text-gray-700 dark:text-gray-300">Close this help</span>
                    <kbd class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono">?</kbd>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <FlashcardStudyCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            currentIndex={currentIndex}
            totalCards={totalCards}
          />

          <FlashcardRatingButtons
            visible={isFlipped}
            onRate={handleRate}
          />

          <!-- End Session Button -->
          {#if !isComplete}
            <button
              onclick={endSession}
              class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              End Session Early
            </button>
          {/if}
        </div>
      {/if}

      <!-- Session Complete -->
      {#if isComplete && sessionStats}
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
          <div class="mb-6">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <svg class="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Session Complete!
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Great job on completing this study session
            </p>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {sessionStats.total}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Cards</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <p class="text-3xl font-bold text-green-600 dark:text-green-400">
                {sessionStats.reviewed}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Reviewed</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {getAccuracyPercent()}%
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {sessionStats.ratings.good + sessionStats.ratings.easy}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Good/Easy</p>
            </div>
          </div>

          <!-- Rating Breakdown -->
          <div class="flex flex-wrap justify-center gap-3 mb-8">
            <div class="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full">
              <span class="text-red-600 dark:text-red-400 font-semibold">{sessionStats.ratings.again}</span>
              <span class="text-sm text-gray-600 dark:text-gray-400">Again</span>
            </div>
            <div class="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-full">
              <span class="text-orange-600 dark:text-orange-400 font-semibold">{sessionStats.ratings.hard}</span>
              <span class="text-sm text-gray-600 dark:text-gray-400">Hard</span>
            </div>
            <div class="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
              <span class="text-blue-600 dark:text-blue-400 font-semibold">{sessionStats.ratings.good}</span>
              <span class="text-sm text-gray-600 dark:text-gray-400">Good</span>
            </div>
            <div class="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
              <span class="text-green-600 dark:text-green-400 font-semibold">{sessionStats.ratings.easy}</span>
              <span class="text-sm text-gray-600 dark:text-gray-400">Easy</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onclick={startNewSession}
              class="py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-300"
            >
              Start New Session
            </button>
            <button
              onclick={goBack}
              class="py-3 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all duration-300"
            >
              Back to Flashcards
            </button>
          </div>
        </div>
      {/if}

    </div>
  </div>
{/if}
