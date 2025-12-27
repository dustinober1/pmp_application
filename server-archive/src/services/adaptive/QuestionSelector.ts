/**
 * Question Selector Service
 *
 * Selects questions for adaptive learning sessions based on user performance and knowledge gaps.
 *
 * Requirements:
 * - 4.1: Prioritize questions from Knowledge_Gap areas (60% of questions)
 * - 4.2: Include maintenance questions from mastered areas (25% of questions)
 * - 4.3: Include stretch questions slightly above current ability (15% of questions)
 * - 4.4: Avoid repeating questions answered correctly in the last 7 days
 * - 4.5: Reduce difficulty after 3 consecutive incorrect answers
 * - 4.6: Increase difficulty after 5 consecutive correct answers
 */

import { prisma } from "../database";
import Logger from "../../utils/logger";
import { knowledgeGapIdentifier } from "./KnowledgeGapIdentifier";
import { masteryCalculator } from "./MasteryCalculator";
import {
  type Difficulty,
  DEFAULT_EXCLUDE_RECENT_DAYS,
  CONSECUTIVE_INCORRECT_THRESHOLD,
  CONSECUTIVE_CORRECT_THRESHOLD,
  MASTERY_THRESHOLD,
  STRETCH_THRESHOLD,
  DIFFICULTY_ORDER,
  DIFFICULTY_VALUES,
  calculateQuestionDistribution,
  shouldExcludeRecentQuestion,
} from "./QuestionSelectorUtils";

// Re-export utils for external use
export * from "./QuestionSelectorUtils";

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface SelectionParams {
  userId: string;
  count: number;
  domainFilter?: string;
  difficultyRange?: { min: Difficulty; max: Difficulty };
  excludeRecentDays?: number;
}

export interface SelectedQuestion {
  id: string;
  domainId: string;
  domainName: string;
  questionText: string;
  scenario?: string;
  choices: string;
  correctAnswerIndex: number;
  explanation: string;
  difficulty: Difficulty;
  methodology: string;
  selectionReason: "gap" | "maintenance" | "stretch";
}

export interface QuestionCandidate {
  id: string;
  domainId: string;
  domainName: string;
  questionText: string;
  scenario?: string;
  choices: string;
  correctAnswerIndex: number;
  explanation: string;
  difficulty: Difficulty;
  methodology: string;
  masteryLevel: number;
  lastIncorrectAt: Date | null;
}

// =============================================================================
// Question Selector Class
// =============================================================================

