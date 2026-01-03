/**
 * Comprehensive tests for flashcard.service
 * Coverage: All methods, SM-2 algorithm, session tracking, edge cases
 */

import { FlashcardService } from "./flashcard.service";
import prisma from "../config/database";
import type { FlashcardRating } from "@pmp/shared";
import { SM2_DEFAULTS } from "@pmp/shared";
import * as fc from "fast-check";

// Mock dependencies
jest.mock("../config/database", () => ({
  __esModule: true,
  default: {
    flashcard: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    flashcardReview: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    flashcardSession: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    flashcardSessionCard: {
      createMany: jest.fn(),
      updateMany: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
    },
  },
}));

describe("FlashcardService", () => {
  let flashcardService: FlashcardService;
  const mockDate = new Date("2025-01-01T00:00:00.000Z");

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    flashcardService = new FlashcardService();
    jest.clearAllMocks();
  });

  describe("getFlashcards", () => {
    it("should return flashcards with no filters", async () => {
      const mockCards = [
        {
          id: "1",
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front 1",
          back: "Back 1",
          isCustom: false,
          createdBy: null,
          createdAt: mockDate,
        },
        {
          id: "2",
          domainId: "domain-2",
          taskId: "task-2",
          front: "Front 2",
          back: "Back 2",
          isCustom: true,
          createdBy: "user-1",
          createdAt: mockDate,
        },
      ];

      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(mockCards);

      const result = await flashcardService.getFlashcards({});

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "1",
        domainId: "domain-1",
        taskId: "task-1",
        front: "Front 1",
        back: "Back 1",
        isCustom: false,
        createdBy: undefined,
        createdAt: mockDate,
      });
      expect(result[1]?.createdBy).toBe("user-1");
      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: {},
        take: 50,
        orderBy: { createdAt: "asc" },
      });
    });

    it("should filter flashcards by domainId", async () => {
      const mockCards = [
        {
          id: "1",
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front 1",
          back: "Back 1",
          isCustom: false,
          createdBy: null,
          createdAt: mockDate,
        },
      ];

      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(mockCards);

      const result = await flashcardService.getFlashcards({
        domainId: "domain-1",
      });

      expect(result).toHaveLength(1);
      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: { domainId: "domain-1" },
        take: 50,
        orderBy: { createdAt: "asc" },
      });
    });

    it("should filter flashcards by taskId", async () => {
      const mockCards = [
        {
          id: "1",
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front 1",
          back: "Back 1",
          isCustom: false,
          createdBy: null,
          createdAt: mockDate,
        },
      ];

      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(mockCards);

      const result = await flashcardService.getFlashcards({ taskId: "task-1" });

      expect(result).toHaveLength(1);
      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: { taskId: "task-1" },
        take: 50,
        orderBy: { createdAt: "asc" },
      });
    });

    it("should filter flashcards by both domainId and taskId", async () => {
      const mockCards = [
        {
          id: "1",
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front 1",
          back: "Back 1",
          isCustom: false,
          createdBy: null,
          createdAt: mockDate,
        },
      ];

      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(mockCards);

      const result = await flashcardService.getFlashcards({
        domainId: "domain-1",
        taskId: "task-1",
      });

      expect(result).toHaveLength(1);
      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: { domainId: "domain-1", taskId: "task-1" },
        take: 50,
        orderBy: { createdAt: "asc" },
      });
    });

    it("should respect custom limit", async () => {
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue([]);

      await flashcardService.getFlashcards({ limit: 10 });

      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: {},
        take: 10,
        orderBy: { createdAt: "asc" },
      });
    });

    it("should return empty array when no flashcards found", async () => {
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue([]);

      const result = await flashcardService.getFlashcards({});

      expect(result).toEqual([]);
    });
  });

  describe("getDueForReview", () => {
    it("should return flashcards due for review", async () => {
      const mockDueReviews = [
        {
          userId: "user-1",
          cardId: "card-1",
          nextReviewDate: new Date("2024-12-31T00:00:00.000Z"),
          card: {
            id: "card-1",
            domainId: "domain-1",
            taskId: "task-1",
            front: "Front 1",
            back: "Back 1",
            isCustom: false,
            createdBy: null,
            createdAt: mockDate,
          },
        },
      ];

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue(
        mockDueReviews,
      );

      const result = await flashcardService.getDueForReview("user-1");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "card-1",
        domainId: "domain-1",
        taskId: "task-1",
        front: "Front 1",
        back: "Back 1",
        isCustom: false,
        createdBy: undefined,
        createdAt: mockDate,
      });
      expect(prisma.flashcardReview.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          nextReviewDate: { lte: mockDate },
        },
        include: { card: true },
        take: 20,
        orderBy: { nextReviewDate: "asc" },
      });
    });

    it("should respect custom limit", async () => {
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);

      await flashcardService.getDueForReview("user-1", 10);

      expect(prisma.flashcardReview.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          nextReviewDate: { lte: mockDate },
        },
        include: { card: true },
        take: 10,
        orderBy: { nextReviewDate: "asc" },
      });
    });

    it("should return empty array when no cards are due", async () => {
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);

      const result = await flashcardService.getDueForReview("user-1");

      expect(result).toEqual([]);
    });

    it("should handle cards with createdBy", async () => {
      const mockDueReviews = [
        {
          userId: "user-1",
          cardId: "card-1",
          nextReviewDate: new Date("2024-12-31T00:00:00.000Z"),
          card: {
            id: "card-1",
            domainId: "domain-1",
            taskId: "task-1",
            front: "Front 1",
            back: "Back 1",
            isCustom: true,
            createdBy: "creator-1",
            createdAt: mockDate,
          },
        },
      ];

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue(
        mockDueReviews,
      );

      const result = await flashcardService.getDueForReview("user-1");

      expect(result[0]?.createdBy).toBe("creator-1");
    });
  });

  describe("startSession", () => {
    it("should start session without prioritizeReview", async () => {
      const mockCards = [
        {
          id: "card-1",
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front 1",
          back: "Back 1",
          isCustom: false,
          createdBy: null,
          createdAt: mockDate,
        },
      ];

      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 1,
        createdAt: mockDate,
      };

      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(mockCards);
      (prisma.flashcardSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSessionCard.createMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      const result = await flashcardService.startSession("user-1", {
        cardCount: 20,
      });

      expect(result).toEqual({
        sessionId: "session-1",
        cards: [
          {
            id: "card-1",
            domainId: "domain-1",
            taskId: "task-1",
            front: "Front 1",
            back: "Back 1",
            isCustom: false,
            createdBy: undefined,
            createdAt: mockDate,
          },
        ],
      });
      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: { isCustom: false },
        take: 20,
        orderBy: { createdAt: "asc" },
      });
      expect(prisma.flashcardSession.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          totalCards: 1,
        },
      });
      expect(prisma.flashcardSessionCard.createMany).toHaveBeenCalledWith({
        data: [{ sessionId: "session-1", cardId: "card-1" }],
      });
    });

    it("should start session with domain filter", async () => {
      const mockCards = [
        {
          id: "card-1",
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front 1",
          back: "Back 1",
          isCustom: false,
          createdBy: null,
          createdAt: mockDate,
        },
      ];

      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 1,
        createdAt: mockDate,
      };

      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(mockCards);
      (prisma.flashcardSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSessionCard.createMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      await flashcardService.startSession("user-1", {
        domainIds: ["domain-1"],
        cardCount: 20,
      });

      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: { domainId: { in: ["domain-1"] }, isCustom: false },
        take: 20,
        orderBy: { createdAt: "asc" },
      });
    });

    it("should start session with task filter", async () => {
      const mockCards = [
        {
          id: "card-1",
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front 1",
          back: "Back 1",
          isCustom: false,
          createdBy: null,
          createdAt: mockDate,
        },
      ];

      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 1,
        createdAt: mockDate,
      };

      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(mockCards);
      (prisma.flashcardSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSessionCard.createMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      await flashcardService.startSession("user-1", {
        taskIds: ["task-1"],
        cardCount: 20,
      });

      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: { taskId: { in: ["task-1"] }, isCustom: false },
        take: 20,
        orderBy: { createdAt: "asc" },
      });
    });

    it("should include custom cards when requested", async () => {
      const mockCards = [
        {
          id: "card-1",
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front 1",
          back: "Back 1",
          isCustom: true,
          createdBy: "user-1",
          createdAt: mockDate,
        },
      ];

      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 1,
        createdAt: mockDate,
      };

      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(mockCards);
      (prisma.flashcardSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSessionCard.createMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      await flashcardService.startSession("user-1", {
        includeCustom: true,
        cardCount: 20,
      });

      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: {},
        take: 20,
        orderBy: { createdAt: "asc" },
      });
    });

    it("should prioritize review cards when enough are available", async () => {
      const mockDueReviews = [
        {
          userId: "user-1",
          cardId: "card-1",
          nextReviewDate: new Date("2024-12-31T00:00:00.000Z"),
          card: {
            id: "card-1",
            domainId: "domain-1",
            taskId: "task-1",
            front: "Front 1",
            back: "Back 1",
            isCustom: false,
            createdBy: null,
            createdAt: mockDate,
          },
        },
        {
          userId: "user-1",
          cardId: "card-2",
          nextReviewDate: new Date("2024-12-31T00:00:00.000Z"),
          card: {
            id: "card-2",
            domainId: "domain-1",
            taskId: "task-1",
            front: "Front 2",
            back: "Back 2",
            isCustom: false,
            createdBy: null,
            createdAt: mockDate,
          },
        },
      ];

      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 2,
        createdAt: mockDate,
      };

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue(
        mockDueReviews,
      );
      (prisma.flashcardSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSessionCard.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const result = await flashcardService.startSession("user-1", {
        prioritizeReview: true,
        cardCount: 2,
      });

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0]?.id).toBe("card-1");
      expect(result.cards[1]?.id).toBe("card-2");
      expect(prisma.flashcard.findMany).not.toHaveBeenCalled();
    });

    it("should fill with new cards when not enough due cards", async () => {
      const mockDueReviews = [
        {
          userId: "user-1",
          cardId: "card-1",
          nextReviewDate: new Date("2024-12-31T00:00:00.000Z"),
          card: {
            id: "card-1",
            domainId: "domain-1",
            taskId: "task-1",
            front: "Front 1",
            back: "Back 1",
            isCustom: false,
            createdBy: null,
            createdAt: mockDate,
          },
        },
      ];

      const mockAdditionalCards = [
        {
          id: "card-2",
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front 2",
          back: "Back 2",
          isCustom: false,
          createdBy: null,
          createdAt: mockDate,
        },
      ];

      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 2,
        createdAt: mockDate,
      };

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue(
        mockDueReviews,
      );
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(
        mockAdditionalCards,
      );
      (prisma.flashcardSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSessionCard.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const result = await flashcardService.startSession("user-1", {
        prioritizeReview: true,
        cardCount: 2,
      });

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0]?.id).toBe("card-1"); // Due card first
      expect(result.cards[1]?.id).toBe("card-2"); // New card second
      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: {
          isCustom: false,
          NOT: {
            id: { in: ["card-1"] },
          },
        },
        take: 1,
      });
    });

    it("should use default cardCount when not provided", async () => {
      const mockCards: any[] = [];

      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 0,
        createdAt: mockDate,
      };

      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(mockCards);
      (prisma.flashcardSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSessionCard.createMany as jest.Mock).mockResolvedValue({
        count: 0,
      });

      await flashcardService.startSession("user-1", {});

      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: { isCustom: false },
        take: 20,
        orderBy: { createdAt: "asc" },
      });
    });

    it("should prioritize review with domain filter and fill with additional cards", async () => {
      const mockDueReviews = [
        {
          userId: "user-1",
          cardId: "card-1",
          nextReviewDate: new Date("2024-12-31T00:00:00.000Z"),
          card: {
            id: "card-1",
            domainId: "domain-1",
            taskId: "task-1",
            front: "Front 1",
            back: "Back 1",
            isCustom: false,
            createdBy: null,
            createdAt: mockDate,
          },
        },
      ];

      const mockAdditionalCards = [
        {
          id: "card-2",
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front 2",
          back: "Back 2",
          isCustom: false,
          createdBy: null,
          createdAt: mockDate,
        },
      ];

      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 2,
        createdAt: mockDate,
      };

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue(
        mockDueReviews,
      );
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(
        mockAdditionalCards,
      );
      (prisma.flashcardSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSessionCard.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const result = await flashcardService.startSession("user-1", {
        prioritizeReview: true,
        domainIds: ["domain-1"],
        taskIds: ["task-1"],
        cardCount: 2,
      });

      expect(result.cards).toHaveLength(2);
      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: {
          domainId: { in: ["domain-1"] },
          taskId: { in: ["task-1"] },
          isCustom: false,
          NOT: {
            id: { in: ["card-1"] },
          },
        },
        take: 1,
      });
    });
  });

  describe("getSession", () => {
    it("should return existing session with cards and progress", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 2,
        cards: [
          {
            sessionId: "session-1",
            cardId: "card-1",
            rating: "know_it",
            timeSpentMs: 5000,
            answeredAt: mockDate,
            card: {
              id: "card-1",
              domainId: "domain-1",
              taskId: "task-1",
              front: "Front 1",
              back: "Back 1",
              isCustom: false,
              createdBy: null,
              createdAt: mockDate,
            },
          },
          {
            sessionId: "session-1",
            cardId: "card-2",
            rating: null,
            timeSpentMs: null,
            answeredAt: null,
            card: {
              id: "card-2",
              domainId: "domain-1",
              taskId: "task-1",
              front: "Front 2",
              back: "Back 2",
              isCustom: false,
              createdBy: null,
              createdAt: mockDate,
            },
          },
        ],
      };

      (prisma.flashcardSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await flashcardService.getSession("session-1", "user-1");

      expect(result).toEqual({
        sessionId: "session-1",
        cards: [
          {
            id: "card-1",
            domainId: "domain-1",
            taskId: "task-1",
            front: "Front 1",
            back: "Back 1",
            isCustom: false,
            createdBy: undefined,
            createdAt: mockDate,
          },
          {
            id: "card-2",
            domainId: "domain-1",
            taskId: "task-1",
            front: "Front 2",
            back: "Back 2",
            isCustom: false,
            createdBy: undefined,
            createdAt: mockDate,
          },
        ],
        progress: {
          total: 2,
          answered: 1,
        },
      });
      expect(prisma.flashcardSession.findUnique).toHaveBeenCalledWith({
        where: { id: "session-1" },
        include: {
          cards: {
            include: { card: true },
            orderBy: { cardId: "asc" },
          },
        },
      });
    });

    it("should return null when session not found", async () => {
      (prisma.flashcardSession.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await flashcardService.getSession("session-1", "user-1");

      expect(result).toBeNull();
    });

    it("should return null when userId does not match", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-2",
        totalCards: 1,
        cards: [],
      };

      (prisma.flashcardSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await flashcardService.getSession("session-1", "user-1");

      expect(result).toBeNull();
    });

    it("should count answered cards correctly when all answered", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 2,
        cards: [
          {
            sessionId: "session-1",
            cardId: "card-1",
            rating: "know_it",
            timeSpentMs: 5000,
            answeredAt: mockDate,
            card: {
              id: "card-1",
              domainId: "domain-1",
              taskId: "task-1",
              front: "Front 1",
              back: "Back 1",
              isCustom: false,
              createdBy: null,
              createdAt: mockDate,
            },
          },
          {
            sessionId: "session-1",
            cardId: "card-2",
            rating: "learning",
            timeSpentMs: 3000,
            answeredAt: mockDate,
            card: {
              id: "card-2",
              domainId: "domain-1",
              taskId: "task-1",
              front: "Front 2",
              back: "Back 2",
              isCustom: false,
              createdBy: null,
              createdAt: mockDate,
            },
          },
        ],
      };

      (prisma.flashcardSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await flashcardService.getSession("session-1", "user-1");

      expect(result?.progress).toEqual({
        total: 2,
        answered: 2,
      });
    });
  });

  describe("recordResponse", () => {
    it("should record response for know_it rating", async () => {
      const existingReview = {
        userId: "user-1",
        cardId: "card-1",
        easeFactor: 2.5,
        interval: 6,
        repetitions: 1,
      };

      (prisma.flashcardSessionCard.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (prisma.flashcardReview.findUnique as jest.Mock).mockResolvedValue(
        existingReview,
      );
      (prisma.flashcardReview.upsert as jest.Mock).mockResolvedValue({});

      await flashcardService.recordResponse(
        "session-1",
        "card-1",
        "user-1",
        "know_it",
        5000,
      );

      expect(prisma.flashcardSessionCard.updateMany).toHaveBeenCalledWith({
        where: { sessionId: "session-1", cardId: "card-1" },
        data: {
          rating: "know_it",
          timeSpentMs: 5000,
          answeredAt: mockDate,
        },
      });
      expect(prisma.flashcardReview.findUnique).toHaveBeenCalledWith({
        where: { userId_cardId: { userId: "user-1", cardId: "card-1" } },
      });
      expect(prisma.flashcardReview.upsert).toHaveBeenCalled();
    });

    it("should create new review when none exists", async () => {
      (prisma.flashcardSessionCard.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (prisma.flashcardReview.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.flashcardReview.upsert as jest.Mock).mockResolvedValue({});

      await flashcardService.recordResponse(
        "session-1",
        "card-1",
        "user-1",
        "know_it",
        5000,
      );

      expect(prisma.flashcardReview.upsert).toHaveBeenCalledWith({
        where: { userId_cardId: { userId: "user-1", cardId: "card-1" } },
        update: expect.objectContaining({
          easeFactor: expect.any(Number),
          interval: expect.any(Number),
          repetitions: expect.any(Number),
          nextReviewDate: expect.any(Date),
          lastReviewDate: mockDate,
        }),
        create: expect.objectContaining({
          userId: "user-1",
          cardId: "card-1",
          easeFactor: expect.any(Number),
          interval: expect.any(Number),
          repetitions: expect.any(Number),
          nextReviewDate: expect.any(Date),
          lastReviewDate: mockDate,
        }),
      });
    });

    it("should handle learning rating", async () => {
      (prisma.flashcardSessionCard.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (prisma.flashcardReview.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.flashcardReview.upsert as jest.Mock).mockResolvedValue({});

      await flashcardService.recordResponse(
        "session-1",
        "card-1",
        "user-1",
        "learning",
        5000,
      );

      expect(prisma.flashcardSessionCard.updateMany).toHaveBeenCalledWith({
        where: { sessionId: "session-1", cardId: "card-1" },
        data: {
          rating: "learning",
          timeSpentMs: 5000,
          answeredAt: mockDate,
        },
      });
    });

    it("should handle dont_know rating", async () => {
      (prisma.flashcardSessionCard.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (prisma.flashcardReview.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.flashcardReview.upsert as jest.Mock).mockResolvedValue({});

      await flashcardService.recordResponse(
        "session-1",
        "card-1",
        "user-1",
        "dont_know",
        5000,
      );

      expect(prisma.flashcardSessionCard.updateMany).toHaveBeenCalledWith({
        where: { sessionId: "session-1", cardId: "card-1" },
        data: {
          rating: "dont_know",
          timeSpentMs: 5000,
          answeredAt: mockDate,
        },
      });
    });
  });

  describe("completeSession", () => {
    it("should complete session and calculate stats", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 3,
        cards: [
          { rating: "know_it", timeSpentMs: 5000 },
          { rating: "learning", timeSpentMs: 3000 },
          { rating: "dont_know", timeSpentMs: 2000 },
        ],
      };

      (prisma.flashcardSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSession.update as jest.Mock).mockResolvedValue({});

      const result = await flashcardService.completeSession("session-1");

      expect(result).toEqual({
        totalCards: 3,
        knowIt: 1,
        learning: 1,
        dontKnow: 1,
        totalTimeMs: 10000,
        averageTimePerCard: 3333,
      });
      expect(prisma.flashcardSession.update).toHaveBeenCalledWith({
        where: { id: "session-1" },
        data: {
          completedAt: mockDate,
          knowIt: 1,
          learning: 1,
          dontKnow: 1,
          totalTimeMs: 10000,
        },
      });
    });

    it("should throw error when session not found", async () => {
      (prisma.flashcardSession.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        flashcardService.completeSession("session-1"),
      ).rejects.toThrow("Session not found");
    });

    it("should handle session with all know_it ratings", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 2,
        cards: [
          { rating: "know_it", timeSpentMs: 5000 },
          { rating: "know_it", timeSpentMs: 4000 },
        ],
      };

      (prisma.flashcardSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSession.update as jest.Mock).mockResolvedValue({});

      const result = await flashcardService.completeSession("session-1");

      expect(result).toEqual({
        totalCards: 2,
        knowIt: 2,
        learning: 0,
        dontKnow: 0,
        totalTimeMs: 9000,
        averageTimePerCard: 4500,
      });
    });

    it("should handle session with null timeSpentMs", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 2,
        cards: [
          { rating: "know_it", timeSpentMs: 5000 },
          { rating: "learning", timeSpentMs: null },
        ],
      };

      (prisma.flashcardSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSession.update as jest.Mock).mockResolvedValue({});

      const result = await flashcardService.completeSession("session-1");

      expect(result).toEqual({
        totalCards: 2,
        knowIt: 1,
        learning: 1,
        dontKnow: 0,
        totalTimeMs: 5000,
        averageTimePerCard: 2500,
      });
    });

    it("should handle session with no cards", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 0,
        cards: [],
      };

      (prisma.flashcardSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSession.update as jest.Mock).mockResolvedValue({});

      const result = await flashcardService.completeSession("session-1");

      expect(result).toEqual({
        totalCards: 0,
        knowIt: 0,
        learning: 0,
        dontKnow: 0,
        totalTimeMs: 0,
        averageTimePerCard: 0,
      });
    });

    it("should handle session with null ratings", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-1",
        totalCards: 2,
        cards: [
          { rating: "know_it", timeSpentMs: 5000 },
          { rating: null, timeSpentMs: 0 },
        ],
      };

      (prisma.flashcardSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.flashcardSession.update as jest.Mock).mockResolvedValue({});

      const result = await flashcardService.completeSession("session-1");

      expect(result).toEqual({
        totalCards: 2,
        knowIt: 1,
        learning: 0,
        dontKnow: 0,
        totalTimeMs: 5000,
        averageTimePerCard: 2500,
      });
    });
  });

  describe("createCustomFlashcard", () => {
    it("should create custom flashcard successfully", async () => {
      const mockTask = {
        id: "task-1",
        domainId: "domain-1",
        code: "1.1",
        name: "Test Task",
      };

      const mockCreatedCard = {
        id: "card-1",
        domainId: "domain-1",
        taskId: "task-1",
        front: "Front",
        back: "Back",
        isCustom: true,
        createdBy: "user-1",
        createdAt: mockDate,
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.flashcard.create as jest.Mock).mockResolvedValue(mockCreatedCard);

      const result = await flashcardService.createCustomFlashcard("user-1", {
        domainId: "domain-1",
        taskId: "task-1",
        front: "Front",
        back: "Back",
      });

      expect(result).toEqual({
        id: "card-1",
        domainId: "domain-1",
        taskId: "task-1",
        front: "Front",
        back: "Back",
        isCustom: true,
        createdBy: "user-1",
        createdAt: mockDate,
      });
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: "task-1" },
      });
      expect(prisma.flashcard.create).toHaveBeenCalledWith({
        data: {
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front",
          back: "Back",
          isCustom: true,
          createdBy: "user-1",
        },
      });
    });

    it("should throw error when task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        flashcardService.createCustomFlashcard("user-1", {
          domainId: "domain-1",
          taskId: "invalid-task",
          front: "Front",
          back: "Back",
        }),
      ).rejects.toThrow("Invalid domain or task");
    });

    it("should throw error when domainId does not match task", async () => {
      const mockTask = {
        id: "task-1",
        domainId: "domain-2",
        code: "1.1",
        name: "Test Task",
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      await expect(
        flashcardService.createCustomFlashcard("user-1", {
          domainId: "domain-1",
          taskId: "task-1",
          front: "Front",
          back: "Back",
        }),
      ).rejects.toThrow("Invalid domain or task");
    });
  });

  describe("getReviewStats", () => {
    it("should calculate review stats correctly", async () => {
      const futureDate = new Date("2025-02-01T00:00:00.000Z");
      const pastDate = new Date("2024-12-31T00:00:00.000Z");

      const mockReviews = [
        {
          userId: "user-1",
          cardId: "card-1",
          easeFactor: 2.6,
          interval: 10,
          repetitions: 5,
          nextReviewDate: futureDate,
        },
        {
          userId: "user-1",
          cardId: "card-2",
          easeFactor: 2.4,
          interval: 3,
          repetitions: 2,
          nextReviewDate: futureDate,
        },
        {
          userId: "user-1",
          cardId: "card-3",
          easeFactor: 2.5,
          interval: 1,
          repetitions: 3,
          nextReviewDate: pastDate,
        },
      ];

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue(
        mockReviews,
      );

      const result = await flashcardService.getReviewStats("user-1");

      expect(result).toEqual({
        totalCards: 3,
        mastered: 2, // card-1 and card-3 (repetitions >= 3 && easeFactor >= 2.5)
        learning: 1, // card-2
        dueForReview: 1, // card-3
      });
      expect(prisma.flashcardReview.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
      });
    });

    it("should return zero stats when no reviews exist", async () => {
      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue([]);

      const result = await flashcardService.getReviewStats("user-1");

      expect(result).toEqual({
        totalCards: 0,
        mastered: 0,
        learning: 0,
        dueForReview: 0,
      });
    });

    it("should count cards with repetitions < 3 as learning", async () => {
      const mockReviews = [
        {
          userId: "user-1",
          cardId: "card-1",
          easeFactor: 2.6,
          interval: 10,
          repetitions: 2,
          nextReviewDate: new Date("2025-02-01T00:00:00.000Z"),
        },
      ];

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue(
        mockReviews,
      );

      const result = await flashcardService.getReviewStats("user-1");

      expect(result).toEqual({
        totalCards: 1,
        mastered: 0,
        learning: 1,
        dueForReview: 0,
      });
    });

    it("should count cards with easeFactor < 2.5 as learning", async () => {
      const mockReviews = [
        {
          userId: "user-1",
          cardId: "card-1",
          easeFactor: 2.4,
          interval: 10,
          repetitions: 5,
          nextReviewDate: new Date("2025-02-01T00:00:00.000Z"),
        },
      ];

      (prisma.flashcardReview.findMany as jest.Mock).mockResolvedValue(
        mockReviews,
      );

      const result = await flashcardService.getReviewStats("user-1");

      expect(result).toEqual({
        totalCards: 1,
        mastered: 0,
        learning: 1,
        dueForReview: 0,
      });
    });
  });

  describe("SM-2 Algorithm (calculateSM2)", () => {
    // Access private method for testing via any cast
    const callCalculateSM2 = (
      service: any,
      existingReview: any,
      rating: FlashcardRating,
    ) => {
      return service.calculateSM2(existingReview, rating);
    };

    describe("know_it rating (quality 5)", () => {
      it("should set interval to 1 on first repetition", () => {
        const result = callCalculateSM2(flashcardService, null, "know_it");

        expect(result.interval).toBe(1);
        expect(result.repetitions).toBe(1);
        expect(result.easeFactor).toBeGreaterThan(
          SM2_DEFAULTS.INITIAL_EASE_FACTOR,
        );
      });

      it("should set interval to 6 on second repetition", () => {
        const existingReview = {
          easeFactor: 2.5,
          interval: 1,
          repetitions: 1,
        };

        const result = callCalculateSM2(
          flashcardService,
          existingReview,
          "know_it",
        );

        expect(result.interval).toBe(6);
        expect(result.repetitions).toBe(2);
      });

      it("should multiply interval by easeFactor after second repetition", () => {
        const existingReview = {
          easeFactor: 2.5,
          interval: 6,
          repetitions: 2,
        };

        const result = callCalculateSM2(
          flashcardService,
          existingReview,
          "know_it",
        );

        // Interval is calculated using the OLD easeFactor (before update)
        expect(result.interval).toBe(Math.round(6 * existingReview.easeFactor));
        expect(result.repetitions).toBe(3);
      });

      it("should increase easeFactor", () => {
        const existingReview = {
          easeFactor: 2.5,
          interval: 1,
          repetitions: 1,
        };

        const result = callCalculateSM2(
          flashcardService,
          existingReview,
          "know_it",
        );

        expect(result.easeFactor).toBeGreaterThan(2.5);
      });
    });

    describe("learning rating (quality 3)", () => {
      it("should set interval to 1 on first repetition", () => {
        const result = callCalculateSM2(flashcardService, null, "learning");

        expect(result.interval).toBe(1);
        expect(result.repetitions).toBe(1);
      });

      it("should set interval to 6 on second repetition", () => {
        const existingReview = {
          easeFactor: 2.5,
          interval: 1,
          repetitions: 1,
        };

        const result = callCalculateSM2(
          flashcardService,
          existingReview,
          "learning",
        );

        expect(result.interval).toBe(6);
        expect(result.repetitions).toBe(2);
      });

      it("should maintain easeFactor approximately", () => {
        const existingReview = {
          easeFactor: 2.5,
          interval: 1,
          repetitions: 1,
        };

        const result = callCalculateSM2(
          flashcardService,
          existingReview,
          "learning",
        );

        // Learning should keep ease factor close to original
        expect(Math.abs(result.easeFactor - 2.5)).toBeLessThan(0.5);
      });
    });

    describe("dont_know rating (quality 0)", () => {
      it("should reset repetitions to 0", () => {
        const existingReview = {
          easeFactor: 2.5,
          interval: 10,
          repetitions: 5,
        };

        const result = callCalculateSM2(
          flashcardService,
          existingReview,
          "dont_know",
        );

        expect(result.repetitions).toBe(0);
      });

      it("should reset interval to 1", () => {
        const existingReview = {
          easeFactor: 2.5,
          interval: 10,
          repetitions: 5,
        };

        const result = callCalculateSM2(
          flashcardService,
          existingReview,
          "dont_know",
        );

        expect(result.interval).toBe(1);
      });

      it("should decrease easeFactor", () => {
        const existingReview = {
          easeFactor: 2.5,
          interval: 10,
          repetitions: 5,
        };

        const result = callCalculateSM2(
          flashcardService,
          existingReview,
          "dont_know",
        );

        expect(result.easeFactor).toBeLessThan(2.5);
      });

      it("should not allow easeFactor below minimum", () => {
        const existingReview = {
          easeFactor: SM2_DEFAULTS.MINIMUM_EASE_FACTOR,
          interval: 1,
          repetitions: 0,
        };

        const result = callCalculateSM2(
          flashcardService,
          existingReview,
          "dont_know",
        );

        expect(result.easeFactor).toBeGreaterThanOrEqual(
          SM2_DEFAULTS.MINIMUM_EASE_FACTOR,
        );
      });
    });

    it("should calculate nextReviewDate based on interval", () => {
      const result = callCalculateSM2(flashcardService, null, "know_it");

      const expectedDate = new Date(mockDate);
      expectedDate.setDate(expectedDate.getDate() + result.interval);

      expect(result.nextReviewDate.getTime()).toBe(expectedDate.getTime());
    });

    it("should use default values when existingReview is null", () => {
      const result = callCalculateSM2(flashcardService, null, "know_it");

      expect(result.easeFactor).toBeDefined();
      expect(result.interval).toBeDefined();
      expect(result.repetitions).toBe(1);
      expect(result.nextReviewDate).toBeInstanceOf(Date);
    });

    // Property-based test for SM-2 algorithm
    it("should always produce valid SM-2 values", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }),
          fc.double({ min: 1.3, max: 3.0 }),
          fc.integer({ min: 0, max: 20 }),
          fc.constantFrom("know_it", "learning", "dont_know"),
          (interval, easeFactor, repetitions, rating) => {
            const existingReview = { interval, easeFactor, repetitions };
            const result = callCalculateSM2(
              flashcardService,
              existingReview,
              rating as FlashcardRating,
            );

            // Invariants that should always hold
            expect(result.easeFactor).toBeGreaterThanOrEqual(
              SM2_DEFAULTS.MINIMUM_EASE_FACTOR,
            );
            expect(result.interval).toBeGreaterThanOrEqual(1);
            expect(result.repetitions).toBeGreaterThanOrEqual(0);
            expect(result.nextReviewDate).toBeInstanceOf(Date);
          },
        ),
        { numRuns: 100 },
      );
    });

    // Test edge case with very high repetitions
    it("should handle very high repetitions", () => {
      const existingReview = {
        easeFactor: 2.8,
        interval: 100,
        repetitions: 50,
      };

      const result = callCalculateSM2(
        flashcardService,
        existingReview,
        "know_it",
      );

      expect(result.repetitions).toBe(51);
      expect(result.interval).toBeGreaterThan(100);
    });

    // Test edge case with minimum ease factor
    it("should maintain minimum ease factor after multiple dont_know", () => {
      let review = {
        easeFactor: SM2_DEFAULTS.INITIAL_EASE_FACTOR,
        interval: 1,
        repetitions: 0,
      };

      // Simulate multiple dont_know responses
      for (let i = 0; i < 10; i++) {
        const result = callCalculateSM2(flashcardService, review, "dont_know");
        review = {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
        };
      }

      expect(review.easeFactor).toBeGreaterThanOrEqual(
        SM2_DEFAULTS.MINIMUM_EASE_FACTOR,
      );
    });

    // Test interval progression
    it("should follow correct interval progression", () => {
      // First review - know_it
      let result = callCalculateSM2(flashcardService, null, "know_it");
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);

      // Second review - know_it
      result = callCalculateSM2(
        flashcardService,
        {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
        },
        "know_it",
      );
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);

      // Third review - know_it (should multiply by ease factor)
      const secondEaseFactor = result.easeFactor;
      const thirdResult = callCalculateSM2(
        flashcardService,
        {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
        },
        "know_it",
      );
      // Interval is calculated using the OLD easeFactor (before update in this iteration)
      expect(thirdResult.interval).toBe(Math.round(6 * secondEaseFactor));
      expect(thirdResult.repetitions).toBe(3);
    });

    // Test edge case with invalid rating (for 100% coverage of default case)
    it("should handle invalid rating gracefully by treating as learning", () => {
      const result = callCalculateSM2(flashcardService, null, "invalid" as any);

      // Default case treats unknown ratings as quality 3 (learning)
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      expect(result.easeFactor).toBeDefined();
      expect(result.nextReviewDate).toBeInstanceOf(Date);
    });
  });
});
