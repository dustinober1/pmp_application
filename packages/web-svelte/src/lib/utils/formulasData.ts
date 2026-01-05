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
 * Validation error for formula calculations
 */
export class FormulaValidationError extends Error {
	constructor(
		public field: string,
		message: string
	) {
		super(message);
		this.name = 'FormulaValidationError';
	}
}

/**
 * Validate that a value is a finite number
 */
function validateFiniteNumber(value: unknown, fieldName: string): number {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new FormulaValidationError(fieldName, `${fieldName} must be a finite number`);
	}
	return value;
}

/**
 * Validate that required inputs exist and are valid numbers
 */
function validateInputs(
	inputs: Record<string, number>,
	requiredFields: string[]
): void {
	// Check that all required fields are present
	for (const field of requiredFields) {
		if (!(field in inputs) || inputs[field] === undefined || inputs[field] === null) {
			throw new FormulaValidationError(field, `Required input '${field}' is missing`);
		}
	}

	// Validate all inputs are finite numbers
	for (const [key, value] of Object.entries(inputs)) {
		validateFiniteNumber(value, key);
	}
}

/**
 * Check for division by zero before performing division
 */
function safeDivision(numerator: number, denominator: number, fieldName: string): number {
	if (denominator === 0) {
		throw new FormulaValidationError(fieldName, `Division by zero: ${fieldName} cannot be zero`);
	}
	return numerator / denominator;
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
			validateInputs(inputs, ['ev', 'ac']);
			result = inputs.ev - inputs.ac;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Cost Variance',
				expression: 'CV = EV - AC',
				value: result
			});
			break;

		case 'sv':
			validateInputs(inputs, ['ev', 'pv']);
			result = inputs.ev - inputs.pv;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Schedule Variance',
				expression: 'SV = EV - PV',
				value: result
			});
			break;

		case 'cpi':
			validateInputs(inputs, ['ev', 'ac']);
			result = safeDivision(inputs.ev, inputs.ac, 'AC');
			steps.push({
				stepNumber: 1,
				description: 'Calculate Cost Performance Index',
				expression: 'CPI = EV / AC',
				value: result
			});
			break;

		case 'spi':
			validateInputs(inputs, ['ev', 'pv']);
			result = safeDivision(inputs.ev, inputs.pv, 'PV');
			steps.push({
				stepNumber: 1,
				description: 'Calculate Schedule Performance Index',
				expression: 'SPI = EV / PV',
				value: result
			});
			break;

		case 'eac_bac_cpi':
			validateInputs(inputs, ['bac', 'cpi']);
			result = safeDivision(inputs.bac, inputs.cpi, 'CPI');
			steps.push({
				stepNumber: 1,
				description: 'Calculate Estimate at Completion',
				expression: 'EAC = BAC / CPI',
				value: result
			});
			break;

		case 'etc_eac_ac':
			validateInputs(inputs, ['eac', 'ac']);
			result = inputs.eac - inputs.ac;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Estimate to Complete',
				expression: 'ETC = EAC - AC',
				value: result
			});
			break;

		case 'vac':
			validateInputs(inputs, ['bac', 'eac']);
			result = inputs.bac - inputs.eac;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Variance at Completion',
				expression: 'VAC = BAC - EAC',
				value: result
			});
			break;

		case 'tcpi':
			validateInputs(inputs, ['bac', 'ev', 'ac']);
			const remainingWork = inputs.bac - inputs.ev;
			const remainingFunds = inputs.bac - inputs.ac;
			result = safeDivision(remainingWork, remainingFunds, 'BAC - AC');
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
			validateInputs(inputs, ['fv', 'r', 'n']);
			const denominator = Math.pow(1 + inputs.r, inputs.n);
			if (denominator === 0) {
				throw new FormulaValidationError('denominator', 'Division by zero: (1 + r)^n cannot be zero');
			}
			const pvResult = safeDivision(inputs.fv, denominator, '(1 + r)^n');
			steps.push({
				stepNumber: 1,
				description: 'Calculate denominator (1 + r)^n',
				expression: `(1 + ${inputs.r})^${inputs.n} = ${denominator.toFixed(4)}`,
				value: denominator
			});
			result = pvResult;
			steps.push({
				stepNumber: 2,
				description: 'Calculate Present Value',
				expression: `PV = ${inputs.fv} / ${denominator.toFixed(4)}`,
				value: result
			});
			break;

		case 'npv': {
			validateInputs(inputs, ['cashFlows', 'r', 'initialInvestment']);
			const cashFlows = inputs.cashFlows as unknown as number[];
			const r = inputs.r;
			const initialInvestment = inputs.initialInvestment;

			if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
				throw new FormulaValidationError('cashFlows', 'cashFlows must be a non-empty array');
			}

			let presentValue = 0;
			cashFlows.forEach((cf, index) => {
				validateFiniteNumber(cf, `cashFlows[${index}]`);
				const period = index + 1;
				const periodDenominator = Math.pow(1 + r, period);
				if (periodDenominator === 0) {
					throw new FormulaValidationError(`period ${period}`, 'Division by zero: (1 + r)^period cannot be zero');
				}
				const pv = safeDivision(cf, periodDenominator, `(1 + r)^${period}`);
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
			validateInputs(inputs, ['cashFlows']);
			const cashFlows = inputs.cashFlows as unknown as number[];

			if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
				throw new FormulaValidationError('cashFlows', 'cashFlows must be a non-empty array');
			}

			// Validate all cash flows are finite numbers
			cashFlows.forEach((cf, index) => {
				validateFiniteNumber(cf, `cashFlows[${index}]`);
			});

			// IRR requires iterative calculation - use Newton-Raphson method
			let guess = 0.1; // Initial guess of 10%
			const maxIterations = 100;
			const tolerance = 0.00001;

			for (let i = 0; i < maxIterations; i++) {
				let npv = 0;
				let dnpv = 0;

				for (let j = 0; j < cashFlows.length; j++) {
					const periodDenominator = Math.pow(1 + guess, j);
					if (periodDenominator === 0) {
						throw new FormulaValidationError(`iteration ${i}`, 'Division by zero in IRR calculation');
					}
					npv += safeDivision(cashFlows[j], periodDenominator, `(1 + guess)^${j}`);
					if (j > 0) {
						const derivativeDenominator = Math.pow(1 + guess, j + 1);
						if (derivativeDenominator === 0) {
							throw new FormulaValidationError(`iteration ${i}`, 'Division by zero in IRR derivative');
						}
						dnpv -= safeDivision(j * cashFlows[j], derivativeDenominator, `(1 + guess)^${j + 1}`);
					}
				}

				if (dnpv === 0) {
					throw new FormulaValidationError('derivative', 'Division by zero: derivative cannot be zero in IRR calculation');
				}

				const newGuess = guess - safeDivision(npv, dnpv, 'derivative');
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
			validateInputs(inputs, ['p', 'm', 'o']);
			result = safeDivision(inputs.p + 4 * inputs.m + inputs.o, 6, '6');
			steps.push({
				stepNumber: 1,
				description: 'Apply PERT formula',
				expression: `(${inputs.p} + 4×${inputs.m} + ${inputs.o}) / 6`,
				value: result
			});
			break;

		case 'activity_variance':
			validateInputs(inputs, ['p', 'o']);
			const diff = inputs.p - inputs.o;
			const diffDivided = safeDivision(diff, 6, '6');
			result = Math.pow(diffDivided, 2);
			steps.push({
				stepNumber: 1,
				description: 'Calculate range (P - O)',
				expression: `(${inputs.p} - ${inputs.o}) / 6 = ${diffDivided}`,
				value: diffDivided
			});
			steps.push({
				stepNumber: 2,
				description: 'Square the result',
				expression: `(${diffDivided})²`,
				value: result
			});
			break;

		case 'float':
			validateInputs(inputs, ['ls', 'es', 'lf', 'ef']);
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
			validateInputs(inputs, ['n']);
			result = safeDivision(inputs.n * (inputs.n - 1), 2, '2');
			steps.push({
				stepNumber: 1,
				description: 'Calculate communication channels',
				expression: `${inputs.n} × (${inputs.n} - 1) / 2`,
				value: result
			});
			break;

		// Probability formulas
		case 'expectation_ept':
			validateInputs(inputs, ['probability', 'impact']);
			result = inputs.probability * inputs.impact;
			steps.push({
				stepNumber: 1,
				description: 'Calculate Expected Monetary Value',
				expression: `EMV = ${inputs.probability} × ${inputs.impact}`,
				value: result
			});
			break;

		case 'sigma':
			validateInputs(inputs, ['p', 'o']);
			result = safeDivision(inputs.p - inputs.o, 6, '6');
			steps.push({
				stepNumber: 1,
				description: 'Calculate Standard Deviation',
				expression: `(${inputs.p} - ${inputs.o}) / 6`,
				value: result
			});
			break;

		// Procurement formulas
		case 'point_of_total_assumption':
			validateInputs(inputs, ['ceilingPrice', 'targetPrice', 'buyerShareRatio', 'targetCost']);
			const ptaNumerator = inputs.ceilingPrice - inputs.targetPrice;
			const ptaQuotient = safeDivision(ptaNumerator, inputs.buyerShareRatio, 'buyerShareRatio');
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
			validateInputs(inputs, ['evwpi', 'evwopi']);
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
	if (!input || typeof input !== 'string') {
		throw new FormulaValidationError('input', 'Input must be a non-empty string');
	}

	const parsed = input
		.split(',')
		.map((s) => {
			const trimmed = s.trim();
			if (trimmed === '') {
				throw new FormulaValidationError('input', 'Empty value found in cash flows input');
			}
			const num = parseFloat(trimmed);
			if (isNaN(num)) {
				throw new FormulaValidationError(trimmed, `"${trimmed}" is not a valid number`);
			}
			if (!Number.isFinite(num)) {
				throw new FormulaValidationError(trimmed, `"${trimmed}" is not a finite number`);
			}
			return num;
		});

	if (parsed.length === 0) {
		throw new FormulaValidationError('input', 'No valid cash flows found in input');
	}

	return parsed;
}
