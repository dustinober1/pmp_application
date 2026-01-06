<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';

	interface Props {
		content: string;
		className?: string;
	}

	let { content, className = '' }: Props = $props();

	// Sanitize and parse markdown
	const html = $derived(
		DOMPurify.sanitize(marked.parse(content, {
			headerIds: false,
			mangle: false
		}) as string, {
			USE_PROFILES: { html: true }
		})
	);
</script>

<div class="prose prose-invert max-w-none {className}">
	{@html html}
</div>

<style>
	/* Custom prose styling */
	:global(.prose) {
		color: var(--foreground);
		max-width: none;
	}

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
