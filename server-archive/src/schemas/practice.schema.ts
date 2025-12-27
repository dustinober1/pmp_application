import { z } from "zod";

export const startSessionSchema = z.object({
  body: z.object({
    testId: z.string().uuid(),
    adaptiveMode: z.boolean().optional(),
  }),
});

export const submitAnswerSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid(),
    questionId: z.string().uuid(),
    answerIndex: z.number().int().min(0),
    timeSpentSeconds: z.number().int().min(0),
  }),
});

export const toggleFlagSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid(),
    questionId: z.string().uuid(),
    isFlagged: z.boolean(),
  }),
});

export const completeSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});
