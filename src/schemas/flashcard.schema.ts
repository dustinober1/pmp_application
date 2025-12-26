import { z } from "zod";

// Flashcard query schema
export const getFlashcardsSchema = z.object({
  query: z.object({
    domain: z.string().uuid().optional(),
    category: z.string().optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  }),
});

// Flashcard ID param schema
export const flashcardIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid flashcard ID"),
  }),
});

// Review flashcard schema
export const reviewFlashcardSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid flashcard ID"),
  }),
  body: z.object({
    difficulty: z.enum(["AGAIN", "HARD", "GOOD", "EASY"] as const),
  }),
});

// Due cards query schema
export const dueCardsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    domain: z.string().uuid().optional(),
  }),
});

// Update daily goals schema
export const updateGoalsSchema = z.object({
  body: z
    .object({
      flashcardGoal: z.number().int().min(1).max(100).optional(),
      questionsGoal: z.number().int().min(1).max(100).optional(),
    })
    .refine(
      (data) =>
        data.flashcardGoal !== undefined || data.questionsGoal !== undefined,
      {
        message: "At least one goal must be provided",
      },
    ),
});

// Admin create flashcard schema
export const createFlashcardSchema = z.object({
  body: z.object({
    domainId: z.string().uuid("Invalid domain ID"),
    frontText: z.string().min(1, "Front text is required").max(2000),
    backText: z.string().min(1, "Back text is required").max(5000),
    category: z.string().min(1, "Category is required").max(100),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  }),
});

// Admin update flashcard schema
export const updateFlashcardSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid flashcard ID"),
  }),
  body: z.object({
    frontText: z.string().min(1).max(2000).optional(),
    backText: z.string().min(1).max(5000).optional(),
    category: z.string().min(1).max(100).optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    isActive: z.boolean().optional(),
  }),
});
