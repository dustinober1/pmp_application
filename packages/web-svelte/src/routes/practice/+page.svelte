<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { getRollingAverage, getAllScores, type MockExamScore } from '$lib/utils/mockExamStorage';
	import { getPracticeStatsFromStorage, type PracticeStats as StoragePracticeStats } from '$lib/utils/practiceSessionStorage';
	import { practiceApi } from '$lib/utils/api';
	import { getPracticeStats, getDomains, type PracticeStats, type Domain } from '$lib/utils/practiceData';
	import { loadStaticQuestions } from '$lib/utils/staticDataLoader';
	import { practiceMode } from '$lib/stores/practiceMode';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';

	// Combined stats type that includes testbank metadata and user progress
	interface CombinedPracticeStats extends PracticeStats {
		totalSessions: number;
		bestScore: number;
		weakDomains: string[];
	}

	let loading = $state(true);
	let stats: CombinedPracticeStats | null = $state(null);
	let domains: Domain[] = $state([]);
	let mockExams = [];
	let error = $state(null);
	let selectedDomains = $state<string[]>([]);
	let questionCount = $state(25);
	let startMode = $state<'srs' | 'shuffle'>('srs');
	let starting = $state(false);

	// LocalStorage data
	let rollingAverage = $state(0);
	let mockExamHistory: MockExamScore[] = $state([]);
	let storageStats = $state({
		totalSessions: 0,
		totalQuestions: 0,
		bestScore: 0,
		weakDomains: [] as string[],
		averageScore: 0
	});

	onMount(async () => {
		// Load localStorage data for practice sessions
		storageStats = getPracticeStatsFromStorage();
		rollingAverage = getRollingAverage(5);
		mockExamHistory = getAllScores();

		// Load data from JSON files (client-side)
		try {
			const [statsResult, domainsResult] = await Promise.all([
				getPracticeStats(),
				getDomains()
			]);
			stats = {
				...statsResult,
				totalSessions: storageStats.totalSessions,
				bestScore: storageStats.bestScore,
				weakDomains: storageStats.weakDomains,
			};
			domains = domainsResult;
			mockExams = [];
		} catch (err) {
			console.error('Failed to load practice data:', err);
			error = err instanceof Error ? err.message : 'Failed to load practice data';
		} finally {
			loading = false;
		}
	});

	async function startSession() {
		console.log('[DEBUG] startSession called');
		starting = true;
		try {
			// Load all questions
			console.log('[DEBUG] Loading static questions...');
			const allQuestions = await loadStaticQuestions();
			console.log('[DEBUG] Questions loaded:', allQuestions?.length);
			
			// Filter by domain if selected
			let filteredQuestions = allQuestions;
			if (selectedDomains.length > 0) {
				filteredQuestions = allQuestions.filter(q => 
					selectedDomains.some(dId => q.domainId.toLowerCase().includes(dId.toLowerCase()))
				);
			}

			// Start session in store
			console.log('[DEBUG] Starting session in store with options:', { limit: questionCount, priority: startMode });
			const sessionId = practiceMode.startSession(filteredQuestions, {
				limit: questionCount,
				priority: startMode
			});
			console.log('[DEBUG] Session ID generated:', sessionId);

			if (sessionId) {
				const target = `${base}/practice/${sessionId}`;
				console.log('[DEBUG] Navigating to:', target);
				goto(target);
			} else {
				console.error('[DEBUG] No session ID returned');
			}
		} catch (err) {
			console.error('Failed to start session:', err);
			error = err instanceof Error ? err.message : 'Failed to start practice session';
		} finally {
			starting = false;
		}
	}

	async function startMockExam(examId: number) {
		starting = true;
		try {
			const response = await practiceApi.startSession({
				// Mock exam parameters
				questionCount: 185,
				domainIds: []
			});
			const sessionId = response.data?.sessionId;
			if (sessionId) {
				goto(`${base}/practice/${sessionId}`);
			}
		} catch (err) {
			console.error('Failed to start mock exam:', err);
			error = err instanceof Error ? err.message : 'Failed to start mock exam';
		} finally {
			starting = false;
		}
	}

	function toggleDomain(domainId: string) {
		if (selectedDomains.includes(domainId)) {
			selectedDomains = selectedDomains.filter((id) => id !== domainId);
		} else {
			selectedDomains = [...selectedDomains, domainId];
		}
	}
	
	async function startPresetSession(count: number, mode: 'srs' | 'shuffle') {
            console.log('[DEBUG] startPresetSession called with:', count, mode, 'Base:', base);
            // alert('Starting session...'); // Debug alert
		    questionCount = count;
		    startMode = mode;
		    await startSession();
	}

	async function startFlaggedSession() {
		console.log('[DEBUG] startFlaggedSession called');
		starting = true;
		try {
			// Load all questions
			const allQuestions = await loadStaticQuestions();
			
			// Start session with 'flagged' priority (filtering handled in store)
			const sessionId = practiceMode.startSession(allQuestions, {
				priority: 'flagged'
			});

			if (sessionId) {
				goto(`${base}/practice/${sessionId}`);
			} else {
				// Handle case where no flagged questions exist
				alert('No flagged questions found to review!');
			}
		} catch (err) {
			console.error('Failed to start flagged session:', err);
			error = err instanceof Error ? err.message : 'Failed to start flagged session';
		} finally {
			starting = false;
		}
	}

	let showHistory = $state(false);
</script>

