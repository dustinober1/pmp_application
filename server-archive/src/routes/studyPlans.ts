import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { validateResult } from "../middleware/validation";
import {
  createStudyPlan,
  getActivePlan,
  completeStudyTask,
  getStudyPlanTasks,
  updateStudyPlan,
} from "../controllers/studyPlanController";
import {
  createStudyPlanSchema,
  completeStudyTaskSchema,
  getStudyPlanTasksSchema,
  updateStudyPlanSchema,
} from "../schemas/studyPlan.schema";

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.use(authenticateToken as any);

router.post("/", validateResult(createStudyPlanSchema), createStudyPlan);
router.get("/active", getActivePlan);
router.put("/:id", validateResult(updateStudyPlanSchema), updateStudyPlan);
router.get(
  "/:id/tasks",
  validateResult(getStudyPlanTasksSchema),
  getStudyPlanTasks,
);
router.put(
  "/tasks/:taskId/complete",
  validateResult(completeStudyTaskSchema),
  completeStudyTask,
);

export default router;
