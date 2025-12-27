/**
 * Test Generator Service
 *
 * Utility for generating domain-specific practice tests.
 * Provides helper functions to create tests filtered by domain(s)
 * with optional difficulty and methodology distribution.
 *
 * Used by:
 * - Admin API for creating custom tests
 * - Seed scripts for generating sample domain-specific tests
 */

import { prisma } from "./database";
import Logger from "../utils/logger";

// =============================================================================
// Types and Interfaces
// =============================================================================

/**
 * Difficulty levels for questions
 */
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

/**
 * Methodology types for questions
 */
export type Methodology = "PREDICTIVE" | "AGILE" | "HYBRID";

/**
 * Configuration for difficulty distribution in a test
 */
export interface DifficultyDistribution {
  /** Percentage of easy questions (0-100) */
  easy: number;
  /** Percentage of medium questions (0-100) */
  medium: number;
  /** Percentage of hard questions (0-100) */
  hard: number;
}

/**
 * Configuration for methodology distribution in a test
 */
export interface MethodologyDistribution {
  /** Percentage of predictive questions (0-100) */
  predictive: number;
  /** Percentage of agile questions (0-100) */
  agile: number;
  /** Percentage of hybrid questions (0-100) */
  hybrid: number;
}

/**
 * Domain information returned from queries
 */
export interface DomainInfo {
  id: string;
  name: string;
  weightPercentage: number;
}

/**
 * Options for generating a test by domain
 */
export interface GenerateTestOptions {
  /**
   * Array of domain IDs to include questions from.
   * If empty, all domains are included.
   */
  domainIds: string[];

  /**
   * Total number of questions to include in the test.
   */
  questionCount: number;

  /**
   * Optional difficulty distribution. If not provided, uses available questions.
   * Percentages should sum to 100.
   */
  difficultyDistribution?: DifficultyDistribution;

  /**
   * Optional methodology distribution. If not provided, uses available questions.
   * Percentages should sum to 100.
   */
  methodologyDistribution?: MethodologyDistribution;

  /**
   * Whether to balance questions across selected domains based on their weight.
   * If true, questions are distributed proportionally to domain weightPercentage.
   * If false, questions are distributed evenly across domains.
   * Default: true
   */
  useWeightedDistribution?: boolean;

  /**
   * Optional list of question IDs to exclude from selection.
   * Useful for avoiding recently used questions.
   */
  excludeQuestionIds?: string[];
}

/**
 * Result of test generation
 */
export interface GenerateTestResult {
  /** Array of selected question IDs */
  questionIds: string[];

  /** Breakdown of questions by domain */
  domainBreakdown: {
    domainId: string;
    domainName: string;
    questionCount: number;
    targetCount: number;
  }[];

  /** Breakdown of questions by difficulty */
  difficultyBreakdown: {
    difficulty: Difficulty;
    count: number;
    targetCount: number;
  }[];

  /** Breakdown of questions by methodology */
  methodologyBreakdown: {
    methodology: Methodology;
    count: number;
    targetCount: number;
  }[];

  /** Warning messages if any constraints couldn't be fully satisfied */
  warnings: string[];
}

// =============================================================================
// Validation Types and Interfaces
// =============================================================================

/**
 * Severity level for validation messages
 */
export type ValidationSeverity = "error" | "warning" | "info";

/**
 * Individual validation message
 */
export interface ValidationMessage {
  /** Severity level of the message */
  severity: ValidationSeverity;
  /** Human-readable message describing the issue or suggestion */
  message: string;
  /** Optional field or domain the message relates to */
  field?: string;
  /** Optional suggested action to resolve the issue */
  suggestion?: string;
}

/**
 * Result of domain test requirements validation
 */
export interface DomainTestValidationResult {
  /** Whether the validation passed (no errors) */
  isValid: boolean;
  /** Whether there are warnings to consider */
  hasWarnings: boolean;
  /** List of validation messages */
  messages: ValidationMessage[];
  /** Summary statistics about the validation */
  stats: {
    /** Requested number of questions */
    requestedCount: number;
    /** Total available questions across selected domains */
    availableCount: number;
    /** Shortfall (if requested > available) */
    shortfall: number;
    /** Per-domain availability breakdown */
    domainAvailability: {
      domainId: string;
      domainName: string;
      available: number;
      expectedWeightPercentage: number;
      targetCount: number;
    }[];
  };
}

/**
 * Result of domain distribution validation
 */
export interface DomainDistributionValidationResult {
  /** Whether the distribution is considered valid */
  isValid: boolean;
  /** Whether there are significant deviations from expected weights */
  hasDeviations: boolean;
  /** Detailed distribution analysis */
  analysis: {
    domainId: string;
    domainName: string;
    expectedPercentage: number;
    actualPercentage: number;
    deviationPercentage: number;
    isWithinThreshold: boolean;
  }[];
  /** Validation messages */
  messages: ValidationMessage[];
}

