<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore } from '$lib/stores/auth';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';

	export let data;

	let loading = true;
	let task = null;
	let studyGuide = null;
	let activeSection = '';
	let error = null;

	// Auth state
	let canAccess = false;

	authStore.subscribe((auth) => {
		canAccess = auth.isAuthenticated;
	});

	onMount(() => {
		// Use data from load function if available
		if (data.task) {
			task = data.task;
		}
		if (data.studyGuide) {
			studyGuide = data.studyGuide;
			if (studyGuide.sections.length > 0) {
				activeSection = studyGuide.sections[0].id;
			}
		}
		if (data.error) {
			error = data.error;
		}
		loading = false;
	});

	function scrollToSection(sectionId) {
		activeSection = sectionId;
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

{#if loading}
	<LoadingState message="Loading study guide..." />
{:else if !task}
	<div class="max-w-4xl mx-auto px-4 py-8 text-center bg-gray-900 border border-gray-800 rounded-lg">
		<h1 class="text-2xl font-bold text-white mb-2">Task Not Found</h1>
		<p class="text-gray-400 mb-6">The requested task could not be found.</p>
		<button
			on:click={() => goto('/study')}
			class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
		>
			Back to Study Guide
		</button>
	</div>
{:else if !canAccess}
	<ErrorState
		title="Authentication Required"
		message="Please log in to access study materials."
	/>
{:else}
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center space-x-2 text-sm text-gray-400 mb-2">
				<button on:click={() => goto('/study')} class="hover:text-white transition">
					Study Guide
				</button>
				<span>/</span>
				<span class="text-white">Task {task.code}</span>
			</div>
			<h1 class="text-3xl font-bold text-white mb-2">{task.name}</h1>
			<p class="text-xl text-gray-400">{task.description}</p>
		</div>

		<div class="flex flex-col lg:flex-row gap-8">
			<!-- Sidebar Navigation -->
			<aside class="lg:w-64 flex-shrink-0">
				<div class="sticky top-24 bg-gray-900 border border-gray-800 rounded-xl p-4">
					<h3
						class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4"
					>
						Contents
					</h3>
					<nav class="space-y-1">
						{#if !studyGuide || studyGuide.sections.length === 0}
							<p class="text-sm text-gray-500 italic">
								No content sections available.
							</p>
						{:else}
							{#each studyGuide.sections as section}
								<button
									on:click={() => scrollToSection(section.id)}
									class="w-full text-left px-3 py-2 text-sm rounded-md transition-colors {activeSection ===
									section.id
										? 'bg-indigo-900/30 text-indigo-400 border-l-2 border-indigo-500'
										: 'text-gray-400 hover:bg-gray-800 hover:text-white'}"
								>
									{section.title}
								</button>
							{/each}
						{/if}
					</nav>

					<div class="mt-8 pt-6 border-t border-gray-800">
						<h3
							class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4"
						>
							Resources
						</h3>
						<div class="space-y-2">
							<button
								on:click={() => goto('/flashcards')}
								class="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition flex items-center"
							>
								<span class="mr-2">🗂️</span> Related Flashcards
							</button>
							<button
								on:click={() => goto('/formulas')}
								class="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition flex items-center"
							>
								<span class="mr-2">∑</span> Related Formulas
							</button>
						</div>
					</div>
				</div>
			</aside>

			<!-- Main Content -->
			<main class="flex-1 min-w-0">
				{#if !studyGuide}
					<div
						class="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center"
					>
						<h3 class="text-xl font-medium text-white mb-2">
							Content Coming Soon
						</h3>
						<p class="text-gray-400">
							Detailed study guide content for this task is currently being
							developed. Please check back later or start with flashcards.
						</p>
						<div class="mt-6 flex justify-center space-x-4">
							<button
								on:click={() => goto('/flashcards')}
								class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
							>
								Start Flashcards
							</button>
						</div>
					</div>
				{:else}
					<div class="space-y-12">
						{#each studyGuide.sections as section}
							<section id={section.id} class="scroll-mt-24">
								<div
									class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
								>
									<div
										class="border-b border-gray-800 px-6 py-4 bg-gray-800/50"
									>
										<h2 class="text-xl font-semibold text-white">
											{section.title}
										</h2>
									</div>
									<div
										class="px-6 py-6 prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-a:text-indigo-400 prose-code:text-indigo-300"
									>
										{@html section.content}
									</div>
								</div>
							</section>
						{/each}
					</div>
				{/if}
			</main>
		</div>
	</div>
{/if}
