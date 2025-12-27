import { prisma } from "./database";
import { ErrorFactory } from "../utils/AppError";

export interface DiscussionCommentResponse {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  parentId: string | null;
  upvotes: number;
  isExpertVerified: boolean;
  isHidden: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  hasVoted: boolean;
  replies: Omit<DiscussionCommentResponse, "replies">[];
}

const mapCommentWithVote = (
  comment: any,
  userId?: string,
): DiscussionCommentResponse => {
  const hasVoted =
    !!userId && Array.isArray(comment.votes) && comment.votes.length > 0;
  return {
    ...comment,
    hasVoted,
    replies: (comment.replies || []).map((reply: any) => ({
      ...reply,
      hasVoted:
        !!userId && Array.isArray(reply.votes) && reply.votes.length > 0,
    })),
  };
};

export const discussionService = {
  async listComments(
    questionId: string,
    sort: "newest" | "top",
    userId?: string,
  ): Promise<DiscussionCommentResponse[]> {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });
    if (!question) {
      throw ErrorFactory.notFound("Question not found");
    }

    const orderBy =
      sort === "top"
        ? [{ upvotes: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

    const comments = await prisma.discussionComment.findMany({
      where: { questionId, parentId: null, isHidden: false },
      orderBy,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        votes: userId
          ? { where: { userId }, select: { id: true } }
          : { select: { id: true } },
        replies: {
          where: { isHidden: false },
          orderBy: [{ createdAt: "asc" }],
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
            votes: userId
              ? { where: { userId }, select: { id: true } }
              : { select: { id: true } },
          },
        },
      },
    });

    return comments.map((c) => mapCommentWithVote(c, userId));
  },

  async createComment({
    questionId,
    userId,
    content,
    parentId,
  }: {
    questionId: string;
    userId: string;
    content: string;
    parentId?: string;
  }) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });
    if (!question) {
      throw ErrorFactory.notFound("Question not found");
    }

    if (parentId) {
      const parent = await prisma.discussionComment.findUnique({
        where: { id: parentId },
        select: { id: true, questionId: true },
      });
      if (!parent || parent.questionId !== questionId) {
        throw ErrorFactory.badRequest("Invalid parent comment");
      }
    }

    return prisma.discussionComment.create({
      data: {
        questionId,
        userId,
        content,
        parentId: parentId || null,
      },
    });
  },

  async updateComment({
    id,
    userId,
    content,
  }: {
    id: string;
    userId: string;
    content: string;
  }) {
    const existing = await prisma.discussionComment.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!existing) {
      throw ErrorFactory.notFound("Comment not found");
    }
    if (existing.userId !== userId) {
      throw ErrorFactory.forbidden("You can only edit your own comments");
    }

    return prisma.discussionComment.update({
      where: { id },
      data: { content },
    });
  },

  async deleteComment({ id, userId }: { id: string; userId: string }) {
    const existing = await prisma.discussionComment.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!existing) {
      throw ErrorFactory.notFound("Comment not found");
    }
    if (existing.userId !== userId) {
      throw ErrorFactory.forbidden("You can only delete your own comments");
    }

    await prisma.discussionComment.delete({ where: { id } });
  },

  async voteComment({ id, userId }: { id: string; userId: string }) {
    const comment = await prisma.discussionComment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!comment) {
      throw ErrorFactory.notFound("Comment not found");
    }

    const existing = await prisma.commentVote.findUnique({
      where: { commentId_userId: { commentId: id, userId } },
    });

    if (existing) {
      return { alreadyVoted: true };
    }

    await prisma.$transaction([
      prisma.commentVote.create({
        data: { commentId: id, userId },
      }),
      prisma.discussionComment.update({
        where: { id },
        data: { upvotes: { increment: 1 } },
      }),
    ]);

    return { alreadyVoted: false };
  },

  async removeVote({ id, userId }: { id: string; userId: string }) {
    const existing = await prisma.commentVote.findUnique({
      where: { commentId_userId: { commentId: id, userId } },
    });

    if (!existing) {
      return { removed: false };
    }

    await prisma.$transaction([
      prisma.commentVote.delete({
        where: { commentId_userId: { commentId: id, userId } },
      }),
      prisma.discussionComment.update({
        where: { id },
        data: { upvotes: { decrement: 1 } },
      }),
    ]);

    return { removed: true };
  },

  async reportComment({
    id,
    userId,
    reason,
  }: {
    id: string;
    userId: string;
    reason: string;
  }) {
    const comment = await prisma.discussionComment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!comment) {
      throw ErrorFactory.notFound("Comment not found");
    }

    const existing = await prisma.commentReport.findUnique({
      where: { commentId_userId: { commentId: id, userId } },
    });
    if (existing) {
      throw ErrorFactory.conflict("You already reported this comment");
    }

    await prisma.$transaction([
      prisma.commentReport.create({
        data: { commentId: id, userId, reason },
      }),
      prisma.discussionComment.update({
        where: { id },
        data: { reportCount: { increment: 1 } },
      }),
    ]);
  },

  async adminHide({ id }: { id: string }) {
    const comment = await prisma.discussionComment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!comment) {
      throw ErrorFactory.notFound("Comment not found");
    }

    return prisma.discussionComment.update({
      where: { id },
      data: { isHidden: true },
    });
  },

  async adminVerify({ id }: { id: string }) {
    const comment = await prisma.discussionComment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!comment) {
      throw ErrorFactory.notFound("Comment not found");
    }

    return prisma.discussionComment.update({
      where: { id },
      data: { isExpertVerified: true },
    });
  },
};
