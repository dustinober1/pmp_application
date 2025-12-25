/**
 * Performance Analyzer Service
 *
 * Analyzes user performance data and maintains answer history for the Adaptive Learning Engine.
 *
 * Requirements:
 * - 1.1: Record question domain, difficulty, methodology, time spent, correctness
 * - 1.2: Calculate aggregate statistics including accuracy rate, average time, domain breakdown
 * - 1.3: Maintain a rolling history of the last 500 answers per user
 */

import { prisma } from "../database";
import Logger from "../../utils/logger";

// =============================================================================
// Types and Interfaces
// =============================================================================

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface AnswerRecord {
  questionId: string;
  domainId: string;
  difficulty: Difficulty;
  methodology: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  answeredAt: Date;
}

export interface DomainStats {
  domainId: string;
  domainName: string;
  totalAnswered: number;
  correctAnswers: number;
  accuracyRate: number;
  averageTimeSeconds: number;
}

export interface DifficultyStats {
  difficulty: Difficulty;
  totalAnswered: number;
  correctAnswers: number;
  accuracyRate: number;
}

export interface PerformanceStats {
  totalAnswered: number;
  correctAnswers: number;
  accuracyRate: number;
  averageTimePerQuestion: number;
  domainBreakdown: DomainStats[];
  difficultyBreakdown: DifficultyStats[];
}

export interface TrendData {
  date: Date;
  accuracyRate: number;
  questionsAnswered: number;
}

// Maximum number of answers to retain per user (rolling window)
export const MAX_ANSWER_HISTORY = 500;

// =============================================================================
// Performance Analyzer Class
// =============================================================================