{#if loading}
	<LoadingState message="Loading practice..." />
{:else if error && !stats}
	<ErrorState title="Practice Error" message={error} />
{:else}
	<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">

		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- ECO Notice with Sustainability -->
			<div class="group mb-6 bg-gradient-to-r from-green-50/90 to-emerald-50/90 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-md p-4 rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-lg hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-[1.01]">
				<div class="flex items-center justify-center gap-2 mb-2">
					<span class="text-2xl group-hover:scale-110 transition-transform duration-300">🌱</span>
					<span class="font-semibold text-green-900 dark:text-green-100">July 2026 ECO Update</span>
				</div>
				<p class="text-sm text-green-700 dark:text-green-300 text-center">
					Practice questions now include <strong>Sustainability & ESG scenarios</strong> alongside AI in project management topics.
				</p>
			</div>

			<div class="mb-8">
				<h1 class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">Practice Questions</h1>
				<p class="text-gray-600 dark:text-gray-300">
					Test your knowledge with realistic PMP exam questions.
				</p>
			</div>

			<!-- Quick Start Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<!-- Quick 10 -->
				<button
					on:click={() => startPresetSession(10, 'shuffle')}
					disabled={starting}
					class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-600/50 dark:hover:border-indigo-400/50 p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/20 text-left"
				>
					<div class="flex items-center justify-between mb-4">
						<div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-1 rounded-lg">Quick</span>
					</div>
					<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Quick 10</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Random 10 questions to warm up</p>
				</button>

				<!-- Standard 25 -->
				<button
					on:click={() => startPresetSession(25, 'shuffle')}
					disabled={starting}
					class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border-2 border-transparent hover:border-purple-600/50 dark:hover:border-purple-400/50 p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-purple-500/20 text-left"
				>
					<div class="flex items-center justify-between mb-4">
						<div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						</div>
						<span class="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/50 px-2 py-1 rounded-lg">Standard</span>
					</div>
					<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Standard 25</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Balanced set of 25 questions</p>
				</button>

				<!-- Weak Areas (SRS) -->
				<button
					on:click={() => startPresetSession(30, 'srs')}
					disabled={starting}
					class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border-2 border-transparent hover:border-pink-600/50 dark:hover:border-pink-400/50 p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-pink-500/20 text-left"
				>
					<div class="flex items-center justify-between mb-4">
						<div class="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform duration-300">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
							</svg>
						</div>
						<span class="text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/50 px-2 py-1 rounded-lg">Smart Focus</span>
					</div>
					<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Weak Areas</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Target your weakest topics</p>
				</button>
				
				<!-- Review Flagged -->
				<button
					onclick={startFlaggedSession}
					disabled={starting}
					class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border-2 border-transparent hover:border-yellow-600/50 dark:hover:border-yellow-400/50 p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-yellow-500/20 block w-full text-left"
				>
					<div class="flex items-center justify-between mb-4">
						<div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform duration-300">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8l-2 2h-2a2 2 0 01-2-2v-3a2 2 0 01-2-2h-3z" /> 
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
							</svg>
						</div>
						<span class="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50 px-2 py-1 rounded-lg">Review</span>
					</div>
					<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Flagged</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Review questions you marked</p>
				</button>
			</div>
			
			<!-- Stats Row -->
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 text-center border border-gray-200/50 dark:border-gray-700/50">
					<h2 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Sessions</h2>
					<p class="text-3xl font-bold text-gray-900 dark:text-white">{storageStats.totalSessions}</p>
				</div>
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 text-center border border-gray-200/50 dark:border-gray-700/50">
					<h2 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Questions Answered</h2>
					<p class="text-3xl font-bold text-gray-900 dark:text-white">{storageStats.totalQuestions}</p>
				</div>
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 text-center border border-gray-200/50 dark:border-gray-700/50">
					<h2 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Average Score</h2>
					<p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{storageStats.averageScore}%</p>
				</div>
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 text-center border border-gray-200/50 dark:border-gray-700/50">
					<h2 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Best Score</h2>
					<p class="text-3xl font-bold text-green-600 dark:text-green-400">{storageStats.bestScore}%</p>
				</div>
			</div>

			<!-- Session History (Collapsible) -->
			{#if mockExamHistory.length > 0}
				<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-8 transition-all duration-300">
					<div class="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
						<h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">
							Session History ({mockExamHistory.length})
						</h2>
						<button
							onclick={() => showHistory = !showHistory}
							class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
						>
							{showHistory ? 'Hide' : 'Show'}
						</button>
					</div>

					{#if showHistory}
						<div class="divide-y divide-gray-200/50 dark:divide-gray-700/50">
							{#each mockExamHistory.slice().reverse() as exam}
								<div class="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors flex items-center justify-between">
									<div>
										<p class="text-sm font-medium text-gray-900 dark:text-white">
											Practice Session
										</p>
										<p class="text-xs text-gray-500 dark:text-gray-400">
											{new Date(exam.date).toLocaleDateString()} • {exam.totalQuestions} Questions
										</p>
									</div>
									<div class="flex items-center gap-4">
										<div class="text-right">
											<p class="text-sm font-bold {exam.score >= 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}">
												{exam.score}%
											</p>
											<p class="text-xs text-gray-500 dark:text-gray-400">
												{exam.correctAnswers}/{exam.totalQuestions}
											</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
			
			<!-- Weak Areas Focus -->
			{#if storageStats.weakDomains && storageStats.weakDomains.length > 0}
				<div class="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md rounded-2xl shadow-sm border border-red-100 dark:border-red-800/30 p-6">
					<h2 class="text-lg font-semibold text-red-800 dark:text-red-300 mb-3">Priority Focus Areas</h2>
					<div class="flex flex-wrap gap-2">
						{#each storageStats.weakDomains as domain}
							<span class="px-3 py-1 text-sm font-medium rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50">
								{domain}
							</span>
						{/each}
					</div>
				</div>
			{/if}

		</main>
	</div>
{/if}
