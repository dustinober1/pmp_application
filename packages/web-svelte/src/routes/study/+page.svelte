<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { contentApi, flashcardApi, practiceApi } from '$lib/utils/api';
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

	// ECO 2026 Updates
	const ecoInfo = {
		version: 'July 2026 ECO',
		domains: [
			{ name: 'People', weight: 33, color: 'blue' },
			{ name: 'Process', weight: 41, color: 'emerald' },
			{ name: 'Business Environment', weight: 26, color: 'orange' }
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
			text: 'text-blue-600',
			shadowColor: 'blue'
		},
		PROCESS: {
			gradient: 'from-emerald-500 to-teal-600',
			bg: 'bg-emerald-500/10',
			text: 'text-emerald-600',
			shadowColor: 'emerald'
		},
		BUSINESS_ENVIRONMENT: {
			gradient: 'from-orange-500 to-amber-600',
			bg: 'bg-orange-500/10',
			text: 'text-orange-600',
			shadowColor: 'orange'
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
{:else}
	<div class="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">

		<!-- Hero Section -->
		<section class="relative overflow-hidden py-12 sm:py-16">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<!-- ECO Notice -->
				<div class="mb-6 flex justify-center">
					<div class="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200 dark:border-indigo-700 rounded-full backdrop-blur-sm hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-300">
						<span class="relative flex h-3 w-3">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
							<span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
						</span>
						<span class="text-sm font-medium text-indigo-900 dark:text-indigo-100">Updated for {ecoInfo.version}</span>
					</div>
				</div>

				<div class="text-center">
					<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
						PMP Study Hub
					</h1>
					<p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
						Master all three domains with integrated study guides, flashcards, and
						practice questions for each task.
					</p>

					<!-- ECO Info Cards -->
					<div class="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
						<!-- Domain Weighting -->
						<div class="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-md rounded-lg p-4 border border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300">
							<div class="flex items-center justify-center gap-2 mb-3">
								<svg class="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
								</svg>
								<span class="text-sm font-semibold text-blue-900 dark:text-blue-100">Domain Weighting</span>
							</div>
							<div class="space-y-1 text-xs text-blue-800 dark:text-blue-200">
								<div class="flex justify-between"><span>People</span><span class="font-medium">{ecoInfo.domains[0].weight}%</span></div>
								<div class="flex justify-between"><span>Process</span><span class="font-medium">{ecoInfo.domains[1].weight}%</span></div>
								<div class="flex justify-between"><span>Business Environment</span><span class="font-medium">{ecoInfo.domains[2].weight}%</span></div>
							</div>
						</div>

						<!-- Methodology Distribution -->
						<div class="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 backdrop-blur-md rounded-lg p-4 border border-emerald-200 dark:border-emerald-700 shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300">
							<div class="flex items-center justify-center gap-2 mb-3">
								<svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
								</svg>
								<span class="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Methodology Focus</span>
							</div>
							<div class="space-y-1 text-xs text-emerald-800 dark:text-emerald-200">
								<div class="flex justify-between"><span>Adaptive/Hybrid</span><span class="font-medium">{ecoInfo.methodology.adaptiveHybrid}%</span></div>
								<div class="flex justify-between"><span>Predictive</span><span class="font-medium">{ecoInfo.methodology.predictive}%</span></div>
								<div class="pt-1 text-xs text-emerald-600 dark:text-emerald-300 italic">60/40 split for ECO 2026</div>
							</div>
						</div>

						<!-- Exam Format -->
						<div class="group bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 backdrop-blur-md rounded-lg p-4 border border-orange-200 dark:border-orange-700 shadow-lg hover:shadow-orange-500/25 hover:scale-105 transition-all duration-300">
							<div class="flex items-center justify-center gap-2 mb-3">
								<svg class="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
								<span class="text-sm font-semibold text-orange-900 dark:text-orange-100">Exam Format</span>
							</div>
							<div class="space-y-1 text-xs text-orange-800 dark:text-orange-200">
								<div class="flex justify-between"><span>Questions</span><span class="font-medium">{ecoInfo.examFormat.questions}</span></div>
								<div class="flex justify-between"><span>Time Limit</span><span class="font-medium">{ecoInfo.examFormat.minutes} minutes</span></div>
								<div class="pt-1 text-xs text-orange-600 dark:text-orange-300">~{Math.round(ecoInfo.examFormat.minutes / (ecoInfo.examFormat.questions / 60))} sec/question</div>
							</div>
						</div>
					</div>

					<!-- Sustainability/ESG Section -->
					<div class="group mt-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-md rounded-lg p-6 border border-green-200 dark:border-green-700 shadow-lg hover:shadow-green-500/25 hover:scale-[1.01] transition-all duration-300">
						<div class="flex items-center justify-center gap-2 mb-4">
							<span class="text-2xl group-hover:scale-110 transition-transform duration-300">🌱</span>
							<h3 class="text-lg font-semibold text-green-900 dark:text-green-100">Sustainability & ESG Considerations</h3>
						</div>
						<p class="text-sm text-green-800 dark:text-green-200 mb-4 text-center">
							New for July 2026 ECO - Environmental, Social, and Governance factors in project management
						</p>
						<div class="grid sm:grid-cols-3 gap-4">
							<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 dark:border-green-700 shadow-md hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300">
								<div class="flex items-center gap-2 mb-2">
									<span class="text-xl group-hover:scale-110 transition-transform duration-300">🌍</span>
									<h4 class="font-semibold text-green-900 dark:text-green-100 text-sm">Environmental</h4>
								</div>
								<ul class="text-xs text-green-800 dark:text-green-200 space-y-1">
									<li>• Carbon footprint management</li>
									<li>• Resource efficiency</li>
									<li>• Climate risk assessment</li>
									<li>• Sustainable procurement</li>
								</ul>
							</div>
							<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 dark:border-green-700 shadow-md hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300">
								<div class="flex items-center gap-2 mb-2">
									<span class="text-xl group-hover:scale-110 transition-transform duration-300">👥</span>
									<h4 class="font-semibold text-green-900 dark:text-green-100 text-sm">Social</h4>
								</div>
								<ul class="text-xs text-green-800 dark:text-green-200 space-y-1">
									<li>• Stakeholder inclusivity</li>
									<li>• Community impact</li>
									<li>• Labor practices</li>
									<li>• Health & safety</li>
								</ul>
							</div>
							<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 dark:border-green-700 shadow-md hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300">
								<div class="flex items-center gap-2 mb-2">
									<span class="text-xl group-hover:scale-110 transition-transform duration-300">⚖️</span>
									<h4 class="font-semibold text-green-900 dark:text-green-100 text-sm">Governance</h4>
								</div>
								<ul class="text-xs text-green-800 dark:text-green-200 space-y-1">
									<li>• Ethical leadership</li>
									<li>• Compliance & reporting</li>
									<li>• Transparency</li>
									<li>• Risk management</li>
								</ul>
							</div>
						</div>
						<div class="mt-4 p-3 bg-green-100/90 dark:bg-green-900/50 backdrop-blur-sm rounded-lg border border-green-300 dark:border-green-600">
							<p class="text-xs text-green-900 dark:text-green-100 font-medium">
								💡 <strong>Exam Tip:</strong> ESG considerations are integrated across all three domains. Look for scenarios where sustainable practices impact project decisions, stakeholder engagement, and business value.
							</p>
						</div>
					</div>

					<!-- AI in Project Management Section -->
					<div class="group mt-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 backdrop-blur-md rounded-lg p-6 border border-violet-200 dark:border-violet-700 shadow-lg hover:shadow-violet-500/25 hover:scale-[1.01] transition-all duration-300">
						<div class="flex items-center justify-center gap-2 mb-4">
							<span class="text-2xl group-hover:scale-110 transition-transform duration-300">🤖</span>
							<h3 class="text-lg font-semibold text-violet-900 dark:text-violet-100">AI in Project Management</h3>
						</div>
						<p class="text-sm text-violet-800 dark:text-violet-200 mb-4 text-center">
							New for July 2026 ECO - Generative AI, machine learning, and automation tools transforming project delivery
						</p>
						<div class="grid sm:grid-cols-3 gap-4">
							<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-violet-200 dark:border-violet-700 shadow-md hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105 transition-all duration-300">
								<div class="flex items-center gap-2 mb-2">
									<span class="text-xl group-hover:scale-110 transition-transform duration-300">📝</span>
									<h4 class="font-semibold text-violet-900 dark:text-violet-100 text-sm">Documentation</h4>
								</div>
								<ul class="text-xs text-violet-800 dark:text-violet-200 space-y-1">
									<li>• AI-generated project docs</li>
									<li>• Meeting summaries</li>
									<li>• Report automation</li>
									<li>• Requirements analysis</li>
								</ul>
							</div>
							<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-violet-200 dark:border-violet-700 shadow-md hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105 transition-all duration-300">
								<div class="flex items-center gap-2 mb-2">
									<span class="text-xl group-hover:scale-110 transition-transform duration-300">📊</span>
									<h4 class="font-semibold text-violet-900 dark:text-violet-100 text-sm">Analytics</h4>
								</div>
								<ul class="text-xs text-violet-800 dark:text-violet-200 space-y-1">
									<li>• Predictive risk modeling</li>
									<li>• Schedule forecasting</li>
									<li>• Resource optimization</li>
									<li>• Performance insights</li>
								</ul>
							</div>
							<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-violet-200 dark:border-violet-700 shadow-md hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105 transition-all duration-300">
								<div class="flex items-center gap-2 mb-2">
									<span class="text-xl group-hover:scale-110 transition-transform duration-300">💬</span>
									<h4 class="font-semibold text-violet-900 dark:text-violet-100 text-sm">Communication</h4>
								</div>
								<ul class="text-xs text-violet-800 dark:text-violet-200 space-y-1">
									<li>• Stakeholder engagement</li>
									<li>• Automated updates</li>
									<li>• Sentiment analysis</li>
									<li>• Language translation</li>
								</ul>
							</div>
						</div>
						<div class="mt-4 grid sm:grid-cols-2 gap-4">
							<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-violet-200 dark:border-violet-700 shadow-md hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105 transition-all duration-300">
								<div class="flex items-center gap-2 mb-2">
									<span class="text-xl group-hover:scale-110 transition-transform duration-300">⚠️</span>
									<h4 class="font-semibold text-violet-900 dark:text-violet-100 text-sm">Key Considerations</h4>
								</div>
								<ul class="text-xs text-violet-800 dark:text-violet-200 space-y-1">
									<li>• Ethical implications & bias</li>
									<li>• Data privacy & security</li>
									<li>• Human judgment remains key</li>
									<li>• Verify AI-generated outputs</li>
								</ul>
							</div>
							<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-violet-200 dark:border-violet-700 shadow-md hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105 transition-all duration-300">
								<div class="flex items-center gap-2 mb-2">
									<span class="text-xl group-hover:scale-110 transition-transform duration-300">🎯</span>
									<h4 class="font-semibold text-violet-900 dark:text-violet-100 text-sm">Exam Focus</h4>
								</div>
								<ul class="text-xs text-violet-800 dark:text-violet-200 space-y-1">
									<li>• AI as tool, not replacement</li>
									<li>• When to use vs. not use AI</li>
									<li>• Balancing automation & oversight</li>
									<li>• PMI's AI guidelines</li>
								</ul>
							</div>
						</div>
						<div class="mt-4 p-3 bg-violet-100/90 dark:bg-violet-900/50 backdrop-blur-sm rounded-lg border border-violet-300 dark:border-violet-600">
							<p class="text-xs text-violet-900 dark:text-violet-100 font-medium">
								💡 <strong>Exam Tip:</strong> AI appears across all domains in scenarios. Focus on understanding when AI enhances project outcomes versus when human expertise is essential. Consider ethical, privacy, and accuracy implications in AI-assisted decisions.
							</p>
						</div>
					</div>
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
						text: 'text-gray-600',
						shadowColor: 'gray'
					}}
					{@const isSelected = selectedDomain === domain.id}

					<button
						on:click={() => toggleSelectedDomain(domain.id)}
						class="card group w-full text-left transition-all duration-300 hover:scale-105 hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 {isSelected
							? 'ring-2 ring-indigo-600 shadow-xl'
							: colors.shadowColor === 'blue' ? 'hover:shadow-xl hover:shadow-blue-500/20'
							: colors.shadowColor === 'emerald' ? 'hover:shadow-xl hover:shadow-emerald-500/20'
							: colors.shadowColor === 'orange' ? 'hover:shadow-xl hover:shadow-orange-500/20'
							: 'hover:shadow-xl hover:shadow-gray-500/20'}"
						aria-pressed={isSelected}
					>
						<div class="flex items-start justify-between mb-4">
							<div
								class="w-14 h-14 rounded-xl bg-gradient-to-br {colors.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
							>
								<span class="text-white font-bold text-lg">{domain.weightPercentage}%</span>
							</div>
							<span class="px-3 py-1 rounded-full text-xs font-medium {colors.bg} {colors.text}">
								{domain.tasks?.length || 0} Tasks
							</span>
						</div>
						<h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{domain.name}</h2>
						<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{domain.description}</p>
						<div class="flex items-center justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
							<span class="text-sm font-medium {colors.text}">
								{isSelected ? 'Viewing Tasks ↓' : 'View Tasks →'}
							</span>
						</div>
					</button>
				{/each}
			</div>

			<!-- Loading state for domain details -->
			{#if selectedDomain && loadingDomainDetails}
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6">
					<div class="flex items-center justify-center py-12">
						<div class="flex items-center gap-3">
							<div
								class="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"
							></div>
							<span class="text-sm text-gray-600 dark:text-gray-400">Loading tasks and study materials...</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Expanded Domain with Tasks -->
			{#if selectedDomain && selectedDomainData && !loadingDomainDetails}
				<div class="space-y-4">
					<!-- Domain Header -->
					<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div>
								<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedDomainData.name}</h2>
								<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedDomainData.description}</p>
							</div>
							<div class="flex items-center gap-3">
								<span class="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200">
									{selectedDomainData.weightPercentage}%
								</span>
								<span class="text-sm text-gray-600 dark:text-gray-400">
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
								text: 'text-gray-600',
								shadowColor: 'gray'
							}}
							{@const hoverShadowClass = colors.shadowColor === 'blue' ? 'hover:shadow-blue-500/20'
								: colors.shadowColor === 'emerald' ? 'hover:shadow-emerald-500/20'
								: colors.shadowColor === 'orange' ? 'hover:shadow-orange-500/20'
								: 'hover:shadow-gray-500/20'}

							<div
								class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden transition-all duration-300 {isExpanded
									? 'ring-2 ring-indigo-600 shadow-xl'
									: 'hover:shadow-xl hover:scale-[1.01] ' + hoverShadowClass}"
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
												<h3 class="font-semibold text-gray-900 dark:text-gray-100">{task.name}</h3>
											</div>
											<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{task.description}</p>
										</div>
										<svg
											class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform flex-shrink-0 mt-1 group-hover:scale-110 {isExpanded
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
									<div class="border-t border-gray-200 dark:border-gray-700">
										<!-- Tab Navigation -->
										<div class="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-700/50 backdrop-blur-sm">
											{#each tabs as tab}
												<button
													on:click={() => setTaskTab(task.id, tab.id)}
													class="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative {currentTab ===
													tab.id
														? 'text-indigo-600 dark:text-indigo-400'
														: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}"
												>
													{@html tab.icon}
													<span class="hidden sm:inline">{tab.label}</span>
													{#if currentTab === tab.id}
														<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
													{/if}
												</button>
											{/each}
										</div>

										<!-- Tab Content -->
										<div class="p-4">
											<!-- Study Guide Tab -->
											{#if currentTab === 'study'}
												<div class="space-y-4">
													<p class="text-gray-600 dark:text-gray-400">
														Study guide content for this task will be displayed here.
													</p>
												</div>
											{/if}

											<!-- Flashcards Tab -->
											{#if currentTab === 'flashcards'}
												<div class="text-center py-6">
													<div
														class="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center"
													>
														<svg
															class="w-8 h-8 text-indigo-600 dark:text-indigo-400"
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
													<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
														Flashcards for {task.code}
													</h3>
													<p class="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
														Study key concepts for "{task.name}" with our SM-2 spaced
														repetition flashcards.
													</p>
													<button
														on:click={() =>
															startFlashcardSession(selectedDomainData.id, task.id)}
														disabled={startingSession ===
															`flashcard-${task.id}`}
														class="group px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/40"
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
														class="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center"
													>
														<svg
															class="w-8 h-8 text-orange-600 dark:text-orange-400"
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
													<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
														Practice Questions for {task.code}
													</h3>
													<p class="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
														Test your knowledge of "{task.name}" with exam-style
														practice questions.
													</p>
													<button
														on:click={() =>
															startPracticeSession(selectedDomainData.id, task.id)}
														disabled={startingSession ===
															`practice-${task.id}`}
														class="group px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/40"
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
					<p class="text-gray-600 dark:text-gray-400">No study content available yet.</p>
				</div>
			{/if}
		</main>
	</div>
{/if}
