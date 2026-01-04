<script lang="ts">
  export let title: string = "Something went wrong";
  export let message: string = "An error occurred while loading your data";
  export let showRetry: boolean = true;
  export let onRetry: (() => void) | undefined = undefined;

  function handleRetry() {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  }
</script>

<div class="flex flex-col items-center justify-center py-12 px-4">
  <!-- Error Icon -->
  <div class="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
    <svg
      class="h-10 w-10 text-red-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  </div>

  <!-- Error Message -->
  <h3 class="text-lg font-medium text-gray-900 mb-2">{title}</h3>
  <p class="text-sm text-gray-500 text-center mb-6 max-w-md">{message}</p>

  <!-- Retry Button -->
  {#if showRetry}
    <button
      on:click={handleRetry}
      class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <svg
        class="mr-2 h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Try Again
    </button>
  {/if}
</div>
