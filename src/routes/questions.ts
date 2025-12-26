import { Router } from "express";
import {
  getQuestions,
  getQuestionById,
  getDomains,
} from "../controllers/questionController";
import { validateResult } from "../middleware/validation";
import {
  getQuestionsSchema,
  getQuestionByIdSchema,
} from "../schemas/question.schema";

const router = Router();

router.get("/", validateResult(getQuestionsSchema), getQuestions);
router.get("/domains", getDomains);
router.get("/:id", validateResult(getQuestionByIdSchema), getQuestionById);

export default router;
