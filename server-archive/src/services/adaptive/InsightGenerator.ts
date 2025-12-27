/**
 * Insight Generator Service
 *
 * Generates personalized insights about user learning patterns and performance.
 *
 * Requirements:
 * - 5.1: Produce daily insights summarizing performance trends and recommendations
 * - 5.2: Generate alerts when accuracy drops >10% over a week
 * - 5.4: Recognize and celebrate improvement milestones
 */

import { prisma } from "../database";
import Logger from "../../utils/logger";
import { performanceAnalyzer } from "./PerformanceAnalyzer";
import { masteryCalculator } from "./MasteryCalculator";

// =============================================================================
// Types and Interfaces
// =============================================================================

export type InsightType =
  | "improvement"
  | "alert"
  | "milestone"
  | "recommendation"
  | "pattern";
export type InsightPriority = "high" | "medium" | "low";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  priority: InsightPriority;
  actionUrl?: string;
  createdAt: Date;
  isRead: boolean;
}

// =============================================================================
// Constants
// =============================================================================

// Alert thresholds
export const ACCURACY_DROP_THRESHOLD = 10; // 10% accuracy drop threshold
export const ACCURACY_DROP_WINDOW_DAYS = 7; // Days to check for accuracy drop

// Milestone thresholds
export const IMPROVEMENT_MILESTONE_THRESHOLD = 15; // 15% improvement threshold
export const MASTERY_MILESTONE_THRESHOLD = 80; // 80% mastery threshold for celebration

// =============================================================================
// Insight Generator Class
// =============================================================================

