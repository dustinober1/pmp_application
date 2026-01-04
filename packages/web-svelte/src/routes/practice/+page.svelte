<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { getRollingAverage, getAllScores, type MockExamScore } from '$lib/utils/mockExamStorage';
	import { getPracticeStatsFromStorage, type PracticeStats as StoragePracticeStats } from '$lib/utils/practiceSessionStorage';
	import { practiceApi } from '$lib/utils/api';
	import { getPracticeStats, getDomains, type PracticeStats, type Domain } from '$lib/utils/practiceData';
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
	let questionCount = $state(20);
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
		starting = true;
		try {
			const response = await practiceApi.startSession({
				domainIds: selectedDomains.length > 0 ? selectedDomains : undefined,
				questionCount
			});
			const sessionId = response.data?.sessionId;
			if (sessionId) {
				goto(`${base}/practice/session/${sessionId}`);
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
				goto(`${base}/practice/session/${sessionId}`);
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
				<h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Practice Questions</h1>
				<p class="text-gray-600 dark:text-gray-300">
					Test your knowledge with realistic PMP exam questions.
				</p>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 text-center border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-105 transition-all duration-300 cursor-default">
					<p class="text-3xl font-bold group-hover:scale-110 transition-transform duration-300">{storageStats.totalSessions}</p>
					<p class="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
				</div>
				<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 text-center border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300 cursor-default">
					<p class="text-3xl font-bold group-hover:scale-110 transition-transform duration-300">{storageStats.totalQuestions}</p>
					<p class="text-sm text-gray-600 dark:text-gray-400">Questions Answered</p>
				</div>
				<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 text-center border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-105 transition-all duration-300 cursor-default">
					<p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">{storageStats.averageScore}%</p>
					<p class="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
				</div>
				<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 text-center border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-green-500/20 hover:scale-105 transition-all duration-300 cursor-default">
					<p class="text-3xl font-bold text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">{storageStats.bestScore}%</p>
					<p class="text-sm text-gray-600 dark:text-gray-400">Best Score</p>
				</div>
			</div>

			<!-- Mock Exam History -->
			{#if mockExamHistory.length > 0}
				<div class="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
					<h2 class="font-semibold mb-4 text-gray-900 dark:text-white">Mock Exam History</h2>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b border-gray-200">
									<th class="text-left py-2 px-4">Date</th>
									<th class="text-center py-2 px-4">Score</th>
									<th class="text-center py-2 px-4">Correct</th>
									<th class="text-center py-2 px-4">Total</th>
								</tr>
							</thead>
							<tbody>
								{#each mockExamHistory.slice().reverse() as exam}
									<tr class="border-b border-gray-100">
										<td class="py-2 px-4">{new Date(exam.date).toLocaleDateString()}</td>
										<td class="text-center py-2 px-4">
											<span class="px-2 py-1 rounded-full text-xs font-medium {exam.score >= 75
												? 'bg-green-100 text-green-800'
												: exam.score >= 60
													? 'bg-yellow-100 text-yellow-800'
													: 'bg-red-100 text-red-800'}">
												{exam.score}%
											</span>
										</td>
										<td class="text-center py-2 px-4">{exam.correctAnswers}</td>
										<td class="text-center py-2 px-4">{exam.totalQuestions}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<div class="grid lg:grid-cols-3 gap-6">
				<!-- Practice Configuration -->
				<div class="lg:col-span-2 space-y-6">
					<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
						<h2 class="font-semibold mb-4 text-gray-900 dark:text-white">Configure Practice Session</h2>

						<!-- Domain Selection -->
						<fieldset class="mb-6">
							<legend class="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
								Select Domains (optional)
							</legend>
							<div class="flex flex-wrap gap-2">
								{#each domains as domain}
									<button
										on:click={() => toggleDomain(domain.id)}
										class="group px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 {selectedDomains.includes(
											domain.id
										)
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
											: 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:scale-105 hover:shadow-md'}"
									>
										{domain.name}
									</button>
								{/each}
							</div>
							<p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Leave empty to include all domains</p>
						</fieldset>

						<!-- Question Count -->
						<fieldset class="mb-6">
							<legend class="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
								Number of Questions
							</legend>
							<div class="flex gap-2">
								{#each [10, 20, 30, 50] as count}
									<button
										on:click={() => (questionCount = count)}
										class="group px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 {questionCount ===
										count
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
											: 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:scale-105 hover:shadow-md'}"
									>
										{count}
									</button>
								{/each}
							</div>
						</fieldset>

						<button
							on:click={startSession}
							disabled={starting}
							class="group w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105"
						>
							{starting ? 'Starting...' : 'Start Practice Session'}
						</button>
					</div>

					<!-- Weak Areas -->
					{#if storageStats.weakDomains && storageStats.weakDomains.length > 0}
						<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
							<h2 class="font-semibold mb-4 text-gray-900 dark:text-white">Focus Areas</h2>
							<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
								Based on your practice history, focus on these areas:
							</p>
							<div class="flex flex-wrap gap-2">
								{#each storageStats.weakDomains as domain}
									<span class="group px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-800/50 hover:scale-105 hover:shadow-md transition-all duration-300"
										>{domain}</span
									>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Quick Actions -->
				<div class="space-y-6">
					<!-- Mock Exam Card -->
					<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
						<div
							class="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
						>
							<svg
								class="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Full Mock Exams</h2>
						<p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
							Simulate the real PMP exam with 185 questions and a 4-hour time limit.
						</p>

						<div class="mt-4 space-y-2">
								{#if mockExams.length > 0}
									{#each mockExams as exam}
										<div
											class="group border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-3 hover:border-indigo-300/50 dark:hover:border-indigo-600/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all duration-300 cursor-pointer"
											on:click={() => startMockExam(exam.id)}
											role="button"
											tabindex="0"
											on:keypress={(e) =>
												e.key === 'Enter' && startMockExam(exam.id)}
										>
											<div class="flex items-center justify-between mb-2">
												<h3 class="font-medium text-sm text-gray-900 dark:text-white">{exam.name}</h3>
												<span class="text-xs text-gray-600 dark:text-gray-400">{exam.totalQuestions} questions</span>
											</div>
											<div class="flex flex-wrap gap-1 mb-3">
												{#each exam.domainBreakdown as domain}
													<span
														class="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50"
														title="{domain.domainName}: {domain.count} questions"
													>
														{domain.domainName.split(' ')[0]} {domain.percentage}%
													</span>
												{/each}
											</div>
											<button
												on:click|stopPropagation={() => startMockExam(exam.id)}
												disabled={starting}
												class="group w-full px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105"
											>
												{starting ? 'Starting...' : `Start ${exam.name}`}
											</button>
										</div>
									{/each}
								{:else}
									<p class="text-sm text-gray-600 dark:text-gray-400 text-center py-4">No mock exams available</p>
								{/if}
							</div>
					</div>

					<!-- Flagged Questions -->
					<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
						<h2 class="font-semibold mb-2 text-gray-900 dark:text-white">Flagged Questions</h2>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Review questions you have flagged for later.
						</p>
						<a
							href="{base}/practice/flagged"
							class="group block w-full px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 text-center rounded-lg hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 hover:scale-105 transition-all duration-300 mt-4 shadow-md hover:shadow-lg"
						>
							View Flagged
						</a>
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
