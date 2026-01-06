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
 getQuickStats,
 getFlashcardsByDomain,
 prefetchDomains,
 type Flashcard,
 type DomainManifest
 } from "$lib/utils/flashcardsData";
 import { goto } from '$app/navigation';
 import { base } from '$app/paths';

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
 let recentReviews: FlashcardReview[] = $state([]);
 let showRecentReviews = $state(false);

 // Data loading state
 let loading = $state(true);
 let allFlashcards: Flashcard[] = $state([]);
 let quickStats: { totalFlashcards: number; totalDomains: number; totalTasks: number; domains: DomainManifest[] } | null = $state(null);
 let error: string | null = $state(null);

 // Debounced search removed

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

 // Pagination helpers removed

 onMount(async () => {
 // Load data from localStorage first (fast, synchronous)
 localMasteredCount = getMasteredCount();
 recentReviews = getRecentReviews();

 try {
 // FAST: Load only the manifest (~500 bytes) initially
 quickStats = await getQuickStats();
 
 // Immediately mark as loaded - page renders instantly with stats
 loading = false;
 
 // Load all cards for prefetching
 const domains = ['people', 'process', 'business'];
 const results = await Promise.all(domains.map(d => getFlashcardsByDomain(d)));
 allFlashcards = results.flat();
 
 // Start prefetching
 prefetchDomains('people');
 } catch (err) {
 console.error('Failed to load flashcards:', err);
 error = err instanceof Error ? err.message : 'Failed to load flashcards';
 loading = false;
 }
 });

 // Re-fetch progress when returning to the page (e.g. from practice)
 $effect(() => {
 // This will trigger whenever the component is active
 localMasteredCount = getMasteredCount();
 recentReviews = getRecentReviews();
 });

 // Domain filter effect removed
</script>

{#if loading}
 <LoadingState message="Loading flashcards..." />
{:else if error}
 <ErrorState
 title="Flashcards Error"
 message={error}
 />
{:else}
 <div class="relative min-h-screen overflow-hidden bg-background">
 <!-- Organic Blob Backgrounds -->
 <div class="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-blob blur-3xl animate-float opacity-70"></div>
 <div class="absolute top-40 -right-20 w-80 h-80 bg-secondary/15 rounded-blob blur-3xl animate-float delay-1000 opacity-60"></div>
 <div class="absolute bottom-0 left-1/3 w-full h-96 bg-accent/30 rounded-t-[50%] blur-3xl opacity-40"></div>

 <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
 <!-- ECO Badge -->
 <div class="mb-6">
 <ECOBadge variant="compact" />
 </div>

 <h1 class="text-3xl md:text-4xl font-bold font-serif text-foreground mb-6">Flashcards</h1>

 <!-- Session selection is now via the practice session grid below -->

 <!-- Practice Sessions -->
 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
 {#each [25, 50, 75, 100] as limit}
 <a
 href="{base}/flashcards/practice?limit={limit}"
 class="group block"
 aria-label="Practice {limit} flashcards"
 >
 <Card class="p-6 h-full transition-all hover:scale-[1.03] hover:shadow-hover">
 <div class="flex items-center justify-between mb-4">
 <div class="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
 </svg>
 </div>
 <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">SRS</span>
 </div>
 <h3 class="text-xl font-bold text-foreground mb-1">Practice {limit}</h3>
 <p class="text-sm text-muted-foreground">Random {limit} cards from your SRS queue</p>
 </Card>
 </a>
 {/each}
 </div>

 <!-- Recent Reviews -->
 {#if recentReviews && recentReviews.length > 0}
 <Card class="mb-8">
 <div class="px-6 py-4 border-b border-border flex items-center justify-between">
 <h2 class="text-lg font-medium text-foreground">
 Recent Reviews ({recentReviews.length})
 </h2>
 <button
 onclick={() => showRecentReviews = !showRecentReviews}
 class="text-sm text-primary hover:text-primary/80 hover:scale-105 transition-all duration-300"
 aria-expanded={showRecentReviews}
 >
 {showRecentReviews ? 'Hide' : 'Show'}
 </button>
 </div>

 {#if showRecentReviews}
 <div class="divide-y divide-border">
 {#each recentReviews as review}
 <div class="px-6 py-3 hover:bg-muted/50 transition-colors duration-300">
 <div class="flex items-start justify-between gap-4">
 <div class="flex-1 min-w-0">
 <p class="text-sm font-medium text-foreground truncate">
 {review.cardFront}
 </p>
 <p class="text-xs text-muted-foreground mt-1">
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
 </Card>
 {/if}

 <!-- Quick Stats -->
 {#if quickStats}
 <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
 <Card class="p-6 cursor-default">
 <h2 class="text-lg font-medium text-foreground mb-2">Total Cards</h2>
 <p class="text-3xl font-bold text-primary">{quickStats.totalFlashcards || 0}</p>
 </Card>
 <Card class="p-6 cursor-default">
 <h2 class="text-lg font-medium text-foreground mb-2">Mastered</h2>
 <p class="text-3xl font-bold text-secondary">{localMasteredCount || 0}</p>
 </Card>
 </div>
 {/if}
 </div>
 </div>
{/if}
