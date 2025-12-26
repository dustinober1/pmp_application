import cron from "node-cron";
import Logger from "../utils/logger";
import { prisma } from "../services/database";
import { notificationService } from "../services/notificationService";
import { NotificationPreference } from "@prisma/client";

const todayMidnight = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

async function runStudyReminderJob() {
  try {
    const today = todayMidnight();
    const streaks = await prisma.studyStreak.findMany({
      where: {
        lastStudyDate: {
          lt: today,
        },
      },
      select: { userId: true },
    });

    await Promise.all(
      streaks.map((s) => notificationService.sendStudyReminder(s.userId)),
    );

    Logger.info(
      `[Notifications] Study reminder job sent ${streaks.length} reminders`,
    );
  } catch (error) {
    Logger.error("[Notifications] Study reminder job failed", error);
  }
}

async function runWeeklyDigestJob() {
  try {
    const prefs: Pick<NotificationPreference, "userId">[] =
      await prisma.notificationPreference.findMany({
        where: {
          digestEnabled: true,
          emailEnabled: true,
        },
        select: { userId: true },
      });

    await Promise.all(
      prefs.map((p) => notificationService.sendWeeklyDigest(p.userId)),
    );

    Logger.info(
      `[Notifications] Weekly digest job sent ${prefs.length} digests`,
    );
  } catch (error) {
    Logger.error("[Notifications] Weekly digest job failed", error);
  }
}

export function startNotificationJobs() {
  // Daily study reminder at 1pm UTC
  cron.schedule("0 13 * * *", () => {
    void runStudyReminderJob();
  });

  // Weekly digest every Monday at 2pm UTC
  cron.schedule("0 14 * * 1", () => {
    void runWeeklyDigestJob();
  });

  Logger.info("[Notifications] Scheduled cron jobs initialized");
}
