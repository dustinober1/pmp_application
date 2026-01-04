<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import ECOBadge from '$lib/components/ECOBadge.svelte';
	import type { Formula, FormulaCategory } from '@pmp/shared';
	import {
		getAllFormulas,
		getCategoryBreakdown,
		getFormulasByCategory,
		searchFormulas,
		calculateFormula,
		parseCashFlows,
		CATEGORY_NAMES
	} from '$lib/utils/formulasData';

	interface CalculationResult {
		formulaId: string;
		inputs: Record<string, number | number[]>;
		result: number;
		steps: Array<{
			stepNumber: number;
			description: string;
			expression: string;
			value: number;
		}>;
	}

	// State
	let loading = $state(true);
	let error = $state<string | null>(null);
	let allFormulas: Formula[] = $state([]);
	let categoryBreakdown: Array<{ id: FormulaCategory; name: string; count: number }> = $state([]);

	// Filter state
	let selectedCategory: FormulaCategory | 'all' = $state('all');
	let filteredFormulas: Formula[] = $state([]);
	let searchQuery = $state('');

	// Calculator state
	let selectedFormula: Formula | null = $state(null);
	let inputValues: Record<string, number> = $state({});
	let calculationResult: CalculationResult | null = $state(null);
	let showCalculator = $state(false);
	let cashFlowsInput = $state('');

	// Load data
	onMount(async () => {
		try {
			const [formulas, categories] = await Promise.all([getAllFormulas(), getCategoryBreakdown()]);
			allFormulas = formulas;
			categoryBreakdown = categories;
			filteredFormulas = formulas;
		} catch (err) {
			console.error('Failed to load formulas:', err);
			error = err instanceof Error ? err.message : 'Failed to load formulas';
		} finally {
			loading = false;
		}
	});

	// Computed
	let displayFormulas = $derived(() => {
		let formulas = selectedCategory === 'all' ? allFormulas : filteredFormulas;
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			formulas = formulas.filter(
				(f) =>
					f.name.toLowerCase().includes(q) ||
					f.description.toLowerCase().includes(q) ||
					f.expression.toLowerCase().includes(q)
			);
		}
		return formulas;
	});

	// Filter by category
	async function filterByCategory(category: FormulaCategory | 'all') {
		selectedCategory = category;
		if (category === 'all') {
			filteredFormulas = allFormulas;
		} else {
			filteredFormulas = await getFormulasByCategory(category);
		}
	}

	// Clear search
	function clearSearch() {
		searchQuery = '';
	}

	// Open calculator for a formula
	function openCalculator(formula: Formula) {
		selectedFormula = formula;
		inputValues = {};
		calculationResult = null;
		cashFlowsInput = '';
		showCalculator = true;
	}

	// Close calculator
	function closeCalculator() {
		showCalculator = false;
		selectedFormula = null;
		inputValues = {};
		calculationResult = null;
		cashFlowsInput = '';
	}

	// Handle input change
	function handleInputChange(variableId: string, value: string) {
		const numValue = parseFloat(value);
		if (!isNaN(numValue)) {
			inputValues[variableId] = numValue;
		} else {
			delete inputValues[variableId];
		}
	}

	// Calculate result
	function performCalculation() {
		if (!selectedFormula) return;

		let finalInputs = { ...inputValues };

		// Handle cash flows input for NPV and IRR
		if (selectedFormula.id === 'npv' || selectedFormula.id === 'irr') {
			const cashFlows = parseCashFlows(cashFlowsInput);
			if (cashFlows.length > 0) {
				finalInputs.cashFlows = cashFlows as unknown as number;
			}
		}

		// Validate all required inputs
		const requiredVariables = selectedFormula.variables;
		const missingInputs = requiredVariables.filter((v) => !(v.id in finalInputs));

		if (missingInputs.length > 0) {
			alert(`Please fill in all required inputs: ${missingInputs.map((v) => v.name).join(', ')}`);
			return;
		}

		calculationResult = calculateFormula(selectedFormula, finalInputs);
	}

	// Get category color
	function getCategoryColor(category: FormulaCategory): string {
		const colors: Record<string, string> = {
			earned_value: 'bg-blue-100 text-blue-800 border-blue-200',
			scheduling: 'bg-purple-100 text-purple-800 border-purple-200',
			cost: 'bg-green-100 text-green-800 border-green-200',
			communication: 'bg-yellow-100 text-yellow-800 border-yellow-200',
			probability: 'bg-red-100 text-red-800 border-red-200',
			procurement: 'bg-indigo-100 text-indigo-800 border-indigo-200'
		};
		return colors[category];
	}

	// Get category name
	function getCategoryName(category: FormulaCategory): string {
		return CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES];
	}

	// Format number
	function formatNumber(num: number, decimals: number = 2): string {
		return num.toFixed(decimals);
	}
</script>

