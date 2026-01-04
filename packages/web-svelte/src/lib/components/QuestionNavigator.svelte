<script lang="ts">
	interface Props {
		totalQuestions: number;
		currentIndex: number;
		answeredQuestions: string[];
		flaggedQuestions: string[];
		onJumpToQuestion: (index: number) => void;
		questionsPerPage?: number;
	}

	let {
		totalQuestions,
		currentIndex,
		answeredQuestions,
		flaggedQuestions,
		onJumpToQuestion,
		questionsPerPage = 10
	}: Props = $props();

	const answeredSet = $derived(new Set(answeredQuestions));
	const flaggedSet = $derived(new Set(flaggedQuestions));

	const pages = $derived(
		Array.from({ length: Math.ceil(totalQuestions / questionsPerPage) }, (_, i) => ({
			start: i * questionsPerPage,
			end: Math.min((i + 1) * questionsPerPage, totalQuestions)
		}))
	);

	const currentPage = $derived(Math.floor(currentIndex / questionsPerPage));

	function getQuestionStatus(index: number): 'answered' | 'flagged' | 'current' | 'unanswered' {
		const questionId = `q-${index}`;
		if (flaggedSet.has(questionId)) return 'flagged';
		if (answeredSet.has(questionId)) return 'answered';
		if (index === currentIndex) return 'current';
		return 'unanswered';
	}

	function getButtonClass(status: string, isCurrent: boolean): string {
		let buttonClass = 'w-8 h-8 text-xs rounded font-medium transition-all ';

		switch (status) {
			case 'answered':
				buttonClass += 'bg-green-500/20 text-green-400 border border-green-500/50';
				break;
			case 'flagged':
				buttonClass += 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50';
				break;
			case 'current':
				buttonClass += 'bg-[var(--primary)] text-white border border-[var(--primary)]';
				break;
			default:
				buttonClass +=
					'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-transparent hover:border-[var(--border)]';
		}

		return buttonClass;
	}
</script>

<div class="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
	<h3 class="font-semibold mb-3 text-sm text-[var(--foreground)]">
		Question Navigator
	</h3>

	<!-- Page navigation -->
	<div class="flex items-center justify-between mb-3">
		<button
			onclick={() => onJumpToQuestion(Math.max(0, (currentPage - 1) * questionsPerPage))}
			disabled={currentPage === 0}
			class="px-2 py-1 text-xs bg-[var(--secondary)] rounded hover:bg-[var(--secondary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
			aria-label="Previous page"
		>
			← Prev
		</button>
		<span class="text-xs text-[var(--foreground-muted)]"
			>Page {currentPage + 1} of {pages.length}</span
		>
		<button
			onclick={() =>
				onJumpToQuestion(Math.min(totalQuestions - 1, (currentPage + 1) * questionsPerPage))}
			disabled={currentPage >= pages.length - 1}
			class="px-2 py-1 text-xs bg-[var(--secondary)] rounded hover:bg-[var(--secondary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
			aria-label="Next page"
		>
			Next →
		</button>
	</div>

	<!-- Question grid -->
	<div class="grid grid-cols-5 gap-2" role="grid" aria-label="Question numbers">
		{#each Array(totalQuestions) as _, i}
			{@const status = getQuestionStatus(i)}
			{@const isCurrent = i === currentIndex}
			{@const buttonClass = getButtonClass(status, isCurrent)}
			<button
				onclick={() => onJumpToQuestion(i)}
				class={buttonClass}
				aria-label="Question {i + 1}{status === 'answered'
					? ' - answered'
					: ''}{status === 'flagged' ? ' - flagged' : ''}"
				aria-current={isCurrent ? 'step' : undefined}
			>
				{i + 1}
				{#if status === 'flagged'}
					<span class="ml-1">★</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Legend -->
	<div
		class="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[var(--border)] text-xs"
	>
		<div class="flex items-center gap-1.5">
			<div
				class="w-4 h-4 rounded bg-green-500/20 border border-green-500/50"
			></div>
			<span class="text-[var(--foreground-muted)]">Answered</span>
		</div>
		<div class="flex items-center gap-1.5">
			<div
				class="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50"
			></div>
			<span class="text-[var(--foreground-muted)]">Flagged</span>
		</div>
		<div class="flex items-center gap-1.5">
			<div class="w-4 h-4 rounded bg-[var(--primary)]"></div>
			<span class="text-[var(--foreground-muted)]">Current</span>
		</div>
		<div class="flex items-center gap-1.5">
			<div class="w-4 h-4 rounded bg-[var(--secondary)]"></div>
			<span class="text-[var(--foreground-muted)]">Unanswered</span>
		</div>
	</div>
</div>
