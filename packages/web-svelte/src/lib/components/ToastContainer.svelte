<script lang="ts">
	import { toastStore } from '../stores/toast';
	import { onMount } from 'svelte';

	onMount(() => {
		const onSyncFailed = (event: Event) => {
			const detail = (event as CustomEvent<{ count?: number }>).detail;
			const count = detail?.count ?? 1;
			toastStore.error(
				`Some offline actions failed to sync (${count}). We'll retry automatically.`
			);
		};

		window.addEventListener('pmp-sync-failed', onSyncFailed);
		return () => window.removeEventListener('pmp-sync-failed', onSyncFailed);
	});
</script>

<div
	class="fixed bottom-4 right-4 z-[200] space-y-2"
	aria-live="polite"
	aria-relevant="additions"
>
	{#each $toastStore as toastItem (toastItem.id)}
		{@const toastTypeClass = toastItem.type === 'success'
			? 'bg-green-900/30 border-green-800 text-green-200'
			: toastItem.type === 'error'
				? 'bg-red-900/30 border-red-800 text-red-200'
				: 'bg-gray-900/60 border-gray-700 text-gray-200'}
		<div
			role={toastItem.type === 'error' ? 'alert' : 'status'}
			class="max-w-sm rounded-xl border px-4 py-3 shadow-lg backdrop-blur {toastTypeClass}"
		>
			<div class="flex items-start justify-between gap-3">
				<p class="text-sm leading-snug">{toastItem.message}</p>
				<button
					type="button"
					onclick={() => toastStore.dismiss(toastItem.id)}
					class="text-xs text-gray-300 hover:text-white"
					aria-label="Dismiss notification"
				>
					✕
				</button>
			</div>
		</div>
	{/each}
</div>
