import { Router } from "express";
import {
  listNotifications,
  markNotificationRead,
  saveSubscription,
  getPreferences,
  updatePreferences,
} from "../controllers/notificationController";
import { authenticateToken } from "../middleware/auth";
import { validateResult } from "../middleware/validation";
import {
  subscribeSchema,
  updatePreferenceSchema,
} from "../schemas/notification.schema";

const router = Router();

router.use(authenticateToken);

router.get("/notifications", listNotifications);
router.put("/notifications/:id/read", markNotificationRead);
router.post(
  "/notifications/subscribe",
  validateResult(subscribeSchema),
  saveSubscription,
);
router.get("/notifications/preferences", getPreferences);
router.put(
  "/notifications/preferences",
  validateResult(updatePreferenceSchema),
  updatePreferences,
);

export default router;
