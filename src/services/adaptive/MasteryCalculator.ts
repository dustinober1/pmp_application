/**
 * Mastery Calculator Service
 *
 * Calculates and manages domain mastery levels for the Adaptive Learning Engine.
 *
 * Requirements:
 * - 2.1: Calculate Mastery_Level (0-100) for each PMP domain
 * - 2.2: Calculate based on: accuracy (60%), consistency (20%), difficulty (20%)
 * - 2.3: Apply decay for inactive domains (5% per week, floor at 50% of peak)
 * - 2.5: Show trend direction (improving, stable, declining)
 */

import { prisma } from "../database";
import Logger from "../../utils/logger";

// =============================================================================
// Types and Interfaces
// =============================================================================

export type TrendDirection = "improving" | "stable" | "declining";

export interface MasteryLevel {
  domainId: string;
  domainName: string;
  score: number;
  trend: TrendDirection;
  lastActivityAt: Date;
  questionCount: number;
  accuracyRate: number;
  consistencyScore: number;
  difficultyScore: number;
  peakScore: number;
}

export interface MasteryInput {
  accuracyRate: number;
  consistencyScore: number;
  difficultyScore: number;
}

// =============================================================================
// Constants
// =============================================================================

// Mastery calculation weights (Requirements 2.2)
export const ACCURACY_WEIGHT = 0.6;
export const CONSISTENCY_WEIGHT = 0.2;
export const DIFFICULTY_WEIGHT = 0.2;

// Decay settings (Requirements 2.3)
export const DECAY_RATE_PER_WEEK = 0.05; // 5% decay per week
export const DECAY_FLOOR_PERCENTAGE = 0.5; // Floor at 50% of peak mastery
export const INACTIVITY_THRESHOLD_DAYS = 7; // Days before decay starts

// Trend calculation settings
export const TREND_THRESHOLD = 5; // Percentage change threshold for trend detection
export const TREND_WINDOW_DAYS = 14; // Days to consider for trend calculation

// =============================================================================
// Pure Calculation Functions (for testing)
// =============================================================================

/**
 * Calculates mastery score using the weighted formula.
 * Formula: (accuracy * 0.6) + (consistency * 0.2) + (difficulty * 0.2)
 *
 * @param input - The input values for calculation
 * @returns Mastery score bounded between 0 and 100
 *
 * Requirements: 2.1, 2.2
 */
export function calculateMasteryScore(input: MasteryInput): number {
  const { accuracyRate, consistencyScore, difficultyScore } = input;

  // Calculate weighted sum
  const rawScore =
    accuracyRate * ACCURACY_WEIGHT +
    consistencyScore * CONSISTENCY_WEIGHT +
    difficultyScore * DIFFICULTY_WEIGHT;

  // Bound the result between 0 and 100
  return Math.max(0, Math.min(100, rawScore));
}

/**
 * Applies decay to a mastery score based on inactivity period.
 * Decay rate: 5% per week of inactivity
 * Floor: 50% of peak mastery
 *
 * @param currentScore - Current mastery score
 * @param peakScore - Historical peak mastery score
 * @param inactivityDays - Number of days since last activity
 * @returns Decayed mastery score
 *
 * Requirements: 2.3
 */
export function applyMasteryDecay(
  currentScore: number,
  peakScore: number,
  inactivityDays: number,
): number {
  // No decay if within threshold
  if (inactivityDays <= INACTIVITY_THRESHOLD_DAYS) {
    return currentScore;
  }

  // Calculate weeks of inactivity (beyond threshold)
  const inactiveWeeks = (inactivityDays - INACTIVITY_THRESHOLD_DAYS) / 7;

  // Calculate total decay percentage
  const totalDecay = inactiveWeeks * DECAY_RATE_PER_WEEK;

  // Apply decay
  const decayedScore = currentScore * (1 - totalDecay);

  // Calculate floor (50% of peak)
  const floor = peakScore * DECAY_FLOOR_PERCENTAGE;

  // Return decayed score, but not below floor
  return Math.max(floor, Math.max(0, decayedScore));
}

/**
 * Calculates trend direction based on score history.
 * Compares recent average to older average.
 *
 * @param recentAverage - Average score from recent period
 * @param olderAverage - Average score from older period
 * @returns Trend direction
 *
 * Requirements: 2.5
 */
export function calculateTrendDirection(
  recentAverage: number,
  olderAverage: number,
): TrendDirection {
  const difference = recentAverage - olderAverage;

  if (difference > TREND_THRESHOLD) {
    return "improving";
  } else if (difference < -TREND_THRESHOLD) {
    return "declining";
  }
  return "stable";
}

// =============================================================================
// Mastery Calculator Class
// =============================================================================

