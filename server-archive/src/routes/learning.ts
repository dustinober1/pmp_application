import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { getLearningProfile } from "../controllers/adaptiveController";
import {
  getDomainMastery,
  getLearningRecommendations,
} from "../controllers/learningController";

const router = Router();

router.use(authenticateToken);

router.get("/profile", getLearningProfile);
router.get("/mastery/:domainId", getDomainMastery);
router.get("/recommendations", getLearningRecommendations);

export default router;
