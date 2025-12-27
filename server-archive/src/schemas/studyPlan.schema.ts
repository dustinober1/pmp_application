import { z } from "zod";

const isoDateString = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime());

export const createStudyPlanSchema = z.object({
  body: z.object({
    targetExamDate: isoDateString,
    hoursPerDay: z.number().positive().max(24),
  }),
});

export const updateStudyPlanSchema = z.object({
  body: z
    .object({
      targetExamDate: isoDateString.optional(),
      hoursPerDay: z.number().positive().max(24).optional(),
      status: z.enum(["active", "archived", "completed"]).optional(),
      progressStatus: z.enum(["on_track", "behind", "ahead"]).optional(),
    })
    .refine(
      (data) =>
        data.targetExamDate !== undefined ||
        data.hoursPerDay !== undefined ||
        data.status !== undefined ||
        data.progressStatus !== undefined,
      { message: "At least one field must be provided" },
    ),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getStudyPlanTasksSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const completeStudyTaskSchema = z.object({
  params: z.object({
    taskId: z.string().uuid(),
  }),
});
