<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { saveMockExamScore } from '$lib/utils/mockExamStorage';
	import { practiceMode, currentQuestion, practiceProgress, sessionStats } from '$lib/stores/practiceMode';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';

	let selectedOptionId = null;
	let showExplanation = false;
	let submitting = false;
	let error = null;

	onMount(() => {
		if (!$practiceMode.sessionId) {
			error = "No active session found. Please start a session from the practice configuration page.";
		}
	});

	async function handleSubmitAnswer() {
		if (!selectedOptionId || submitting) return;

		submitting = true;
		try {
			practiceMode.submitAnswer(selectedOptionId);
			showExplanation = true;
		} catch (err) {
			console.error('Failed to submit answer:', err);
			error = err instanceof Error ? err.message : 'Failed to submit answer';
		} finally {
			submitting = false;
		}
	}

	function handleNext() {
		practiceMode.nextQuestion();
		selectedOptionId = null;
		showExplanation = false;
	}

	async function handleCompleteSession() {
		try {
			const stats = $sessionStats;
			saveMockExamScore({
				sessionId: $practiceMode.sessionId,
				score: stats.percentage,
				totalQuestions: stats.total,
				correctAnswers: stats.correct,
				date: new Date().toISOString()
			});

			goto(`${base}/dashboard`);
		} catch (err) {
			console.error('Failed to complete session:', err);
			error = err instanceof Error ? err.message : 'Failed to complete session';
		}
	}

	$: isLastQuestion = $practiceMode.currentIndex === $practiceMode.questions.length - 1;
	$: isComplete = $practiceMode.isComplete;

	// Automatically complete session when store marks it as complete
	$: if (isComplete) {
		handleCompleteSession();
	}
</script>

{#if !error && !$currentQuestion && !isComplete}
	<LoadingState message="Loading practice session..." />
{:else if error}
	<ErrorState title="Practice Session Error" message={error} />
{:else if !$currentQuestion && !isComplete}
	<ErrorState
		title="Question Not Found"
		message="Could not load the current question."
	/>
{:else if $currentQuestion}
	<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
		<nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex items-center">
						<button
							on:click={() => window.history.back()}
							class="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium flex items-center gap-2"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
							Back to Practice
						</button>
					</div>
				</div>
			</div>
		</nav>

		<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Progress Bar -->
			<div class="mb-8">
				<div class="flex justify-between items-center mb-3">
					<span class="text-sm font-semibold text-gray-900 dark:text-white">
						Question {$practiceMode.currentIndex + 1} of {$practiceMode.questions.length}
					</span>
					<span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">{$practiceProgress}%</span>
				</div>
				<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
					<div
						class="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
						style="width: {$practiceProgress}%"
					></div>
				</div>
			</div>

			<div class="space-y-6">
				<!-- Main Question Card -->
				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-300">
					<div class="p-6 sm:p-8">
						<!-- Question Header -->
						<div class="flex flex-wrap gap-2 mb-6">
							<span class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
								{$currentQuestion.domainId.split('-')[1]}
							</span>
							<span class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
								{$currentQuestion.taskId}
							</span>
							<span class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
								{$currentQuestion.difficulty}
							</span>
						</div>

						<!-- Question Text -->
						<div class="mb-8">
							<h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
								{$currentQuestion.questionText}
							</h2>
						</div>

						<!-- Options -->
						<div class="space-y-4 mb-8">
							{#each $currentQuestion.options as option}
								{@const isSelected = selectedOptionId === option.id}
								{@const showCorrect = showExplanation && option.isCorrect}
								{@const showIncorrect = showExplanation && isSelected && !option.isCorrect}

								<button
									on:click={() => {
										if (!showExplanation) selectedOptionId = option.id;
									}}
									disabled={showExplanation}
									class="w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group {showCorrect
										? 'border-green-500 bg-green-50 dark:bg-green-900/10'
										: showIncorrect
											? 'border-red-500 bg-red-50 dark:bg-red-900/10'
											: isSelected
												? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10'
												: 'border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'} {showExplanation
										? 'cursor-default'
										: 'cursor-pointer active:scale-[0.98]'}"
								>
									<div class="flex items-center gap-4">
										<div
											class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors {showCorrect
												? 'border-green-500 bg-green-500'
												: showIncorrect
													? 'border-red-500 bg-red-500'
													: isSelected
														? 'border-indigo-500 bg-indigo-500'
														: 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}"
										>
											{#if isSelected && !showExplanation}
												<div class="w-2.5 h-2.5 rounded-full bg-white"></div>
											{/if}
											{#if showCorrect}
												<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
												</svg>
											{/if}
											{#if showIncorrect}
												<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
												</svg>
											{/if}
										</div>
										<span class="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{option.text}</span>
									</div>
								</button>
							{/each}
						</div>

						<!-- Explanation Area -->
						{#if showExplanation}
							<div class="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 animate-in fade-in slide-in-from-top-4 duration-300">
								<div class="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-300">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<h3 class="font-bold tracking-tight">remediation Core Logic</h3>
								</div>
								<p class="text-gray-800 dark:text-gray-300 leading-relaxed">{$currentQuestion.explanation}</p>
							</div>
						{/if}

						<!-- Action Buttons -->
						<div class="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
							{#if !showExplanation}
								<button
									on:click={handleSubmitAnswer}
									disabled={!selectedOptionId || submitting}
									class="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
								>
									{submitting ? 'Checking...' : 'Check Answer'}
								</button>
							{:else}
								{#if isLastQuestion}
									<button
										on:click={handleCompleteSession}
										class="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95"
									>
										Finish Session
									</button>
								{:else}
									<button
										on:click={handleNext}
										class="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
									>
										Next Question
									</button>
								{/if}
							{/if}
						</div>
					</div>
				</div>

				<!-- Session Stats Card -->
				<div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg">
					<div class="flex items-center justify-between gap-4">
						<div class="text-center flex-1 border-r border-gray-100 dark:border-gray-700">
							<p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Correct</p>
							<p class="text-xl font-bold text-green-600 dark:text-green-400">{$sessionStats.correct}</p>
						</div>
						<div class="text-center flex-1 border-r border-gray-100 dark:border-gray-700">
							<p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Current Accuracy</p>
							<p class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{$sessionStats.percentage}%</p>
						</div>
						<div class="text-center flex-1">
							<p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Remaining</p>
							<p class="text-xl font-bold text-purple-600 dark:text-purple-400">
								{$practiceMode.questions.length - ($practiceMode.currentIndex + (showExplanation ? 1 : 0))}
							</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
