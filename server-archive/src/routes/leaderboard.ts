import express from "express";
import { leaderboardController } from "../controllers/leaderboardController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public endpoints
router.get("/global", leaderboardController.getGlobalLeaderboard);
router.get("/domain/:domainId", leaderboardController.getDomainLeaderboard);

// Protected endpoints
router.get("/rank", authenticateToken, leaderboardController.getUserRank);

export default router;
