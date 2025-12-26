import { z } from "zod";

// Difficulty enum for validation
const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"] as const);

/**
 * Schema for GET /api/adaptive/questions query parameters
 */
export const getQuestionsSchema = z.object({
  query: z.object({
    count: z.coerce.number().int().min(1).max(50).default(10),
    domainFilter: z.string().uuid().optional(),
    difficultyMin: difficultyEnum.optional(),
    difficultyMax: difficultyEnum.optional(),
    excludeRecentDays: z.coerce.number().int().min(0).max(30).default(7),
  }),
});

/**
 * Schema for GET /api/adaptive/gaps query parameters
 */
export const getGapsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(20).default(10),
  }),
});

/**
 * Schema for GET /api/adaptive/insights query parameters
 */
export const getInsightsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

/**
 * Schema for validating difficulty range consistency
 */
export const validateDifficultyRange = (data: {
  difficultyMin?: string;
  difficultyMax?: string;
}) => {
  if (data.difficultyMin && data.difficultyMax) {
    const difficulties = ["EASY", "MEDIUM", "HARD"];
    const minIndex = difficulties.indexOf(data.difficultyMin);
    const maxIndex = difficulties.indexOf(data.difficultyMax);

    if (minIndex > maxIndex) {
      throw new Error("difficultyMin cannot be higher than difficultyMax");
    }
  }
  return data;
};
