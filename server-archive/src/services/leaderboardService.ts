import { prisma } from "./database";
import Logger from "../utils/logger";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  score: number;
  testsTaken: number;
  averageAccuracy: number;
  streak: number;
}

export interface DomainLeaderboardEntry extends LeaderboardEntry {
  domainId: string;
  domainName: string;
}

type TimePeriod = "weekly" | "monthly" | "all_time";

function getDateRangeForPeriod(period: TimePeriod): Date {
  const now = new Date();
  switch (period) {
    case "weekly":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "all_time":
      return new Date(0);
  }
}

export const leaderboardService = {
  async getGlobalLeaderboard(
    period: TimePeriod = "all_time",
    limit: number = 100,
  ): Promise<LeaderboardEntry[]> {
    try {
      const startDate = getDateRangeForPeriod(period);

      const users = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      const leaderboard: LeaderboardEntry[] = [];

      for (const user of users) {
        const sessions = await prisma.userTestSession.findMany({
          where: {
            userId: user.id,
            status: "COMPLETED",
            completedAt: {
              gte: startDate,
            },
          },
          include: {
            answers: true,
          },
        });

        const streak = await prisma.studyStreak.findUnique({
          where: { userId: user.id },
        });

        const totalScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
        const totalCorrect = sessions.reduce(
          (sum, s) => sum + s.answers.filter((a) => a.isCorrect).length,
          0,
        );
        const totalQuestions = sessions.reduce(
          (sum, s) => sum + s.answers.length,
          0,
        );
        const averageAccuracy =
          totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

        leaderboard.push({
          rank: 0, // Will be calculated after sorting
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          score: totalScore,
          testsTaken: sessions.length,
          averageAccuracy: Math.round(averageAccuracy),
          streak: streak?.currentStreak || 0,
        });
      }

      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return leaderboard.slice(0, limit);
    } catch (error) {
      Logger.error("Error fetching global leaderboard", error);
      throw new Error("Failed to fetch leaderboard");
    }
  },

  async getDomainLeaderboard(
    domainId: string,
    period: TimePeriod = "all_time",
    limit: number = 50,
  ): Promise<DomainLeaderboardEntry[]> {
    try {
      const _startDate = getDateRangeForPeriod(period);
      const domain = await prisma.domain.findUnique({
        where: { id: domainId },
      });

      if (!domain) {
        throw new Error("Domain not found");
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });

      const leaderboard: DomainLeaderboardEntry[] = [];

      for (const user of users) {
        const progress = await prisma.userProgress.findUnique({
          where: {
            userId_domainId: {
              userId: user.id,
              domainId,
            },
          },
        });

        if (!progress) {
          continue;
        }

        const streak = await prisma.studyStreak.findUnique({
          where: { userId: user.id },
        });

        const accuracyRate =
          progress.questionsAnswered > 0
            ? progress.correctAnswers / progress.questionsAnswered
            : 0;

        leaderboard.push({
          rank: 0,
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          score: Math.round(accuracyRate * 10), // Scale for display
          testsTaken: progress.questionsAnswered,
          averageAccuracy: Math.round(accuracyRate * 100),
          streak: streak?.currentStreak || 0,
          domainId,
          domainName: domain.name,
        });
      }

      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return leaderboard.slice(0, limit);
    } catch (error) {
      Logger.error("Error fetching domain leaderboard", error);
      throw new Error("Failed to fetch domain leaderboard");
    }
  },

  async getUserRank(userId: string): Promise<{
    global: { rank: number; totalUsers: number } | null;
    domains: Array<{ domainId: string; domainName: string; rank: number }>;
  }> {
    try {
      const global = await this.getGlobalLeaderboard("all_time", 1000);
      const userGlobalRank = global.find((u) => u.userId === userId);

      const domains = await prisma.domain.findMany({
        select: { id: true, name: true },
      });

      const domainRanks = await Promise.all(
        domains.map(async (domain) => {
          const domainLeaderboard = await this.getDomainLeaderboard(
            domain.id,
            "all_time",
            1000,
          );
          const userRank = domainLeaderboard.find((u) => u.userId === userId);
          return {
            domainId: domain.id,
            domainName: domain.name,
            rank: userRank?.rank || 0,
          };
        }),
      );

      return {
        global: userGlobalRank
          ? { rank: userGlobalRank.rank, totalUsers: global.length }
          : null,
        domains: domainRanks,
      };
    } catch (error) {
      Logger.error("Error fetching user rank", error);
      throw new Error("Failed to fetch user rank");
    }
  },
};
