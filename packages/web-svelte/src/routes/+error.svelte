<script lang="ts">
 import { page } from "$app/stores";
 import { base } from "$app/paths";

 export let status: number;
 export let error: Error & { frame?: string };

 const dev = import.meta.env.DEV;
</script>

<svelte:head>
 <title>{status} - Error</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
 <div class="max-w-md w-full">
 <div class="text-center">
 <!-- Error Icon -->
 <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
 <svg
 class="h-10 w-10 text-red-600"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 aria-hidden="true"
 >
 <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
 />
 </svg>
 </div>

 <!-- Error Status -->
 <h1 class="text-4xl font-bold text-gray-900 mb-2">{status}</h1>

 <!-- Error Message -->
 <p class="text-lg text-gray-600 mb-4">
 {error.message}
 </p>

 <!-- Additional Context -->
 {#if status === 404}
 <p class="text-sm text-gray-500 mb-6">
 The page you're looking for doesn't exist.
 </p>
 {:else if status === 401}
 <p class="text-sm text-gray-500 mb-6">
 You need to be logged in to access this page.
 </p>
 {:else if status === 403}
 <p class="text-sm text-gray-500 mb-6">
 You don't have permission to access this page.
 </p>
 {:else if status === 500}
 <p class="text-sm text-gray-500 mb-6">
 Something went wrong on our end. Please try again later.
 </p>
 {/if}

 <!-- Action Buttons -->
 <div class="flex flex-col sm:flex-row gap-3 justify-center">
 <a
 href="{base}/"
 class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
 >
 Go Home
 </a>
 <button
 on:click={() => window.history.back()}
 class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
 >
 Go Back
 </button>
 </div>

 <!-- Dev Details -->
 {#if dev}
 <div class="mt-6 p-4 bg-red-50 rounded-lg text-left">
 <p class="text-sm font-medium text-red-800 mb-2">Error Details (Dev Mode)</p>
 <pre class="text-xs text-red-700 overflow-auto">{error.stack}</pre>
 </div>
 {/if}
 </div>
 </div>
</div>
