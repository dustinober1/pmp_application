<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { getDomain } from '$lib/utils/studyData';
	import { flashcardApi, practiceApi } from '$lib/utils/api';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

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

	// ECO 2026 Updates
	const ecoInfo = {
		version: 'July 2026 ECO',
		domains: [
			{ name: 'People', weight: 33 },
			{ name: 'Process', weight: 41 },
			{ name: 'Business Environment', weight: 26 }
		],
		methodology: {
			adaptiveHybrid: 60,
			predictive: 40
		},
		examFormat: {
			questions: 185,
			minutes: 240
		}
	};

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
				// Use static data loader
				const domain = await getDomain(domainId);
				selectedDomainData = domain;
			} catch (err) {
				console.error('Failed to fetch domain details:', err);
				// Fallback to static data from initial load
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
				goto(`${base}/flashcards/practice?sessionId=${response.data.sessionId}`);
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
				goto(`${base}/practice/${response.data.sessionId}`);
			}
		} catch (err) {
			console.error('Failed to start practice session:', err);
		} finally {
			startingSession = null;
		}
	}

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
{:else}
	<div class="min-h-screen flex flex-col bg-background relative overflow-hidden">
		<!-- Subtle blobs for background -->
		<div class="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-b-blob blur-3xl opacity-50 pointer-events-none transform -translate-y-1/2"></div>
		<div class="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-40 pointer-events-none translate-y-1/4"></div>

		<!-- Hero Section -->
		<section class="relative py-12 sm:py-16 z-10">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<!-- ECO Notice -->
				<div class="mb-6 flex justify-center">
					<div class="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-black/20 border border-primary/20 rounded-full backdrop-blur-sm shadow-sm">
						<span class="relative flex h-3 w-3">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
							<span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
						</span>
						<span class="text-sm font-bold font-serif text-primary-foreground text-foreground">Updated for {ecoInfo.version}</span>
					</div>
				</div>

				<div class="text-center mb-12">
					<h1 class="text-4xl sm:text-5xl font-bold font-serif text-foreground mb-4">
						PMP Study Hub
					</h1>
					<p class="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
						Master all three domains with integrated study guides, flashcards, and
						practice questions for each task.
					</p>
				</div>
				
				<!-- ECO Info Cards -->
				<div class="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
					<!-- Domain Weighting -->
					<Card variant="default" class="p-6 text-center hover:shadow-lg transition-transform hover:-translate-y-1">
						<div class="flex items-center justify-center gap-2 mb-3 text-primary">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
							</svg>
							<span class="text-sm font-bold font-serif text-foreground">Domain Weighting</span>
						</div>
						<div class="space-y-2 text-sm text-muted-foreground">
							<div class="flex justify-between border-b border-border/50 pb-1"><span>People</span><span class="font-bold text-foreground">{ecoInfo.domains[0].weight}%</span></div>
							<div class="flex justify-between border-b border-border/50 pb-1"><span>Process</span><span class="font-bold text-foreground">{ecoInfo.domains[1].weight}%</span></div>
							<div class="flex justify-between pt-1"><span>Business Env.</span><span class="font-bold text-foreground">{ecoInfo.domains[2].weight}%</span></div>
						</div>
					</Card>

					<!-- Methodology Distribution -->
					<Card variant="default" class="p-6 text-center hover:shadow-lg transition-transform hover:-translate-y-1">
						<div class="flex items-center justify-center gap-2 mb-3 text-secondary">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
							</svg>
							<span class="text-sm font-bold font-serif text-foreground">Methodology</span>
						</div>
						<div class="space-y-2 text-sm text-muted-foreground">
							<div class="flex justify-between border-b border-border/50 pb-1"><span>Adaptive/Hybrid</span><span class="font-bold text-foreground">{ecoInfo.methodology.adaptiveHybrid}%</span></div>
							<div class="flex justify-between border-b border-border/50 pb-1"><span>Predictive</span><span class="font-bold text-foreground">{ecoInfo.methodology.predictive}%</span></div>
							<div class="pt-1 text-xs italic text-secondary">60/40 split for ECO 2026</div>
						</div>
					</Card>

					<!-- Exam Format -->
					<Card variant="default" class="p-6 text-center hover:shadow-lg transition-transform hover:-translate-y-1">
						<div class="flex items-center justify-center gap-2 mb-3 text-primary">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<span class="text-sm font-bold font-serif text-foreground">Exam Format</span>
						</div>
						<div class="space-y-2 text-sm text-muted-foreground">
							<div class="flex justify-between border-b border-border/50 pb-1"><span>Questions</span><span class="font-bold text-foreground">{ecoInfo.examFormat.questions}</span></div>
							<div class="flex justify-between border-b border-border/50 pb-1"><span>Time Limit</span><span class="font-bold text-foreground">{ecoInfo.examFormat.minutes}m</span></div>
							<div class="pt-1 text-xs text-primary font-bold">~{Math.round(ecoInfo.examFormat.minutes / (ecoInfo.examFormat.questions / 60))} sec/question</div>
						</div>
					</Card>
				</div>
			</div>
		</section>

		<main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full z-10">
			
			<!-- Study Modules -->
			{#if data.modules && data.modules.length > 0}
				<div class="mb-12">
					<h2 class="text-2xl font-bold font-serif text-foreground mb-6 flex items-center gap-2">
						<span class="text-primary">📚</span> 
						Study Modules
					</h2>
					<div class="grid md:grid-cols-2 gap-6">
						{#each data.modules as module}
							<a href="{base}/study/modules/{module.id}" class="group block no-underline text-foreground">
								<Card variant="feature" class="p-6 h-full transition-all hover:border-primary/50 hover:shadow-lg relative overflow-hidden group">
									<div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-blob -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
									<div class="relative z-10">
										<span class="inline-block px-3 py-1 text-xs font-bold text-primary bg-primary/10 rounded-full mb-3">
											Module {module.id.split('-')[0]}
										</span>
										<h3 class="text-xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">
											{module.title}
										</h3>
										<p class="text-sm text-muted-foreground mb-4 line-clamp-2">
											{module.description}
										</p>
										<div class="flex items-center text-sm font-bold text-primary">
											Start Learning <span class="ml-1 transition-transform group-hover:translate-x-1">→</span>
										</div>
									</div>
								</Card>
							</a>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Loading state for domain details -->
			{#if selectedDomain && loadingDomainDetails}
				<Card class="p-12 mb-8">
					<div class="flex items-center justify-center">
						<div class="flex items-center gap-3">
							<div
								class="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"
							></div>
							<span class="text-lg font-serif text-muted-foreground">Loading tasks...</span>
						</div>
					</div>
				</Card>
			{/if}

			<!-- Expanded Domain with Tasks -->
			{#if selectedDomain && selectedDomainData && !loadingDomainDetails}
				<div class="space-y-6">
					<!-- Domain Header -->
					<Card variant="feature" class="p-8">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div>
								<h2 class="text-2xl font-bold font-serif text-foreground">{selectedDomainData.name}</h2>
								<p class="text-muted-foreground mt-2">{selectedDomainData.description}</p>
							</div>
							<div class="flex items-center gap-3">
								<span class="px-4 py-1.5 text-sm font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
									{selectedDomainData.weightPercentage}%
								</span>
								<span class="text-sm font-medium text-muted-foreground">
									{selectedDomainData.tasks?.length ?? 0} Tasks
								</span>
							</div>
						</div>
					</Card>

					<!-- Task List -->
					<div class="space-y-4">
						{#each (selectedDomainData.tasks || []) as task}
							{@const isExpanded = expandedTask === task.id}
							{@const currentTab = activeTab[task.id] || 'study'}
							
							<Card
								variant={isExpanded ? "default" : "flat"}
								class="transition-all duration-300 {isExpanded ? 'ring-2 ring-primary/30 shadow-lg' : 'hover:bg-muted/30'}"
							>
								<!-- Task Header -->
								<button
									on:click={() => toggleTaskExpanded(task.id)}
									class="w-full text-left p-6 focus:outline-none"
								>
									<div class="flex items-start justify-between gap-4">
										<div class="flex-1">
											<div class="flex items-center gap-3 mb-2">
												<span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-muted text-muted-foreground border border-border">
													{task.code}
												</span>
												<h3 class="font-bold font-serif text-lg text-foreground">{task.name}</h3>
											</div>
											<p class="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
										</div>
										<div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-transform group-hover:scale-110 {isExpanded ? 'rotate-180 bg-primary/10 text-primary' : ''}">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
										</div>
									</div>
								</button>

								<!-- Expanded Content with Tabs -->
								{#if isExpanded}
									<div class="border-t border-border">
										<!-- Tab Navigation -->
										<div class="flex border-b border-border bg-muted/30">
											{#each tabs as tab}
												<button
													on:click={() => setTaskTab(task.id, tab.id)}
													class="flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative {currentTab === tab.id ? 'text-primary bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
												>
													{@html tab.icon}
													<span class="hidden sm:inline">{tab.label}</span>
													{#if currentTab === tab.id}
														<div class="absolute top-0 left-0 right-0 h-0.5 bg-primary"></div>
													{/if}
												</button>
											{/each}
										</div>

										<!-- Tab Content -->
										<div class="p-6 bg-background/50">
											<!-- Study Guide Tab -->
											{#if currentTab === 'study'}
												<div class="prose prose-stone max-w-none dark:prose-invert">
													<p class="text-muted-foreground italic">
														Study guide content for this task will be displayed here soon.
													</p>
												</div>
											{/if}

											<!-- Flashcards Tab -->
											{#if currentTab === 'flashcards'}
												<div class="text-center py-8">
													<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
														<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
													</div>
													<h3 class="text-lg font-bold font-serif mb-2">Flashcards for {task.code}</h3>
													<p class="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
														Study key concepts for "{task.name}" with our SM-2 spaced repetition flashcards.
													</p>
													<Button
														variant="primary"
														on:click={() => startFlashcardSession(selectedDomainData.id, task.id)}
														disabled={startingSession === `flashcard-${task.id}`}
													>
														{#if startingSession === `flashcard-${task.id}`}
															<span class="flex items-center gap-2">Started...</span>
														{:else}
															Start Flashcard Session
														{/if}
													</Button>
												</div>
											{/if}

											<!-- Practice Questions Tab -->
											{#if currentTab === 'practice'}
												<div class="text-center py-8">
													<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
														<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
													</div>
													<h3 class="text-lg font-bold font-serif mb-2">Practice Questions for {task.code}</h3>
													<p class="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
														Test your knowledge of "{task.name}" with exam-style practice questions.
													</p>
													<Button
														variant="secondary"
														on:click={() => startPracticeSession(selectedDomainData.id, task.id)}
														disabled={startingSession === `practice-${task.id}`}
													>
														{#if startingSession === `practice-${task.id}`}
															<span class="flex items-center gap-2">Starting...</span>
														{:else}
															Start Practice Session
														{/if}
													</Button>
												</div>
											{/if}
										</div>
									</div>
								{/if}
							</Card>
						{/each}
					</div>
				</div>
			{/if}

			<!-- No domains message -->
			{#if domains.length === 0}
				<div class="text-center py-12">
					<p class="text-muted-foreground italic">No study content available yet.</p>
				</div>
			{/if}
		</main>
	</div>
{/if}
