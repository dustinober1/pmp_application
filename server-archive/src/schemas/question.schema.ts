import { z } from "zod";

export const getQuestionsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
    domainId: z.string().optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  }),
});

export const getQuestionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