/**
 * Recommended question count result
 */
export interface RecommendedQuestionCountResult {
  /** Recommended question count */
  recommended: number;
  /** Minimum viable question count */
  minimum: number;
  /** Maximum possible question count */
  maximum: number;
  /** Explanation of the recommendation */
  explanation: string;
  /** Per-domain breakdown of the recommendation */
  domainBreakdown: {
    domainId: string;
    domainName: string;
    available: number;
    recommendedCount: number;
    minimumCount: number;
  }[];
}

// =============================================================================
// Default Distributions
// =============================================================================

/**
 * Default difficulty distribution (balanced)
 */
export const DEFAULT_DIFFICULTY_DISTRIBUTION: DifficultyDistribution = {
  easy: 30,
  medium: 50,
  hard: 20,
};

/**
 * Default methodology distribution (balanced)
 */
export const DEFAULT_METHODOLOGY_DISTRIBUTION: MethodologyDistribution = {
  predictive: 33,
  agile: 33,
  hybrid: 34,
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculates target counts based on distribution percentages
 * @param total - Total count to distribute
 * @param distribution - Object with percentage values
 * @returns Object with calculated counts
 */
function calculateDistributionCounts<T extends Record<string, number>>(
  total: number,
  distribution: T,
): Record<keyof T, number> {
  const entries = Object.entries(distribution) as [keyof T, number][];
  const result = {} as Record<keyof T, number>;

  let remaining = total;
  let processed = 0;

  for (const [key, percentage] of entries) {
    processed++;
    if (processed === entries.length) {
      // Last item gets remainder to avoid rounding issues
      result[key] = remaining;
    } else {
      const count = Math.round((total * percentage) / 100);
      result[key] = count;
      remaining -= count;
    }
  }

  return result;
}

// =============================================================================
// Main Test Generator Functions
// =============================================================================

/**
 * Generates question IDs for a domain-specific test.
 *
 * This function queries questions from specified domains and returns
 * a set of question IDs suitable for creating a practice test.
 *
 * @param options - Configuration options for test generation
 * @returns Promise resolving to test generation result with question IDs and metadata
 *
 * @example
 * // Generate a 50-question test for the People domain
 * const result = await generateTestByDomain({
 *   domainIds: ['people-domain-uuid'],
 *   questionCount: 50,
 * });
 *
 * @example
 * // Generate a mixed domain test with specific distributions
 * const result = await generateTestByDomain({
 *   domainIds: ['people-uuid', 'process-uuid'],
 *   questionCount: 100,
 *   difficultyDistribution: { easy: 20, medium: 60, hard: 20 },
 *   useWeightedDistribution: true,
 * });
 */
export async function generateTestByDomain(
  options: GenerateTestOptions,
): Promise<GenerateTestResult> {
  const {
    domainIds,
    questionCount,
    difficultyDistribution,
    methodologyDistribution,
    useWeightedDistribution = true,
    excludeQuestionIds = [],
  } = options;

  const warnings: string[] = [];

  try {
    // Get domain information
    const domainsQuery = domainIds.length > 0 ? { id: { in: domainIds } } : {};
    const domains = await prisma.domain.findMany({
      where: domainsQuery,
      select: {
        id: true,
        name: true,
        weightPercentage: true,
      },
    });

    if (domains.length === 0) {
      throw new Error("No domains found matching the provided domain IDs");
    }

    // Calculate target counts per domain
    const domainTargets = calculateDomainTargets(
      domains,
      questionCount,
      useWeightedDistribution,
    );

    // Get all available questions for the selected domains
    const allQuestions = await prisma.question.findMany({
      where: {
        domainId: { in: domains.map((d) => d.id) },
        isActive: true,
        id: { notIn: excludeQuestionIds },
      },
      select: {
        id: true,
        domainId: true,
        difficulty: true,
        methodology: true,
      },
    });

    if (allQuestions.length === 0) {
      throw new Error("No active questions found for the selected domains");
    }

    if (allQuestions.length < questionCount) {
      warnings.push(
        `Requested ${questionCount} questions but only ${allQuestions.length} available. Using all available questions.`,
      );
    }

    // Group questions by domain
    const questionsByDomain = new Map<string, typeof allQuestions>();
    for (const question of allQuestions) {
      const existing = questionsByDomain.get(question.domainId) || [];
      existing.push(question);
      questionsByDomain.set(question.domainId, existing);
    }

    // Select questions per domain
    const selectedQuestions: typeof allQuestions = [];

    for (const domain of domains) {
      const domainQuestions = questionsByDomain.get(domain.id) || [];
      const targetCount = domainTargets.get(domain.id) || 0;

      if (domainQuestions.length < targetCount) {
        warnings.push(
          `Domain "${domain.name}": requested ${targetCount} questions but only ${domainQuestions.length} available`,
        );
      }

      // Shuffle and select questions for this domain
      const shuffled = shuffleArray(domainQuestions);

      // If we have distribution requirements, try to respect them
      if (difficultyDistribution || methodologyDistribution) {
        const selected = selectWithDistributions(
          shuffled,
          targetCount,
          difficultyDistribution,
          methodologyDistribution,
        );
        selectedQuestions.push(...selected);
      } else {
        // Simple random selection
        selectedQuestions.push(...shuffled.slice(0, targetCount));
      }
    }

    // If we still haven't reached questionCount, fill with remaining questions
    if (selectedQuestions.length < questionCount) {
      const selectedIds = new Set(selectedQuestions.map((q) => q.id));
      const remaining = allQuestions.filter((q) => !selectedIds.has(q.id));
      const shuffledRemaining = shuffleArray(remaining);
      const needed = questionCount - selectedQuestions.length;
      selectedQuestions.push(...shuffledRemaining.slice(0, needed));
    }

    // Final shuffle to avoid predictable patterns
    const finalSelection = shuffleArray(selectedQuestions).slice(
      0,
      questionCount,
    );

    // Calculate breakdowns
    const domainBreakdown = calculateDomainBreakdown(
      finalSelection,
      domains,
      domainTargets,
    );
    const difficultyBreakdown = calculateDifficultyBreakdown(
      finalSelection,
      questionCount,
      difficultyDistribution,
    );
    const methodologyBreakdown = calculateMethodologyBreakdown(
      finalSelection,
      questionCount,
      methodologyDistribution,
    );

    Logger.info(
      `Generated test with ${finalSelection.length} questions from ${domains.length} domain(s)`,
    );

    return {
      questionIds: finalSelection.map((q) => q.id),
      domainBreakdown,
      difficultyBreakdown,
      methodologyBreakdown,
      warnings,
    };
  } catch (error) {
    Logger.error("Error generating test by domain:", error);
    throw error;
  }
}

/**
 * Calculates target question counts per domain based on weight or even distribution
 */
function calculateDomainTargets(
  domains: DomainInfo[],
  totalCount: number,
  useWeightedDistribution: boolean,
): Map<string, number> {
  const targets = new Map<string, number>();

  if (useWeightedDistribution) {
    // Calculate total weight of selected domains
    const totalWeight = domains.reduce((sum, d) => sum + d.weightPercentage, 0);

    let remaining = totalCount;
    let processed = 0;

    for (const domain of domains) {
      processed++;
      if (processed === domains.length) {
        // Last domain gets remainder
        targets.set(domain.id, remaining);
      } else {
        const normalizedWeight = domain.weightPercentage / totalWeight;
        const count = Math.round(totalCount * normalizedWeight);
        targets.set(domain.id, count);
        remaining -= count;
      }
    }
  } else {
    // Even distribution
    const countPerDomain = Math.floor(totalCount / domains.length);
    const remainder = totalCount % domains.length;

    domains.forEach((domain, index) => {
      const count = countPerDomain + (index < remainder ? 1 : 0);
      targets.set(domain.id, count);
    });
  }

  return targets;
}

/**
 * Selects questions while trying to respect difficulty and methodology distributions
 */
function selectWithDistributions(
  questions: Array<{
    id: string;
    domainId: string;
    difficulty: string;
    methodology: string;
  }>,
  targetCount: number,
  difficultyDist?: DifficultyDistribution,
  _methodologyDist?: MethodologyDistribution,
): typeof questions {
  if (questions.length <= targetCount) {
    return questions;
  }

  const selected: typeof questions = [];
  const remaining = [...questions];

  // Primary selection based on difficulty if specified
  if (difficultyDist) {
    const diffCounts = calculateDistributionCounts(targetCount, {
      EASY: difficultyDist.easy,
      MEDIUM: difficultyDist.medium,
      HARD: difficultyDist.hard,
    });

    for (const [difficulty, count] of Object.entries(diffCounts)) {
      const matching = remaining.filter(
        (q) => q.difficulty.toUpperCase() === difficulty,
      );
      const shuffled = shuffleArray(matching);
      const toSelect = shuffled.slice(0, count);

      for (const q of toSelect) {
        selected.push(q);
        const idx = remaining.findIndex((r) => r.id === q.id);
        if (idx !== -1) {
          remaining.splice(idx, 1);
        }
      }
    }
  }

  // Fill remaining slots randomly if needed
  if (selected.length < targetCount) {
    const shuffledRemaining = shuffleArray(remaining);
    const needed = targetCount - selected.length;
    selected.push(...shuffledRemaining.slice(0, needed));
  }

  return selected.slice(0, targetCount);
}

/**
 * Calculates domain breakdown for the result
 */
function calculateDomainBreakdown(
  questions: Array<{ id: string; domainId: string }>,
  domains: DomainInfo[],
  targets: Map<string, number>,
): GenerateTestResult["domainBreakdown"] {
  const counts = new Map<string, number>();
  for (const q of questions) {
    counts.set(q.domainId, (counts.get(q.domainId) || 0) + 1);
  }

  return domains.map((domain) => ({
    domainId: domain.id,
    domainName: domain.name,
    questionCount: counts.get(domain.id) || 0,
    targetCount: targets.get(domain.id) || 0,
  }));
}

/**
 * Calculates difficulty breakdown for the result
 */
function calculateDifficultyBreakdown(
  questions: Array<{ difficulty: string }>,
  totalCount: number,
  distribution?: DifficultyDistribution,
): GenerateTestResult["difficultyBreakdown"] {
  const counts = { EASY: 0, MEDIUM: 0, HARD: 0 };
  for (const q of questions) {
    const diff = q.difficulty.toUpperCase() as Difficulty;
    if (diff in counts) {
      counts[diff]++;
    }
  }

  const targets = distribution
    ? calculateDistributionCounts(totalCount, {
        EASY: distribution.easy,
        MEDIUM: distribution.medium,
        HARD: distribution.hard,
      })
    : { EASY: 0, MEDIUM: 0, HARD: 0 };

  return (["EASY", "MEDIUM", "HARD"] as const).map((difficulty) => ({
    difficulty,
    count: counts[difficulty],
    targetCount: targets[difficulty],
  }));
}

/**
 * Calculates methodology breakdown for the result
 */
function calculateMethodologyBreakdown(
  questions: Array<{ methodology: string }>,
  totalCount: number,
  distribution?: MethodologyDistribution,
): GenerateTestResult["methodologyBreakdown"] {
  const counts = { PREDICTIVE: 0, AGILE: 0, HYBRID: 0 };
  for (const q of questions) {
    const meth = q.methodology.toUpperCase() as Methodology;
    if (meth in counts) {
      counts[meth]++;
    }
  }

  const targets = distribution
    ? calculateDistributionCounts(totalCount, {
        PREDICTIVE: distribution.predictive,
        AGILE: distribution.agile,
        HYBRID: distribution.hybrid,
      })
    : { PREDICTIVE: 0, AGILE: 0, HYBRID: 0 };

  return (["PREDICTIVE", "AGILE", "HYBRID"] as const).map((methodology) => ({
    methodology,
    count: counts[methodology],
    targetCount: targets[methodology],
  }));
}

// =============================================================================
// Additional Utility Functions
// =============================================================================

/**
 * Gets all available domains from the database
 *
 * @returns Promise resolving to array of domain information
 */
export async function getAllDomains(): Promise<DomainInfo[]> {
  return prisma.domain.findMany({
    select: {
      id: true,
      name: true,
      weightPercentage: true,
    },
  });
}

/**
 * Gets the count of available questions for a domain
 *
 * @param domainId - ID of the domain to check
 * @param excludeQuestionIds - Optional list of question IDs to exclude
 * @returns Promise resolving to question count
 */
export async function getQuestionCountForDomain(
  domainId: string,
  excludeQuestionIds: string[] = [],
): Promise<number> {
  return prisma.question.count({
    where: {
      domainId,
      isActive: true,
      id: { notIn: excludeQuestionIds },
    },
  });
}

/**
 * Gets question counts for all domains
 *
 * @param excludeQuestionIds - Optional list of question IDs to exclude
 * @returns Promise resolving to map of domain ID to question count
 */
export async function getQuestionCountsByDomain(
  excludeQuestionIds: string[] = [],
): Promise<Map<string, number>> {
  const domains = await getAllDomains();
  const counts = new Map<string, number>();

  for (const domain of domains) {
    const count = await getQuestionCountForDomain(
      domain.id,
      excludeQuestionIds,
    );
    counts.set(domain.id, count);
  }

  return counts;
}

/**
 * Validates that enough questions are available for the requested test
 *
 * @param domainIds - Domain IDs to include
 * @param questionCount - Desired question count
 * @param excludeQuestionIds - Question IDs to exclude
 * @returns Object with isValid flag and available count
 */
export async function validateQuestionAvailability(
  domainIds: string[],
  questionCount: number,
  excludeQuestionIds: string[] = [],
): Promise<{ isValid: boolean; availableCount: number; shortfall: number }> {
  const whereClause: {
    domainId?: { in: string[] };
    isActive: boolean;
    id: { notIn: string[] };
  } = {
    isActive: true,
    id: { notIn: excludeQuestionIds },
  };

  if (domainIds.length > 0) {
    whereClause.domainId = { in: domainIds };
  }

  const availableCount = await prisma.question.count({
    where: whereClause,
  });

  return {
    isValid: availableCount >= questionCount,
    availableCount,
    shortfall: Math.max(0, questionCount - availableCount),
  };
}

// =============================================================================
// Domain Coverage Validation Functions
// =============================================================================

/** Default threshold for acceptable deviation from expected domain weight (percentage points) */
const DEFAULT_DEVIATION_THRESHOLD = 10;

/** Minimum questions to make a domain-specific test meaningful */
const MINIMUM_QUESTIONS_PER_DOMAIN = 5;

/** Recommended questions per domain for a good learning experience */
const RECOMMENDED_QUESTIONS_PER_DOMAIN = 15;

/**
 * Validates that enough questions are available for creating a domain-specific test.
 * Checks both overall availability and per-domain availability to ensure the test
 * can be created with proper coverage.
 *
 * @param domainIds - Array of domain IDs to include. If empty, validates all domains.
 * @param questionCount - Total number of questions requested for the test.
 * @param options - Additional validation options
 * @param options.excludeQuestionIds - Question IDs to exclude from availability count
 * @param options.useWeightedDistribution - Whether to consider domain weights when calculating targets
 * @returns Promise resolving to detailed validation result
 *
 * @example
 * // Validate a 50-question test for People domain
 * const result = await validateDomainTestRequirements(
 *   ['people-domain-uuid'],
 *   50
 * );
 * if (!result.isValid) {
 *   console.error(result.messages.filter(m => m.severity === 'error'));
 * }
 */
export async function validateDomainTestRequirements(
  domainIds: string[],
  questionCount: number,
  options: {
    excludeQuestionIds?: string[];
    useWeightedDistribution?: boolean;
  } = {},
): Promise<DomainTestValidationResult> {
  const { excludeQuestionIds = [], useWeightedDistribution = true } = options;
  const messages: ValidationMessage[] = [];

  try {
    // Get domains - either specified ones or all
    const domainsQuery = domainIds.length > 0 ? { id: { in: domainIds } } : {};
    const domains = await prisma.domain.findMany({
      where: domainsQuery,
      select: {
        id: true,
        name: true,
        weightPercentage: true,
      },
    });

    // Check for invalid domain IDs
    if (domainIds.length > 0) {
      const foundIds = new Set(domains.map((d) => d.id));
      const invalidIds = domainIds.filter((id) => !foundIds.has(id));
      if (invalidIds.length > 0) {
        messages.push({
          severity: "error",
          message: `Invalid domain IDs provided: ${invalidIds.join(", ")}`,
          field: "domainIds",
          suggestion: "Verify that all domain IDs exist in the database",
        });
      }
    }

    // Check if any domains were found
    if (domains.length === 0) {
      messages.push({
        severity: "error",
        message: "No valid domains found for the test",
        field: "domainIds",
        suggestion:
          "Provide at least one valid domain ID or leave empty for all domains",
      });

      return {
        isValid: false,
        hasWarnings: false,
        messages,
        stats: {
          requestedCount: questionCount,
          availableCount: 0,
          shortfall: questionCount,
          domainAvailability: [],
        },
      };
    }

    // Get question counts per domain
    const domainAvailability: DomainTestValidationResult["stats"]["domainAvailability"] =
      [];
    let totalAvailable = 0;

    // Calculate target counts based on weighted or even distribution
    const domainTargets = calculateDomainTargets(
      domains,
      questionCount,
      useWeightedDistribution,
    );

    for (const domain of domains) {
      const available = await prisma.question.count({
        where: {
          domainId: domain.id,
          isActive: true,
          id: { notIn: excludeQuestionIds },
        },
      });

      totalAvailable += available;
      const targetCount = domainTargets.get(domain.id) || 0;

      domainAvailability.push({
        domainId: domain.id,
        domainName: domain.name,
        available,
        expectedWeightPercentage: domain.weightPercentage,
        targetCount,
      });

      // Check for per-domain issues
      if (available === 0) {
        messages.push({
          severity: "error",
          message: `No questions available for domain "${domain.name}"`,
          field: domain.id,
          suggestion:
            "Add questions to this domain or exclude it from the test",
        });
      } else if (available < targetCount) {
        messages.push({
          severity: "warning",
          message: `Domain "${domain.name}": Only ${available} questions available, but ${targetCount} requested based on weight`,
          field: domain.id,
          suggestion: `Reduce total question count or add more questions to this domain`,
        });
      } else if (available < MINIMUM_QUESTIONS_PER_DOMAIN) {
        messages.push({
          severity: "warning",
          message: `Domain "${domain.name}" has only ${available} questions, which may not provide adequate coverage`,
          field: domain.id,
          suggestion: `Consider adding more questions (at least ${MINIMUM_QUESTIONS_PER_DOMAIN} recommended)`,
        });
      }
    }

    // Check overall availability
    const shortfall = Math.max(0, questionCount - totalAvailable);
    if (shortfall > 0) {
      messages.push({
        severity: "error",
        message: `Insufficient questions: Requested ${questionCount} but only ${totalAvailable} available across selected domains`,
        field: "questionCount",
        suggestion: `Reduce question count to ${totalAvailable} or add more questions`,
      });
    }

    // Check for reasonable question count
    if (questionCount < MINIMUM_QUESTIONS_PER_DOMAIN * domains.length) {
      messages.push({
        severity: "warning",
        message: `Question count (${questionCount}) may be too low for ${domains.length} domain(s). Consider at least ${MINIMUM_QUESTIONS_PER_DOMAIN} questions per domain.`,
        field: "questionCount",
        suggestion: `Increase to at least ${MINIMUM_QUESTIONS_PER_DOMAIN * domains.length} questions`,
      });
    }

    // Add info message about distribution
    if (domains.length > 1 && useWeightedDistribution) {
      const distributionInfo = domains
        .map((d) => `${d.name}: ${d.weightPercentage}%`)
        .join(", ");
      messages.push({
        severity: "info",
        message: `Test will use weighted distribution: ${distributionInfo}`,
      });
    }

    const hasErrors = messages.some((m) => m.severity === "error");
    const hasWarnings = messages.some((m) => m.severity === "warning");

    return {
      isValid: !hasErrors,
      hasWarnings,
      messages,
      stats: {
        requestedCount: questionCount,
        availableCount: totalAvailable,
        shortfall,
        domainAvailability,
      },
    };
  } catch (error) {
    Logger.error("Error validating domain test requirements:", error);
    messages.push({
      severity: "error",
      message:
        "Failed to validate domain test requirements due to an internal error",
    });
    return {
      isValid: false,
      hasWarnings: false,
      messages,
      stats: {
        requestedCount: questionCount,
        availableCount: 0,
        shortfall: questionCount,
        domainAvailability: [],
      },
    };
  }
}

/**
 * Validates that the distribution of questions across domains matches expected weights.
 * This is useful for ensuring that a test properly covers all domains according to
 * their importance in the PMP exam.
 *
 * @param domainIds - Array of domain IDs included in the test
 * @param questionCount - Total number of questions in the test
 * @param options - Validation options
 * @param options.deviationThreshold - Maximum acceptable deviation from expected weight (percentage points, default: 10)
 * @returns Promise resolving to distribution validation result
 *
 * @example
 * // Check if a 100-question test with 40 People, 45 Process, 15 Business Environment
 * // matches expected weights
 * const result = await validateDomainDistribution(
 *   ['people-uuid', 'process-uuid', 'be-uuid'],
 *   100,
 *   { deviationThreshold: 5 }
 * );
 */
export async function validateDomainDistribution(
  domainIds: string[],
  questionCount: number,
  options: {
    deviationThreshold?: number;
    excludeQuestionIds?: string[];
  } = {},
): Promise<DomainDistributionValidationResult> {
  const {
    deviationThreshold = DEFAULT_DEVIATION_THRESHOLD,
    excludeQuestionIds = [],
  } = options;
  const messages: ValidationMessage[] = [];
  const analysis: DomainDistributionValidationResult["analysis"] = [];

  try {
    // Get domains
    const domainsQuery = domainIds.length > 0 ? { id: { in: domainIds } } : {};
    const domains = await prisma.domain.findMany({
      where: domainsQuery,
      select: {
        id: true,
        name: true,
        weightPercentage: true,
      },
    });

    if (domains.length === 0) {
      messages.push({
        severity: "error",
        message: "No domains found for distribution analysis",
      });
      return {
        isValid: false,
        hasDeviations: false,
        analysis: [],
        messages,
      };
    }

    // Calculate total weight of selected domains for normalization
    const totalWeight = domains.reduce((sum, d) => sum + d.weightPercentage, 0);

    // Get actual question counts per domain
    let hasDeviations = false;
    let hasErrors = false;

    for (const domain of domains) {
      const available = await prisma.question.count({
        where: {
          domainId: domain.id,
          isActive: true,
          id: { notIn: excludeQuestionIds },
        },
      });

      // Calculate expected percentage (normalized to selected domains)
      const normalizedWeight = (domain.weightPercentage / totalWeight) * 100;

      // Calculate target count based on normalized weight
      const targetCount = Math.round((questionCount * normalizedWeight) / 100);

      // Calculate what percentage this domain would have if we use target count
      const actualPercentage = (targetCount / questionCount) * 100;

      // Calculate deviation
      const deviation = Math.abs(actualPercentage - normalizedWeight);
      const isWithinThreshold = deviation <= deviationThreshold;

      if (!isWithinThreshold) {
        hasDeviations = true;
      }

      // Check if we even have enough questions to meet target
      if (available < targetCount) {
        hasErrors = true;
        messages.push({
          severity: "warning",
          message: `Domain "${domain.name}" cannot meet target: ${available} available but ${targetCount} needed (${normalizedWeight.toFixed(1)}% weight)`,
          field: domain.id,
        });
      }

      analysis.push({
        domainId: domain.id,
        domainName: domain.name,
        expectedPercentage: normalizedWeight,
        actualPercentage,
        deviationPercentage: deviation,
        isWithinThreshold,
      });
    }

    // Add summary message
    if (hasDeviations) {
      const deviatingDomains = analysis
        .filter((a) => !a.isWithinThreshold)
        .map((a) => a.domainName);
      messages.push({
        severity: "warning",
        message: `Distribution deviation detected in: ${deviatingDomains.join(", ")}`,
        suggestion: `Consider adjusting question count or adding more questions to affected domains`,
      });
    } else {
      messages.push({
        severity: "info",
        message: "Distribution aligns with expected domain weights",
      });
    }

    return {
      isValid: !hasErrors,
      hasDeviations,
      analysis,
      messages,
    };
  } catch (error) {
    Logger.error("Error validating domain distribution:", error);
    messages.push({
      severity: "error",
      message:
        "Failed to validate domain distribution due to an internal error",
    });
    return {
      isValid: false,
      hasDeviations: false,
      analysis: [],
      messages,
    };
  }
}

/**
 * Calculates the recommended question count for a domain-specific test based on
 * available questions and domain weights.
 *
 * @param domainIds - Array of domain IDs to include. If empty, considers all domains.
 * @param options - Recommendation options
 * @param options.excludeQuestionIds - Question IDs to exclude from consideration
 * @param options.useWeightedDistribution - Whether to use domain weights (default: true)
 * @param options.targetUtilization - Target percentage of available questions to use (default: 80)
 * @returns Promise resolving to recommendation result
 *
 * @example
 * // Get recommended question count for People domain
 * const result = await getRecommendedQuestionCount(['people-domain-uuid']);
 * console.log(`Recommended: ${result.recommended} questions`);
 */
export async function getRecommendedQuestionCount(
  domainIds: string[],
  options: {
    excludeQuestionIds?: string[];
    useWeightedDistribution?: boolean;
    targetUtilization?: number;
  } = {},
): Promise<RecommendedQuestionCountResult> {
  const {
    excludeQuestionIds = [],
    useWeightedDistribution = true,
    targetUtilization = 80,
  } = options;

  try {
    // Get domains
    const domainsQuery = domainIds.length > 0 ? { id: { in: domainIds } } : {};
    const domains = await prisma.domain.findMany({
      where: domainsQuery,
      select: {
        id: true,
        name: true,
        weightPercentage: true,
      },
    });

    if (domains.length === 0) {
      return {
        recommended: 0,
        minimum: 0,
        maximum: 0,
        explanation: "No valid domains found",
        domainBreakdown: [],
      };
    }

    // Get question counts per domain
    const domainBreakdown: RecommendedQuestionCountResult["domainBreakdown"] =
      [];
    let totalAvailable = 0;
    let minimumTotal = 0;

    for (const domain of domains) {
      const available = await prisma.question.count({
        where: {
          domainId: domain.id,
          isActive: true,
          id: { notIn: excludeQuestionIds },
        },
      });

      totalAvailable += available;
      const minimumCount = Math.min(available, MINIMUM_QUESTIONS_PER_DOMAIN);
      minimumTotal += minimumCount;

      // Recommended count is based on target utilization or recommended per domain
      const recommendedCount = Math.min(
        available,
        Math.max(
          RECOMMENDED_QUESTIONS_PER_DOMAIN,
          Math.floor(available * (targetUtilization / 100)),
        ),
      );

      domainBreakdown.push({
        domainId: domain.id,
        domainName: domain.name,
        available,
        recommendedCount,
        minimumCount,
      });
    }

    // Calculate overall recommendations
    const maximum = totalAvailable;
    const minimum = Math.max(
      MINIMUM_QUESTIONS_PER_DOMAIN * domains.length,
      minimumTotal,
    );

    // For weighted distribution, calculate recommended based on the smallest available/weight ratio
    let recommended: number;

    if (useWeightedDistribution && domains.length > 1) {
      // Find the limiting factor - the domain that would run out first
      const totalWeight = domains.reduce(
        (sum, d) => sum + d.weightPercentage,
        0,
      );

      let limitingFactor = Infinity;
      for (const breakdown of domainBreakdown) {
        const domain = domains.find((d) => d.id === breakdown.domainId)!;
        const normalizedWeight = domain.weightPercentage / totalWeight;
        // How many total questions could we have before this domain runs out?
        const maxTotal = breakdown.available / normalizedWeight;
        limitingFactor = Math.min(limitingFactor, maxTotal);
      }

      // Apply target utilization to the limiting factor
      recommended = Math.floor(limitingFactor * (targetUtilization / 100));
    } else {
      // For single domain or even distribution, use target utilization of total
      recommended = Math.floor(totalAvailable * (targetUtilization / 100));
    }

    // Ensure recommended is within bounds
    recommended = Math.max(minimum, Math.min(recommended, maximum));

    // Update domain breakdown with recommended counts based on weights
    if (useWeightedDistribution && domains.length > 1) {
      const totalWeight = domains.reduce(
        (sum, d) => sum + d.weightPercentage,
        0,
      );
      for (const breakdown of domainBreakdown) {
        const domain = domains.find((d) => d.id === breakdown.domainId)!;
        const normalizedWeight = domain.weightPercentage / totalWeight;
        breakdown.recommendedCount = Math.min(
          breakdown.available,
          Math.round(recommended * normalizedWeight),
        );
      }
    }

    // Generate explanation
    let explanation: string;
    if (domains.length === 1) {
      explanation = `For a single-domain test on "${domains[0].name}", we recommend ${recommended} questions (${Math.round((recommended / totalAvailable) * 100)}% of available).`;
    } else {
      explanation = `For a test covering ${domains.length} domains, we recommend ${recommended} questions to ensure proper coverage based on domain weights.`;
      if (recommended < totalAvailable * 0.5) {
        explanation += ` The count is limited by available questions in some domains.`;
      }
    }

    return {
      recommended,
      minimum,
      maximum,
      explanation,
      domainBreakdown,
    };
  } catch (error) {
    Logger.error("Error calculating recommended question count:", error);
    return {
      recommended: 0,
      minimum: 0,
      maximum: 0,
      explanation:
        "Failed to calculate recommendation due to an internal error",
      domainBreakdown: [],
    };
  }
}

/**
 * Combined validation function that performs all domain coverage checks at once.
 * Use this for comprehensive validation before creating a test.
 *
 * @param domainIds - Array of domain IDs to include
 * @param questionCount - Desired question count
 * @param options - Validation options
 * @returns Promise resolving to combined validation results
 */
export async function validateDomainCoverage(
  domainIds: string[],
  questionCount: number,
  options: {
    excludeQuestionIds?: string[];
    useWeightedDistribution?: boolean;
    deviationThreshold?: number;
  } = {},
): Promise<{
  requirements: DomainTestValidationResult;
  distribution: DomainDistributionValidationResult;
  recommendation: RecommendedQuestionCountResult;
  overallValid: boolean;
  overallMessages: ValidationMessage[];
}> {
  const [requirements, distribution, recommendation] = await Promise.all([
    validateDomainTestRequirements(domainIds, questionCount, options),
    validateDomainDistribution(domainIds, questionCount, options),
    getRecommendedQuestionCount(domainIds, options),
  ]);

  const overallValid = requirements.isValid && distribution.isValid;
  const overallMessages: ValidationMessage[] = [];

  // Consolidate the most important messages
  if (!requirements.isValid) {
    const errors = requirements.messages.filter((m) => m.severity === "error");
    overallMessages.push(...errors);
  }

  if (requirements.hasWarnings || distribution.hasDeviations) {
    overallMessages.push({
      severity: "warning",
      message: `Recommended question count is ${recommendation.recommended} (current request: ${questionCount})`,
      suggestion: recommendation.explanation,
    });
  }

  if (
    overallValid &&
    !requirements.hasWarnings &&
    !distribution.hasDeviations
  ) {
    overallMessages.push({
      severity: "info",
      message: "All domain coverage requirements met",
    });
  }

  return {
    requirements,
    distribution,
    recommendation,
    overallValid,
    overallMessages,
  };
}
