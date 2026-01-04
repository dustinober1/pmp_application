<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import SanitizedMarkdown from '$lib/components/SanitizedMarkdown.svelte';

	interface PageData {
		faqContent: string;
		error: string | null;
	}

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Frequently Asked Questions - PMP Study Pro</title>
	<meta
		name="description"
		content="Find answers to common questions about the PMP exam, eligibility, application process, study strategies, and using PMP Study Pro."
	/>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6">
	<div class="max-w-4xl mx-auto space-y-12">
		<!-- Back to Home Link -->
		<div>
			<a
				href="{base}/"
				class="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200 group"
			>
				<span class="group-hover:-translate-x-1 transition-transform duration-200">←</span>
				<span>Back to Home</span>
			</a>
		</div>

		<!-- Page Header -->
		<div class="text-center space-y-4">
			<h1
				class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
			>
				Frequently Asked Questions
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
				Everything you need to know about the PMP exam and using PMP Study Pro
			</p>
		</div>

		<!-- Error State -->
		{#if data.error}
			<div
				class="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center"
			>
				<p class="text-red-700 dark:text-red-300 font-medium">Failed to load FAQ content</p>
				<p class="text-red-600 dark:text-red-400 text-sm mt-1">{data.error}</p>
			</div>
		{:else}
			<!-- FAQ Content in Glassmorphism Card -->
			<div
				class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
			>
				<SanitizedMarkdown content={data.faqContent} className="faq-content" />
			</div>
		{/if}
	</div>
</div>

<style>
	/* Custom styling for FAQ markdown content */
	:global(.faq-content.prose h1) {
		font-size: 2rem;
		font-weight: 700;
		margin-top: 2rem;
		margin-bottom: 1rem;
		background: linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	:global(.faq-content.prose h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgb(229, 231, 235);
	}

	:global(.dark .faq-content.prose h2) {
		border-bottom: 1px solid rgb(55, 65, 81);
	}

	:global(.faq-content.prose h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: rgb(31, 41, 55);
	}

	:global(.dark .faq-content.prose h3) {
		color: rgb(229, 231, 235);
	}

	:global(.faq-content.prose p) {
		margin-bottom: 1rem;
		line-height: 1.75;
		color: rgb(55, 65, 81);
	}

	:global(.dark .faq-content.prose p) {
		color: rgb(209, 213, 219);
	}

	:global(.faq-content.prose ul),
	:global(.faq-content.prose ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}

	:global(.faq-content.prose li) {
		margin-bottom: 0.5rem;
		color: rgb(55, 65, 81);
		line-height: 1.75;
	}

	:global(.dark .faq-content.prose li) {
		color: rgb(209, 213, 219);
	}

	:global(.faq-content.prose a) {
		color: rgb(79, 70, 229);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	:global(.dark .faq-content.prose a) {
		color: rgb(129, 140, 248);
	}

	:global(.faq-content.prose a:hover) {
		color: rgb(67, 56, 202);
	}

	:global(.dark .faq-content.prose a:hover) {
		color: rgb(99, 102, 241);
	}

	:global(.faq-content.prose strong) {
		font-weight: 700;
		color: rgb(17, 24, 39);
	}

	:global(.dark .faq-content.prose strong) {
		color: rgb(243, 244, 246);
	}

	:global(.faq-content.prose code) {
		background-color: rgb(243, 244, 246);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
		color: rgb(220, 38, 38);
		font-weight: 500;
	}

	:global(.dark .faq-content.prose code) {
		background-color: rgb(55, 65, 81);
		color: rgb(248, 113, 113);
	}

	:global(.faq-content.prose pre) {
		background-color: rgb(31, 41, 55);
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 1rem 0;
	}

	:global(.faq-content.prose pre code) {
		background-color: transparent;
		color: rgb(229, 231, 235);
		padding: 0;
	}

	:global(.faq-content.prose blockquote) {
		border-left: 4px solid rgb(147, 51, 234);
		padding-left: 1rem;
		font-style: italic;
		margin: 1rem 0;
		color: rgb(75, 85, 99);
		background-color: rgb(249, 250, 251);
		padding: 1rem;
		border-radius: 0 0.5rem 0.5rem 0;
	}

	:global(.dark .faq-content.prose blockquote) {
		border-left-color: rgb(139, 92, 246);
		background-color: rgb(31, 41, 55);
		color: rgb(156, 163, 175);
	}
</style>
