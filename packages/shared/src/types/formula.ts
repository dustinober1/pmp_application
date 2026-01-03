/**
 * Formula related types
 */

export type FormulaCategory =
  | "earned_value"
  | "scheduling"
  | "cost"
  | "communication"
  | "probability"
  | "procurement";

export interface Formula {
  id: string;
  name: string;
  category: FormulaCategory;
  expression: string; // e.g., "CPI = EV / AC"
  variables: FormulaVariable[];
  description: string;
  whenToUse: string;
  example: FormulaExample;
}

export interface FormulaVariable {
  id: string;
  formulaId: string;
  symbol: string;
  name: string;
  description: string;
  unit?: string;
}

export interface FormulaExample {
  scenario: string;
  inputs: Record<string, number>;
  solution: string;
  result: number;
}

export interface CalculationInput {
  formulaId: string;
  inputs: Record<string, number>;
}

export interface CalculationResult {
  formulaId: string;
  inputs: Record<string, number>;
  result: number;
  steps: CalculationStep[];
}

export interface CalculationStep {
  stepNumber: number;
  description: string;
  expression: string;
  value: number;
}

// Common EVM Variables
export const EVM_VARIABLES = {
  EV: {
    symbol: "EV",
    name: "Earned Value",
    description: "Value of work performed",
  },
  PV: {
    symbol: "PV",
    name: "Planned Value",
    description: "Authorized budget for scheduled work",
  },
  AC: {
    symbol: "AC",
    name: "Actual Cost",
    description: "Actual cost incurred",
  },
  BAC: {
    symbol: "BAC",
    name: "Budget at Completion",
    description: "Total authorized budget for the project",
  },
  EAC: {
    symbol: "EAC",
    name: "Estimate at Completion",
    description: "Expected total cost at project completion",
  },
  ETC: {
    symbol: "ETC",
    name: "Estimate to Complete",
    description: "Expected cost to finish remaining work",
  },
  VAC: {
    symbol: "VAC",
    name: "Variance at Completion",
    description: "Projected budget surplus or deficit",
  },
  CPI: {
    symbol: "CPI",
    name: "Cost Performance Index",
    description: "Measure of cost efficiency (EV/AC)",
  },
  SPI: {
    symbol: "SPI",
    name: "Schedule Performance Index",
    description: "Measure of schedule efficiency (EV/PV)",
  },
  CV: {
    symbol: "CV",
    name: "Cost Variance",
    description: "Difference between EV and AC",
  },
  SV: {
    symbol: "SV",
    name: "Schedule Variance",
    description: "Difference between EV and PV",
  },
} as const;
