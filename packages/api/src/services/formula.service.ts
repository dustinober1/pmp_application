import type { FormulaCategory } from '@pmp/shared';
import { EVM_VARIABLES } from '@pmp/shared';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

// Local types for simplicity
interface FormulaResponse {
  id: string;
  name: string;
  category: FormulaCategory;
  expression: string;
  description: string;
  whenToUse: string;
  variables: VariableResponse[];
  example: unknown;
  createdAt: Date;
}

interface VariableResponse {
  symbol: string;
  name: string;
  description: string;
  unit?: string;
}

interface CalcResult {
  formulaId: string;
  formulaName: string;
  inputs: Record<string, number>;
  result: number;
  steps: CalcStep[];
  interpretation: string;
}

interface CalcStep {
  stepNumber: number;
  description: string;
  expression: string;
  value: number;
}

export class FormulaService {
  /**
   * Get all formulas
   */
  async getFormulas(category?: FormulaCategory): Promise<FormulaResponse[]> {
    const where = category ? { category } : {};

    const formulas = await prisma.formula.findMany({
      where,
      include: { variables: true },
      orderBy: { name: 'asc' },
    });

    return formulas.map(f => ({
      id: f.id,
      name: f.name,
      category: f.category as FormulaCategory,
      expression: f.expression,
      description: f.description,
      whenToUse: f.whenToUse,
      variables: f.variables.map(
        (v): VariableResponse => ({
          symbol: v.symbol,
          name: v.name,
          description: v.description,
          unit: v.unit || undefined,
        })
      ),
      example: f.example,
      createdAt: f.createdAt,
    }));
  }

  /**
   * Get a formula by ID
   */
  async getFormulaById(formulaId: string): Promise<FormulaResponse | null> {
    const formula = await prisma.formula.findUnique({
      where: { id: formulaId },
      include: { variables: true },
    });

    if (!formula) return null;

    return {
      id: formula.id,
      name: formula.name,
      category: formula.category as FormulaCategory,
      expression: formula.expression,
      description: formula.description,
      whenToUse: formula.whenToUse,
      variables: formula.variables.map(
        (v): VariableResponse => ({
          symbol: v.symbol,
          name: v.name,
          description: v.description,
          unit: v.unit || undefined,
        })
      ),
      example: formula.example,
      createdAt: formula.createdAt,
    };
  }

  /**
   * Get practice questions related to a formula
   */
  async getRelatedQuestions(formulaId: string, limit: number = 10): Promise<string[]> {
    const relations = await prisma.questionFormula.findMany({
      where: { formulaId },
      select: { questionId: true },
      take: limit,
    });

    return relations.map(r => r.questionId);
  }

  /**
   * Calculate a formula with given inputs (High-End/Corporate tier)
   */
  async calculateFormula(formulaId: string, inputs: Record<string, number>): Promise<CalcResult> {
    const formula = await prisma.formula.findUnique({
      where: { id: formulaId },
      include: { variables: true },
    });

    if (!formula) {
      throw AppError.notFound('Formula not found');
    }

    // Validate all required variables are provided
    const requiredVars = formula.variables.map(v => v.symbol);
    const missingVars = requiredVars.filter(v => !(v in inputs));

    if (missingVars.length > 0) {
      throw AppError.badRequest(
        `Missing required variables: ${missingVars.join(', ')}`,
        'FORMULA_001'
      );
    }

    // Calculate based on formula category
    const steps: CalcStep[] = [];
    let result: number;

    try {
      switch (formula.category) {
        case 'earned_value':
          result = this.calculateEarnedValue(formula.name, inputs, steps);
          break;
        case 'scheduling':
          result = this.calculateScheduling(formula.name, inputs, steps);
          break;
        case 'cost':
          result = this.calculateCost(formula.name, inputs, steps);
          break;
        case 'communication':
          result = this.calculateCommunication(formula.name, inputs, steps);
          break;
        default:
          result = this.calculateGeneric(formula.expression, inputs, steps);
      }
    } catch {
      throw AppError.badRequest('Calculation error', 'FORMULA_002');
    }

    // Determine interpretation
    const interpretation = this.getInterpretation(formula.name, result);

    return {
      formulaId,
      formulaName: formula.name,
      inputs,
      result,
      steps,
      interpretation,
    };
  }

