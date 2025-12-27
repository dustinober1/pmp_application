import { Request, Response } from "express";
import { leaderboardService } from "../services/leaderboardService";
import Logger from "../utils/logger";

export const leaderboardController = {
  async getGlobalLeaderboard(req: Request, res: Response) {
    try {
      const period =
        (req.query.period as "weekly" | "monthly" | "all_time") || "all_time";
      const limit = parseInt(req.query.limit as string) || 100;

      if (!["weekly", "monthly", "all_time"].includes(period)) {
        return res.status(400).json({ error: "Invalid period parameter" });
      }

      if (limit < 1 || limit > 100) {
        return res
          .status(400)
          .json({ error: "Limit must be between 1 and 100" });
      }

      const leaderboard = await leaderboardService.getGlobalLeaderboard(
        period,
        limit,
      );
      return res.json(leaderboard);
    } catch (error) {
      Logger.error("Error fetching global leaderboard", error);
      return res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  },

  async getDomainLeaderboard(req: Request, res: Response) {
    try {
      const { domainId } = req.params;
      const period =
        (req.query.period as "weekly" | "monthly" | "all_time") || "all_time";
      const limit = parseInt(req.query.limit as string) || 50;

      if (!domainId) {
        return res.status(400).json({ error: "Domain ID is required" });
      }

      if (!["weekly", "monthly", "all_time"].includes(period)) {
        return res.status(400).json({ error: "Invalid period parameter" });
      }

      if (limit < 1 || limit > 100) {
        return res
          .status(400)
          .json({ error: "Limit must be between 1 and 100" });
      }

      const leaderboard = await leaderboardService.getDomainLeaderboard(
        domainId,
        period,
        limit,
      );
      return res.json(leaderboard);
    } catch (error: any) {
      Logger.error("Error fetching domain leaderboard", error);
      if (error.message === "Domain not found") {
        return res.status(404).json({ error: "Domain not found" });
      }
      return res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  },

  async getUserRank(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const rank = await leaderboardService.getUserRank(userId);
      return res.json(rank);
    } catch (error) {
      Logger.error("Error fetching user rank", error);
      return res.status(500).json({ error: "Failed to fetch user rank" });
    }
  },
};
