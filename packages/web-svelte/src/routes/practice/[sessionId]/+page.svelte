<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { practiceApi } from '$lib/utils/api';
	import { saveMockExamScore } from '$lib/utils/mockExamStorage';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';

	export let data;

	let loading = true;
	let questions = [];
	let currentIndex = 0;
	let selectedOptionId = null;
	let showExplanation = false;
	let submitting = false;
	let answeredQuestions = new Set();
	let flaggedQuestions = new Set();
	let streak = null;
	let error = null;
	let totalQuestions = 0;
	let correctAnswers = 0;

	onMount(() => {
		// Use data from load function if available
		if (data.questions) {
			questions = data.questions;
		}
		if (data.totalQuestions !== undefined) {
			totalQuestions = data.totalQuestions;
		}
		if (data.streak) {
			streak = data.streak;
		}
		if (data.error) {
			error = data.error;
		}
		loading = false;
	});

	async function handleSubmitAnswer() {
		if (!selectedOptionId || submitting) return;

		submitting = true;
		const question = questions[currentIndex];
		if (!question) {
			submitting = false;
			return;
		}

		try {
			const sessionId = $page.params.sessionId;
			await practiceApi.submitAnswer({
				sessionId,
				questionId: question.id,
				selectedOptionId,
				timeSpentMs: 0
			});

			// Check if answer was correct
			const selectedOption = question.options.find((opt) => opt.id === selectedOptionId);
			if (selectedOption?.isCorrect) {
				correctAnswers += 1;
			}

			answeredQuestions = new Set([...answeredQuestions, question.id]);
			showExplanation = true;
		} catch (err) {
			console.error('Failed to submit answer:', err);
			error = err instanceof Error ? err.message : 'Failed to submit answer';
		} finally {
			submitting = false;
		}
	}

	function handleNext() {
		if (currentIndex < questions.length - 1) {
			currentIndex += 1;
			selectedOptionId = null;
			showExplanation = false;
		}
	}

	function handlePrevious() {
		if (currentIndex > 0) {
			currentIndex -= 1;
			selectedOptionId = null;
			showExplanation = false;
		}
	}

	function handleJumpToQuestion(index) {
		currentIndex = index;
		selectedOptionId = null;
		showExplanation = false;
	}

	async function handleFlag() {
		const question = questions[currentIndex];
		if (!question) return;

		const isFlagged = flaggedQuestions.has(question.id);

		try {
			if (isFlagged) {
				await practiceApi.unflagQuestion(question.id);
				flaggedQuestions = new Set(
					Array.from(flaggedQuestions).filter((id) => id !== question.id)
				);
			} else {
				await practiceApi.flagQuestion(question.id);
				flaggedQuestions = new Set([...flaggedQuestions, question.id]);
			}
		} catch (err) {
			console.error('Failed to flag question:', err);
		}
	}

	async function handleCompleteSession() {
		try {
			const sessionId = $page.params.sessionId;
			const response = await practiceApi.completeSession(sessionId);

			// Save score to localStorage for mock exams
			const score = Math.round((correctAnswers / totalQuestions) * 100);
			saveMockExamScore({
				sessionId,
				score,
				totalQuestions,
				correctAnswers,
				date: new Date().toISOString()
			});

			goto(`${base}/dashboard`);
		} catch (err) {
			console.error('Failed to complete session:', err);
			error = err instanceof Error ? err.message : 'Failed to complete session';
		}
	}

	$: currentQuestion = questions[currentIndex];
	$: progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
	$: isLastQuestion = currentIndex === totalQuestions - 1;
</script>

