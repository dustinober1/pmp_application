<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';
	import { onMount, onDestroy, mount, unmount } from 'svelte';
	import { page } from '$app/stores';
	import ProgressTable from './ProgressTable.svelte';

	interface Props {
		content: string;
		className?: string;
		id?: string; // Optional ID context for persistence
	}

	let { content, className = '', id = '' }: Props = $props();

	// Process custom syntax before markdown parsing
	function preProcess(text: string): string {
		// Replace ::: type Title ::: syntax
		// Matches: ::: type Title \n content \n :::
		// We use a non-greedy match for the content
		let processed = text.replace(
			/:::\s*(tip|info|warning|caution)\s*(.*?)\n([\s\S]*?)\n:::/gm,
			(_, type, title, body) => {
				const titleHtml = title ? `<p class="font-bold mb-2 block-title">${title}</p>` : '';
				return `<div class="callout callout-${type} my-4 p-4 rounded-lg border-l-4">
					${titleHtml}
					<div class="block-content">${body}</div>
				</div>`;
			}
		);
		
		return processed;
	}

	// Sanitize and parse markdown
	const html = $derived.by(() => {
		const processed = preProcess(content);
		const rawHtml = marked.parse(processed, {
			headerIds: false,
			mangle: false
		}) as string;
		
		return DOMPurify.sanitize(rawHtml, {
			USE_PROFILES: { html: true },
			ADD_TAGS: ['input'], // Build-in sanitize removes input attributes sometimes
			ADD_ATTR: ['checked', 'type', 'disabled', 'class', 'onclick', 'data-component']
		});
	});

	// Handle interactive elements
	let container: HTMLDivElement;
	let mountedComponents: any[] = [];

	function handleCheckboxChange(index: number, checked: boolean) {
		const key = `pmp_progress_${id || $page.url.pathname}_checkbox_${index}`;
		localStorage.setItem(key, checked.toString());
	}

	function hydrateInteractiveElements() {
		if (!container) return;

		// 1. Hydrate Checkboxes
		const checkboxes = container.querySelectorAll('input[type="checkbox"]');
		checkboxes.forEach((cb, index) => {
			const checkbox = cb as HTMLInputElement;
			checkbox.disabled = false; // Enable interaction
			checkbox.classList.add('cursor-pointer', 'accent-indigo-600', 'h-4', 'w-4');

			// Restore state
			const key = `pmp_progress_${id || $page.url.pathname}_checkbox_${index}`;
			const saved = localStorage.getItem(key);
			if (saved !== null) {
				checkbox.checked = saved === 'true';
			}

			// Add interaction
			checkbox.onchange = (e) => {
				handleCheckboxChange(index, (e.target as HTMLInputElement).checked);
			};
		});

		// 2. Hydrate Components
		const componentPlaceholders = container.querySelectorAll('[data-component="ProgressTable"]');
		componentPlaceholders.forEach((placeholder) => {
			// Clear existing content if any
			placeholder.innerHTML = '';
			const component = mount(ProgressTable, {
				target: placeholder,
				props: {
					key: id || $page.url.pathname
				}
			});
			mountedComponents.push(component);
		});
	}

	// Cleanup mounted components
	function cleanup() {
		mountedComponents.forEach((comp) => {
			try {
				unmount(comp);
			} catch (e) {
				// Ignore if already unmounted
			}
		});
		mountedComponents = [];
	}

	$effect(() => {
		if (html && container) {
			cleanup();
			// Small timeout to allow DOM update
			setTimeout(hydrateInteractiveElements, 0);
		}
	});

	onDestroy(() => {
		cleanup();
	});

</script>

<div bind:this={container} class="prose prose-invert max-w-none {className}">
	{@html html}
</div>

