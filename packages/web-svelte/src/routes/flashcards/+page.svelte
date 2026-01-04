<script lang="ts">
  export let data;

  import LoadingState from "$lib/components/LoadingState.svelte";
  import ErrorState from "$lib/components/ErrorState.svelte";

  function loadPrevious() {
    const offset = Math.max(0, (data.flashcards?.offset || 0) - (data.flashcards?.limit || 20));
    window.location.search = `?offset=${offset}&limit=${data.flashcards?.limit || 20}`;
  }

  function loadNext() {
    const offset = (data.flashcards?.offset || 0) + (data.flashcards?.limit || 20);
    window.location.search = `?offset=${offset}&limit=${data.flashcards?.limit || 20}`;
  }
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
            <h2 class="text-lg font-medium text-gray-900 mb-2">Mastered</h2>
            <p class="text-3xl font-bold text-purple-600">
              {data.stats.mastered || 0}
            </p>
          </div>
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
