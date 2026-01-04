<script lang="ts">
	import { base } from '$app/paths';

	interface Props {
		variant?: 'navbar' | 'page' | 'compact';
		showFullDetails?: boolean;
	}

	let { variant = 'page', showFullDetails = false }: Props = $props();
</script>

{#if variant === 'navbar'}
	<!-- Compact navbar badge -->
	<a
		href="{base}/"
		class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 transition-all"
		title="Updated for July 2026 ECO"
	>
		<span class="relative flex h-2 w-2">
			<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
			<span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
		</span>
		<span>July 2026 ECO</span>
	</a>

{:else if variant === 'compact'}
	<!-- Compact badge for inline use -->
	<div
		class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800"
	>
		<span class="relative flex h-2.5 w-2.5">
			<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
			<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
		</span>
		<span class="text-sm font-semibold text-indigo-900 dark:text-indigo-100">July 2026 ECO</span>
	</div>

{:else}
	<!-- Full page banner -->
	<div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
		<div class="flex items-center justify-center gap-2">
			<span class="relative flex h-3 w-3">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
				<span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
			</span>
			<span class="font-semibold text-blue-900 dark:text-blue-100">Updated for July 2026 ECO</span>
		</div>
		{#if showFullDetails}
			<p class="text-sm text-blue-700 dark:text-blue-300 mt-2 text-center">
				New domain percentages, AI & Sustainability themes, 60/40 methodology focus
			</p>
		{/if}
	</div>
{/if}
