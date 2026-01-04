<script lang="ts">
  export let data;

  import { onMount } from 'svelte';
  import LoadingState from "$lib/components/LoadingState.svelte";
  import ErrorState from "$lib/components/ErrorState.svelte";
  import ECOBadge from "$lib/components/ECOBadge.svelte";
  import {
    getMasteredCount,
    getRecentReviews,
    type FlashcardReview
  } from "$lib/utils/flashcardStorage";

  // Local storage state
  let localMasteredCount = 0;
  let recentReviews: FlashcardReview[] = [];
  let showRecentReviews = false;

  function loadPrevious() {
    const offset = Math.max(0, (data.flashcards?.offset || 0) - (data.flashcards?.limit || 20));
    window.location.search = `?offset=${offset}&limit=${data.flashcards?.limit || 20}`;
  }

  function loadNext() {
    const offset = (data.flashcards?.offset || 0) + (data.flashcards?.limit || 20);
    window.location.search = `?offset=${offset}&limit=${data.flashcards?.limit || 20}`;
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

  onMount(() => {
    // Load data from localStorage
    localMasteredCount = getMasteredCount();
    recentReviews = getRecentReviews();
  });
</script>

{#if !data.flashcards}
  <LoadingState message="Loading flashcards..." />
{:else if data.error}
  <ErrorState
    title="Flashcards Error"
    message={data.error}
  />
{:else}
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- ECO Badge -->
      <div class="mb-6">
        <ECOBadge variant="compact" />
      </div>

      <h1 class="text-3xl font-bold text-gray-900 mb-8">Flashcards</h1>

      <!-- Stats -->
      {#if data.stats}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">Total Cards</h2>
            <p class="text-3xl font-bold text-indigo-600">
              {data.stats.totalCards || 0}
            </p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">Due Today</h2>
            <p class="text-3xl font-bold text-green-600">
              {data.stats.dueToday || 0}
            </p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">Mastered (Local)</h2>
            <p class="text-3xl font-bold text-purple-600">
              {localMasteredCount || 0}
            </p>
            <p class="text-xs text-gray-500 mt-1">Stored in browser</p>
          </div>
        </div>
      {/if}

      <!-- Recent Reviews -->
      {#if recentReviews && recentReviews.length > 0}
        <div class="bg-white rounded-lg shadow mb-8">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">
              Recent Reviews ({recentReviews.length})
            </h2>
            <button
              on:click={() => showRecentReviews = !showRecentReviews}
              class="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {showRecentReviews ? 'Hide' : 'Show'}
            </button>
          </div>

          {#if showRecentReviews}
            <div class="divide-y divide-gray-200">
              {#each recentReviews as review}
                <div class="px-6 py-3 hover:bg-gray-50">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {review.cardFront}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">
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
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">
            Your Flashcards ({data.flashcards.total} total)
          </h2>
        </div>

        <div class="divide-y divide-gray-200">
          {#each data.flashcards.items as flashcard}
            <div class="px-6 py-4 hover:bg-gray-50">
              <p class="text-sm font-medium text-gray-900">{flashcard.front}</p>
              <p class="text-sm text-gray-600 mt-1">{flashcard.back}</p>
            </div>
          {:else}
            <div class="px-6 py-4 text-center text-gray-500">
              No flashcards found
            </div>
          {/each}
        </div>

        <!-- Pagination -->
        {#if data.flashcards.total > data.flashcards.limit}
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              on:click={loadPrevious}
              disabled={data.flashcards.offset === 0}
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span class="text-sm text-gray-700">
              Showing {data.flashcards.offset + 1} to {Math.min(data.flashcards.offset + data.flashcards.limit, data.flashcards.total)} of {data.flashcards.total}
            </span>

            <button
              on:click={loadNext}
              disabled={!data.flashcards.hasMore}
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