export class QuestionSelector {
  /**
   * Selects questions for an adaptive learning session.
   * Implements the 60/25/15 distribution (gap/maintenance/stretch).
   *
   * @param params - Selection parameters
   * @returns Array of selected questions with selection reasons
   *
   * Requirements: 4.1, 4.2, 4.3, 4.4
   */
  async selectQuestions(params: SelectionParams): Promise<SelectedQuestion[]> {
    try {
      const {
        userId,
        count,
        domainFilter,
        difficultyRange,
        excludeRecentDays = DEFAULT_EXCLUDE_RECENT_DAYS,
      } = params;

      // Get user's mastery levels and knowledge gaps
      const masteryLevels = await masteryCalculator.getAllMasteryLevels(userId);
      const knowledgeGaps = await knowledgeGapIdentifier.identifyGaps(userId);

      const domainAccuracy = await this.getRecentDomainAccuracy(userId);

      // Get consecutive answer patterns for difficulty adjustment
      const consecutivePatterns =
        await this.getConsecutiveAnswerPatterns(userId);

      // Calculate question distribution
      const distribution = calculateQuestionDistribution(count);

      // Get question candidates with mastery context
      const candidates = await this.getQuestionCandidates(
        userId,
        domainFilter,
        difficultyRange,
        excludeRecentDays,
        masteryLevels,
      );

      if (candidates.length === 0) {
        Logger.warn(`No question candidates found for user ${userId}`);
        return [];
      }

      // Select questions by category
      const selectedQuestions: SelectedQuestion[] = [];

      // 1. Select gap questions (60%)
      const gapQuestions = await this.selectGapQuestions(
        candidates,
        knowledgeGaps,
        distribution.gap,
        consecutivePatterns,
        domainAccuracy,
      );
      selectedQuestions.push(...gapQuestions);

      // 2. Select maintenance questions (25%)
      const maintenanceQuestions = await this.selectMaintenanceQuestions(
        candidates,
        masteryLevels,
        distribution.maintenance,
        consecutivePatterns,
        domainAccuracy,
        selectedQuestions.map((q) => q.id),
      );
      selectedQuestions.push(...maintenanceQuestions);

      // 3. Select stretch questions (15%)
      const stretchQuestions = await this.selectStretchQuestions(
        candidates,
        masteryLevels,
        distribution.stretch,
        consecutivePatterns,
        domainAccuracy,
        selectedQuestions.map((q) => q.id),
      );
      selectedQuestions.push(...stretchQuestions);

      // Shuffle the final selection to avoid predictable patterns
      const shuffled = this.shuffleArray([...selectedQuestions]);

      Logger.debug(
        `Selected ${shuffled.length} questions for user ${userId}: ` +
          `${gapQuestions.length} gap, ${maintenanceQuestions.length} maintenance, ${stretchQuestions.length} stretch`,
      );

      return shuffled.slice(0, count); // Ensure we don't exceed requested count
    } catch (error) {
      Logger.error("Error selecting questions:", error);
      throw error;
    }
  }