{#if loading}
	<LoadingState message="Loading practice session..." />
{:else if error}
	<ErrorState title="Practice Session Error" message={error} />
{:else if !currentQuestion}
	<ErrorState
		title="Question Not Found"
		message="Could not load the current question."
	/>
{:else}
	<div class="min-h-screen bg-gray-50">
		<nav class="bg-white border-b border-gray-200">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex items-center">
						<button
							on:click={() => window.history.back()}
							class="text-gray-700 hover:text-indigo-600"
						>
							← Back
						</button>
					</div>
				</div>
			</div>
		</nav>

		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Progress Bar -->
			<div class="mb-6">
				<div class="flex justify-between items-center mb-2">
					<span class="text-sm font-medium">
						Question {currentIndex + 1} of {totalQuestions}
					</span>
					<span class="text-sm font-medium">{Math.round(progress)}%</span>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
					<div
						class="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
						style="width: {progress}%"
					></div>
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- Main Question Area -->
				<div class="lg:col-span-2">
					<div class="bg-white rounded-lg shadow p-6">
						<!-- Question Header -->
						<div class="flex justify-between items-start mb-4">
							<div class="flex gap-2">
								<span class="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
									{currentQuestion.domain}
								</span>
								<span class="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
									{currentQuestion.task}
								</span>
								<span class="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
									{currentQuestion.difficulty}
								</span>
							</div>
							<button
								on:click={handleFlag}
								class="px-4 py-2 rounded-lg font-medium transition-colors {flaggedQuestions.has(
									currentQuestion.id
								)
									? 'bg-red-100 text-red-700 hover:bg-red-200'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
							>
								{flaggedQuestions.has(currentQuestion.id) ? '🚩 Flagged' : 'Flag'}
							</button>
						</div>

						<!-- Question Text -->
						<div class="mb-6">
							<h2 class="text-xl font-semibold mb-4">
								{currentQuestion.question}
							</h2>
						</div>

						<!-- Options -->
						<div class="space-y-3 mb-6">
							{#each currentQuestion.options as option}
								{@const isSelected = selectedOptionId === option.id}
								{@const showCorrect = showExplanation && option.isCorrect}
								{@const showIncorrect =
									showExplanation && isSelected && !option.isCorrect}

								<button
									on:click={() => {
										if (!showExplanation) selectedOptionId = option.id;
									}}
									disabled={showExplanation}
									class="w-full text-left p-4 rounded-lg border-2 transition-all {showCorrect
										? 'border-green-500 bg-green-50'
										: showIncorrect
											? 'border-red-500 bg-red-50'
											: isSelected
												? 'border-indigo-500 bg-indigo-50'
												: 'border-gray-200 hover:border-indigo-300'} {showExplanation
										? 'cursor-not-allowed'
										: 'cursor-pointer'}"
								>
									<div class="flex items-center gap-3">
										<div
											class="w-5 h-5 rounded-full border-2 flex items-center justify-center {showCorrect
												? 'border-green-500 bg-green-500'
												: showIncorrect
													? 'border-red-500 bg-red-500'
													: isSelected
														? 'border-indigo-500 bg-indigo-500'
														: 'border-gray-300'}"
										>
											{#if isSelected && !showExplanation}
												<div class="w-2 h-2 rounded-full bg-white"></div>
											{/if}
											{#if showCorrect}
												<span class="text-white text-xs">✓</span>
											{/if}
											{#if showIncorrect}
												<span class="text-white text-xs">✗</span>
											{/if}
										</div>
										<span class="flex-1">{option.text}</span>
									</div>
								</button>
							{/each}
						</div>

						<!-- Explanation -->
						{#if showExplanation}
							<div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
								<h3 class="font-semibold mb-2">Explanation</h3>
								<p class="text-sm text-gray-700">{currentQuestion.explanation}</p>
							</div>
						{/if}

						<!-- Action Buttons -->
						<div class="flex justify-between">
							<button
								on:click={handlePrevious}
								disabled={currentIndex === 0}
								class="px-6 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
							>
								Previous
							</button>
							<div class="flex gap-2">
								{#if !showExplanation}
									<button
										on:click={handleSubmitAnswer}
										disabled={!selectedOptionId || submitting}
										class="px-6 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
									>
										{submitting ? 'Submitting...' : 'Submit Answer'}
									</button>
								{:else}
									{#if isLastQuestion}
										<button
											on:click={handleCompleteSession}
											class="px-6 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition"
										>
											Complete Session
										</button>
									{:else}
										<button
											on:click={handleNext}
											class="px-6 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
										>
											Next Question
										</button>
									{/if}
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Sidebar -->
				<div class="space-y-6">
					<!-- Streak Counter -->
					{#if streak}
						<div class="bg-white rounded-lg shadow p-6">
							<h3 class="font-semibold mb-4">Current Streak</h3>
							<div class="text-center">
								<p class="text-4xl font-bold text-indigo-600">
									{streak.currentStreak}
								</p>
								<p class="text-sm text-gray-600 mt-1">consecutive correct</p>
							</div>
							<div class="mt-4 pt-4 border-t border-gray-200">
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Best Streak</span>
									<span class="font-medium">{streak.longestStreak}</span>
								</div>
								<div class="flex justify-between text-sm mt-2">
									<span class="text-gray-600">Total Answered</span>
									<span class="font-medium">{streak.totalAnswered}</span>
								</div>
								<div class="flex justify-between text-sm mt-2">
									<span class="text-gray-600">Accuracy</span>
									<span class="font-medium"
										>{streak.totalAnswered > 0
											? Math.round((streak.correctCount / streak.totalAnswered) * 100)
											: 0}%</span
									>
								</div>
							</div>
						</div>
					{/if}

					<!-- Question Navigator -->
					<div class="bg-white rounded-lg shadow p-6">
						<h3 class="font-semibold mb-4">Question Navigator</h3>
						<div class="grid grid-cols-5 gap-2">
							{#each Array(totalQuestions) as _, i}
								{@const isAnswered = answeredQuestions.has(
									questions[i]?.id
								)}
								{@const isCurrent = i === currentIndex}
								<button
									on:click={() => handleJumpToQuestion(i)}
									class="w-10 h-10 rounded text-sm font-medium transition-colors {isCurrent
										? 'bg-indigo-600 text-white'
										: isAnswered
											? 'bg-green-100 text-green-700'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
								>
									{i + 1}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
