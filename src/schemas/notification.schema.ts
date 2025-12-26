import { z } from "zod";

export const subscribeSchema = z.object({
  body: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

export const updatePreferenceSchema = z.object({
  body: z.object({
    pushEnabled: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
    emailFrequency: z.enum(["daily", "weekly"]).optional(),
    studyReminders: z.boolean().optional(),
    achievements: z.boolean().optional(),
    digestEnabled: z.boolean().optional(),
  }),
});
