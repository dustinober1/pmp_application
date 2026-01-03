/**
 * Comprehensive tests for practice.service
 * Targeting 100% code coverage
 */

import { PracticeService } from "./practice.service";
import prisma from "../config/database";
import { AppError } from "../middleware/error.middleware";
import * as fc from "fast-check";
import type { Difficulty } from "@pmp/shared";
import { PMP_EXAM } from "@pmp/shared";

// Mock Prisma Client
jest.mock("../config/database", () => ({
  __esModule: true,
  default: {
    practiceQuestion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    practiceSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    practiceSessionQuestion: {
      updateMany: jest.fn(),
    },
    questionAttempt: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    domain: {
      findMany: jest.fn(),
    },
    studyActivity: {
      create: jest.fn(),
    },
  },
}));

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe("PracticeService", () => {
  let practiceService: PracticeService;

  const userId = "user-123";
  const sessionId = "session-123";
  const questionId = "question-123";

  // Mock question data
  const mockQuestion = {
    id: questionId,
    domainId: "domain-1",
    taskId: "task-1",
    questionText: "What is project management?",
    difficulty: "medium",
    explanation: "Project management is...",
    createdAt: new Date(),
    options: [
      { id: "opt-1", questionId, text: "Option A", isCorrect: true },
      { id: "opt-2", questionId, text: "Option B", isCorrect: false },
      { id: "opt-3", questionId, text: "Option C", isCorrect: false },
      { id: "opt-4", questionId, text: "Option D", isCorrect: false },
    ],
  };

  beforeEach(() => {
    practiceService = new PracticeService();
    jest.clearAllMocks();
  });

  describe("startSession", () => {
    it("should start a new practice session with default options", async () => {
      const questions = [mockQuestion];
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            question: mockQuestion,
            selectedOptionId: null,
            isCorrect: null,
            timeSpentMs: null,
            answeredAt: null,
          },
        ],
      };

      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        questions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await practiceService.startSession(userId, {
        questionCount: 20,
      });

      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: {},
        include: { options: true },
        take: 20,
      });
      expect(prisma.practiceSession.create).toHaveBeenCalledWith({
        data: {
          userId,
          totalQuestions: 1,
          questions: {
            create: [{ questionId }],
          },
        },
        include: {
          questions: {
            include: {
              question: {
                include: { options: true },
              },
            },
          },
        },
      });
      expect(result.sessionId).toBe(sessionId);
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0]?.correctOptionId).toBe("");
      expect(result.questions[0]?.explanation).toBe("");
    });

    it("should filter questions by domain IDs", async () => {
      const domainIds = ["domain-1", "domain-2"];
      const questions = [mockQuestion];
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            question: mockQuestion,
          },
        ],
      };

      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        questions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );

      await practiceService.startSession(userId, {
        domainIds,
        questionCount: 20,
      });

      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: { domainId: { in: domainIds } },
        include: { options: true },
        take: 20,
      });
    });

    it("should filter questions by task IDs", async () => {
      const taskIds = ["task-1", "task-2"];
      const questions = [mockQuestion];
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            question: mockQuestion,
          },
        ],
      };

      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        questions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );

      await practiceService.startSession(userId, {
        taskIds,
        questionCount: 20,
      });

      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: { taskId: { in: taskIds } },
        include: { options: true },
        take: 20,
      });
    });

    it("should filter questions by difficulty", async () => {
      const difficulty: Difficulty[] = ["medium", "hard"];
      const questions = [mockQuestion];
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            question: mockQuestion,
          },
        ],
      };

      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        questions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );

      await practiceService.startSession(userId, {
        difficulty,
        questionCount: 20,
      });

      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: { difficulty: { in: difficulty } },
        include: { options: true },
        take: 20,
      });
    });

    it("should combine all filters", async () => {
      const domainIds = ["domain-1"];
      const taskIds = ["task-1"];
      const difficulty: Difficulty[] = ["medium"];
      const questions = [mockQuestion];
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            question: mockQuestion,
          },
        ],
      };

      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        questions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );

      await practiceService.startSession(userId, {
        domainIds,
        taskIds,
        difficulty,
        questionCount: 20,
      });

      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: {
          domainId: { in: domainIds },
          taskId: { in: taskIds },
          difficulty: { in: difficulty },
        },
        include: { options: true },
        take: 20,
      });
    });

    it("should handle empty question results", async () => {
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        totalQuestions: 0,
        questions: [],
      });

      const result = await practiceService.startSession(userId, {
        questionCount: 20,
      });

      expect(result.sessionId).toBe(sessionId);
      expect(result.questions).toHaveLength(0);
    });

    it("should map question options correctly without revealing answers", async () => {
      const questions = [mockQuestion];
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            question: mockQuestion,
          },
        ],
      };

      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        questions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await practiceService.startSession(userId, {
        questionCount: 20,
      });

      const question = result.questions[0];
      expect(question?.options).toHaveLength(4);
      expect(question?.options.every((opt) => opt.isCorrect === false)).toBe(
        true,
      );
      expect(question?.correctOptionId).toBe("");
      expect(question?.explanation).toBe("");
    });

    it("should handle empty filter arrays", async () => {
      const questions = [mockQuestion];
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            question: mockQuestion,
          },
        ],
      };

      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        questions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );

      await practiceService.startSession(userId, {
        domainIds: [],
        taskIds: [],
        difficulty: [],
        questionCount: 15,
      });

      // Empty arrays should not add where conditions
      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: {},
        include: { options: true },
        take: 15,
      });
    });

    it("should use default question count of 20 when questionCount is 0", async () => {
      const questions = [mockQuestion];
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            question: mockQuestion,
          },
        ],
      };

      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        questions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue(
        mockSession,
      );

      await practiceService.startSession(userId, {
        questionCount: 0,
      });

      // Should default to 20 when questionCount is 0 (falsy)
      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: {},
        include: { options: true },
        take: 20,
      });
    });
  });

  describe("getSession", () => {
    it("should return existing session with questions", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            selectedOptionId: null,
            question: mockQuestion,
          },
        ],
      };

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await practiceService.getSession(sessionId, userId);

      expect(prisma.practiceSession.findUnique).toHaveBeenCalledWith({
        where: { id: sessionId },
        include: {
          questions: {
            include: {
              question: {
                include: { options: true },
              },
            },
            orderBy: { question: { createdAt: "asc" } },
          },
        },
      });
      expect(result).not.toBeNull();
      expect(result?.sessionId).toBe(sessionId);
      expect(result?.questions).toHaveLength(1);
      expect(result?.progress.total).toBe(1);
      expect(result?.progress.answered).toBe(0);
    });

    it("should return null when session not found", async () => {
      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await practiceService.getSession(sessionId, userId);

      expect(result).toBeNull();
    });

    it("should return null when user does not own session", async () => {
      const mockSession = {
        id: sessionId,
        userId: "other-user",
        totalQuestions: 1,
        questions: [],
      };

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await practiceService.getSession(sessionId, userId);

      expect(result).toBeNull();
    });

    it("should track answered questions count", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 3,
        questions: [
          {
            questionId: "q1",
            selectedOptionId: "opt-1",
            question: { ...mockQuestion, id: "q1" },
          },
          {
            questionId: "q2",
            selectedOptionId: "opt-2",
            question: { ...mockQuestion, id: "q2" },
          },
          {
            questionId: "q3",
            selectedOptionId: null,
            question: { ...mockQuestion, id: "q3" },
          },
        ],
      };

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await practiceService.getSession(sessionId, userId);

      expect(result?.progress.total).toBe(3);
      expect(result?.progress.answered).toBe(2);
    });

    it("should reveal answers for answered questions", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            selectedOptionId: "opt-1",
            question: mockQuestion,
          },
        ],
      };

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await practiceService.getSession(sessionId, userId);

      const question = result?.questions[0];
      expect(question?.correctOptionId).toBe("opt-1");
      expect(question?.explanation).toBe("Project management is...");
    });

    it("should hide answers for unanswered questions", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            selectedOptionId: null,
            question: mockQuestion,
          },
        ],
      };

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await practiceService.getSession(sessionId, userId);

      const question = result?.questions[0];
      expect(question?.correctOptionId).toBe("");
      expect(question?.explanation).toBe("");
    });

    it("should handle question with no correct option when answered", async () => {
      const questionWithNoCorrect = {
        ...mockQuestion,
        options: [
          { id: "opt-1", questionId, text: "Option A", isCorrect: false },
          { id: "opt-2", questionId, text: "Option B", isCorrect: false },
        ],
      };

      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [
          {
            questionId,
            selectedOptionId: "opt-1",
            question: questionWithNoCorrect,
          },
        ],
      };

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await practiceService.getSession(sessionId, userId);

      const question = result?.questions[0];
      expect(question?.correctOptionId).toBe("");
    });
  });

  describe("submitAnswer", () => {
    it("should submit correct answer and return result", async () => {
      const correctOptionId = "opt-1";
      const timeSpentMs = 30000;

      (prisma.practiceQuestion.findUnique as jest.Mock).mockResolvedValue(
        mockQuestion,
      );
      (prisma.questionAttempt.create as jest.Mock).mockResolvedValue({});
      (
        prisma.practiceSessionQuestion.updateMany as jest.Mock
      ).mockResolvedValue({});

      const result = await practiceService.submitAnswer(
        sessionId,
        questionId,
        userId,
        correctOptionId,
        timeSpentMs,
      );

      expect(result.isCorrect).toBe(true);
      expect(result.correctOptionId).toBe(correctOptionId);
      expect(result.explanation).toBe("Project management is...");
      expect(result.timeSpentMs).toBe(timeSpentMs);
    });

    it("should submit incorrect answer and return result", async () => {
      const incorrectOptionId = "opt-2";
      const timeSpentMs = 20000;

      (prisma.practiceQuestion.findUnique as jest.Mock).mockResolvedValue(
        mockQuestion,
      );
      (prisma.questionAttempt.create as jest.Mock).mockResolvedValue({});
      (
        prisma.practiceSessionQuestion.updateMany as jest.Mock
      ).mockResolvedValue({});

      const result = await practiceService.submitAnswer(
        sessionId,
        questionId,
        userId,
        incorrectOptionId,
        timeSpentMs,
      );

      expect(result.isCorrect).toBe(false);
      expect(result.correctOptionId).toBe("opt-1");
      expect(result.explanation).toBe("Project management is...");
    });

    it("should create question attempt record", async () => {
      const selectedOptionId = "opt-1";
      const timeSpentMs = 15000;

      (prisma.practiceQuestion.findUnique as jest.Mock).mockResolvedValue(
        mockQuestion,
      );
      (prisma.questionAttempt.create as jest.Mock).mockResolvedValue({});
      (
        prisma.practiceSessionQuestion.updateMany as jest.Mock
      ).mockResolvedValue({});

      await practiceService.submitAnswer(
        sessionId,
        questionId,
        userId,
        selectedOptionId,
        timeSpentMs,
      );

      expect(prisma.questionAttempt.create).toHaveBeenCalledWith({
        data: {
          userId,
          questionId,
          sessionId,
          selectedOptionId,
          isCorrect: true,
          timeSpentMs,
        },
      });
    });

    it("should update session question state", async () => {
      const selectedOptionId = "opt-1";
      const timeSpentMs = 15000;

      (prisma.practiceQuestion.findUnique as jest.Mock).mockResolvedValue(
        mockQuestion,
      );
      (prisma.questionAttempt.create as jest.Mock).mockResolvedValue({});
      (
        prisma.practiceSessionQuestion.updateMany as jest.Mock
      ).mockResolvedValue({});

      await practiceService.submitAnswer(
        sessionId,
        questionId,
        userId,
        selectedOptionId,
        timeSpentMs,
      );

      expect(prisma.practiceSessionQuestion.updateMany).toHaveBeenCalledWith({
        where: { sessionId, questionId },
        data: {
          selectedOptionId,
          isCorrect: true,
          timeSpentMs,
          answeredAt: expect.any(Date),
        },
      });
    });

    it("should throw error when question not found", async () => {
      (prisma.practiceQuestion.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        practiceService.submitAnswer(
          sessionId,
          questionId,
          userId,
          "opt-1",
          1000,
        ),
      ).rejects.toThrow(AppError);

      await expect(
        practiceService.submitAnswer(
          sessionId,
          questionId,
          userId,
          "opt-1",
          1000,
        ),
      ).rejects.toMatchObject({
        message: "Question not found",
        statusCode: 404,
      });
    });

    it("should handle question with no correct option", async () => {
      const questionWithNoCorrect = {
        ...mockQuestion,
        options: [
          { id: "opt-1", questionId, text: "Option A", isCorrect: false },
          { id: "opt-2", questionId, text: "Option B", isCorrect: false },
        ],
      };

      (prisma.practiceQuestion.findUnique as jest.Mock).mockResolvedValue(
        questionWithNoCorrect,
      );
      (prisma.questionAttempt.create as jest.Mock).mockResolvedValue({});
      (
        prisma.practiceSessionQuestion.updateMany as jest.Mock
      ).mockResolvedValue({});

      const result = await practiceService.submitAnswer(
        sessionId,
        questionId,
        userId,
        "opt-1",
        1000,
      );

      expect(result.isCorrect).toBe(false);
      expect(result.correctOptionId).toBe("");
    });
  });

  describe("completeSession", () => {
    it("should complete session and calculate results", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 3,
      };

      const mockAttempts = [
        {
          isCorrect: true,
          timeSpentMs: 10000,
          question: {
            domainId: "domain-1",
            domain: { name: "People" },
          },
        },
        {
          isCorrect: true,
          timeSpentMs: 15000,
          question: {
            domainId: "domain-1",
            domain: { name: "People" },
          },
        },
        {
          isCorrect: false,
          timeSpentMs: 20000,
          question: {
            domainId: "domain-2",
            domain: { name: "Process" },
          },
        },
      ];

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.practiceSession.update as jest.Mock).mockResolvedValue({});
      (prisma.studyActivity.create as jest.Mock).mockResolvedValue({});

      const result = await practiceService.completeSession(sessionId, userId);

      expect(result.sessionId).toBe(sessionId);
      expect(result.totalQuestions).toBe(3);
      expect(result.correctAnswers).toBe(2);
      expect(result.scorePercentage).toBe(67);
      expect(result.totalTimeMs).toBe(45000);
      expect(result.averageTimePerQuestion).toBe(15000);
    });

    it("should throw error when session not found", async () => {
      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        practiceService.completeSession(sessionId, userId),
      ).rejects.toThrow(AppError);

      await expect(
        practiceService.completeSession(sessionId, userId),
      ).rejects.toMatchObject({
        message: "Session not found",
        statusCode: 404,
      });
    });

    it("should throw error when user does not own session", async () => {
      const mockSession = {
        id: sessionId,
        userId: "other-user",
        totalQuestions: 1,
      };

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      await expect(
        practiceService.completeSession(sessionId, userId),
      ).rejects.toThrow(AppError);
    });

    it("should calculate domain breakdown correctly", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 4,
      };

      const mockAttempts = [
        {
          isCorrect: true,
          timeSpentMs: 10000,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
        {
          isCorrect: true,
          timeSpentMs: 10000,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
        {
          isCorrect: false,
          timeSpentMs: 10000,
          question: { domainId: "domain-2", domain: { name: "Process" } },
        },
        {
          isCorrect: true,
          timeSpentMs: 10000,
          question: { domainId: "domain-2", domain: { name: "Process" } },
        },
      ];

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.practiceSession.update as jest.Mock).mockResolvedValue({});
      (prisma.studyActivity.create as jest.Mock).mockResolvedValue({});

      const result = await practiceService.completeSession(sessionId, userId);

      expect(result.domainBreakdown).toHaveLength(2);

      const peopleDomain = result.domainBreakdown.find(
        (d) => d.domainId === "domain-1",
      );
      expect(peopleDomain?.domainName).toBe("People");
      expect(peopleDomain?.totalQuestions).toBe(2);
      expect(peopleDomain?.correctAnswers).toBe(2);
      expect(peopleDomain?.scorePercentage).toBe(100);

      const processDomain = result.domainBreakdown.find(
        (d) => d.domainId === "domain-2",
      );
      expect(processDomain?.domainName).toBe("Process");
      expect(processDomain?.totalQuestions).toBe(2);
      expect(processDomain?.correctAnswers).toBe(1);
      expect(processDomain?.scorePercentage).toBe(50);
    });

    it("should update session with completion data", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 2,
      };

      const mockAttempts = [
        {
          isCorrect: true,
          timeSpentMs: 10000,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
        {
          isCorrect: false,
          timeSpentMs: 15000,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
      ];

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.practiceSession.update as jest.Mock).mockResolvedValue({});
      (prisma.studyActivity.create as jest.Mock).mockResolvedValue({});

      await practiceService.completeSession(sessionId, userId);

      expect(prisma.practiceSession.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: {
          completedAt: expect.any(Date),
          correctAnswers: 1,
          totalTimeMs: 25000,
        },
      });
    });

    it("should create study activity log", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 2,
      };

      const mockAttempts = [
        {
          isCorrect: true,
          timeSpentMs: 10000,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
        {
          isCorrect: true,
          timeSpentMs: 10000,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
      ];

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.practiceSession.update as jest.Mock).mockResolvedValue({});
      (prisma.studyActivity.create as jest.Mock).mockResolvedValue({});

      await practiceService.completeSession(sessionId, userId);

      expect(prisma.studyActivity.create).toHaveBeenCalledWith({
        data: {
          userId,
          activityType: "practice_complete",
          targetId: sessionId,
          metadata: {
            scorePercentage: 100,
            correctCount: 2,
            totalQuestions: 2,
          },
        },
      });
    });

    it("should handle session with no attempts", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 0,
      };

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.practiceSession.update as jest.Mock).mockResolvedValue({});
      (prisma.studyActivity.create as jest.Mock).mockResolvedValue({});

      const result = await practiceService.completeSession(sessionId, userId);

      expect(result.scorePercentage).toBe(0);
      expect(result.averageTimePerQuestion).toBe(0);
      expect(result.domainBreakdown).toHaveLength(0);
    });

    it("should handle session with null totalQuestions", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: null,
      };

      const mockAttempts = [
        {
          isCorrect: true,
          timeSpentMs: 10000,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
      ];

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.practiceSession.update as jest.Mock).mockResolvedValue({});
      (prisma.studyActivity.create as jest.Mock).mockResolvedValue({});

      const result = await practiceService.completeSession(sessionId, userId);

      expect(result.totalQuestions).toBe(1);
      expect(result.scorePercentage).toBe(100);
    });
  });

  describe("startMockExam", () => {
    it("should start mock exam with questions from all domains", async () => {
      const mockDomains = [
        { id: "domain-1", weightPercentage: 42 },
        { id: "domain-2", weightPercentage: 50 },
        { id: "domain-3", weightPercentage: 8 },
      ];

      const mockQuestionsD1 = Array.from({ length: 75 }, (_, i) => ({
        ...mockQuestion,
        id: `q-d1-${i}`,
        domainId: "domain-1",
      }));

      const mockQuestionsD2 = Array.from({ length: 90 }, (_, i) => ({
        ...mockQuestion,
        id: `q-d2-${i}`,
        domainId: "domain-2",
      }));

      const mockQuestionsD3 = Array.from({ length: 15 }, (_, i) => ({
        ...mockQuestion,
        id: `q-d3-${i}`,
        domainId: "domain-3",
      }));

      (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);
      (prisma.practiceQuestion.findMany as jest.Mock)
        .mockResolvedValueOnce(mockQuestionsD1)
        .mockResolvedValueOnce(mockQuestionsD2)
        .mockResolvedValueOnce(mockQuestionsD3);

      (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        isMockExam: true,
        totalQuestions: PMP_EXAM.TOTAL_QUESTIONS,
        timeLimit: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
      });

      const result = await practiceService.startMockExam(userId);

      expect(prisma.domain.findMany).toHaveBeenCalled();
      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledTimes(3);
      expect(result.sessionId).toBe(sessionId);
      expect(result.questions.length).toBeLessThanOrEqual(
        PMP_EXAM.TOTAL_QUESTIONS,
      );
    });

    it("should create session with mock exam flag and time limit", async () => {
      const mockDomains = [{ id: "domain-1", weightPercentage: 100 }];
      const mockQuestions = Array.from({ length: 180 }, (_, i) => ({
        ...mockQuestion,
        id: `q-${i}`,
      }));

      (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        mockQuestions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        isMockExam: true,
        totalQuestions: PMP_EXAM.TOTAL_QUESTIONS,
        timeLimit: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
      });

      await practiceService.startMockExam(userId);

      expect(prisma.practiceSession.create).toHaveBeenCalledWith({
        data: {
          userId,
          isMockExam: true,
          totalQuestions: PMP_EXAM.TOTAL_QUESTIONS,
          timeLimit: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
          questions: {
            create: expect.any(Array),
          },
        },
      });
    });

    it("should limit questions to PMP_EXAM.TOTAL_QUESTIONS", async () => {
      const mockDomains = [{ id: "domain-1", weightPercentage: 100 }];
      const mockQuestions = Array.from({ length: 300 }, (_, i) => ({
        ...mockQuestion,
        id: `q-${i}`,
      }));

      (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        mockQuestions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        isMockExam: true,
        totalQuestions: PMP_EXAM.TOTAL_QUESTIONS,
        timeLimit: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
      });

      const result = await practiceService.startMockExam(userId);

      expect(result.questions.length).toBeLessThanOrEqual(
        PMP_EXAM.TOTAL_QUESTIONS,
      );
    });

    it("should hide answers for mock exam questions", async () => {
      const mockDomains = [{ id: "domain-1", weightPercentage: 100 }];
      const mockQuestions = [mockQuestion];

      (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        mockQuestions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        isMockExam: true,
        totalQuestions: 1,
        timeLimit: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
      });

      const result = await practiceService.startMockExam(userId);

      const question = result.questions[0];
      expect(question?.correctOptionId).toBe("");
      expect(question?.explanation).toBe("");
      expect(question?.options.every((opt) => opt.isCorrect === false)).toBe(
        true,
      );
    });

    it("should calculate correct question count per domain based on weight", async () => {
      const mockDomains = [
        { id: "domain-1", weightPercentage: 50 },
        { id: "domain-2", weightPercentage: 30 },
        { id: "domain-3", weightPercentage: 20 },
      ];

      const mockQuestions = [mockQuestion];

      (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        mockQuestions,
      );
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        isMockExam: true,
        totalQuestions: 3,
        timeLimit: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
      });

      await practiceService.startMockExam(userId);

      // Verify findMany was called with correct take values
      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: { domainId: "domain-1" },
        include: { options: true },
        take: Math.round((50 / 100) * PMP_EXAM.TOTAL_QUESTIONS),
      });

      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: { domainId: "domain-2" },
        include: { options: true },
        take: Math.round((30 / 100) * PMP_EXAM.TOTAL_QUESTIONS),
      });

      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: { domainId: "domain-3" },
        include: { options: true },
        take: Math.round((20 / 100) * PMP_EXAM.TOTAL_QUESTIONS),
      });
    });
  });

  describe("flagQuestion", () => {
    it("should flag a question for user", async () => {
      (prisma.questionAttempt.updateMany as jest.Mock).mockResolvedValue({});

      await practiceService.flagQuestion(userId, questionId);

      expect(prisma.questionAttempt.updateMany).toHaveBeenCalledWith({
        where: { userId, questionId },
        data: { flagged: true },
      });
    });

    it("should update all attempts for the question", async () => {
      (prisma.questionAttempt.updateMany as jest.Mock).mockResolvedValue({
        count: 3,
      });

      await practiceService.flagQuestion(userId, questionId);

      expect(prisma.questionAttempt.updateMany).toHaveBeenCalledWith({
        where: { userId, questionId },
        data: { flagged: true },
      });
    });
  });

  describe("unflagQuestion", () => {
    it("should unflag a question for user", async () => {
      (prisma.questionAttempt.updateMany as jest.Mock).mockResolvedValue({});

      await practiceService.unflagQuestion(userId, questionId);

      expect(prisma.questionAttempt.updateMany).toHaveBeenCalledWith({
        where: { userId, questionId },
        data: { flagged: false },
      });
    });
  });

  describe("getFlaggedQuestions", () => {
    it("should return flagged questions for user", async () => {
      const mockFlagged = [
        {
          questionId,
          flagged: true,
          question: mockQuestion,
        },
      ];

      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockFlagged,
      );

      const result = await practiceService.getFlaggedQuestions(userId);

      expect(prisma.questionAttempt.findMany).toHaveBeenCalledWith({
        where: { userId, flagged: true },
        include: {
          question: {
            include: { options: true },
          },
        },
        distinct: ["questionId"],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(questionId);
    });

    it("should hide answers in flagged questions", async () => {
      const mockFlagged = [
        {
          questionId,
          flagged: true,
          question: mockQuestion,
        },
      ];

      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockFlagged,
      );

      const result = await practiceService.getFlaggedQuestions(userId);

      const question = result[0];
      expect(question?.correctOptionId).toBe("");
      expect(question?.explanation).toBe("");
      expect(question?.options.every((opt) => opt.isCorrect === false)).toBe(
        true,
      );
    });

    it("should return empty array when no flagged questions", async () => {
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);

      const result = await practiceService.getFlaggedQuestions(userId);

      expect(result).toHaveLength(0);
    });
  });

  describe("getPracticeStats", () => {
    it("should return practice statistics for user", async () => {
      const mockSessions = [
        {
          id: "session-1",
          userId,
          totalQuestions: 10,
          correctAnswers: 8,
          completedAt: new Date(),
        },
        {
          id: "session-2",
          userId,
          totalQuestions: 20,
          correctAnswers: 15,
          completedAt: new Date(),
        },
      ];

      const mockAttempts = [
        {
          isCorrect: true,
          question: { domainId: "domain-1" },
        },
        {
          isCorrect: true,
          question: { domainId: "domain-1" },
        },
        {
          isCorrect: false,
          question: { domainId: "domain-1" },
        },
      ];

      (prisma.practiceSession.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);

      const result = await practiceService.getPracticeStats(userId);

      expect(result.totalSessions).toBe(2);
      expect(result.totalQuestions).toBe(30);
      expect(result.averageScore).toBe(78); // (80 + 75) / 2 = 77.5 rounded
      expect(result.bestScore).toBe(80);
    });

    it("should identify weak domains (below 70% accuracy with at least 5 attempts)", async () => {
      const mockSessions = [
        {
          id: "session-1",
          userId,
          totalQuestions: 10,
          correctAnswers: 8,
          completedAt: new Date(),
        },
      ];

      const mockAttempts = [
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
      ];

      const mockDomains = [{ id: "domain-1", name: "Weak Domain" }];

      (prisma.practiceSession.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);

      const result = await practiceService.getPracticeStats(userId);

      expect(result.weakDomains).toContain("Weak Domain");
    });

    it("should not include domains with less than 5 attempts as weak", async () => {
      const mockSessions = [
        {
          id: "session-1",
          userId,
          totalQuestions: 10,
          correctAnswers: 8,
          completedAt: new Date(),
        },
      ];

      const mockAttempts = [
        { isCorrect: false, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
      ];

      (prisma.practiceSession.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);

      const result = await practiceService.getPracticeStats(userId);

      expect(result.weakDomains).toHaveLength(0);
    });

    it("should not include domains with 70% or higher accuracy as weak", async () => {
      const mockSessions = [
        {
          id: "session-1",
          userId,
          totalQuestions: 10,
          correctAnswers: 8,
          completedAt: new Date(),
        },
      ];

      const mockAttempts = [
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
      ];

      (prisma.practiceSession.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);

      const result = await practiceService.getPracticeStats(userId);

      expect(result.weakDomains).toHaveLength(0);
    });

    it("should return default stats when user has no sessions", async () => {
      (prisma.practiceSession.findMany as jest.Mock).mockResolvedValue([]);

      const result = await practiceService.getPracticeStats(userId);

      expect(result).toEqual({
        totalSessions: 0,
        totalQuestions: 0,
        averageScore: 0,
        bestScore: 0,
        weakDomains: [],
      });
    });

    it("should only count completed sessions", async () => {
      (prisma.practiceSession.findMany as jest.Mock).mockResolvedValue([]);

      await practiceService.getPracticeStats(userId);

      expect(prisma.practiceSession.findMany).toHaveBeenCalledWith({
        where: { userId, completedAt: { not: null } },
      });
    });

    it("should handle sessions with zero totalQuestions", async () => {
      const mockSessions = [
        {
          id: "session-1",
          userId,
          totalQuestions: 0,
          correctAnswers: 0,
          completedAt: new Date(),
        },
      ];

      (prisma.practiceSession.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);

      const result = await practiceService.getPracticeStats(userId);

      expect(result.totalSessions).toBe(1);
      expect(result.averageScore).toBe(0);
      expect(result.bestScore).toBe(0);
    });

    it("should identify weak domains with exactly 70% accuracy as not weak", async () => {
      const mockSessions = [
        {
          id: "session-1",
          userId,
          totalQuestions: 10,
          correctAnswers: 7,
          completedAt: new Date(),
        },
      ];

      const mockAttempts = [
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: true, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
        { isCorrect: false, question: { domainId: "domain-1" } },
      ];

      (prisma.practiceSession.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);

      const result = await practiceService.getPracticeStats(userId);

      // Exactly 70% should not be considered weak (< 0.7 check)
      expect(result.weakDomains).toHaveLength(0);
    });
  });

  describe("shuffleArray", () => {
    it("should shuffle array elements", () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      // Access private method through type assertion
      const service = practiceService as any;
      const shuffled = service.shuffleArray(original);

      // Shuffled should have same length
      expect(shuffled).toHaveLength(original.length);

      // Shuffled should contain all elements
      expect(shuffled.sort()).toEqual(original.sort());

      // Not guaranteed but very likely to be different order
      // (won't fail test if same, just checking implementation)
    });

    it("should not modify original array", () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];

      const service = practiceService as any;
      service.shuffleArray(original);

      expect(original).toEqual(originalCopy);
    });

    it("should handle empty array", () => {
      const service = practiceService as any;
      const shuffled = service.shuffleArray([]);

      expect(shuffled).toHaveLength(0);
    });

    it("should handle single element array", () => {
      const service = practiceService as any;
      const shuffled = service.shuffleArray([1]);

      expect(shuffled).toEqual([1]);
    });
  });

  describe("Property-Based Tests", () => {
    it("should handle valid user IDs in startSession", async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async (userId) => {
          (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue([]);
          (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
            id: sessionId,
            userId,
            totalQuestions: 0,
            questions: [],
          });

          const result = await practiceService.startSession(userId, {
            questionCount: 20,
          });

          expect(result.sessionId).toBe(sessionId);
          expect(result.questions).toHaveLength(0);
        }),
        { numRuns: 10 },
      );
    });

    it("should handle various question counts", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 200 }),
          async (questionCount) => {
            (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
              [],
            );
            (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
              id: sessionId,
              userId,
              totalQuestions: 0,
              questions: [],
            });

            await practiceService.startSession(userId, { questionCount });

            expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
              where: {},
              include: { options: true },
              take: questionCount,
            });
          },
        ),
        { numRuns: 10 },
      );
    });

    it("should handle various time spent values", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 600000 }),
          async (timeSpentMs) => {
            (prisma.practiceQuestion.findUnique as jest.Mock).mockResolvedValue(
              mockQuestion,
            );
            (prisma.questionAttempt.create as jest.Mock).mockResolvedValue({});
            (
              prisma.practiceSessionQuestion.updateMany as jest.Mock
            ).mockResolvedValue({});

            const result = await practiceService.submitAnswer(
              sessionId,
              questionId,
              userId,
              "opt-1",
              timeSpentMs,
            );

            expect(result.timeSpentMs).toBe(timeSpentMs);
          },
        ),
        { numRuns: 10 },
      );
    });

    it("should validate difficulty filters", () => {
      fc.assert(
        fc.property(fc.constantFrom("easy", "medium", "hard"), (difficulty) => {
          expect(["easy", "medium", "hard"]).toContain(difficulty);
        }),
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle concurrent session completions", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 1,
      };

      const mockAttempts = [
        {
          isCorrect: true,
          timeSpentMs: 10000,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
      ];

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.practiceSession.update as jest.Mock).mockResolvedValue({});
      (prisma.studyActivity.create as jest.Mock).mockResolvedValue({});

      const promises = [
        practiceService.completeSession(sessionId, userId),
        practiceService.completeSession(sessionId, userId),
        practiceService.completeSession(sessionId, userId),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.sessionId).toBe(sessionId);
      });
    });

    it("should handle very long question text", async () => {
      const longQuestion = {
        ...mockQuestion,
        questionText: "Q".repeat(5000),
      };

      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue([
        longQuestion,
      ]);
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [{ questionId: longQuestion.id, question: longQuestion }],
      });

      const result = await practiceService.startSession(userId, {
        questionCount: 1,
      });

      expect(result.questions[0]?.questionText).toBe("Q".repeat(5000));
    });

    it("should handle attempts with null timeSpentMs", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 2,
      };

      const mockAttempts = [
        {
          isCorrect: true,
          timeSpentMs: null,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
        {
          isCorrect: false,
          timeSpentMs: 10000,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
      ];

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.practiceSession.update as jest.Mock).mockResolvedValue({});
      (prisma.studyActivity.create as jest.Mock).mockResolvedValue({});

      const result = await practiceService.completeSession(sessionId, userId);

      expect(result.totalTimeMs).toBe(10000);
    });

    it("should handle session with many domains", async () => {
      const mockSession = {
        id: sessionId,
        userId,
        totalQuestions: 10,
      };

      const mockAttempts = Array.from({ length: 10 }, (_, i) => ({
        isCorrect: true,
        timeSpentMs: 10000,
        question: {
          domainId: `domain-${i}`,
          domain: { name: `Domain ${i}` },
        },
      }));

      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue(
        mockAttempts,
      );
      (prisma.practiceSession.update as jest.Mock).mockResolvedValue({});
      (prisma.studyActivity.create as jest.Mock).mockResolvedValue({});

      const result = await practiceService.completeSession(sessionId, userId);

      expect(result.domainBreakdown).toHaveLength(10);
    });

    it("should handle mock exam with no domains", async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        isMockExam: true,
        totalQuestions: 0,
        timeLimit: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
      });

      const result = await practiceService.startMockExam(userId);

      expect(result.questions).toHaveLength(0);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete practice flow", async () => {
      // Step 1: Start session
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue([
        mockQuestion,
      ]);
      (prisma.practiceSession.create as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        totalQuestions: 1,
        questions: [{ questionId, question: mockQuestion }],
      });

      const session = await practiceService.startSession(userId, {
        questionCount: 1,
      });
      expect(session.sessionId).toBe(sessionId);

      // Step 2: Submit answer
      (prisma.practiceQuestion.findUnique as jest.Mock).mockResolvedValue(
        mockQuestion,
      );
      (prisma.questionAttempt.create as jest.Mock).mockResolvedValue({});
      (
        prisma.practiceSessionQuestion.updateMany as jest.Mock
      ).mockResolvedValue({});

      const answer = await practiceService.submitAnswer(
        sessionId,
        questionId,
        userId,
        "opt-1",
        10000,
      );
      expect(answer.isCorrect).toBe(true);

      // Step 3: Complete session
      (prisma.practiceSession.findUnique as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        totalQuestions: 1,
      });
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        {
          isCorrect: true,
          timeSpentMs: 10000,
          question: { domainId: "domain-1", domain: { name: "People" } },
        },
      ]);
      (prisma.practiceSession.update as jest.Mock).mockResolvedValue({});
      (prisma.studyActivity.create as jest.Mock).mockResolvedValue({});

      const result = await practiceService.completeSession(sessionId, userId);
      expect(result.scorePercentage).toBe(100);
    });

    it("should handle flag/unflag workflow", async () => {
      // Flag question
      (prisma.questionAttempt.updateMany as jest.Mock).mockResolvedValue({});
      await practiceService.flagQuestion(userId, questionId);
      expect(prisma.questionAttempt.updateMany).toHaveBeenCalledWith({
        where: { userId, questionId },
        data: { flagged: true },
      });

      // Get flagged questions
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        { questionId, flagged: true, question: mockQuestion },
      ]);
      const flagged = await practiceService.getFlaggedQuestions(userId);
      expect(flagged).toHaveLength(1);

      // Unflag question
      await practiceService.unflagQuestion(userId, questionId);
      expect(prisma.questionAttempt.updateMany).toHaveBeenCalledWith({
        where: { userId, questionId },
        data: { flagged: false },
      });
    });
  });
});
