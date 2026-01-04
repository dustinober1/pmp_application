<script lang="ts">
	interface Props {
		variant?: 'compact' | 'card' | 'inline';
		showIcon?: boolean;
	}

	let { variant = 'compact', showIcon = true }: Props = $props();
</script>

{#if variant === 'inline'}
	<!-- Inline badge for use in text/grids -->
	<div class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50 transition-all cursor-default">
		{#if showIcon}
			<span class="flex items-center justify-center h-5 w-5 rounded-md bg-emerald-600 dark:bg-emerald-500">
				<svg class="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</span>
		{/if}
		<div class="flex flex-col">
			<span class="text-xs font-bold text-emerald-900 dark:text-emerald-100 leading-tight">2026 Ready</span>
			<span class="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">185 questions • 240 minutes</span>
		</div>
	</div>

{:else if variant === 'card'}
	<!-- Card variant with more emphasis -->
	<div class="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/40 dark:via-teal-900/40 dark:to-cyan-900/40 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/10 transition-all cursor-default">
		<div class="flex items-start gap-3">
			{#if showIcon}
				<div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 shadow-md">
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
			{/if}
			<div class="flex-1 min-w-0">
				<h3 class="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-1">2026 Ready</h3>
				<p class="text-xs text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
					Exam Format: <span class="font-semibold">185 questions • 240 minutes</span>
				</p>
			</div>
		</div>
	</div>

{:else}
	<!-- Compact default badge -->
	<div class="inline-flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50 transition-all shadow-sm hover:shadow-md cursor-default">
		{#if showIcon}
			<span class="flex items-center justify-center h-6 w-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 shadow-sm">
				<svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</span>
		{/if}
		<div class="flex flex-col">
			<span class="text-sm font-bold text-emerald-900 dark:text-emerald-100 leading-tight">2026 Ready</span>
			<span class="text-xs text-emerald-700 dark:text-emerald-300 font-medium">185 questions • 240 minutes</span>
		</div>
	</div>
{/if}
