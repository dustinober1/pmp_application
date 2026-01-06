<script lang="ts">
	import { base } from '$app/paths';
	import faqContent from '$lib/data/faq.md?raw';
	import SanitizedMarkdown from '$lib/components/SanitizedMarkdown.svelte';
</script>

<svelte:head>
	<title>Frequently Asked Questions - PMP Study Pro</title>
	<meta
		name="description"
		content="Find answers to common questions about the PMP exam, eligibility, application process, study strategies, and using PMP Study Pro."
	/>
</svelte:head>

<div class="relative min-h-screen overflow-hidden bg-background">
	<!-- Organic Blob Backgrounds -->
	<div class="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-blob blur-3xl animate-float opacity-70"></div>
	<div class="absolute top-40 -right-20 w-80 h-80 bg-secondary/15 rounded-blob blur-3xl animate-float delay-1000 opacity-60"></div>
	<div class="absolute bottom-0 left-1/3 w-full h-96 bg-accent/30 rounded-t-[50%] blur-3xl opacity-40"></div>

	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
		<div class="max-w-4xl mx-auto space-y-12">
			<!-- Back to Home Link -->
			<div>
				<a
					href="{base}/"
					class="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors duration-200 group"
				>
					<span class="group-hover:-translate-x-1 transition-transform duration-200">←</span>
					<span>Back to Home</span>
				</a>
			</div>

			<!-- Page Header -->
			<div class="text-center space-y-4">
				<h1 class="text-4xl md:text-5xl font-bold font-serif text-foreground">
					Frequently Asked Questions
				</h1>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					Everything you need to know about the PMP exam and using PMP Study Pro
				</p>
			</div>

			<!-- FAQ Content in Glassmorphism Card -->
			<div class="bg-card rounded-2xl shadow-lg border border-border p-8 md:p-12 hover:shadow-hover transition-all duration-300">
				<SanitizedMarkdown content={faqContent} className="faq-content" />
			</div>
		</div>
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
