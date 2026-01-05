// place files you want to import through the `$lib` alias in this folder.

// API Client (placeholder for future backend integration)
export * from "./api";

// Static Data Loader
export * from "./utils/staticDataLoader";

// Load Function Utilities
export * from "./load";

// Composables
export * from "./composables";

// Stores
export { toast, toastStore } from "./stores/toast";

// Actions
export { focusTrap } from "./actions/focusTrap";

// Components
export { default as LoadingState } from "./components/LoadingState.svelte";
export { default as ErrorState } from "./components/ErrorState.svelte";
export { default as ToastContainer } from "./components/ToastContainer.svelte";
export { default as SearchDialog } from "./components/SearchDialog.svelte";
export { default as QuestionNavigator } from "./components/QuestionNavigator.svelte";
export { default as StreakCounter } from "./components/StreakCounter.svelte";
export { default as SanitizedMarkdown } from "./components/SanitizedMarkdown.svelte";
export { default as Readiness2026Badge } from "./components/Readiness2026Badge.svelte";