  /**
   * Calculate Earned Value formulas
   */
  private calculateEarnedValue(
    formulaName: string,
    inputs: Record<string, number>,
    steps: CalcStep[]
  ): number {
    const EV = inputs['EV'] ?? 0;
    const AC = inputs['AC'] ?? 0;
    const PV = inputs['PV'] ?? 0;
    const BAC = inputs['BAC'] ?? 0;
    const EAC = inputs['EAC'] ?? 0;
    const CPI = inputs['CPI'] ?? 0;

    switch (formulaName.toUpperCase()) {
      case 'CPI':
      case 'COST PERFORMANCE INDEX':
        steps.push({
          stepNumber: 1,
          description: 'CPI = EV / AC',
          expression: `${EV} / ${AC}`,
          value: EV / AC,
        });
        return EV / AC;

      case 'SPI':
      case 'SCHEDULE PERFORMANCE INDEX':
        steps.push({
          stepNumber: 1,
          description: 'SPI = EV / PV',
          expression: `${EV} / ${PV}`,
          value: EV / PV,
        });
        return EV / PV;

      case 'CV':
      case 'COST VARIANCE':
        steps.push({
          stepNumber: 1,
          description: 'CV = EV - AC',
          expression: `${EV} - ${AC}`,
          value: EV - AC,
        });
        return EV - AC;

      case 'SV':
      case 'SCHEDULE VARIANCE':
        steps.push({
          stepNumber: 1,
          description: 'SV = EV - PV',
          expression: `${EV} - ${PV}`,
          value: EV - PV,
        });
        return EV - PV;

      case 'EAC':
      case 'ESTIMATE AT COMPLETION': {
        if (CPI) {
          const result = BAC / CPI;
          steps.push({
            stepNumber: 1,
            description: 'EAC = BAC / CPI',
            expression: `${BAC} / ${CPI}`,
            value: result,
          });
          return result;
        }
        const result = AC + (BAC - EV);
        steps.push({
          stepNumber: 1,
          description: 'EAC = AC + (BAC - EV)',
          expression: `${AC} + (${BAC} - ${EV})`,
          value: result,
        });
        return result;
      }

      case 'ETC':
      case 'ESTIMATE TO COMPLETE': {
        const etc = EAC - AC;
        steps.push({
          stepNumber: 1,
          description: 'ETC = EAC - AC',
          expression: `${EAC} - ${AC}`,
          value: etc,
        });
        return etc;
      }

      case 'VAC':
      case 'VARIANCE AT COMPLETION': {
        const vac = BAC - EAC;
        steps.push({
          stepNumber: 1,
          description: 'VAC = BAC - EAC',
          expression: `${BAC} - ${EAC}`,
          value: vac,
        });
        return vac;
      }

      case 'TCPI':
      case 'TO-COMPLETE PERFORMANCE INDEX': {
        if (EAC > 0) {
          const tcpi = (BAC - EV) / (EAC - AC);
          steps.push({
            stepNumber: 1,
            description: 'TCPI = (BAC - EV) / (EAC - AC)',
            expression: `(${BAC} - ${EV}) / (${EAC} - ${AC})`,
            value: tcpi,
          });
          return tcpi;
        }
        const tcpiBac = (BAC - EV) / (BAC - AC);
        steps.push({
          stepNumber: 1,
          description: 'TCPI = (BAC - EV) / (BAC - AC)',
          expression: `(${BAC} - ${EV}) / (${BAC} - ${AC})`,
          value: tcpiBac,
        });
        return tcpiBac;
      }

      default:
        throw new Error(`Unknown EV formula: ${formulaName}`);
    }
  }

  /**
   * Calculate Scheduling formulas
   */
  private calculateScheduling(
    formulaName: string,
    inputs: Record<string, number>,
    steps: CalcStep[]
  ): number {
    switch (formulaName.toUpperCase()) {
      case 'PERT':
      case 'PERT ESTIMATE': {
        const O = inputs['O'] ?? inputs['optimistic'] ?? 0;
        const M = inputs['M'] ?? inputs['mostLikely'] ?? 0;
        const P = inputs['P'] ?? inputs['pessimistic'] ?? 0;
        const result = (O + 4 * M + P) / 6;
        steps.push({
          stepNumber: 1,
          description: 'PERT = (O + 4M + P) / 6',
          expression: `(${O} + 4×${M} + ${P}) / 6`,
          value: result,
        });
        return result;
      }

      case 'STANDARD DEVIATION': {
        const optimistic = inputs['optimistic'] ?? inputs['O'] ?? 0;
        const pessimistic = inputs['pessimistic'] ?? inputs['P'] ?? 0;
        const result = (pessimistic - optimistic) / 6;
        steps.push({
          stepNumber: 1,
          description: 'σ = (P - O) / 6',
          expression: `(${pessimistic} - ${optimistic}) / 6`,
          value: result,
        });
        return result;
      }

      case 'VARIANCE': {
        const sd = inputs['standardDeviation'] ?? inputs['SD'] ?? 0;
        const result = sd * sd;
        steps.push({
          stepNumber: 1,
          description: 'Variance = σ²',
          expression: `${sd}²`,
          value: result,
        });
        return result;
      }

      default:
        throw new Error(`Unknown scheduling formula: ${formulaName}`);
    }
  }

