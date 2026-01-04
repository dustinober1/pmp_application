<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { practiceApi } from '$lib/utils/api';
	import Navbar from '$lib/components/Navbar.svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';

	export let data;

	let loading = true;
	let stats = null;
	let domains = [];
	let mockExams = [];
	let error = null;
	let selectedDomains = [];
	let questionCount = 20;
	let starting = false;

	// Auth state
	let user = null;
	let canAccess = false;

	authStore.subscribe((auth) => {
		user = auth.user;
		canAccess = auth.isAuthenticated;
	});

	onMount(() => {
		// Use data from load function if available
		if (data.stats) {
			stats = data.stats;
		}
		if (data.domains) {
			domains = data.domains;
		}
		if (data.mockExams) {
			mockExams = data.mockExams;
		}
		if (data.error) {
			error = data.error;
		}
		loading = false;
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
				goto(`/practice/session/${sessionId}`);
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
				questionCount: 180,
				domainIds: []
			});
			const sessionId = response.data?.sessionId;
			if (sessionId) {
				goto(`/practice/session/${sessionId}`);
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

	$: canTakeMockExam = user?.tier === 'pro' || user?.tier === 'corporate';
</script>

{#if loading}
	<LoadingState message="Loading practice..." />
{:else if error && !stats}
	<ErrorState title="Practice Error" message={error} />
{:else if !canAccess}
	<ErrorState
		title="Authentication Required"
		message="Please log in to access practice questions."
	/>
{:else}
	<div class="min-h-screen bg-gray-50">
		<Navbar />

		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="mb-8">
				<h1 class="text-2xl font-bold text-gray-900">Practice Questions</h1>
				<p class="text-gray-600">
					Test your knowledge with realistic PMP exam questions.
				</p>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<div class="bg-white rounded-lg shadow p-6 text-center">
					<p class="text-3xl font-bold">{stats?.totalSessions || 0}</p>
					<p class="text-sm text-gray-600">Sessions</p>
				</div>
				<div class="bg-white rounded-lg shadow p-6 text-center">
					<p class="text-3xl font-bold">{stats?.totalQuestions || 0}</p>
					<p class="text-sm text-gray-600">Questions Answered</p>
				</div>
				<div class="bg-white rounded-lg shadow p-6 text-center">
					<p class="text-3xl font-bold text-indigo-600">{stats?.averageScore || 0}%</p>
					<p class="text-sm text-gray-600">Average Score</p>
				</div>
				<div class="bg-white rounded-lg shadow p-6 text-center">
					<p class="text-3xl font-bold text-green-600">{stats?.bestScore || 0}%</p>
					<p class="text-sm text-gray-600">Best Score</p>
				</div>
			</div>

			<div class="grid lg:grid-cols-3 gap-6">
				<!-- Practice Configuration -->
				<div class="lg:col-span-2 space-y-6">
					<div class="bg-white rounded-lg shadow p-6">
						<h2 class="font-semibold mb-4">Configure Practice Session</h2>

						<!-- Domain Selection -->
						<fieldset class="mb-6">
							<legend class="block text-sm font-medium mb-2">
								Select Domains (optional)
							</legend>
							<div class="flex flex-wrap gap-2">
								{#each domains as domain}
									<button
										on:click={() => toggleDomain(domain.id)}
										class="px-4 py-2 rounded-lg text-sm font-medium transition {selectedDomains.includes(
											domain.id
										)
											? 'bg-indigo-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
									>
										{domain.name}
									</button>
								{/each}
							</div>
							<p class="text-xs text-gray-600 mt-2">Leave empty to include all domains</p>
						</fieldset>

						<!-- Question Count -->
						<fieldset class="mb-6">
							<legend class="block text-sm font-medium mb-2">
								Number of Questions
							</legend>
							<div class="flex gap-2">
								{#each [10, 20, 30, 50] as count}
									<button
										on:click={() => (questionCount = count)}
										class="px-4 py-2 rounded-lg text-sm font-medium transition {questionCount ===
										count
											? 'bg-indigo-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
									>
										{count}
									</button>
								{/each}
							</div>
						</fieldset>

						<button
							on:click={startSession}
							disabled={starting}
							class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
						>
							{starting ? 'Starting...' : 'Start Practice Session'}
						</button>
					</div>

					<!-- Weak Areas -->
					{#if stats?.weakDomains && stats.weakDomains.length > 0}
						<div class="bg-white rounded-lg shadow p-6">
							<h2 class="font-semibold mb-4">Focus Areas</h2>
							<p class="text-sm text-gray-600 mb-4">
								Based on your practice history, focus on these areas:
							</p>
							<div class="flex flex-wrap gap-2">
								{#each stats.weakDomains as domain}
									<span class="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800"
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
					<div class="bg-white rounded-lg shadow p-6">
						<div
							class="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4"
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
						<h2 class="text-lg font-semibold">Full Mock Exams</h2>
						<p class="text-sm text-gray-600 mt-2">
							Simulate the real PMP exam with 180 questions and a 3h 50min time limit.
						</p>

						{#if canTakeMockExam}
							<div class="mt-4 space-y-2">
								{#if mockExams.length > 0}
									{#each mockExams as exam}
										<div
											class="border border-gray-200 rounded-lg p-3"
											on:click={() => startMockExam(exam.id)}
											role="button"
											tabindex="0"
											on:keypress={(e) =>
												e.key === 'Enter' && startMockExam(exam.id)}
										>
											<div class="flex items-center justify-between mb-2">
												<h3 class="font-medium text-sm">{exam.name}</h3>
												<span class="text-xs text-gray-600">{exam.totalQuestions} questions</span>
											</div>
											<div class="flex flex-wrap gap-1 mb-3">
												{#each exam.domainBreakdown as domain}
													<span
														class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
														title="{domain.domainName}: {domain.count} questions"
													>
														{domain.domainName.split(' ')[0]} {domain.percentage}%
													</span>
												{/each}
											</div>
											<button
												on:click|stopPropagation={() => startMockExam(exam.id)}
												disabled={starting}
												class="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
											>
												{starting ? 'Starting...' : `Start ${exam.name}`}
											</button>
										</div>
									{/each}
								{:else}
									<p class="text-sm text-gray-600 text-center py-4">No mock exams available</p>
								{/if}
							</div>
						{:else}
							<div class="mt-4">
								<p class="text-xs text-gray-600 mb-2">
									Available for Pro and Corporate tiers
								</p>
								<a
									href="/pricing"
									class="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition"
								>
									Upgrade to Access
								</a>
							</div>
						{/if}
					</div>

					<!-- Flagged Questions -->
					<div class="bg-white rounded-lg shadow p-6">
						<h2 class="font-semibold mb-2">Flagged Questions</h2>
						<p class="text-sm text-gray-600">
							Review questions you have flagged for later.
						</p>
						<a
							href="/practice/flagged"
							class="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition mt-4"
						>
							View Flagged
						</a>
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