export class MasteryCalculator {
  /**
   * Calculates the mastery level for a specific domain.
   *
   * @param userId - The user's ID
   * @param domainId - The domain ID
   * @returns The calculated mastery level
   *
   * Requirements: 2.1, 2.2
   */
  async calculateDomainMastery(
    userId: string,
    domainId: string,
  ): Promise<MasteryLevel> {
    try {
      // Get or create learning profile
      let profile = await prisma.learningProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        profile = await prisma.learningProfile.create({
          data: { userId },
        });
      }

      // Get domain info
      const domain = await prisma.domain.findUnique({
        where: { id: domainId },
      });

      if (!domain) {
        throw new Error(`Domain not found: ${domainId}`);
      }

      // Get or create domain mastery record
      let mastery = await prisma.domainMastery.findUnique({
        where: {
          profileId_domainId: {
            profileId: profile.id,
            domainId,
          },
        },
      });

      if (!mastery) {
        // Create default mastery record
        mastery = await prisma.domainMastery.create({
          data: {
            profileId: profile.id,
            domainId,
            score: 50, // Default neutral mastery
            accuracyRate: 0,
            consistencyScore: 0,
            difficultyScore: 0,
            peakScore: 50,
          },
        });
      }

      // Apply inactivity decay before recalculating, if needed
      const now = new Date();
      const inactivityDays = Math.floor(
        (now.getTime() - mastery.lastActivityAt.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const decayedScore = applyMasteryDecay(
        mastery.score,
        mastery.peakScore,
        inactivityDays,
      );

      if (decayedScore !== mastery.score) {
        mastery = await prisma.domainMastery.update({
          where: { id: mastery.id },
          data: { score: decayedScore },
        });
      }

      // Calculate new mastery score
      const newScore = calculateMasteryScore({
        accuracyRate: mastery.accuracyRate,
        consistencyScore: mastery.consistencyScore,
        difficultyScore: mastery.difficultyScore,
      });

      // Update peak score if new score is higher
      const newPeakScore = Math.max(mastery.peakScore, newScore);

      // Calculate trend
      const trend = await this.calculateTrend(profile.id, domainId);

      // Update mastery record
      await prisma.domainMastery.update({
        where: { id: mastery.id },
        data: {
          score: newScore,
          trend,
          peakScore: newPeakScore,
        },
      });

      return {
        domainId,
        domainName: domain.name,
        score: newScore,
        trend,
        lastActivityAt: mastery.lastActivityAt,
        questionCount: mastery.questionCount,
        accuracyRate: mastery.accuracyRate,
        consistencyScore: mastery.consistencyScore,
        difficultyScore: mastery.difficultyScore,
        peakScore: newPeakScore,
      };
    } catch (error) {
      Logger.error("Error calculating domain mastery:", error);
      throw error;
    }
  }

  /**
   * Gets all mastery levels for a user.
   *
   * @param userId - The user's ID
   * @returns Array of mastery levels for all domains
   */
  async getAllMasteryLevels(userId: string): Promise<MasteryLevel[]> {
    try {
      await this.applyDecay(userId);

      const profile = await prisma.learningProfile.findUnique({
        where: { userId },
        include: {
          domainMasteries: {
            include: {
              domain: true,
            },
          },
        },
      });

      if (!profile) {
        return [];
      }

      return profile.domainMasteries.map((m) => ({
        domainId: m.domainId,
        domainName: m.domain.name,
        score: m.score,
        trend: m.trend as TrendDirection,
        lastActivityAt: m.lastActivityAt,
        questionCount: m.questionCount,
        accuracyRate: m.accuracyRate,
        consistencyScore: m.consistencyScore,
        difficultyScore: m.difficultyScore,
        peakScore: m.peakScore,
      }));
    } catch (error) {
      Logger.error("Error getting all mastery levels:", error);
      throw error;
    }
  }

  /**
   * Applies decay to all inactive domains for a user.
   * Decay rate: 5% per week of inactivity
   * Floor: 50% of peak mastery
   *
   * @param userId - The user's ID
   *
   * Requirements: 2.3
   */
  async applyDecay(userId: string): Promise<void> {
    try {
      const profile = await prisma.learningProfile.findUnique({
        where: { userId },
        include: {
          domainMasteries: true,
        },
      });

      if (!profile) {
        return;
      }

      const now = new Date();

      for (const mastery of profile.domainMasteries) {
        const inactivityDays = Math.floor(
          (now.getTime() - mastery.lastActivityAt.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (inactivityDays > INACTIVITY_THRESHOLD_DAYS) {
          const decayedScore = applyMasteryDecay(
            mastery.score,
            mastery.peakScore,
            inactivityDays,
          );

          await prisma.domainMastery.update({
            where: { id: mastery.id },
            data: { score: decayedScore },
          });

          Logger.debug(
            `Applied decay to domain ${mastery.domainId} for user ${userId}: ${mastery.score} -> ${decayedScore}`,
          );
        }
      }
    } catch (error) {
      Logger.error("Error applying decay:", error);
      throw error;
    }
  }

  /**
   * Calculates the trend direction for a domain.
   * Compares recent performance to older performance.
   *
   * @param profileId - The learning profile ID
   * @param domainId - The domain ID
   * @returns Trend direction
   *
   * Requirements: 2.5
   */
  private async calculateTrend(
    profileId: string,
    domainId: string,
  ): Promise<TrendDirection> {
    try {
      const now = new Date();
      const recentCutoff = new Date(
        now.getTime() - (TREND_WINDOW_DAYS * 24 * 60 * 60 * 1000) / 2,
      );
      const olderCutoff = new Date(
        now.getTime() - TREND_WINDOW_DAYS * 24 * 60 * 60 * 1000,
      );

      // Get recent answers (last 7 days)
      const recentAnswers = await prisma.userAnswer.findMany({
        where: {
          question: {
            domainId,
          },
          session: {
            user: {
              learningProfile: {
                id: profileId,
              },
            },
          },
          answeredAt: {
            gte: recentCutoff,
          },
        },
      });

      // Get older answers (7-14 days ago)
      const olderAnswers = await prisma.userAnswer.findMany({
        where: {
          question: {
            domainId,
          },
          session: {
            user: {
              learningProfile: {
                id: profileId,
              },
            },
          },
          answeredAt: {
            gte: olderCutoff,
            lt: recentCutoff,
          },
        },
      });

      // Calculate averages
      const recentAccuracy =
        recentAnswers.length > 0
          ? (recentAnswers.filter((a) => a.isCorrect).length /
              recentAnswers.length) *
            100
          : 0;

      const olderAccuracy =
        olderAnswers.length > 0
          ? (olderAnswers.filter((a) => a.isCorrect).length /
              olderAnswers.length) *
            100
          : 0;

      // If no older data, consider stable
      if (olderAnswers.length === 0) {
        return "stable";
      }

      return calculateTrendDirection(recentAccuracy, olderAccuracy);
    } catch (error) {
      Logger.error("Error calculating trend:", error);
      return "stable";
    }
  }

  /**
   * Updates mastery metrics based on a new answer.
   * Called by PerformanceAnalyzer when recording answers.
   *
   * @param profileId - The learning profile ID
   * @param domainId - The domain ID
   * @param isCorrect - Whether the answer was correct
   * @param difficulty - The question difficulty
   */
  async updateMasteryMetrics(
    profileId: string,
    domainId: string,
    isCorrect: boolean,
    difficulty: "EASY" | "MEDIUM" | "HARD",
  ): Promise<void> {
    try {
      let mastery = await prisma.domainMastery.findUnique({
        where: {
          profileId_domainId: {
            profileId,
            domainId,
          },
        },
      });

      if (!mastery) {
        mastery = await prisma.domainMastery.create({
          data: {
            profileId,
            domainId,
            score: 50,
            peakScore: 50,
          },
        });
      }

      // Update accuracy rate
      const newQuestionCount = mastery.questionCount + 1;
      const currentCorrect = Math.round(
        (mastery.accuracyRate * mastery.questionCount) / 100,
      );
      const newCorrect = isCorrect ? currentCorrect + 1 : currentCorrect;
      const newAccuracyRate = (newCorrect / newQuestionCount) * 100;

      // Update consistency score (based on variance in recent performance)
      // For simplicity, we use a rolling average approach
      const consistencyWeight = 0.9;
      const newConsistencyScore = isCorrect
        ? mastery.consistencyScore * consistencyWeight +
          100 * (1 - consistencyWeight)
        : mastery.consistencyScore * consistencyWeight;

      // Update difficulty score (higher for harder questions answered correctly)
      const difficultyValue =
        difficulty === "HARD" ? 100 : difficulty === "MEDIUM" ? 66 : 33;
      const difficultyWeight = 0.9;
      const newDifficultyScore = isCorrect
        ? mastery.difficultyScore * difficultyWeight +
          difficultyValue * (1 - difficultyWeight)
        : mastery.difficultyScore * difficultyWeight;

      // Calculate new mastery score
      const newScore = calculateMasteryScore({
        accuracyRate: newAccuracyRate,
        consistencyScore: newConsistencyScore,
        difficultyScore: newDifficultyScore,
      });

      // Update peak score if needed
      const newPeakScore = Math.max(mastery.peakScore, newScore);

      await prisma.domainMastery.update({
        where: { id: mastery.id },
        data: {
          questionCount: newQuestionCount,
          accuracyRate: newAccuracyRate,
          consistencyScore: newConsistencyScore,
          difficultyScore: newDifficultyScore,
          score: newScore,
          peakScore: newPeakScore,
          lastActivityAt: new Date(),
        },
      });
    } catch (error) {
      Logger.error("Error updating mastery metrics:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const masteryCalculator = new MasteryCalculator();
