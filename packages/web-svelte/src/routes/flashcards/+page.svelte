<script lang="ts">
  import { onMount } from 'svelte';
  import LoadingState from "$lib/components/LoadingState.svelte";
  import ErrorState from "$lib/components/ErrorState.svelte";
  import ECOBadge from "$lib/components/ECOBadge.svelte";
  import {
    getMasteredCount,
    getRecentReviews,
    type FlashcardReview
  } from "$lib/utils/flashcardStorage";
  import { getFlashcards, getFlashcardStats, type PaginatedFlashcards, type FlashcardStats } from "$lib/utils/flashcardsData";

  // Local storage state
  let localMasteredCount = $state(0);
  let recentReviews: FlashcardReview[] = $state([]);
  let showRecentReviews = $state(false);

  // Data loading state
  let loading = $state(true);
  let flashcardsData: PaginatedFlashcards | null = $state(null);
  let statsData: FlashcardStats | null = $state(null);
  let error = $state(null);

  // Get URL params
  const urlParams = new URLSearchParams(window.location.search);
  let offset = $state(Number(urlParams.get("offset")) || 0);
  let limit = $state(Number(urlParams.get("limit")) || 20);

  function loadPrevious() {
    const newOffset = Math.max(0, offset - limit);
    window.location.search = `?offset=${newOffset}&limit=${limit}`;
  }

  function loadNext() {
    const newOffset = offset + limit;
    window.location.search = `?offset=${newOffset}&limit=${limit}`;
  }

  // Format date helper
  function formatReviewDate(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  // Get rating color
  function getRatingColor(rating: string): string {
    switch (rating) {
      case 'know_it':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'learning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dont_know':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Get rating label
  function getRatingLabel(rating: string): string {
    switch (rating) {
      case 'know_it':
        return 'Know It';
      case 'learning':
        return 'Learning';
      case 'dont_know':
        return "Don't Know";
      default:
        return rating;
    }
  }

  onMount(async () => {
    // Load data from localStorage
    localMasteredCount = getMasteredCount();
    recentReviews = getRecentReviews();

    // Load flashcards data from JSON files
    try {
      const [flashcardsResult, statsResult] = await Promise.all([
        getFlashcards({ limit, offset }),
        getFlashcardStats()
      ]);
      flashcardsData = flashcardsResult;
      statsData = statsResult;
    } catch (err) {
      console.error('Failed to load flashcards:', err);
      error = err instanceof Error ? err.message : 'Failed to load flashcards';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <LoadingState message="Loading flashcards..." />
{:else if error}
  <ErrorState
    title="Flashcards Error"
    message={error}
  />
{:else}
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- ECO Badge -->
      <div class="mb-6">
        <ECOBadge variant="compact" />
      </div>

      <h1 class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-8">Flashcards</h1>

      <!-- Stats -->
      {#if statsData}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-105 cursor-default">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Total Cards</h2>
            <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              {statsData.totalFlashcards || 0}
            </p>
          </div>
          <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 cursor-default">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Due Today</h2>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
              0
            </p>
          </div>
          <div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 cursor-default">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Mastered (Local)</h2>
            <p class="text-3xl font-bold text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
              {localMasteredCount || 0}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Stored in browser</p>
          </div>
        </div>
      {/if}

      <!-- Recent Reviews -->
      {#if recentReviews && recentReviews.length > 0}
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-8 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
          <div class="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Recent Reviews ({recentReviews.length})
            </h2>
            <button
              on:click={() => showRecentReviews = !showRecentReviews}
              class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:scale-105 hover:shadow-md hover:shadow-indigo-500/20 transition-all duration-300"
            >
              {showRecentReviews ? 'Hide' : 'Show'}
            </button>
          </div>

          {#if showRecentReviews}
            <div class="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {#each recentReviews as review}
                <div class="group px-6 py-3 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors duration-300">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:translate-x-1 transition-transform duration-300">
                        {review.cardFront}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatReviewDate(review.timestamp)}
                      </p>
                    </div>
                    <span
                      class="px-3 py-1 text-xs font-medium rounded-full border flex-shrink-0 {getRatingColor(review.rating)}"
                    >
                      {getRatingLabel(review.rating)}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Flashcards List -->
      {#if flashcardsData}
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
          <div class="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Your Flashcards ({flashcardsData.total} total)
            </h2>
          </div>

          <div class="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {#each flashcardsData.items as flashcard}
              <div class="group px-6 py-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors duration-300 cursor-default">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:translate-x-1 transition-transform duration-300">{flashcard.front}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{flashcard.back}</p>
              </div>
            {:else}
              <div class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No flashcards found
              </div>
            {/each}
          </div>

          <!-- Pagination -->
          {#if flashcardsData.total > flashcardsData.limit}
            <div class="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
              <button
                on:click={loadPrevious}
                disabled={flashcardsData.offset === 0}
                class="group px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                Previous
              </button>

              <span class="text-sm text-gray-700 dark:text-gray-300">
                Showing {flashcardsData.offset + 1} to {Math.min(flashcardsData.offset + flashcardsData.limit, flashcardsData.total)} of {flashcardsData.total}
              </span>

              <button
                on:click={loadNext}
                disabled={!flashcardsData.hasMore}
                class="group px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                Next
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
