/**
 * Formulas data utility for loading and processing formulas.json
 */

import { base } from '$app/paths';
import type {
	Formula,
	FormulaCategory,
	FormulaVariable,
	FormulaExample,
	CalculationResult,
	CalculationStep
} from '@pmp/shared';

// Types for the raw formulas.json structure
export interface FormulasMetadata {
	generatedAt: string;
	totalFormulas: number;
	categories: {
		earned_value: number;
		scheduling: number;
		cost: number;
		communication: number;
		probability: number;
		procurement: number;
	};
}

export interface FormulasData {
	generatedAt: string;
	totalFormulas: number;
	categories: FormulasMetadata['categories'];
	formulas: Formula[];
}

export interface FormulaCategoryInfo {
	id: FormulaCategory;
	name: string;
	count: number;
}

// Category display names
export const CATEGORY_NAMES: Record<FormulaCategory, string> = {
	earned_value: 'Earned Value Management',
	scheduling: 'Scheduling',
	cost: 'Cost Management',
	communication: 'Communication',
	probability: 'Probability & Risk',
	procurement: 'Procurement'
};

// Cache for the loaded formulas data
let cachedFormulas: Formula[] | null = null;
let cachedFormulasData: FormulasData | null = null;

/**
 * Load and parse formulas.json from static/data directory
 */
export async function loadFormulasData(): Promise<FormulasData> {
	if (cachedFormulasData) {
		return cachedFormulasData;
	}

	try {
		const response = await fetch(`${base}/data/formulas.json`);
		if (!response.ok) {
			throw new Error(`Failed to load formulas.json: ${response.statusText}`);
		}
		const data = (await response.json()) as FormulasData;
		cachedFormulasData = data;
		return data;
	} catch (error) {
		console.error('Failed to load formulas.json:', error);
		throw new Error('Failed to load formulas');
	}
}

/**
 * Get all formulas
 */
export async function getAllFormulas(): Promise<Formula[]> {
	if (cachedFormulas) {
		return cachedFormulas;
	}

	const data = await loadFormulasData();
	cachedFormulas = data.formulas;
	return cachedFormulas;
}

/**
 * Get formula by ID
 */
export async function getFormulaById(id: string): Promise<Formula | null> {
	const formulas = await getAllFormulas();
	return formulas.find((f) => f.id === id) || null;
}

/**
 * Get formulas by category
 */
export async function getFormulasByCategory(category: FormulaCategory): Promise<Formula[]> {
	const formulas = await getAllFormulas();
	return formulas.filter((f) => f.category === category);
}

/**
 * Get category breakdown
 */
export async function getCategoryBreakdown(): Promise<FormulaCategoryInfo[]> {
	const data = await loadFormulasData();

	return Object.entries(data.categories).map(([id, count]) => ({
		id: id as FormulaCategory,
		name: CATEGORY_NAMES[id as FormulaCategory],
		count
	}));
}

/**
 * Search formulas by name, description, or expression
 */
export async function searchFormulas(query: string): Promise<Formula[]> {
	const formulas = await getAllFormulas();
	const q = query.toLowerCase().trim();

	if (!q) {
		return formulas;
	}

	return formulas.filter(
		(f) =>
			f.name.toLowerCase().includes(q) ||
			f.description.toLowerCase().includes(q) ||
			f.expression.toLowerCase().includes(q) ||
			f.category.toLowerCase().includes(q)
	);
}

/**
 * Calculate formula result based on inputs
 */
