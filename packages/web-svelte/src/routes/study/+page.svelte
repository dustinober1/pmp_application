<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { contentApi, flashcardApi, practiceApi } from '$lib/utils/api';
	import Navbar from '$lib/components/Navbar.svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';

	export let data;

	let loading = true;
	let domains = [];
	let selectedDomain = null;
	let selectedDomainData = null;
	let loadingDomainDetails = false;
	let expandedTask = null;
	let activeTab = {};
	let startingSession = null;
	let error = null;

	// Auth state
	let canAccess = false;

	authStore.subscribe((auth) => {
		canAccess = auth.isAuthenticated;
	});

	onMount(() => {
		// Use data from load function if available
		if (data.domains) {
			domains = data.domains;
		}
		if (data.error) {
			error = data.error;
		}
		loading = false;
	});

	async function toggleSelectedDomain(domainId) {
		const isDeselecting = selectedDomain === domainId;
		selectedDomain = selectedDomain === domainId ? null : domainId;

		if (!isDeselecting) {
			loadingDomainDetails = true;
			expandedTask = null;
			selectedDomainData = null;

			try {
				const response = await contentApi.getDomain(domainId);
				selectedDomainData = response.data?.domain || null;
			} catch (err) {
				console.error('Failed to fetch domain details:', err);
				// Fallback to static data
				const staticDomain = domains.find((d) => d.id === domainId);
				selectedDomainData = staticDomain || null;
			} finally {
				loadingDomainDetails = false;
			}
		} else {
			expandedTask = null;
			selectedDomainData = null;
		}
	}

	function toggleTaskExpanded(taskId) {
		expandedTask = expandedTask === taskId ? null : taskId;
		activeTab = { ...activeTab, [taskId]: 'study' };
	}

	function setTaskTab(taskId, tab) {
		activeTab = { ...activeTab, [taskId]: tab };
	}

	async function startFlashcardSession(domainId, taskId) {
		try {
			startingSession = `flashcard-${taskId}`;
			const response = await flashcardApi.startSession({
				domainIds: [domainId],
				taskIds: [taskId],
				cardCount: 20
			});
			if (response.data?.sessionId) {
				goto(`/flashcards/session/${response.data.sessionId}`);
			}
		} catch (err) {
			console.error('Failed to start flashcard session:', err);
		} finally {
			startingSession = null;
		}
	}

	async function startPracticeSession(domainId, taskId) {
		try {
			startingSession = `practice-${taskId}`;
			const response = await practiceApi.startSession({
				domainIds: [domainId],
				taskIds: [taskId],
				questionCount: 10
			});
			if (response.data?.sessionId) {
				goto(`/practice/session/${response.data.sessionId}`);
			}
		} catch (err) {
			console.error('Failed to start practice session:', err);
		} finally {
			startingSession = null;
		}
	}

	// Domain colors
	const domainColors = {
		PEOPLE: {
			gradient: 'from-blue-500 to-indigo-600',
			bg: 'bg-blue-500/10',
			text: 'text-blue-600'
		},
		PROCESS: {
			gradient: 'from-emerald-500 to-teal-600',
			bg: 'bg-emerald-500/10',
			text: 'text-emerald-600'
		},
		BUSINESS_ENVIRONMENT: {
			gradient: 'from-orange-500 to-amber-600',
			bg: 'bg-orange-500/10',
			text: 'text-orange-600'
		}
	};

	const tabs = [
		{
			id: 'study',
			label: 'Study Guide',
			icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`
		},
		{
			id: 'flashcards',
			label: 'Flashcards',
			icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`
		},
		{
			id: 'practice',
			label: 'Practice Questions',
			icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
		}
	];
</script>