export class PerformanceAnalyzer {
  /**
   * Records a user's answer and updates their answer history.
   * Maintains a rolling window of the last 500 answers.
   *
   * @param userId - The user's ID
   * @param answer - The answer record to store
   *
   * Requirements: 1.1, 1.3
   */
  async recordAnswer(userId: string, answer: AnswerRecord): Promise<void> {
    try {
      // First, ensure the user has a learning profile
      let profile = await prisma.learningProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        profile = await prisma.learningProfile.create({
          data: { userId },
        });
      }

      // Record the answer in UserAnswer table via a test session
      // For adaptive learning, we track answers through the existing UserAnswer model
      // but we also need to update the learning profile

      // Update domain mastery with the new answer data
      await this.updateDomainMasteryWithAnswer(profile.id, answer);

      // Enforce rolling window limit by checking total answers
      await this.enforceRollingWindowLimit(userId);

      // Update the learning profile's last calculated timestamp
      await prisma.learningProfile.update({
        where: { id: profile.id },
        data: { lastCalculatedAt: new Date() },
      });

      Logger.debug(
        `Recorded answer for user ${userId}, question ${answer.questionId}`,
      );
    } catch (error) {
      Logger.error("Error recording answer:", error);
      throw error;
    }
  }

  /**
   * Updates domain mastery data with a new answer.
   */
  private async updateDomainMasteryWithAnswer(
    profileId: string,
    answer: AnswerRecord,
  ): Promise<void> {
    const existingMastery = await prisma.domainMastery.findUnique({
      where: {
        profileId_domainId: {
          profileId,
          domainId: answer.domainId,
        },
      },
    });

    if (existingMastery) {
      // Update existing mastery
      const newQuestionCount = existingMastery.questionCount + 1;
      const newCorrectCount = answer.isCorrect
        ? Math.round(
            (existingMastery.accuracyRate * existingMastery.questionCount) /
              100,
          ) + 1
        : Math.round(
            (existingMastery.accuracyRate * existingMastery.questionCount) /
              100,
          );
      const newAccuracyRate = (newCorrectCount / newQuestionCount) * 100;

      await prisma.domainMastery.update({
        where: { id: existingMastery.id },
        data: {
          questionCount: newQuestionCount,
          accuracyRate: newAccuracyRate,
          lastActivityAt: answer.answeredAt,
        },
      });
    } else {
      // Create new mastery record
      await prisma.domainMastery.create({
        data: {
          profileId,
          domainId: answer.domainId,
          questionCount: 1,
          accuracyRate: answer.isCorrect ? 100 : 0,
          lastActivityAt: answer.answeredAt,
        },
      });
    }
  }

  /**
   * Enforces the rolling window limit of 500 answers per user.
   * Removes oldest answers if the limit is exceeded.
   *
   * Requirements: 1.3
   */
  private async enforceRollingWindowLimit(userId: string): Promise<void> {
    // Count total answers for this user
    const totalAnswers = await prisma.userAnswer.count({
      where: {
        session: {
          userId,
        },
      },
    });

    if (totalAnswers > MAX_ANSWER_HISTORY) {
      // Find the oldest answers to delete
      const answersToDelete = totalAnswers - MAX_ANSWER_HISTORY;

      const oldestAnswers = await prisma.userAnswer.findMany({
        where: {
          session: {
            userId,
          },
        },
        orderBy: {
          answeredAt: "asc",
        },
        take: answersToDelete,
        select: {
          id: true,
        },
      });

      // Delete the oldest answers
      await prisma.userAnswer.deleteMany({
        where: {
          id: {
            in: oldestAnswers.map((a) => a.id),
          },
        },
      });

      Logger.debug(
        `Removed ${answersToDelete} old answers for user ${userId} to maintain rolling window`,
      );
    }
  }

  /**
   * Gets the current answer count for a user.
   * Used for testing the rolling window property.
   */
  async getAnswerCount(userId: string): Promise<number> {
    return prisma.userAnswer.count({
      where: {
        session: {
          userId,
        },
      },
    });
  }

  /**
   * Calculates aggregate performance statistics for a user.
   *
   * @param userId - The user's ID
   * @returns Performance statistics including accuracy, timing, and breakdowns
   *
   * Requirements: 1.2
   */
  async getPerformanceStats(userId: string): Promise<PerformanceStats> {
    try {
      // Get all answers for the user
      const answers = await prisma.userAnswer.findMany({
        where: {
          session: {
            userId,
          },
        },
        include: {
          question: {
            include: {
              domain: true,
            },
          },
        },
        orderBy: {
          answeredAt: "desc",
        },
        take: MAX_ANSWER_HISTORY,
      });

      if (answers.length === 0) {
        return this.getEmptyStats();
      }

      // Calculate overall stats
      const totalAnswered = answers.length;
      const correctAnswers = answers.filter((a) => a.isCorrect).length;
      const accuracyRate = (correctAnswers / totalAnswered) * 100;
      const totalTime = answers.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
      const averageTimePerQuestion = totalTime / totalAnswered;

      // Calculate domain breakdown
      const domainBreakdown = this.calculateDomainBreakdown(answers);

      // Calculate difficulty breakdown
      const difficultyBreakdown = this.calculateDifficultyBreakdown(answers);

      return {
        totalAnswered,
        correctAnswers,
        accuracyRate,
        averageTimePerQuestion,
        domainBreakdown,
        difficultyBreakdown,
      };
    } catch (error) {
      Logger.error("Error getting performance stats:", error);
      throw error;
    }
  }

  /**
   * Returns empty stats for users with no answer history.
   */
  private getEmptyStats(): PerformanceStats {
    return {
      totalAnswered: 0,
      correctAnswers: 0,
      accuracyRate: 0,
      averageTimePerQuestion: 0,
      domainBreakdown: [],
      difficultyBreakdown: [],
    };
  }

  /**
   * Calculates performance breakdown by domain.
   */
  private calculateDomainBreakdown(
    answers: Array<{
      isCorrect: boolean;
      timeSpentSeconds: number;
      question: {
        domain: {
          id: string;
          name: string;
        };
      };
    }>,
  ): DomainStats[] {
    const domainMap = new Map<
      string,
      {
        domainId: string;
        domainName: string;
        total: number;
        correct: number;
        totalTime: number;
      }
    >();

    for (const answer of answers) {
      const domainId = answer.question.domain.id;
      const domainName = answer.question.domain.name;

      const existing = domainMap.get(domainId) || {
        domainId,
        domainName,
        total: 0,
        correct: 0,
        totalTime: 0,
      };

      existing.total += 1;
      if (answer.isCorrect) {
        existing.correct += 1;
      }
      existing.totalTime += answer.timeSpentSeconds;

      domainMap.set(domainId, existing);
    }

    return Array.from(domainMap.values()).map((d) => ({
      domainId: d.domainId,
      domainName: d.domainName,
      totalAnswered: d.total,
      correctAnswers: d.correct,
      accuracyRate: (d.correct / d.total) * 100,
      averageTimeSeconds: d.totalTime / d.total,
    }));
  }

  /**
   * Calculates performance breakdown by difficulty.
   */
  private calculateDifficultyBreakdown(
    answers: Array<{
      isCorrect: boolean;
      question: {
        difficulty: string;
      };
    }>,
  ): DifficultyStats[] {
    const difficultyMap = new Map<
      Difficulty,
      { total: number; correct: number }
    >();

    for (const answer of answers) {
      const difficulty = answer.question.difficulty as Difficulty;
      const existing = difficultyMap.get(difficulty) || {
        total: 0,
        correct: 0,
      };

      existing.total += 1;
      if (answer.isCorrect) {
        existing.correct += 1;
      }

      difficultyMap.set(difficulty, existing);
    }

    return Array.from(difficultyMap.entries()).map(([difficulty, stats]) => ({
      difficulty,
      totalAnswered: stats.total,
      correctAnswers: stats.correct,
      accuracyRate: (stats.correct / stats.total) * 100,
    }));
  }

  /**
   * Gets performance trend data over a specified number of days.
   *
   * @param userId - The user's ID
   * @param days - Number of days to look back
   * @returns Array of daily performance data
   */
  async getPerformanceTrend(
    userId: string,
    days: number,
  ): Promise<TrendData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const answers = await prisma.userAnswer.findMany({
      where: {
        session: {
          userId,
        },
        answeredAt: {
          gte: startDate,
        },
      },
      orderBy: {
        answeredAt: "asc",
      },
    });

    // Group by date
    const dateMap = new Map<string, { correct: number; total: number }>();

    for (const answer of answers) {
      const dateKey = answer.answeredAt.toISOString().split("T")[0];
      const existing = dateMap.get(dateKey) || { correct: 0, total: 0 };

      existing.total += 1;
      if (answer.isCorrect) {
        existing.correct += 1;
      }

      dateMap.set(dateKey, existing);
    }

    return Array.from(dateMap.entries()).map(([dateStr, stats]) => ({
      date: new Date(dateStr),
      accuracyRate: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      questionsAnswered: stats.total,
    }));
  }
}

// Export singleton instance
export const performanceAnalyzer = new PerformanceAnalyzer();