export function calculateFormula(
	formula: Formula,
	inputs: Record<string, number>
): CalculationResult {
	const steps: CalculationStep[] = [];
	let result = 0;

	switch (formula.id) {
		// Earned Value formulas
		case 'cv':
			result = inputs.ev - inputs.ac;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Cost Variance',
				expression: 'CV = EV - AC',
				value: result
			});
			break;

		case 'sv':
			result = inputs.ev - inputs.pv;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Schedule Variance',
				expression: 'SV = EV - PV',
				value: result
			});
			break;

		case 'cpi':
			result = inputs.ev / inputs.ac;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Cost Performance Index',
				expression: 'CPI = EV / AC',
				value: result
			});
			break;

		case 'spi':
			result = inputs.ev / inputs.pv;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Schedule Performance Index',
				expression: 'SPI = EV / PV',
				value: result
			});
			break;

		case 'eac_bac_cpi':
			result = inputs.bac / inputs.cpi;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Estimate at Completion',
				expression: 'EAC = BAC / CPI',
				value: result
			});
			break;

		case 'etc_eac_ac':
			result = inputs.eac - inputs.ac;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Estimate to Complete',
				expression: 'ETC = EAC - AC',
				value: result
			});
			break;

		case 'vac':
			result = inputs.bac - inputs.eac;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Variance at Completion',
				expression: 'VAC = BAC - EAC',
				value: result
			});
			break;

		case 'tcpi':
			const remainingWork = inputs.bac - inputs.ev;
			const remainingFunds = inputs.bac - inputs.ac;
			result = remainingWork / remainingFunds;
			steps.push({
				stepNumber: 1,
				description: 'Calculate remaining work (BAC - EV)',
				expression: `${inputs.bac} - ${inputs.ev} = ${remainingWork}`,
				value: remainingWork
			});
			steps.push({
				stepNumber: 2,
				description: 'Calculate remaining funds (BAC - AC)',
				expression: `${inputs.bac} - ${inputs.ac} = ${remainingFunds}`,
				value: remainingFunds
			});
			steps.push({
				stepNumber: 3,
				description: 'Calculate TCPI',
				expression: 'TCPI = (BAC - EV) / (BAC - AC)',
				value: result
			});
			break;

		// Cost formulas
		case 'pv_fv':
			const pvResult = inputs.fv / Math.pow(1 + inputs.r, inputs.n);
			steps.push({
				stepNumber: 1,
				description: 'Calculate denominator (1 + r)^n',
				expression: `(1 + ${inputs.r})^${inputs.n} = ${Math.pow(1 + inputs.r, inputs.n).toFixed(4)}`,
				value: Math.pow(1 + inputs.r, inputs.n)
			});
			result = pvResult;
			steps.push({
				stepNumber: 2,
				description: 'Calculate Present Value',
				expression: `PV = ${inputs.fv} / ${Math.pow(1 + inputs.r, inputs.n).toFixed(4)}`,
				value: result
			});
			break;

		case 'npv': {
			const cashFlows = inputs.cashFlows as unknown as number[];
			const r = inputs.r;
			const initialInvestment = inputs.initialInvestment;

			let presentValue = 0;
			cashFlows.forEach((cf, index) => {
				const period = index + 1;
				const pv = cf / Math.pow(1 + r, period);
				presentValue += pv;
				steps.push({
					stepNumber: index + 1,
					description: `PV of cash flow ${period}`,
					expression: `${cf} / (1 + ${r})^${period} = ${pv.toFixed(2)}`,
					value: pv
				});
			});

			result = presentValue - initialInvestment;
			steps.push({
				stepNumber: cashFlows.length + 1,
				description: 'Subtract initial investment',
				expression: `NPV = ${presentValue.toFixed(2)} - ${initialInvestment}`,
				value: result
			});
			break;
		}

		case 'irr': {
			// IRR requires iterative calculation - use Newton-Raphson method
			const cashFlows = inputs.cashFlows as unknown as number[];
			let guess = 0.1; // Initial guess of 10%
			const maxIterations = 100;
			const tolerance = 0.00001;

			for (let i = 0; i < maxIterations; i++) {
				let npv = 0;
				let dnpv = 0;

				for (let j = 0; j < cashFlows.length; j++) {
					npv += cashFlows[j] / Math.pow(1 + guess, j);
					if (j > 0) {
						dnpv -= (j * cashFlows[j]) / Math.pow(1 + guess, j + 1);
					}
				}

				const newGuess = guess - npv / dnpv;
				if (Math.abs(newGuess - guess) < tolerance) {
					guess = newGuess;
					break;
				}
				guess = newGuess;
			}

			result = guess;
			steps.push({
				stepNumber: 1,
				description: 'IRR calculated iteratively',
				expression: 'IRR = r where NPV = 0',
				value: result
			});
			break;
		}

		// Scheduling formulas
		case 'activity_duration':
			result = (inputs.p + 4 * inputs.m + inputs.o) / 6;
			steps.push({
				stepNumber: 1,
				description: 'Apply PERT formula',
				expression: `(${inputs.p} + 4×${inputs.m} + ${inputs.o}) / 6`,
				value: result
			});
			break;

		case 'activity_variance':
			const diff = inputs.p - inputs.o;
			result = Math.pow(diff / 6, 2);
			steps.push({
				stepNumber: 1,
				description: 'Calculate range (P - O)',
				expression: `(${inputs.p} - ${inputs.o}) / 6 = ${diff / 6}`,
				value: diff / 6
			});
			steps.push({
				stepNumber: 2,
				description: 'Square the result',
				expression: `(${diff / 6})²`,
				value: result
			});
			break;

		case 'float':
			const float1 = inputs.ls - inputs.es;
			const float2 = inputs.lf - inputs.ef;
			result = float1;
			steps.push({
				stepNumber: 1,
				description: 'Calculate using start times (LS - ES)',
				expression: `${inputs.ls} - ${inputs.es} = ${float1}`,
				value: float1
			});
			steps.push({
				stepNumber: 2,
				description: 'Verify using finish times (LF - EF)',
				expression: `${inputs.lf} - ${inputs.ef} = ${float2}`,
				value: float2
			});
			break;

		// Communication formulas
		case 'communication_channels':
			result = (inputs.n * (inputs.n - 1)) / 2;
			steps.push({
				stepNumber: 1,
				description: 'Calculate communication channels',
				expression: `${inputs.n} × (${inputs.n} - 1) / 2`,
				value: result
			});
			break;

		// Probability formulas
		case 'expectation_ept':
			result = inputs.probability * inputs.impact;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Expected Monetary Value',
				expression: `EMV = ${inputs.probability} × ${inputs.impact}`,
				value: result
			});
			break;

		case 'sigma':
			result = (inputs.p - inputs.o) / 6;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Standard Deviation',
				expression: `(${inputs.p} - ${inputs.o}) / 6`,
				value: result
			});
			break;

		// Procurement formulas
		case 'point_of_total_assumption':
			const ptaNumerator = inputs.ceilingPrice - inputs.targetPrice;
			const ptaQuotient = ptaNumerator / inputs.buyerShareRatio;
			result = ptaQuotient + inputs.targetCost;
			steps.push({
				stepNumber: 1,
				description: 'Calculate price difference',
				expression: `${inputs.ceilingPrice} - ${inputs.targetPrice} = ${ptaNumerator}`,
				value: ptaNumerator
			});
			steps.push({
				stepNumber: 2,
				description: 'Divide by buyer share ratio',
				expression: `${ptaNumerator} / ${inputs.buyerShareRatio} = ${ptaQuotient}`,
				value: ptaQuotient
			});
			steps.push({
				stepNumber: 3,
				description: 'Add target cost',
				expression: `${ptaQuotient} + ${inputs.targetCost} = ${result}`,
				value: result
			});
			break;

		case 'expected_value_defects':
			result = inputs.evwpi - inputs.evwopi;
			steps.push({
				stepNumber: 1,
				description: 'Calculate EVPI',
				expression: `${inputs.evwpi} - ${inputs.evwopi}`,
				value: result
			});
			break;

		default:
			result = 0;
			steps.push({
				stepNumber: 1,
				description: 'Formula not implemented',
				expression: 'N/A',
				value: 0
			});
	}

	return {
		formulaId: formula.id,
		inputs,
		result,
		steps
	};
}

/**
 * Get formula statistics
 */
export async function getFormulasStats(): Promise<FormulasMetadata> {
	const data = await loadFormulasData();
	return {
		generatedAt: data.generatedAt,
		totalFormulas: data.totalFormulas,
		categories: data.categories
	};
}

/**
 * Clear cached formulas data
 */
export function clearCache(): void {
	cachedFormulas = null;
	cachedFormulasData = null;
}

/**
 * Parse cash flows from comma-separated string
 */
export function parseCashFlows(input: string): number[] {
	return input
		.split(',')
		.map((s) => parseFloat(s.trim()))
		.filter((n) => !isNaN(n));
}
