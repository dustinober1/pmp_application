/**
 * Knowledge Gap Identifier Service
 *
 * Identifies and prioritizes knowledge gaps for the Adaptive Learning Engine.
 *
 * Requirements:
 * - 3.1: Identify Knowledge_Gap when mastery < 70% threshold
 * - 3.2: Rank gaps by severity (difference from threshold) and exam weight
 * - 3.4: Distinguish between "never_learned" and "forgotten" gaps
 */

import { prisma } from "../database";
import Logger from "../../utils/logger";
import type { TrendDirection } from "./MasteryCalculator";

// =============================================================================
// Types and Interfaces
// =============================================================================

export type GapSeverity = "critical" | "moderate" | "minor";
export type GapType = "never_learned" | "forgotten";

export interface KnowledgeGap {
  domainId: string;
  domainName: string;
  currentMastery: number;
  targetThreshold: number;
  severity: GapSeverity;
  gapType: GapType;
  examWeight: number;
  recommendation: string;
  priorityScore: number;
}

export interface DomainMasteryData {
  domainId: string;
  domainName: string;
  score: number;
  trend: TrendDirection;
  questionCount: number;
  examWeight: number;
}

// =============================================================================
// Constants
// =============================================================================

// Target threshold for mastery (Requirements 3.1)
export const TARGET_THRESHOLD = 70;

// Severity thresholds
export const CRITICAL_THRESHOLD = 40; // Below 40% is critical
export const MODERATE_THRESHOLD = 55; // Below 55% is moderate, otherwise minor

// Question count threshold for "never_learned" classification
export const MIN_QUESTIONS_FOR_LEARNED = 10;

// =============================================================================
// Pure Calculation Functions (for testing)
// =============================================================================

/**
 * Determines if a domain has a knowledge gap based on mastery score.
 * A gap exists when mastery is below the target threshold (70%).
 *
 * @param masteryScore - Current mastery score (0-100)
 * @returns true if there is a knowledge gap
 *
 * Requirements: 3.1
 */
export function isKnowledgeGap(masteryScore: number): boolean {
  return masteryScore < TARGET_THRESHOLD;
}

/**
 * Calculates the priority score for a knowledge gap.
 * Formula: (threshold - mastery) * examWeight
 *
 * @param masteryScore - Current mastery score (0-100)
 * @param examWeight - Domain's weight in the exam (0-100)
 * @returns Priority score (higher = more urgent)
 *
 * Requirements: 3.2
 */
export function calculatePriorityScore(
  masteryScore: number,
  examWeight: number,
): number {
  const gap = TARGET_THRESHOLD - masteryScore;
  // Ensure gap is non-negative (only calculate for actual gaps)
  const effectiveGap = Math.max(0, gap);
  return effectiveGap * examWeight;
}

/**
 * Determines the severity of a knowledge gap.
 * - Critical: mastery < 40%
 * - Moderate: mastery < 55%
 * - Minor: mastery < 70%
 *
 * @param masteryScore - Current mastery score (0-100)
 * @returns Gap severity level
 *
 * Requirements: 3.2
 */
export function calculateSeverity(masteryScore: number): GapSeverity {
  if (masteryScore < CRITICAL_THRESHOLD) {
    return "critical";
  }
  if (masteryScore < MODERATE_THRESHOLD) {
    return "moderate";
  }
  return "minor";
}

/**
 * Classifies the type of knowledge gap.
 * - "never_learned": Low exposure (< 10 questions answered)
 * - "forgotten": Declining mastery with sufficient exposure
 *
 * @param questionCount - Number of questions answered in this domain
 * @param trend - Current trend direction
 * @returns Gap type classification
 *
 * Requirements: 3.4
 */
export function classifyGapType(
  questionCount: number,
  _trend: TrendDirection,
): GapType {
  // If user has answered fewer than threshold questions, they haven't learned it yet
  if (questionCount < MIN_QUESTIONS_FOR_LEARNED) {
    return "never_learned";
  }
  // If they have exposure but mastery is low, it's forgotten
  return "forgotten";
}