  /**
   * Gets question candidates with mastery context.
   */
  private async getQuestionCandidates(
    userId: string,
    domainFilter?: string,
    difficultyRange?: { min: Difficulty; max: Difficulty },
    excludeRecentDays: number = DEFAULT_EXCLUDE_RECENT_DAYS,
    masteryLevels: Array<{ domainId: string; score: number }> = [],
  ): Promise<QuestionCandidate[]> {
    // Build where clause
    const whereClause: any = {
      isActive: true,
    };

    if (domainFilter) {
      whereClause.domainId = domainFilter;
    }

    if (difficultyRange) {
      whereClause.difficulty = {
        in: this.getDifficultyRange(difficultyRange.min, difficultyRange.max),
      };
    }

    // Get last incorrect answer per question for spaced repetition
    const incorrectAnswerMap = new Map<string, Date>();

    const recentIncorrectAnswers = await prisma.userAnswer.findMany({
      where: {
        session: { userId },
        isCorrect: false,
      },
      orderBy: { answeredAt: "desc" },
      take: 500,
      select: {
        questionId: true,
        answeredAt: true,
      },
    });

    for (const answer of recentIncorrectAnswers) {
      if (!incorrectAnswerMap.has(answer.questionId)) {
        incorrectAnswerMap.set(answer.questionId, answer.answeredAt);
      }
    }

    // Get questions with recent correct answer data
    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        domain: true,
        answers: {
          where: {
            session: { userId },
            isCorrect: true,
            answeredAt: {
              gte: new Date(
                Date.now() - excludeRecentDays * 24 * 60 * 60 * 1000,
              ),
            },
          },
          orderBy: { answeredAt: "desc" },
          take: 1,
        },
      },
    });

    // Create mastery lookup
    const masteryMap = new Map(masteryLevels.map((m) => [m.domainId, m.score]));

    // Filter out recently answered questions and add mastery context
    const candidates: QuestionCandidate[] = [];

    for (const question of questions) {
      // Check if should exclude due to recent correct answer
      const lastCorrectAnswer = question.answers[0];
      if (
        shouldExcludeRecentQuestion(
          lastCorrectAnswer?.answeredAt || null,
          excludeRecentDays,
        )
      ) {
        continue; // Skip this question
      }

      const lastIncorrectAt = incorrectAnswerMap.get(question.id) || null;

      const masteryLevel = masteryMap.get(question.domainId) || 50; // Default neutral mastery

      candidates.push({
        id: question.id,
        domainId: question.domainId,
        domainName: question.domain.name,
        questionText: question.questionText,
        scenario: question.scenario || undefined,
        choices: question.choices,
        correctAnswerIndex: question.correctAnswerIndex,
        explanation: question.explanation,
        difficulty: question.difficulty as Difficulty,
        methodology: question.methodology,
        masteryLevel,
        lastIncorrectAt,
      });
    }

    return candidates;
  }

  /**
   * Selects questions from knowledge gap areas.
   */
  private async selectGapQuestions(
    candidates: QuestionCandidate[],
    knowledgeGaps: Array<{ domainId: string; priorityScore: number }>,
    count: number,
    consecutivePatterns: Map<string, { correct: number; incorrect: number }>,
    domainAccuracy: Map<string, number>,
  ): Promise<SelectedQuestion[]> {
    if (count === 0) {
      return [];
    }

    // Get gap domain IDs sorted by priority
    const gapPriority = new Map(
      knowledgeGaps.map((gap) => [gap.domainId, gap.priorityScore]),
    );

    const gapDomainIds = knowledgeGaps
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .map((gap) => gap.domainId);

    // Filter candidates to gap domains
    const gapCandidates = candidates
      .filter((c) => gapDomainIds.includes(c.domainId))
      .sort((a, b) => {
        const aPriority = gapPriority.get(a.domainId) || 0;
        const bPriority = gapPriority.get(b.domainId) || 0;

        const aRepeat = a.lastIncorrectAt ? 1 : 0;
        const bRepeat = b.lastIncorrectAt ? 1 : 0;
        if (aRepeat !== bRepeat) {
          return bRepeat - aRepeat;
        }

        if (aRepeat === 1 && bRepeat === 1) {
          return b.lastIncorrectAt!.getTime() - a.lastIncorrectAt!.getTime();
        }

        return bPriority - aPriority;
      });

    if (gapCandidates.length === 0) {
      // No gap questions available, return empty array
      return [];
    }

    // Apply difficulty adjustments and select
    const selected = this.selectWithDifficultyAdjustment(
      gapCandidates,
      count,
      consecutivePatterns,
      domainAccuracy,
      "gap",
    );

    return selected;
  }

  private pickBestCandidate(
    candidates: QuestionCandidate[],
    selectionReason: "gap" | "maintenance" | "stretch",
  ): QuestionCandidate | undefined {
    if (candidates.length === 0) {
      return undefined;
    }

    const sorted = [...candidates].sort((a, b) => {
      const aRepeat = a.lastIncorrectAt ? 1 : 0;
      const bRepeat = b.lastIncorrectAt ? 1 : 0;
      if (aRepeat !== bRepeat) {
        return bRepeat - aRepeat;
      }

      if (aRepeat === 1 && bRepeat === 1) {
        return b.lastIncorrectAt!.getTime() - a.lastIncorrectAt!.getTime();
      }

      if (selectionReason === "stretch") {
        return (
          DIFFICULTY_VALUES[b.difficulty] - DIFFICULTY_VALUES[a.difficulty]
        );
      }

      return DIFFICULTY_VALUES[a.difficulty] - DIFFICULTY_VALUES[b.difficulty];
    });

    return sorted[0];
  }

  private getPreferredDifficultyForDomain(
    domainId: string,
    consecutivePatterns: Map<string, { correct: number; incorrect: number }>,
    domainAccuracy: Map<string, number>,
  ): Difficulty {
    const domainPattern = consecutivePatterns.get(domainId) || {
      correct: 0,
      incorrect: 0,
    };

    if (domainPattern.incorrect >= CONSECUTIVE_INCORRECT_THRESHOLD) {
      return "EASY";
    }

    if (domainPattern.correct >= CONSECUTIVE_CORRECT_THRESHOLD) {
      return "HARD";
    }

    const accuracy = domainAccuracy.get(domainId);
    if (accuracy === undefined) {
      return "MEDIUM";
    }

    if (accuracy < 50) {
      return "EASY";
    }

    if (accuracy > 80) {
      return "HARD";
    }

    return "MEDIUM";
  }

  private async getRecentDomainAccuracy(
    userId: string,
  ): Promise<Map<string, number>> {
    const answers = await prisma.userAnswer.findMany({
      where: {
        session: { userId },
      },
      include: {
        question: {
          select: {
            domainId: true,
          },
        },
      },
      orderBy: { answeredAt: "desc" },
      take: 200,
    });

    const counts = new Map<string, { total: number; correct: number }>();
    for (const answer of answers) {
      const domainId = answer.question.domainId;
      const current = counts.get(domainId) || { total: 0, correct: 0 };
      current.total += 1;
      if (answer.isCorrect) {
        current.correct += 1;
      }
      counts.set(domainId, current);
    }

    const accuracy = new Map<string, number>();
    for (const [domainId, c] of counts) {
      if (c.total > 0) {
        accuracy.set(domainId, (c.correct / c.total) * 100);
      }
    }

    return accuracy;
  }

  /**
   * Selects maintenance questions from mastered areas.
   */
  private async selectMaintenanceQuestions(
    candidates: QuestionCandidate[],
    masteryLevels: Array<{ domainId: string; score: number }>,
    count: number,
    consecutivePatterns: Map<string, { correct: number; incorrect: number }>,
    domainAccuracy: Map<string, number>,
    excludeIds: string[],
  ): Promise<SelectedQuestion[]> {
    if (count === 0) {
      return [];
    }

    // Get mastered domain IDs (mastery >= 70% but < 85%)
    const masteredDomainIds = masteryLevels
      .filter(
        (m) => m.score >= MASTERY_THRESHOLD && m.score < STRETCH_THRESHOLD,
      )
      .map((m) => m.domainId);

    // Filter candidates to mastered domains, excluding already selected
    const maintenanceCandidates = candidates.filter(
      (c) =>
        masteredDomainIds.includes(c.domainId) && !excludeIds.includes(c.id),
    );

    if (maintenanceCandidates.length === 0) {
      return [];
    }

    const selected = this.selectWithDifficultyAdjustment(
      maintenanceCandidates,
      count,
      consecutivePatterns,
      domainAccuracy,
      "maintenance",
    );

    return selected;
  }

  /**
   * Selects stretch questions for highly mastered areas.
   */
  private async selectStretchQuestions(
    candidates: QuestionCandidate[],
    masteryLevels: Array<{ domainId: string; score: number }>,
    count: number,
    consecutivePatterns: Map<string, { correct: number; incorrect: number }>,
    domainAccuracy: Map<string, number>,
    excludeIds: string[],
  ): Promise<SelectedQuestion[]> {
    if (count === 0) {
      return [];
    }

    // Get highly mastered domain IDs (mastery >= 85%)
    const stretchDomainIds = masteryLevels
      .filter((m) => m.score >= STRETCH_THRESHOLD)
      .map((m) => m.domainId);

    // Filter candidates to stretch domains, excluding already selected
    // Prefer harder questions for stretch
    const stretchCandidates = candidates
      .filter(
        (c) =>
          stretchDomainIds.includes(c.domainId) && !excludeIds.includes(c.id),
      )
      .sort(
        (a, b) =>
          DIFFICULTY_VALUES[b.difficulty] - DIFFICULTY_VALUES[a.difficulty],
      );

    if (stretchCandidates.length === 0) {
      return [];
    }

    const selected = this.selectWithDifficultyAdjustment(
      stretchCandidates,
      count,
      consecutivePatterns,
      domainAccuracy,
      "stretch",
    );

    return selected;
  }

  /**
   * Selects questions with difficulty adjustment based on consecutive patterns.
   */
  private selectWithDifficultyAdjustment(
    candidates: QuestionCandidate[],
    count: number,
    consecutivePatterns: Map<string, { correct: number; incorrect: number }>,
    domainAccuracy: Map<string, number>,
    selectionReason: "gap" | "maintenance" | "stretch",
  ): SelectedQuestion[] {
    const selected: SelectedQuestion[] = [];
    const availableCandidates = [...candidates];

    for (let i = 0; i < count && availableCandidates.length > 0; i++) {
      const nextCandidateDomainId = availableCandidates[0]?.domainId;
      if (!nextCandidateDomainId) {
        break;
      }

      const preferredDifficulty = this.getPreferredDifficultyForDomain(
        nextCandidateDomainId,
        consecutivePatterns,
        domainAccuracy,
      );

      const difficultyMatches = availableCandidates.filter(
        (c) => c.difficulty === preferredDifficulty,
      );

      let bestCandidate = this.pickBestCandidate(
        difficultyMatches,
        selectionReason,
      );

      // If no exact match, take any available candidate
      if (!bestCandidate) {
        bestCandidate = this.pickBestCandidate(
          availableCandidates,
          selectionReason,
        );
      }

      if (bestCandidate) {
        selected.push({
          id: bestCandidate.id,
          domainId: bestCandidate.domainId,
          domainName: bestCandidate.domainName,
          questionText: bestCandidate.questionText,
          scenario: bestCandidate.scenario,
          choices: bestCandidate.choices,
          correctAnswerIndex: bestCandidate.correctAnswerIndex,
          explanation: bestCandidate.explanation,
          difficulty: bestCandidate.difficulty,
          methodology: bestCandidate.methodology,
          selectionReason,
        });

        // Remove selected candidate from available pool
        const index = availableCandidates.indexOf(bestCandidate);
        availableCandidates.splice(index, 1);
      }
    }

    return selected;
  }

  /**
   * Gets consecutive answer patterns for difficulty adjustment.
   */
  private async getConsecutiveAnswerPatterns(
    userId: string,
  ): Promise<Map<string, { correct: number; incorrect: number }>> {
    // Get recent answers grouped by domain
    const recentAnswers = await prisma.userAnswer.findMany({
      where: {
        session: { userId },
      },
      include: {
        question: {
          select: { domainId: true },
        },
      },
      orderBy: { answeredAt: "desc" },
      take: 50, // Look at last 50 answers to find patterns
    });

    const patterns = new Map<string, { correct: number; incorrect: number }>();

    // Group by domain and calculate consecutive patterns
    const domainAnswers = new Map<string, boolean[]>();

    for (const answer of recentAnswers) {
      const domainId = answer.question.domainId;
      if (!domainAnswers.has(domainId)) {
        domainAnswers.set(domainId, []);
      }
      domainAnswers.get(domainId)!.push(answer.isCorrect);
    }

    // Calculate consecutive counts for each domain
    for (const [domainId, answers] of domainAnswers) {
      let consecutiveCorrect = 0;
      let consecutiveIncorrect = 0;

      // Count consecutive from most recent
      for (const isCorrect of answers) {
        if (isCorrect) {
          consecutiveCorrect++;
          consecutiveIncorrect = 0; // Reset incorrect count
        } else {
          consecutiveIncorrect++;
          consecutiveCorrect = 0; // Reset correct count
        }
      }

      patterns.set(domainId, {
        correct: consecutiveCorrect,
        incorrect: consecutiveIncorrect,
      });
    }

    return patterns;
  }

  /**
   * Gets difficulty range array from min to max.
   */
  private getDifficultyRange(min: Difficulty, max: Difficulty): Difficulty[] {
    const minIndex = DIFFICULTY_ORDER.indexOf(min);
    const maxIndex = DIFFICULTY_ORDER.indexOf(max);

    return DIFFICULTY_ORDER.slice(minIndex, maxIndex + 1);
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm.
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export singleton instance
export const questionSelector = new QuestionSelector();
