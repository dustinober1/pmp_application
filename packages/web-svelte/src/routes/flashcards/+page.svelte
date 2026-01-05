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
  import {
    getFlashcardStats,
    type Flashcard,
    type FlashcardStats
  } from "$lib/utils/flashcardsData";
  import { getCardProgressStats } from "$lib/utils/cardProgressStorage";
  import { goto } from '$app/navigation';
  import { usePagination } from '$lib/composables';

  // Domain filter options
  interface DomainFilter {
    id: string;
    label: string;
    color: string;
  }

  const DOMAIN_FILTERS: DomainFilter[] = [
    { id: 'all', label: 'All', color: 'gray' },
    { id: 'people', label: 'People', color: 'blue' },
    { id: 'process', label: 'Process', color: 'green' },
    { id: 'business', label: 'Business Environment', color: 'purple' }
  ];

  // Local storage state
  let localMasteredCount = $state(0);
  let dueTodayCount = $state(0);
  let recentReviews: FlashcardReview[] = $state([]);
  let showRecentReviews = $state(false);

  // Data loading state
  let loading = $state(true);
  let allFlashcards: Flashcard[] = $state([]);
  let filteredFlashcards: Flashcard[] = $state([]);
  let statsData: FlashcardStats | null = $state(null);
  let error = $state(null);

  // Domain filter state
  let selectedDomain = $state<string>('all');

  // Search state
  let searchQuery = $state('');
  let searchInput = $state('');

  // Pagination - will be initialized with filteredFlashcards after data loads
  // Note: Not wrapped in $state() to avoid infinite re-render loops
  let pagination = usePagination({ items: [] as Flashcard[], pageSize: 20 });

  // Reactive state for triggering updates when pagination changes
  let paginationVersion = $state(0);

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

  // Apply domain filter
  function applyDomainFilter() {
    if (selectedDomain === 'all') {
      filteredFlashcards = allFlashcards;
    } else {
      filteredFlashcards = allFlashcards.filter(card => card.domainId === selectedDomain);
    }
    // Re-apply search if there's an active search
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      filteredFlashcards = filteredFlashcards.filter(card =>
        card.front.toLowerCase().includes(q) ||
        card.back.toLowerCase().includes(q) ||
        card.category.toLowerCase().includes(q) ||
        card.domain.toLowerCase().includes(q) ||
        card.task.toLowerCase().includes(q)
      );
    }
    // Reset pagination when filter changes
    pagination.reset();
    // Update pagination with new filtered items
    pagination.setItems(filteredFlashcards);
    paginationVersion++;
  }

  // Search function
  function searchFlashcards(query: string) {
    searchQuery = query;
    const q = query.toLowerCase().trim();

    let baseFlashcards = allFlashcards;

    // Apply domain filter first
    if (selectedDomain !== 'all') {
      baseFlashcards = baseFlashcards.filter(card => card.domainId === selectedDomain);
    }

    if (!q) {
      filteredFlashcards = baseFlashcards;
    } else {
      filteredFlashcards = baseFlashcards.filter(card =>
        card.front.toLowerCase().includes(q) ||
        card.back.toLowerCase().includes(q) ||
        card.category.toLowerCase().includes(q) ||
        card.domain.toLowerCase().includes(q) ||
        card.task.toLowerCase().includes(q)
      );
    }
    // Reset pagination when search changes
    pagination.reset();
    // Update pagination with new filtered items
    pagination.setItems(filteredFlashcards);
    paginationVersion++;
  }

  // Debounced search
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;
  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    searchInput = target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchFlashcards(searchInput);
    }, 300);
  }

  function clearSearch() {
    searchInput = '';
    searchQuery = '';
    applyDomainFilter();
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

  // Pagination navigation wrappers that trigger reactivity
  function goToPreviousPage() {
    pagination.previous();
    paginationVersion++;
  }

  function goToNextPage() {
    pagination.next();
    paginationVersion++;
  }

  // Computed pagination values (reactive via paginationVersion dependency)
  let displayItems = $derived(() => {
    paginationVersion; // Depend on version to trigger recomputation
    return pagination.displayItems;
  });

  let currentPageInfo = $derived(() => {
    paginationVersion;
    return pagination.currentPageInfo;
  });

  let hasMore = $derived(() => {
    paginationVersion;
    return pagination.hasMore;
  });

  let canGoBack = $derived(() => {
    paginationVersion;
    return pagination.offset > 0;
  });

  onMount(async () => {
    // Load data from localStorage first (fast, synchronous)
    localMasteredCount = getMasteredCount();
    recentReviews = getRecentReviews();

    // Load flashcards data from JSON files
    try {
      // Load stats and all flashcards in a more efficient way
      // processFlashcards() will load and cache the data, so we only load once
      const [statsResult, flashcardsResult] = await Promise.all([
        getFlashcardStats(),
        import('$lib/utils/flashcardsData').then(m => m.processFlashcards())
      ]);
      
      statsData = statsResult;
      allFlashcards = flashcardsResult;
      filteredFlashcards = allFlashcards;

      // Initialize pagination with loaded flashcards
      pagination = usePagination({ items: filteredFlashcards, pageSize: 20 });
      
      // Mark as loaded before expensive calculations
      loading = false;

      // Calculate due today from localStorage card progress (deferred, non-blocking)
      // Use setTimeout to allow the UI to render first
      setTimeout(() => {
        const allCardIds = allFlashcards.map(card => card.id);
        const cardStats = getCardProgressStats(allCardIds);
        dueTodayCount = cardStats.cardsDue;
      }, 0);
    } catch (err) {
      console.error('Failed to load flashcards:', err);
      error = err instanceof Error ? err.message : 'Failed to load flashcards';
      loading = false;
    }
  });

  // Watch for domain filter changes
  $effect(() => {
    if (allFlashcards.length > 0) {
      applyDomainFilter();
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

      <h1 class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-6">Flashcards</h1>

      <!-- Study Mode Button -->
      <a
        href="/flashcards/study"
        class="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] mb-8"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Start Study Mode</span>
        <span class="text-sm opacity-90 font-normal">{dueTodayCount > 0 ? `(${dueTodayCount} due)` : '(spaced repetition)'}</span>
      </a>

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
              {dueTodayCount}
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

      <!-- Domain Filter Chips -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 mb-8 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
        <h2 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter by Domain</h2>
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
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Showing {filteredFlashcards.length} {selectedDomain === 'all' ? 'total' : DOMAIN_FILTERS.find(f => f.id === selectedDomain)?.label} flashcards
        </p>
      </div>

      <!-- Recent Reviews -->
      {#if recentReviews && recentReviews.length > 0}
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-8 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
          <div class="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Recent Reviews ({recentReviews.length})
            </h2>
            <button
              onclick={() => showRecentReviews = !showRecentReviews}
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
      {#if allFlashcards.length > 0}
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
          <!-- Search Header -->
          <div class="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                {selectedDomain === 'all' ? 'All Flashcards' : DOMAIN_FILTERS.find(f => f.id === selectedDomain)?.label + ' Flashcards'}
              </h2>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? `${filteredFlashcards.length} of ${allFlashcards.length} found`
                  : selectedDomain === 'all'
                    ? `${allFlashcards.length} total`
                    : `${filteredFlashcards.length} in this domain`
                }
              </span>
            </div>

            <!-- Search Input -->
            <div class="relative">
              <input
                type="text"
                value={searchInput}
                oninput={handleSearchInput}
                placeholder="Search flashcards by text, category, domain, or task..."
                class="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-300"
              />
              <!-- Search Icon -->
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <!-- Clear Button -->
              {#if searchInput}
                <button
                  onclick={clearSearch}
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              {/if}
            </div>
          </div>

          <div class="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {#each displayItems() as flashcard}
              <div class="group px-6 py-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors duration-300 cursor-default">
                <div class="flex items-start gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:translate-x-1 transition-transform duration-300">{flashcard.front}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{flashcard.back}</p>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                        {flashcard.category}
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {flashcard.domain} / {flashcard.task}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <div class="px-6 py-12 text-center">
                {#if searchQuery}
                  <p class="text-gray-500 dark:text-gray-400 mb-2">No flashcards match your search</p>
                  <button
                    onclick={clearSearch}
                    class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
                  >
                    Clear search to see all flashcards
                  </button>
                {:else}
                  <p class="text-gray-500 dark:text-gray-400">No flashcards available</p>
                {/if}
              </div>
            {/each}
          </div>

          <!-- Pagination -->
          {#if filteredFlashcards.length > pagination.limit}
            <div class="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
              <button
                onclick={goToPreviousPage}
                disabled={!canGoBack}
                class="group px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                Previous
              </button>

              <span class="text-sm text-gray-700 dark:text-gray-300">
                {currentPageInfo()}
              </span>

              <button
                onclick={goToNextPage}
                disabled={!hasMore()}
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