export class InsightGenerator {
  /**
   * Generates daily insights for a user based on their performance patterns.
   *
   * @param userId - The user's ID
   * @returns Array of generated insights
   *
   * Requirements: 5.1
   */
  async generateDailyInsights(userId: string): Promise<Insight[]> {
    try {
      const insights: Insight[] = [];

      // Get or create learning profile
      let profile = await prisma.learningProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        profile = await prisma.learningProfile.create({
          data: { userId },
        });
      }

      // Generate performance trend insights
      const trendInsights = await this.generatePerformanceTrendInsights(userId);
      insights.push(...trendInsights);

      // Generate accuracy drop alerts
      const alertInsights = await this.generateAccuracyDropAlerts(userId);
      insights.push(...alertInsights);

      // Generate milestone recognition insights
      const milestoneInsights = await this.generateMilestoneInsights(userId);
      insights.push(...milestoneInsights);

      // Store insights in database
      for (const insight of insights) {
        await prisma.insight.create({
          data: {
            profileId: profile.id,
            type: insight.type,
            title: insight.title,
            message: insight.message,
            priority: insight.priority,
            actionUrl: insight.actionUrl,
          },
        });
      }

      Logger.debug(
        `Generated ${insights.length} daily insights for user ${userId}`,
      );
      return insights;
    } catch (error) {
      Logger.error("Error generating daily insights:", error);
      throw error;
    }
  }

  /**
   * Gets recent insights for a user.
   *
   * @param userId - The user's ID
   * @param limit - Maximum number of insights to return
   * @returns Array of recent insights
   */
  async getRecentInsights(
    userId: string,
    limit: number = 10,
  ): Promise<Insight[]> {
    try {
      const profile = await prisma.learningProfile.findUnique({
        where: { userId },
        include: {
          insights: {
            orderBy: { createdAt: "desc" },
            take: limit,
          },
        },
      });

      if (!profile) {
        return [];
      }

      return profile.insights.map((i) => ({
        id: i.id,
        type: i.type as InsightType,
        title: i.title,
        message: i.message,
        priority: i.priority as InsightPriority,
        actionUrl: i.actionUrl || undefined,
        createdAt: i.createdAt,
        isRead: i.isRead,
      }));
    } catch (error) {
      Logger.error("Error getting recent insights:", error);
      throw error;
    }
  }

  /**
   * Generates performance trend insights based on recent activity.
   *
   * @param userId - The user's ID
   * @returns Array of trend insights
   *
   * Requirements: 5.1
   */
  private async generatePerformanceTrendInsights(
    userId: string,
  ): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      // Get performance stats
      const stats = await performanceAnalyzer.getPerformanceStats(userId);

      if (stats.totalAnswered === 0) {
        return insights;
      }

      // Get trend data for the last 7 days
      const trendData = await performanceAnalyzer.getPerformanceTrend(
        userId,
        7,
      );

      if (trendData.length === 0) {
        return insights;
      }

      // Calculate overall trend
      const recentAccuracy =
        trendData.slice(-3).reduce((sum, d) => sum + d.accuracyRate, 0) /
        Math.max(1, trendData.slice(-3).length);
      const olderAccuracy =
        trendData.slice(0, -3).reduce((sum, d) => sum + d.accuracyRate, 0) /
        Math.max(1, trendData.slice(0, -3).length);

      if (recentAccuracy > olderAccuracy + 5) {
        insights.push({
          id: "", // Will be set when stored
          type: "improvement",
          title: "Performance Improving",
          message: `Great progress! Your accuracy has improved by ${(recentAccuracy - olderAccuracy).toFixed(1)}% over the past week.`,
          priority: "medium",
          createdAt: new Date(),
          isRead: false,
        });
      } else if (recentAccuracy < olderAccuracy - 5) {
        insights.push({
          id: "", // Will be set when stored
          type: "pattern",
          title: "Performance Dip Noticed",
          message: `Your accuracy has decreased by ${(olderAccuracy - recentAccuracy).toFixed(1)}% this week. Consider reviewing your weak areas.`,
          priority: "medium",
          actionUrl: "/practice?focus=gaps",
          createdAt: new Date(),
          isRead: false,
        });
      }

      // Generate domain-specific insights
      const domainInsights = await this.generateDomainTrendInsights(
        userId,
        stats,
      );
      insights.push(...domainInsights);
    } catch (error) {
      Logger.error("Error generating performance trend insights:", error);
    }

    return insights;
  }

  /**
   * Generates domain-specific trend insights.
   */
  private async generateDomainTrendInsights(
    _userId: string,
    _stats: unknown,
  ): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      const masteryLevels =
        await masteryCalculator.getAllMasteryLevels(_userId);

      for (const mastery of masteryLevels) {
        if (mastery.trend === "improving" && mastery.score > 75) {
          insights.push({
            id: "",
            type: "improvement",
            title: `${mastery.domainName} Mastery Rising`,
            message: `Excellent work! Your ${mastery.domainName} mastery is now at ${mastery.score.toFixed(0)}% and improving.`,
            priority: "low",
            createdAt: new Date(),
            isRead: false,
          });
        } else if (mastery.trend === "declining" && mastery.score < 60) {
          insights.push({
            id: "",
            type: "recommendation",
            title: `Focus Needed: ${mastery.domainName}`,
            message: `Your ${mastery.domainName} mastery has declined to ${mastery.score.toFixed(0)}%. Consider dedicating more practice time to this area.`,
            priority: "high",
            actionUrl: `/practice?domain=${mastery.domainId}`,
            createdAt: new Date(),
            isRead: false,
          });
        }
      }
    } catch (error) {
      Logger.error("Error generating domain trend insights:", error);
    }

    return insights;
  }

  /**
   * Generates accuracy drop alerts when performance drops significantly.
   *
   * @param userId - The user's ID
   * @returns Array of alert insights
   *
   * Requirements: 5.2
   */
  private async generateAccuracyDropAlerts(userId: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      // Get trend data for the accuracy drop window
      const trendData = await performanceAnalyzer.getPerformanceTrend(
        userId,
        ACCURACY_DROP_WINDOW_DAYS,
      );

      if (trendData.length < 2) {
        return insights;
      }

      // Calculate accuracy drop
      const recentAccuracy =
        trendData.slice(-2).reduce((sum, d) => sum + d.accuracyRate, 0) / 2;
      const olderAccuracy =
        trendData.slice(0, 2).reduce((sum, d) => sum + d.accuracyRate, 0) / 2;
      const accuracyDrop = olderAccuracy - recentAccuracy;

      if (accuracyDrop > ACCURACY_DROP_THRESHOLD) {
        insights.push({
          id: "",
          type: "alert",
          title: "Accuracy Drop Alert",
          message: `Your accuracy has dropped by ${accuracyDrop.toFixed(1)}% over the past week. Consider taking a break or reviewing fundamental concepts.`,
          priority: "high",
          actionUrl: "/practice?mode=review",
          createdAt: new Date(),
          isRead: false,
        });
      }

      // Check for domain-specific accuracy drops
      const domainAlerts = await this.generateDomainAccuracyAlerts(userId);
      insights.push(...domainAlerts);
    } catch (error) {
      Logger.error("Error generating accuracy drop alerts:", error);
    }

    return insights;
  }

  /**
   * Generates domain-specific accuracy drop alerts.
   */
  private async generateDomainAccuracyAlerts(
    userId: string,
  ): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      const stats = await performanceAnalyzer.getPerformanceStats(userId);

      for (const domainStat of stats.domainBreakdown) {
        if (domainStat.accuracyRate < 50 && domainStat.totalAnswered >= 10) {
          insights.push({
            id: "",
            type: "alert",
            title: `${domainStat.domainName} Needs Attention`,
            message: `Your ${domainStat.domainName} accuracy is only ${domainStat.accuracyRate.toFixed(0)}%. This area needs focused practice.`,
            priority: "high",
            actionUrl: `/practice?domain=${domainStat.domainId}`,
            createdAt: new Date(),
            isRead: false,
          });
        }
      }
    } catch (error) {
      Logger.error("Error generating domain accuracy alerts:", error);
    }

    return insights;
  }

  /**
   * Generates milestone recognition insights for achievements.
   *
   * @param userId - The user's ID
   * @returns Array of milestone insights
   *
   * Requirements: 5.4
   */
  private async generateMilestoneInsights(userId: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      const masteryLevels = await masteryCalculator.getAllMasteryLevels(userId);
      const stats = await performanceAnalyzer.getPerformanceStats(userId);

      // Check for mastery milestones
      for (const mastery of masteryLevels) {
        if (
          mastery.score >= MASTERY_MILESTONE_THRESHOLD &&
          mastery.trend === "improving"
        ) {
          insights.push({
            id: "",
            type: "milestone",
            title: `🎉 ${mastery.domainName} Mastery Achieved!`,
            message: `Congratulations! You've achieved ${mastery.score.toFixed(0)}% mastery in ${mastery.domainName}. You're well-prepared in this domain!`,
            priority: "medium",
            createdAt: new Date(),
            isRead: false,
          });
        }
      }

      // Check for overall improvement milestones
      const trendData = await performanceAnalyzer.getPerformanceTrend(
        userId,
        14,
      );
      if (trendData.length >= 7) {
        const recentWeekAccuracy =
          trendData.slice(-7).reduce((sum, d) => sum + d.accuracyRate, 0) / 7;
        const previousWeekAccuracy =
          trendData.slice(-14, -7).reduce((sum, d) => sum + d.accuracyRate, 0) /
          7;
        const improvement = recentWeekAccuracy - previousWeekAccuracy;

        if (improvement >= IMPROVEMENT_MILESTONE_THRESHOLD) {
          insights.push({
            id: "",
            type: "milestone",
            title: "🚀 Significant Improvement!",
            message: `Amazing progress! You've improved your overall accuracy by ${improvement.toFixed(1)}% over the past two weeks. Keep up the excellent work!`,
            priority: "medium",
            createdAt: new Date(),
            isRead: false,
          });
        }
      }

      // Check for question count milestones
      if (stats.totalAnswered > 0) {
        const milestones = [100, 250, 500, 1000, 2000];
        for (const milestone of milestones) {
          if (
            stats.totalAnswered >= milestone &&
            stats.totalAnswered < milestone + 50
          ) {
            insights.push({
              id: "",
              type: "milestone",
              title: `📊 ${milestone} Questions Milestone!`,
              message: `You've answered ${stats.totalAnswered} questions! Your dedication to practice is paying off.`,
              priority: "low",
              createdAt: new Date(),
              isRead: false,
            });
            break; // Only show one milestone at a time
          }
        }
      }
    } catch (error) {
      Logger.error("Error generating milestone insights:", error);
    }

    return insights;
  }

  /**
   * Marks an insight as read.
   *
   * @param insightId - The insight ID
   */
  async markInsightAsRead(insightId: string): Promise<void> {
    try {
      await prisma.insight.update({
        where: { id: insightId },
        data: { isRead: true },
      });
    } catch (error) {
      Logger.error("Error marking insight as read:", error);
      throw error;
    }
  }

  /**
   * Deletes old insights to prevent database bloat.
   * Keeps only the last 100 insights per user.
   *
   * @param userId - The user's ID
   */
  async cleanupOldInsights(userId: string): Promise<void> {
    try {
      const profile = await prisma.learningProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return;
      }

      // Get insights ordered by creation date (newest first)
      const insights = await prisma.insight.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      // If more than 100 insights, delete the oldest ones
      if (insights.length > 100) {
        const insightsToDelete = insights.slice(100);
        await prisma.insight.deleteMany({
          where: {
            id: {
              in: insightsToDelete.map((i) => i.id),
            },
          },
        });

        Logger.debug(
          `Cleaned up ${insightsToDelete.length} old insights for user ${userId}`,
        );
      }
    } catch (error) {
      Logger.error("Error cleaning up old insights:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const insightGenerator = new InsightGenerator();