{#if loading}
	<LoadingState message="Loading formulas..." />
{:else if error}
	<ErrorState title="Formulas Error" message={error} />
{:else}
	<div
		class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- ECO Badge -->
			<div class="mb-6">
				<ECOBadge variant="compact" />
			</div>

			<h1
				class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-8"
			>
				PMP Formulas Reference
			</h1>

			<!-- Category Filter -->
			<div class="mb-6 flex flex-wrap gap-2">
				<button
					onclick={() => filterByCategory('all')}
					class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 {selectedCategory === 'all'
						? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
						: 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700'}"
				>
					All ({allFormulas.length})
				</button>
				{#each categoryBreakdown as cat}
					<button
						onclick={() => filterByCategory(cat.id)}
						class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 {selectedCategory === cat.id
							? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
							: 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-700'}"
					>
						{cat.name} ({cat.count})
					</button>
				{/each}
			</div>

			<!-- Search -->
			<div class="mb-6">
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search formulas by name, description, or expression..."
						class="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-lg"
					/>
					<svg
						class="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					{#if searchQuery}
						<button
							onclick={clearSearch}
							class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					{/if}
				</div>
			</div>

			<!-- Formulas Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each displayFormulas() as formula}
					<div
						class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
						onclick={() => openCalculator(formula)}
					>
						<div class="p-6">
							<!-- Category Badge -->
							<div class="mb-3">
								<span
									class="px-3 py-1 text-xs font-medium rounded-full border {getCategoryColor(
										formula.category
									)}"
								>
									{getCategoryName(formula.category)}
								</span>
							</div>

							<!-- Formula Name -->
							<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
								{formula.name}
							</h3>

							<!-- Expression -->
							<div
								class="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-3 py-2 mb-3 font-mono text-sm text-indigo-700 dark:text-indigo-300"
							>
								{formula.expression}
							</div>

							<!-- Description -->
							<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
								{formula.description}
							</p>

							<!-- Open Calculator Button -->
							<button class="mt-4 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-300">
								Open Calculator
							</button>
						</div>
					</div>
				{:else}
					<div class="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
						<p class="text-lg">No formulas found</p>
						<p class="text-sm mt-2">Try adjusting your search or filter</p>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Calculator Modal -->
	{#if showCalculator && selectedFormula}
		<div class="fixed inset-0 z-50 overflow-y-auto">
			<div class="flex items-center justify-center min-h-screen px-4">
				<!-- Backdrop -->
				<div
					class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
					onclick={closeCalculator}
				></div>

				<!-- Modal Content -->
				<div
					class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
				>
					<!-- Header -->
					<div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
						<div class="flex items-start justify-between">
							<div>
								<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
									{selectedFormula.name}
								</h2>
								<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
									{getCategoryName(selectedFormula.category)}
								</p>
							</div>
							<button
								onclick={closeCalculator}
								class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
							>
								<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>

					<!-- Body -->
					<div class="px-6 py-6">
						<!-- Formula Expression -->
						<div
							class="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl px-4 py-3 mb-6 font-mono text-lg text-center text-indigo-700 dark:text-indigo-300"
						>
							{selectedFormula.expression}
						</div>

						<!-- Description -->
						<div class="mb-6">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
								Description
							</h4>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{selectedFormula.description}
							</p>
						</div>

						<!-- When to Use -->
						<div class="mb-6">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
								When to Use
							</h4>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{selectedFormula.whenToUse}
							</p>
						</div>

						<!-- Example -->
						<div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
								Example
							</h4>
							<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
								{selectedFormula.example.scenario}
							</p>
							<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
								Solution: {selectedFormula.example.solution}
							</p>
							<p class="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
								Result: {formatNumber(selectedFormula.example.result)}
							</p>
						</div>

						<!-- Calculator Inputs -->
						<div class="mb-6">
							<h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
								Calculate
							</h4>

							<div class="space-y-4">
								{#if selectedFormula.id === 'npv' || selectedFormula.id === 'irr'}
									<!-- Cash Flows Input -->
									<div>
										<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Cash Flows (comma-separated)
											{#if selectedFormula.id === 'irr'}
												<br />
												<span class="text-xs text-gray-500"
													>First value should be negative (initial investment)</span
												>
											{/if}
										</label>
										<input
											type="text"
											bind:value={cashFlowsInput}
											placeholder={selectedFormula.id === 'npv'
												? "e.g., 20000, 25000, 30000"
												: "e.g., -50000, 20000, 25000, 30000"}
											class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
										/>
									</div>
								{/if}

								{#each selectedFormula.variables as variable}
									{#if variable.id !== 'cashFlows'}
										<div>
											<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
												{variable.name}
												{#if variable.unit}
													<span class="text-gray-500">({variable.unit})</span>
												{/if}
											</label>
											<input
												type="number"
												step="any"
												placeholder={variable.description}
												oninput={(e) =>
													handleInputChange(variable.id, e.currentTarget.value)}
												class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
											/>
											<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
												{variable.description}
											</p>
										</div>
									{/if}
								{/each}
							</div>

							<button
								onclick={performCalculation}
								class="mt-4 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300"
							>
								Calculate
							</button>
						</div>

						<!-- Calculation Result -->
						{#if calculationResult}
							<div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
								<h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
									Calculation Steps
								</h4>
								<div class="space-y-2">
									{#each calculationResult.steps as step}
										<div class="flex items-start gap-3">
											<span
												class="flex-shrink-0 w-6 h-6 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-xs font-semibold text-green-800 dark:text-green-200"
											>
												{step.stepNumber}
											</span>
											<div class="flex-1">
												<p class="text-sm text-gray-600 dark:text-gray-400">
													{step.description}
												</p>
												<p
													class="text-sm font-mono font-medium text-gray-900 dark:text-gray-100"
												>
													{step.expression}
												</p>
											</div>
											<span
												class="text-sm font-bold text-green-600 dark:text-green-400"
											>
												{formatNumber(step.value, 4)}
											</span>
										</div>
									{/each}
								</div>
								<div class="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
									<p class="text-sm text-gray-600 dark:text-gray-400">Final Result</p>
									<p
										class="text-2xl font-bold text-green-600 dark:text-green-400"
									>
										{formatNumber(calculationResult.result)}
									</p>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