{#if loading}
	<LoadingState message="Loading study content..." />
{:else if error && domains.length === 0}
	<ErrorState title="Study Error" message={error} />
{:else if !canAccess}
	<ErrorState
		title="Authentication Required"
		message="Please log in to access study materials."
	/>
{:else}
	<div class="min-h-screen flex flex-col bg-gray-50">
		<Navbar />

		<!-- Hero Section -->
		<section class="relative overflow-hidden py-12 sm:py-16 bg-white">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="text-center">
					<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
						PMP <span class="text-indigo-600">Study Hub</span>
					</h1>
					<p class="text-lg text-gray-600 max-w-2xl mx-auto">
						Master all three domains with integrated study guides, flashcards, and
						practice questions for each task.
					</p>
				</div>
			</div>
		</section>

		<main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
			<!-- Domain Cards -->
			<div class="grid md:grid-cols-3 gap-6 mb-8">
				{#each domains as domain}
					{@const colors = domainColors[domain.code] || {
						gradient: 'from-gray-500 to-gray-600',
						bg: 'bg-gray-500/10',
						text: 'text-gray-600'
					}}
					{@const isSelected = selectedDomain === domain.id}

					<button
						on:click={() => toggleSelectedDomain(domain.id)}
						class="card w-full text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 bg-white rounded-lg shadow p-6 {isSelected
							? 'ring-2 ring-indigo-600 shadow-lg'
							: 'hover:shadow-md'}"
						aria-pressed={isSelected}
					>
						<div class="flex items-start justify-between mb-4">
							<div
								class="w-14 h-14 rounded-xl bg-gradient-to-br {colors.gradient} flex items-center justify-center shadow-lg"
							>
								<span class="text-white font-bold text-lg">{domain.weightPercentage}%</span>
							</div>
							<span class="px-3 py-1 rounded-full text-xs font-medium {colors.bg} {colors.text}">
								{domain.tasks?.length || 0} Tasks
							</span>
						</div>
						<h2 class="text-lg font-bold text-gray-900 mb-2">{domain.name}</h2>
						<p class="text-sm text-gray-600 line-clamp-2">{domain.description}</p>
						<div class="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
							<span class="text-sm font-medium {colors.text}">
								{isSelected ? 'Viewing Tasks ↓' : 'View Tasks →'}
							</span>
						</div>
					</button>
				{/each}
			</div>

			<!-- Loading state for domain details -->
			{#if selectedDomain && loadingDomainDetails}
				<div class="bg-white rounded-lg shadow p-6">
					<div class="flex items-center justify-center py-12">
						<div class="flex items-center gap-3">
							<div
								class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"
							></div>
							<span class="text-sm text-gray-600">Loading tasks and study materials...</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Expanded Domain with Tasks -->
			{#if selectedDomain && selectedDomainData && !loadingDomainDetails}
				<div class="space-y-4">
					<!-- Domain Header -->
					<div class="bg-gray-50 rounded-lg shadow p-6">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div>
								<h2 class="text-xl font-bold text-gray-900">{selectedDomainData.name}</h2>
								<p class="text-sm text-gray-600 mt-1">{selectedDomainData.description}</p>
							</div>
							<div class="flex items-center gap-3">
								<span class="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800">
									{selectedDomainData.weightPercentage}%
								</span>
								<span class="text-sm text-gray-600">
									{selectedDomainData.tasks?.length ?? 0} Tasks
								</span>
							</div>
						</div>
					</div>

					<!-- Task List -->
					<div class="space-y-3">
						{#each (selectedDomainData.tasks || []) as task}
							{@const isExpanded = expandedTask === task.id}
							{@const currentTab = activeTab[task.id] || 'study'}
							{@const colors = domainColors[selectedDomainData.code] || {
								gradient: 'from-gray-500 to-gray-600',
								bg: 'bg-gray-500/10',
								text: 'text-gray-600'
							}}

							<div
								class="bg-white rounded-lg shadow overflow-hidden transition-all duration-300 {isExpanded
									? 'ring-2 ring-indigo-600 shadow-lg'
									: 'hover:shadow-md'}"
							>
								<!-- Task Header -->
								<button
									on:click={() => toggleTaskExpanded(task.id)}
									class="w-full text-left p-4"
								>
									<div class="flex items-start justify-between gap-4">
										<div class="flex-1">
											<div class="flex items-center gap-3 mb-2">
												<span class="px-3 py-1 text-xs font-medium rounded-full {colors.bg} {colors.text}">
													{task.code}
												</span>
												<h3 class="font-semibold text-gray-900">{task.name}</h3>
											</div>
											<p class="text-sm text-gray-600 line-clamp-2">{task.description}</p>
										</div>
										<svg
											class="w-5 h-5 text-gray-600 transition-transform flex-shrink-0 mt-1 {isExpanded
												? 'rotate-180'
												: ''}"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</button>

								<!-- Expanded Content with Tabs -->
								{#if isExpanded}
									<div class="border-t border-gray-200">
										<!-- Tab Navigation -->
										<div class="flex border-b border-gray-200 bg-gray-50">
											{#each tabs as tab}
												<button
													on:click={() => setTaskTab(task.id, tab.id)}
													class="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative {currentTab ===
													tab.id
														? 'text-indigo-600'
														: 'text-gray-600 hover:text-gray-900'}"
												>
													{@html tab.icon}
													<span class="hidden sm:inline">{tab.label}</span>
													{#if currentTab === tab.id}
														<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
													{/if}
												</button>
											{/each}
										</div>

										<!-- Tab Content -->
										<div class="p-4">
											<!-- Study Guide Tab -->
											{#if currentTab === 'study'}
												<div class="space-y-4">
													<p class="text-gray-600">
														Study guide content for this task will be displayed here.
													</p>
												</div>
											{/if}

											<!-- Flashcards Tab -->
											{#if currentTab === 'flashcards'}
												<div class="text-center py-6">
													<div
														class="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center"
													>
														<svg
															class="w-8 h-8 text-indigo-600"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
															/>
														</svg>
													</div>
													<h3 class="text-lg font-semibold text-gray-900 mb-2">
														Flashcards for {task.code}
													</h3>
													<p class="text-sm text-gray-600 mb-6 max-w-md mx-auto">
														Study key concepts for "{task.name}" with our SM-2 spaced
														repetition flashcards.
													</p>
													<button
														on:click={() =>
															startFlashcardSession(selectedDomainData.id, task.id)}
														disabled={startingSession ===
															`flashcard-${task.id}`}
														class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
													>
														{#if startingSession === `flashcard-${task.id}`}
															<span class="flex items-center gap-2">
																<div
																	class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
																></div>
																Starting...
															</span>
														{:else}
															Start Flashcard Session
														{/if}
													</button>
												</div>
											{/if}

											<!-- Practice Questions Tab -->
											{#if currentTab === 'practice'}
												<div class="text-center py-6">
													<div
														class="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center"
													>
														<svg
															class="w-8 h-8 text-orange-600"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
													</div>
													<h3 class="text-lg font-semibold text-gray-900 mb-2">
														Practice Questions for {task.code}
													</h3>
													<p class="text-sm text-gray-600 mb-6 max-w-md mx-auto">
														Test your knowledge of "{task.name}" with exam-style
														practice questions.
													</p>
													<button
														on:click={() =>
															startPracticeSession(selectedDomainData.id, task.id)}
														disabled={startingSession ===
															`practice-${task.id}`}
														class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
													>
														{#if startingSession === `practice-${task.id}`}
															<span class="flex items-center gap-2">
																<div
																	class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
																></div>
																Starting...
															</span>
														{:else}
															Start Practice Session
														{/if}
													</button>
												</div>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- No domains message -->
			{#if domains.length === 0}
				<div class="text-center py-12">
					<p class="text-gray-600">No study content available yet.</p>
				</div>
			{/if}
		</main>
	</div>
{/if}
