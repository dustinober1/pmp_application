<script lang="ts">
	interface Props {
		variant?: 'full' | 'compact';
	}

	let { variant = 'full' }: Props = $props();
</script>

{#if variant === 'compact'}
	<!-- Compact banner for smaller spaces -->
	<div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-3 rounded-lg border border-amber-300 dark:border-amber-700 shadow-md">
		<div class="flex items-center gap-2">
			<span class="text-xl"></span>
			<p class="text-sm font-medium text-amber-900 dark:text-amber-100">
				Progress is stored locally. To avoid losing data when clearing cache, use the Export Progress tool on the Dashboard.
			</p>
		</div>
	</div>
{:else}
	<!-- Full prominent banner -->
	<div class="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 p-5 rounded-2xl border-2 border-amber-400 dark:border-amber-600 shadow-lg mb-6">
		<div class="flex items-center justify-center gap-2 mb-2">
			<span class="text-3xl"></span>
			<span class="font-bold text-amber-900 dark:text-amber-100 text-lg">IMPORTANT</span>
		</div>
		<p class="text-amber-900 dark:text-amber-100 font-medium text-sm leading-relaxed text-center">
			Progress is stored locally. To avoid losing data when clearing cache, use the Export Progress tool on the Dashboard.
		</p>
	</div>
{/if}