  /**
   * Calculate Cost formulas
   */
  private calculateCost(
    formulaName: string,
    inputs: Record<string, number>,
    steps: CalcStep[]
  ): number {
    switch (formulaName.toUpperCase()) {
      case 'ROI':
      case 'RETURN ON INVESTMENT': {
        const benefit = inputs['benefit'] ?? 0;
        const cost = inputs['cost'] ?? 0;
        const result = ((benefit - cost) / cost) * 100;
        steps.push({
          stepNumber: 1,
          description: 'ROI = (Benefit - Cost) / Cost × 100',
          expression: `(${benefit} - ${cost}) / ${cost} × 100`,
          value: result,
        });
        return result;
      }

      case 'NPV':
      case 'NET PRESENT VALUE': {
        const cashFlow = inputs['cashFlow'] ?? 0;
        const rate = inputs['rate'] ?? 0;
        const periods = inputs['periods'] ?? 1;
        const pv = cashFlow / Math.pow(1 + rate, periods);
        steps.push({
          stepNumber: 1,
          description: 'PV = CF / (1 + r)^n',
          expression: `${cashFlow} / (1 + ${rate})^${periods}`,
          value: pv,
        });
        return pv;
      }

      case 'PAYBACK PERIOD': {
        const investment = inputs['investment'] ?? 0;
        const annualCashFlow = inputs['annualCashFlow'] ?? 1;
        const result = investment / annualCashFlow;
        steps.push({
          stepNumber: 1,
          description: 'Payback = Investment / Annual Cash Flow',
          expression: `${investment} / ${annualCashFlow}`,
          value: result,
        });
        return result;
      }

      default:
        throw new Error(`Unknown cost formula: ${formulaName}`);
    }
  }

  /**
   * Calculate Communication formulas
   */
  private calculateCommunication(
    formulaName: string,
    inputs: Record<string, number>,
    steps: CalcStep[]
  ): number {
    switch (formulaName.toUpperCase()) {
      case 'COMMUNICATION CHANNELS': {
        const n = inputs['n'] ?? 0;
        const result = (n * (n - 1)) / 2;
        steps.push({
          stepNumber: 1,
          description: 'Channels = n(n-1) / 2',
          expression: `${n} × (${n} - 1) / 2`,
          value: result,
        });
        return result;
      }

      default:
        throw new Error(`Unknown communication formula: ${formulaName}`);
    }
  }

  /**
   * Calculate generic formula using expression
   */
  private calculateGeneric(
    expression: string,
    inputs: Record<string, number>,
    steps: CalcStep[]
  ): number {
    // Simple expression parser for basic operations
    let expr = expression;

    // Replace variables with values
    for (const [key, value] of Object.entries(inputs)) {
      expr = expr.replace(new RegExp(`\\b${key}\\b`, 'gi'), String(value));
    }

    steps.push({ stepNumber: 1, description: expression, expression: expr, value: 0 });

    // Evaluate (using Function for safety - only numbers and operators)
    const sanitized = expr.replace(/[^0-9+\-*/().]/g, '');
    const result = Function(`"use strict"; return (${sanitized})`)() as number;
    steps[0]!.value = result;
    return result;
  }

  /**
   * Get interpretation of result
   */
  private getInterpretation(formulaName: string, result: number): string {
    const name = formulaName.toUpperCase();

    if (name.includes('CPI') || name.includes('COST PERFORMANCE')) {
      if (result > 1) return 'Under budget - spending less than planned';
      if (result < 1) return 'Over budget - spending more than planned';
      return 'On budget - spending as planned';
    }

    if (name.includes('SPI') || name.includes('SCHEDULE PERFORMANCE')) {
      if (result > 1) return 'Ahead of schedule - progressing faster than planned';
      if (result < 1) return 'Behind schedule - progressing slower than planned';
      return 'On schedule - progressing as planned';
    }

    if (name.includes('CV') || name.includes('COST VARIANCE')) {
      if (result > 0) return 'Positive variance - under budget';
      if (result < 0) return 'Negative variance - over budget';
      return 'No variance - on budget';
    }

    if (name.includes('SV') || name.includes('SCHEDULE VARIANCE')) {
      if (result > 0) return 'Positive variance - ahead of schedule';
      if (result < 0) return 'Negative variance - behind schedule';
      return 'No variance - on schedule';
    }

    if (name.includes('TCPI')) {
      if (result > 1) return 'Must improve performance to meet target';
      if (result < 1) return 'Can relax performance and still meet target';
      return 'Current performance will meet target';
    }

    return `Result: ${result.toFixed(2)}`;
  }

  /**
   * Get all EVM variable definitions
   */
  getEVMVariables(): typeof EVM_VARIABLES {
    return EVM_VARIABLES;
  }
}

export const formulaService = new FormulaService();
