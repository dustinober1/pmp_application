<script lang="ts">
 import { fade } from 'svelte/transition';
	import { base } from '$app/paths';

 interface Question {
 text: string;
 options: string[];
 correct: number;
 explanation: string;
 reference: string;
 }

 interface Props {
 title: string;
 questions: Question[];
 }

 let { title, questions }: Props = $props();

 let currentQuestionIndex = $state(0);
 let selectedOption = $state<number | null>(null);
 let showExplanation = $state(false);
 let score = $state(0);
 	let quizComplete = $state(false);
	let answers = $state<({ selected: number; isCorrect: boolean } | null)[]>([]);

	$effect.pre(() => {
		if (answers.length !== questions.length) {
			answers = new Array(questions.length).fill(null);
		}
	});

 const currentQuestion = $derived(questions[currentQuestionIndex]);

 function handleOptionSelect(index: number) {
 if (showExplanation) return;
 selectedOption = index;
 }

 function handleSubmit() {
 if (selectedOption === null) return;
 
 const isCorrect = selectedOption === currentQuestion.correct;
 if (isCorrect) score++;
 
 answers[currentQuestionIndex] = {
 selected: selectedOption,
 isCorrect
 };
 
 showExplanation = true;
 }

 function nextQuestion() {
 if (currentQuestionIndex < questions.length - 1) {
 currentQuestionIndex++;
 selectedOption = null;
 showExplanation = false;
 } else {
 quizComplete = true;
 }
 }

 function restartQuiz() {
 currentQuestionIndex = 0;
 selectedOption = null;
 showExplanation = false;
 score = 0;
 quizComplete = false;
 answers = new Array(questions.length).fill(null);
 }
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden my-8">
 <div class="bg-indigo-600 px-6 py-4">
 <h3 class="text-white font-bold text-lg">{title}</h3>
 {#if !quizComplete}
 <div class="flex justify-between items-center mt-2">
 <span class="text-indigo-100 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
 <div class="w-32 h-2 bg-indigo-800 rounded-full overflow-hidden">
 <div class="h-full bg-white transition-all duration-300" style="width: {((currentQuestionIndex + 1) / questions.length) * 100}%"></div>
 </div>
 </div>
 {/if}
 </div>

 <div class="p-6">
 {#if !quizComplete}
 <div in:fade>
 <p id="question-text" class="text-lg text-gray-900 dark:text-gray-100 font-medium mb-6">
 {currentQuestion.text}
 </p>

 <div role="radiogroup" aria-labelledby="question-text" class="space-y-3 mb-8">
 {#each currentQuestion.options as option, i}
 <button
 onclick={() => handleOptionSelect(i)}
 disabled={showExplanation}
 role="radio"
 aria-checked={selectedOption === i}
 aria-disabled={showExplanation}
 class="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 {
 selectedOption === i 
 ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' 
 : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500'
 } {
 showExplanation && i === currentQuestion.correct 
 ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
 : ''
 } {
 showExplanation && selectedOption === i && i !== currentQuestion.correct 
 ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
 : ''
 }"
 >
 <div class="flex items-center gap-3">
 <span class="w-6 h-6 flex items-center justify-center rounded-full border border-current text-xs font-bold" aria-hidden="true">
 {String.fromCharCode(65 + i)}
 </span>
 {option}
 </div>
 </button>
 {/each}
 </div>

 {#if showExplanation}
 <div in:fade class="mb-8 p-4 rounded-lg {currentQuestion.correct === selectedOption ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}">
 <p class="font-bold mb-1 {currentQuestion.correct === selectedOption ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}">
 {currentQuestion.correct === selectedOption ? ' Correct!' : ' Incorrect'}
 </p>
 <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
 {currentQuestion.explanation}
 </p>
 {#if currentQuestion.reference}
 <p class="text-xs text-gray-500 dark:text-gray-400">
 Reference: {currentQuestion.reference}
 </p>
 {/if}
 </div>
 {/if}

 <div class="flex justify-end">
 {#if !showExplanation}
 <button
 onclick={handleSubmit}
 disabled={selectedOption === null}
 class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold disabled:opacity-50 transition-all active:scale-95"
 >
 Submit Answer
 </button>
 {:else}
 <button
 onclick={nextQuestion}
 class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all active:scale-95"
 >
 {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
 </button>
 {/if}
 </div>
 </div>
 {:else}
 <div in:fade class="text-center py-8">
 <div class="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
 <span class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
 {Math.round((score / questions.length) * 100)}%
 </span>
 </div>
 <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Quiz Complete!</h3>
 <p class="text-gray-600 dark:text-gray-400 mb-8">
 You scored {score} out of {questions.length} correct answers.
 </p>

 <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
 <button
 onclick={restartQuiz}
 class="px-6 py-2 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
 >
 Retry
 </button>
 <a
 href="{base}/study"
 class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all text-center"
 >
 Back to Hub
 </a>
 </div>
 </div>
 {/if}
 </div>
</div>
