<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { focusTrap } from '../actions/focusTrap';
	import { toast } from '../stores/toast';
	import { apiRequest } from '../utils/api';
	import type { SearchResult } from '@pmp/shared';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let loading = $state(false);
	let inputElement = $state<HTMLInputElement | undefined>();
	let dialogElement = $state<HTMLDivElement | undefined>();
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let lastPathname = $state('');

	// Debounced search
	$effect(() => {
		if (!open) {
			results = [];
			loading = false;
			return;
		}

		// Clear previous timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		const trimmedQuery = query.trim();
		if (trimmedQuery.length < 2) {
			results = [];
			loading = false;
			return;
		}

		loading = true;

		debounceTimer = setTimeout(async () => {
			try {
				const response = await apiRequest<{ results: SearchResult[] }>(
					`/search?q=${encodeURIComponent(trimmedQuery)}&limit=10`
				);
				if (response.data) {
					results = response.data.results;
				}
			} catch (error) {
				console.error('Search failed', error);
				toast.error('Search failed. Please try again.');
			} finally {
				loading = false;
			}
		}, 500);

		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		};
	});

	// Global keyboard shortcut
	onMount(() => {
		if (!browser) return;

		const onKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && open) {
				onClose();
			}
		};

		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});

	// Focus input when dialog opens
	$effect(() => {
		if (open) {
			tick().then(() => {
				inputElement?.focus();
			});
		}
	});

	function getResultIcon(type: SearchResult['type']): string {
		switch (type) {
			case 'study_guide':
				return '';
			case 'flashcard':
				return '';
			case 'question':
				return '';
			case 'formula':
				return '∑';
			default:
				return '';
		}
	}

	function getResultLink(result: SearchResult): string {
		switch (result.type) {
			case 'study_guide':
				return `/study/${result.taskId}`;
			case 'flashcard':
				return `/flashcards`;
			case 'question':
				return `/practice`;
			case 'formula':
				return `/formulas`;
			default:
				return `/dashboard`;
		}
	}
</script>

{#if open}
	<div class="relative z-[100]" role="dialog" aria-modal="true" aria-label="Search">
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
			onclick={onClose}
			aria-label="Close search"
		></button>

		<div class="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
			<div
				bind:this={dialogElement}
				use:focusTrap={{ enabled: open, initialFocus: inputElement }}
				class="mx-auto max-w-2xl transform divide-y divide-gray-800 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl transition-all"
			>
				<div class="relative">
					<div
						class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"
					>
						<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path
								fill-rule="evenodd"
								d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<input
						bind:this={inputElement}
						type="text"
						class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm"
						placeholder="Search study guides, flashcards, questions..."
						bind:value={query}
						aria-label="Search"
					/>
				</div>

				{#if loading}
					<div class="p-4 text-center text-sm text-gray-400">Searching...</div>
				{:else if results.length === 0 && query.trim().length >= 2}
					<div class="p-4 text-center text-sm text-gray-400">
						No results found for "{query}"
					</div>
				{:else if results.length > 0}
					<ul class="max-h-96 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-200">
						{#each results as result (result.type + '-' + result.id)}
							<li>
								<a
									href={getResultLink(result)}
									class="group flex select-none items-center px-4 py-2 hover:bg-gray-800 hover:text-white"
									onclick={onClose}
								>
									<span class="flex-none text-xl mr-3" aria-hidden="true">
										{getResultIcon(result.type)}
									</span>
									<div class="flex-auto truncate">
										<p class="truncate font-medium">{result.title}</p>
										<p class="truncate text-xs text-gray-500">{result.excerpt}</p>
									</div>
									<span
										class="ml-3 flex-none text-xs font-medium text-gray-500 capitalize"
									>
										{result.type.replace('_', ' ')}
									</span>
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<!-- Default state -->
					<div class="py-14 px-6 text-center text-sm sm:px-14">
						<p class="mt-4 text-gray-400">
							Press
							<kbd
								class="mx-1 flex h-5 w-5 items-center justify-center rounded border border-gray-700 bg-gray-800 font-semibold text-white sm:mx-2"
							>
								↵
							</kbd>
							to select,
							<kbd
								class="mx-1 flex h-5 w-5 items-center justify-center rounded border border-gray-700 bg-gray-800 font-semibold text-white sm:mx-2"
							>
								Esc
							</kbd>
							to close
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