<style>
	/* Custom prose styling */
	:global(.prose) {
		color: var(--foreground);
		max-width: none;
	}

	/* Callout Styles */
	:global(.callout) {
		background-color: rgb(31, 41, 55); /* Default dark bg */
	}

	:global(.callout-tip) {
		border-left-color: #10b981; /* Emerald 500 */
		background-color: rgba(16, 185, 129, 0.1);
	}
	:global(.callout-tip .block-title) { color: #10b981; }

	:global(.callout-info) {
		border-left-color: #3b82f6; /* Blue 500 */
		background-color: rgba(59, 130, 246, 0.1);
	}
	:global(.callout-info .block-title) { color: #3b82f6; }

	:global(.callout-warning) {
		border-left-color: #f59e0b; /* Amber 500 */
		background-color: rgba(245, 158, 11, 0.1);
	}
	:global(.callout-warning .block-title) { color: #f59e0b; }

	:global(.callout-caution) {
		border-left-color: #ef4444; /* Red 500 */
		background-color: rgba(239, 68, 68, 0.1);
	}
	:global(.callout-caution .block-title) { color: #ef4444; }


	:global(.prose h1) {
		font-size: 1.5rem;
		font-weight: bold;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
		color: var(--foreground);
	}

	:global(.prose h2) {
		font-size: 1.25rem;
		font-weight: bold;
		margin-top: 1.25rem;
		margin-bottom: 0.75rem;
		color: var(--foreground);
	}

	:global(.prose h3) {
		font-size: 1.125rem;
		font-weight: 600;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: var(--foreground);
	}

	:global(.prose p) {
		margin-bottom: 0.75rem;
		line-height: 1.6;
	}

	:global(.prose a) {
		color: var(--primary);
		text-decoration: underline;
	}

	:global(.prose a:hover) {
		color: var(--primary-hover);
	}

	:global(.prose code) {
		background-color: rgb(31, 41, 55);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}

	:global(.prose pre) {
		background-color: rgb(31, 41, 55);
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin-bottom: 0.75rem;
	}

	:global(.prose pre code) {
		background-color: transparent;
		padding: 0;
	}

	:global(.prose ul) {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin-bottom: 0.75rem;
	}

	:global(.prose ol) {
		list-style-type: decimal;
		padding-left: 1.5rem;
		margin-bottom: 0.75rem;
	}

	:global(.prose li) {
		margin-bottom: 0.25rem;
	}
	
	/* Style checkboxed list items */
	:global(.prose li:has(input[type="checkbox"])) {
		list-style-type: none;
		margin-left: -1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	:global(.prose blockquote) {
		border-left: 4px solid rgb(75, 85, 99);
		padding-left: 1rem;
		font-style: italic;
		margin-bottom: 0.75rem;
		color: rgb(156, 163, 175);
	}

	:global(.prose strong) {
		font-weight: bold;
		color: var(--foreground);
	}

	:global(.prose em) {
		font-style: italic;
	}

	:global(.prose hr) {
		border-color: rgb(75, 85, 99);
		margin: 1.5rem 0;
	}

	:global(.prose table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1.5rem 0;
		font-size: 0.95rem;
		display: block;
		overflow-x: auto;
	}

	:global(.prose thead) {
		position: sticky;
		top: 0;
	}

	:global(.prose th),
	:global(.prose td) {
		border: 1px solid #d1d5db;
		padding: 0.75rem 1rem;
		text-align: left;
		vertical-align: top;
	}

	:global(.dark .prose th),
	:global(.dark .prose td) {
		border-color: rgb(75, 85, 99);
	}

	:global(.prose th) {
		background-color: #f3f4f6;
		font-weight: 600;
		color: #1f2937;
		white-space: nowrap;
	}

	:global(.dark .prose th) {
		background-color: rgb(31, 41, 55);
		color: #f9fafb;
	}

	:global(.prose tr:nth-child(even) td) {
		background-color: #fafafa;
	}

	:global(.dark .prose tr:nth-child(even) td) {
		background-color: rgba(31, 41, 55, 0.5);
	}

	:global(.prose tr:hover td) {
		background-color: #f0f9ff;
	}

	:global(.dark .prose tr:hover td) {
		background-color: rgba(59, 130, 246, 0.1);
	}

	:global(.prose img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1rem 0;
	}
</style>
