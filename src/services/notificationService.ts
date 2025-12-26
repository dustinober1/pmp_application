import webpush from "web-push";
import nodemailer from "nodemailer";
import Logger from "../utils/logger";
import { prisma } from "./database";
import {
  Notification,
  NotificationSubscription,
  NotificationPreference,
} from "@prisma/client";

type NotificationType =
  | "study_reminder"
  | "streak_milestone"
  | "mastery_level_up"
  | "test_completed"
  | "weekly_digest"
  | "general";

const {
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_CONTACT_EMAIL = "mailto:notifications@example.com",
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = "notifications@example.com",
} = process.env;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_CONTACT_EMAIL,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );
} else {
  Logger.warn(
    "VAPID keys not configured. Push notifications will be disabled.",
  );
}

const transporter =
  SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    : null;

export type NotificationInput = {
  userId: string;
  type?: NotificationType;
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, unknown>;
};

async function ensurePreferences(
  userId: string,
): Promise<NotificationPreference> {
  let pref = await prisma.notificationPreference.findUnique({
    where: { userId },
  });
  if (!pref) {
    pref = await prisma.notificationPreference.create({
      data: {
        userId,
        pushEnabled: true,
        emailEnabled: false,
        emailFrequency: "weekly",
        studyReminders: true,
        achievements: true,
        digestEnabled: true,
      },
    });
  }
  return pref;
}

async function sendPush(userId: string, payload: Record<string, unknown>) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return;
  }
  const subs = await prisma.notificationSubscription.findMany({
    where: { userId },
  });
  const pushPayload = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (sub: NotificationSubscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          pushPayload,
        );
      } catch (err) {
        Logger.warn("Push send failed, removing subscription", { err });
        await prisma.notificationSubscription.delete({
          where: { endpoint: sub.endpoint },
        });
      }
    }),
  );
}

async function sendEmail(userId: string, subject: string, text: string) {
  if (!transporter) {
    Logger.warn("SMTP not configured; skipping email send.");
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });
  if (!user) {
    return;
  }
  await transporter.sendMail({
    from: SMTP_FROM,
    to: user.email,
    subject,
    text,
  });
}

export const notificationService = {
  async list(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async markRead(userId: string, id: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }
    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  },

  async saveSubscription(params: {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
  }) {
    const { userId, endpoint, p256dh, auth } = params;
    return prisma.notificationSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, userId },
      create: { userId, endpoint, p256dh, auth },
    });
  },

  async getPreferences(userId: string) {
    return ensurePreferences(userId);
  },

  async updatePreferences(
    userId: string,
    data: Partial<{
      pushEnabled: boolean;
      emailEnabled: boolean;
      emailFrequency: string;
      studyReminders: boolean;
      achievements: boolean;
      digestEnabled: boolean;
    }>,
  ) {
    await ensurePreferences(userId);
    return prisma.notificationPreference.update({
      where: { userId },
      data,
    });
  },

  async createNotification(input: NotificationInput) {
    const pref = await ensurePreferences(input.userId);
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type ?? "general",
        title: input.title,
        body: input.body,
        link: input.link,
        metadata: input.metadata,
      },
    });

    // Push
    if (pref.pushEnabled) {
      await sendPush(input.userId, {
        title: input.title,
        body: input.body,
        link: input.link,
        type: input.type ?? "general",
      });
    }

    // Email (only immediate notifications, not digest)
    if (pref.emailEnabled) {
      await sendEmail(
        input.userId,
        input.title,
        `${input.body}${input.link ? `\n\nOpen: ${input.link}` : ""}`,
      );
    }

    return notification;
  },

  async sendTestCompletion(params: {
    userId: string;
    testName: string;
    score: number;
  }) {
    return this.createNotification({
      userId: params.userId,
      type: "test_completed",
      title: "Test completed",
      body: `You finished ${params.testName} with a score of ${params.score}%`,
      link: "/practice",
      metadata: { score: params.score, testName: params.testName },
    });
  },

  async sendStreakMilestone(userId: string, streak: number) {
    return this.createNotification({
      userId,
      type: "streak_milestone",
      title: "Study streak milestone reached!",
      body: `Great job! You hit a ${streak}-day study streak.`,
      link: "/dashboard",
      metadata: { streak },
    });
  },

  async sendMasteryLevelUp(userId: string, domainName: string, level: string) {
    return this.createNotification({
      userId,
      type: "mastery_level_up",
      title: `Mastery level up: ${domainName}`,
      body: `You reached ${level} mastery in ${domainName}. Keep it up!`,
      link: "/dashboard",
      metadata: { domainName, level },
    });
  },

  async sendStudyReminder(userId: string) {
    const pref = await ensurePreferences(userId);
    if (!pref.studyReminders) {
      return;
    }
    return this.createNotification({
      userId,
      type: "study_reminder",
      title: "Time to study",
      body: "You haven't studied today. Complete a quick session to keep your streak alive!",
      link: "/dashboard",
    });
  },

  async sendWeeklyDigest(userId: string) {
    const pref = await ensurePreferences(userId);
    if (!pref.digestEnabled || !pref.emailEnabled) {
      return;
    }
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    const latest = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    const lines = latest.map(
      (n: Notification) =>
        `• ${n.title} - ${n.body.slice(0, 100)}${n.body.length > 100 ? "..." : ""}`,
    );
    const text = [
      `You have ${unreadCount} unread notifications.`,
      "",
      "Recent updates:",
      ...lines,
      "",
      "Visit your dashboard to catch up.",
    ].join("\n");
    await sendEmail(userId, "Weekly PMP digest", text);
    return this.createNotification({
      userId,
      type: "weekly_digest",
      title: "Weekly digest sent",
      body: "We emailed your weekly study digest.",
      link: "/dashboard",
    });
  },
};
