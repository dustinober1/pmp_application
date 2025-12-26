import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getTests,
  createTest,
  updateTest,
  deleteTest,
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from "../controllers/adminController";
import {
  getDetailedHealth,
  getDatabaseMetrics,
  getApiMetrics,
} from "../controllers/systemHealthController";
import {
  getAuditLogs,
  getAuditLogById,
  getAuditLogStats,
  exportAuditLogs,
} from "../controllers/auditLogController";

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken as any);
router.use(requireAdmin as any);

// Dashboard
router.get("/dashboard", getDashboardStats);

// User Management
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Question Management
router.get("/questions", getQuestions);
router.post("/questions", createQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

// Practice Test Management
router.get("/tests", getTests);
router.post("/tests", createTest);
router.put("/tests/:id", updateTest);
router.delete("/tests/:id", deleteTest);

// Flashcard Management
router.get("/flashcards", getFlashcards);
router.post("/flashcards", createFlashcard);
router.put("/flashcards/:id", updateFlashcard);
router.delete("/flashcards/:id", deleteFlashcard);

// System Health
router.get("/health/detailed", getDetailedHealth);
router.get("/health/database", getDatabaseMetrics);
router.get("/health/api-metrics", getApiMetrics);

// Audit Logs
router.get("/audit-logs/stats", getAuditLogStats);
router.get("/audit-logs/export", exportAuditLogs);
router.get("/audit-logs/:id", getAuditLogById);
router.get("/audit-logs", getAuditLogs);

export default router;