/**
 * Generates a recommendation message based on gap characteristics.
 *
 * @param gapType - Type of knowledge gap
 * @param severity - Severity of the gap
 * @param domainName - Name of the domain
 * @returns Actionable recommendation string
 *
 * Requirements: 3.5
 */
export function generateRecommendation(
  gapType: GapType,
  severity: GapSeverity,
  domainName: string,
): string {
  if (gapType === "never_learned") {
    if (severity === "critical") {
      return `Start with foundational ${domainName} concepts. Focus on understanding core principles before practicing questions.`;
    }
    return `Begin exploring ${domainName} topics. Review flashcards and attempt practice questions to build familiarity.`;
  }

  // Forgotten gap
  if (severity === "critical") {
    return `Urgent review needed for ${domainName}. Your mastery has declined significantly. Schedule focused practice sessions.`;
  }
  if (severity === "moderate") {
    return `Refresh your ${domainName} knowledge. Regular practice will help restore your previous mastery level.`;
  }
  return `Maintain your ${domainName} skills with periodic review to prevent further decline.`;
}

// =============================================================================
// Knowledge Gap Identifier Class
// =============================================================================

export class KnowledgeGapIdentifier {
  /**
   * Identifies all knowledge gaps for a user.
   * A gap is identified when domain mastery falls below 70%.
   *
   * @param userId - The user's ID
   * @returns Array of knowledge gaps
   *
   * Requirements: 3.1
   */
  async identifyGaps(userId: string): Promise<KnowledgeGap[]> {
    try {
      // Get user's learning profile with domain masteries
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
        // No profile means no data - return empty array
        return [];
      }

      const gaps: KnowledgeGap[] = [];

      for (const mastery of profile.domainMasteries) {
        // Check if this domain has a knowledge gap
        if (isKnowledgeGap(mastery.score)) {
          const examWeight = mastery.domain.weightPercentage;
          const severity = calculateSeverity(mastery.score);
          const gapType = classifyGapType(
            mastery.questionCount,
            mastery.trend as TrendDirection,
          );
          const priorityScore = calculatePriorityScore(
            mastery.score,
            examWeight,
          );
          const recommendation = generateRecommendation(
            gapType,
            severity,
            mastery.domain.name,
          );

          gaps.push({
            domainId: mastery.domainId,
            domainName: mastery.domain.name,
            currentMastery: mastery.score,
            targetThreshold: TARGET_THRESHOLD,
            severity,
            gapType,
            examWeight,
            recommendation,
            priorityScore,
          });
        }
      }

      return gaps;
    } catch (error) {
      Logger.error("Error identifying knowledge gaps:", error);
      throw error;
    }
  }

  /**
   * Gets prioritized knowledge gaps sorted by severity and exam weight.
   * Priority score = (threshold - mastery) * examWeight
   *
   * @param userId - The user's ID
   * @param limit - Maximum number of gaps to return
   * @returns Array of prioritized knowledge gaps
   *
   * Requirements: 3.2
   */
  async getPrioritizedGaps(
    userId: string,
    limit?: number,
  ): Promise<KnowledgeGap[]> {
    try {
      const gaps = await this.identifyGaps(userId);

      // Sort by priority score descending
      const sortedGaps = sortGapsByPriority(gaps);

      // Apply limit if specified
      if (limit !== undefined && limit > 0) {
        return sortedGaps.slice(0, limit);
      }

      return sortedGaps;
    } catch (error) {
      Logger.error("Error getting prioritized gaps:", error);
      throw error;
    }
  }
}

/**
 * Sorts knowledge gaps by priority score in descending order.
 * Pure function for testing.
 *
 * @param gaps - Array of knowledge gaps
 * @returns Sorted array (highest priority first)
 *
 * Requirements: 3.2
 */
export function sortGapsByPriority(gaps: KnowledgeGap[]): KnowledgeGap[] {
  return [...gaps].sort((a, b) => b.priorityScore - a.priorityScore);
}

// Export singleton instance
export const knowledgeGapIdentifier = new KnowledgeGapIdentifier();
