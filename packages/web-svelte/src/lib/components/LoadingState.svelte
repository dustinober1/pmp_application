<script lang="ts">
 export let message: string = "Loading...";
 export let size: "sm" | "md" | "lg" = "md";

 const sizes = {
 sm: "h-6 w-6",
 md: "h-12 w-12",
 lg: "h-16 w-16",
 };
</script>

<div class="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
 <svg
 class="animate-spin {sizes[size]} text-indigo-600 mb-4"
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 aria-hidden="true"
 >
 <circle
 class="opacity-25"
 cx="12"
 cy="12"
 r="10"
 stroke="currentColor"
 stroke-width="4"
 ></circle>
 <path
 class="opacity-75"
 fill="currentColor"
 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
 ></path>
 </svg>
 <p class="text-sm text-gray-600">{message}</p>
</div>

<style>
 @keyframes spin {
 from {
 transform: rotate(0deg);
 }
 to {
 transform: rotate(360deg);
 }
 }

 .animate-spin {
 animation: spin 1s linear infinite;
 }
</style>
