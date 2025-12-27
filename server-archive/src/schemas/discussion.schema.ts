import { z } from "zod";

const contentSchema = z
  .string()
  .min(3, "Content must be at least 3 characters")
  .max(2000, "Content must be at most 2000 characters");

export const getCommentsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Question ID must be a valid UUID"),
  }),
  query: z.object({
    sort: z.enum(["newest", "top"]).optional().default("newest"),
  }),
});

export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Question ID must be a valid UUID"),
  }),
  body: z.object({
    content: contentSchema,
    parentId: z.string().uuid("Parent ID must be a valid UUID").optional(),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Comment ID must be a valid UUID"),
  }),
  body: z.object({
    content: contentSchema,
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Comment ID must be a valid UUID"),
  }),
});

export const voteCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Comment ID must be a valid UUID"),
  }),
});

export const reportCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Comment ID must be a valid UUID"),
  }),
  body: z.object({
    reason: z
      .string()
      .min(3, "Report reason must be at least 3 characters")
      .max(500, "Report reason must be at most 500 characters"),
  }),
});

export const adminModerateCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Comment ID must be a valid UUID"),
  }),
});

export {};
