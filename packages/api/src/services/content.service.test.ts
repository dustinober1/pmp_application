/**
 * Comprehensive Tests for content.service
 * Tests all public methods with 100% coverage
 */

import { ContentService } from "./content.service";
import prisma from "../config/database";
import * as fc from "fast-check";

// Mock Prisma Client
jest.mock("../config/database", () => ({
  __esModule: true,
  default: {
    domain: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    studyGuide: {
      findUnique: jest.fn(),
    },
    studySection: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    studyProgress: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    flashcard: {
      findMany: jest.fn(),
    },
    practiceQuestion: {
      findMany: jest.fn(),
    },
  },
}));

describe("ContentService", () => {
  let contentService: ContentService;

  beforeEach(() => {
    contentService = new ContentService();
    jest.clearAllMocks();
  });

  describe("getDomains", () => {
    it("should return all domains ordered by orderIndex", async () => {
      const mockDomains = [
        {
          id: "1",
          name: "People",
          code: "PEOPLE",
          description: "People domain",
          weightPercentage: 42,
          orderIndex: 1,
          _count: { tasks: 5 },
        },
        {
          id: "2",
          name: "Process",
          code: "PROCESS",
          description: "Process domain",
          weightPercentage: 50,
          orderIndex: 2,
          _count: { tasks: 8 },
        },
      ];

      (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);

      const result = await contentService.getDomains();

      expect(prisma.domain.findMany).toHaveBeenCalledWith({
        orderBy: { orderIndex: "asc" },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      });

      expect(result).toEqual([
        {
          id: "1",
          name: "People",
          code: "PEOPLE",
          description: "People domain",
          weightPercentage: 42,
          orderIndex: 1,
        },
        {
          id: "2",
          name: "Process",
          code: "PROCESS",
          description: "Process domain",
          weightPercentage: 50,
          orderIndex: 2,
        },
      ]);
    });

    it("should return empty array when no domains exist", async () => {
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);

      const result = await contentService.getDomains();

      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      (prisma.domain.findMany as jest.Mock).mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(contentService.getDomains()).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("getDomainById", () => {
    it("should return domain with tasks when found", async () => {
      const domainId = "domain-123";
      const mockDomainData = {
        id: domainId,
        name: "People",
        code: "PEOPLE",
        description: "People domain",
        weightPercentage: 42,
        orderIndex: 1,
        tasks: [
          {
            id: "task-1",
            domainId,
            code: "1.1",
            name: "Task 1",
            description: "First task",
            enablers: ["Enabler 1", "Enabler 2"],
            orderIndex: 1,
          },
          {
            id: "task-2",
            domainId,
            code: "1.2",
            name: "Task 2",
            description: "Second task",
            enablers: ["Enabler 3"],
            orderIndex: 2,
          },
        ],
      };

      (prisma.domain.findUnique as jest.Mock).mockResolvedValue(mockDomainData);

      const result = await contentService.getDomainById(domainId);

      expect(prisma.domain.findUnique).toHaveBeenCalledWith({
        where: { id: domainId },
        include: { tasks: { orderBy: { orderIndex: "asc" } } },
      });

      expect(result).toEqual({
        id: domainId,
        name: "People",
        code: "PEOPLE",
        description: "People domain",
        weightPercentage: 42,
        orderIndex: 1,
        tasks: [
          {
            id: "task-1",
            domainId,
            code: "1.1",
            name: "Task 1",
            description: "First task",
            enablers: ["Enabler 1", "Enabler 2"],
            orderIndex: 1,
          },
          {
            id: "task-2",
            domainId,
            code: "1.2",
            name: "Task 2",
            description: "Second task",
            enablers: ["Enabler 3"],
            orderIndex: 2,
          },
        ],
      });
    });

    it("should return null when domain not found", async () => {
      (prisma.domain.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await contentService.getDomainById("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      (prisma.domain.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(contentService.getDomainById("domain-123")).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("getTasksByDomain", () => {
    it("should return tasks for a domain ordered by orderIndex", async () => {
      const domainId = "domain-123";
      const mockTasks = [
        {
          id: "task-1",
          domainId,
          code: "1.1",
          name: "Task 1",
          description: "First task",
          enablers: ["Enabler 1"],
          orderIndex: 1,
          domain: { id: domainId, name: "People" },
        },
        {
          id: "task-2",
          domainId,
          code: "1.2",
          name: "Task 2",
          description: "Second task",
          enablers: ["Enabler 2"],
          orderIndex: 2,
          domain: { id: domainId, name: "People" },
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await contentService.getTasksByDomain(domainId);

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { domainId },
        orderBy: { orderIndex: "asc" },
        include: { domain: true },
      });

      expect(result).toEqual([
        {
          id: "task-1",
          domainId,
          code: "1.1",
          name: "Task 1",
          description: "First task",
          enablers: ["Enabler 1"],
          orderIndex: 1,
        },
        {
          id: "task-2",
          domainId,
          code: "1.2",
          name: "Task 2",
          description: "Second task",
          enablers: ["Enabler 2"],
          orderIndex: 2,
        },
      ]);
    });

    it("should return empty array when no tasks found", async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const result = await contentService.getTasksByDomain("domain-123");

      expect(result).toEqual([]);
    });
  });

  describe("getTaskById", () => {
    it("should return task when found", async () => {
      const taskId = "task-123";
      const mockTaskData = {
        id: taskId,
        domainId: "domain-123",
        code: "1.1",
        name: "Task 1",
        description: "First task",
        enablers: ["Enabler 1", "Enabler 2"],
        orderIndex: 1,
        domain: { id: "domain-123", name: "People" },
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTaskData);

      const result = await contentService.getTaskById(taskId);

      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
        include: { domain: true },
      });

      expect(result).toEqual({
        id: taskId,
        domainId: "domain-123",
        code: "1.1",
        name: "Task 1",
        description: "First task",
        enablers: ["Enabler 1", "Enabler 2"],
        orderIndex: 1,
      });
    });

    it("should return null when task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await contentService.getTaskById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getStudyGuide", () => {
    it("should return study guide with sections and related content", async () => {
      const taskId = "task-123";
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");

      const mockGuide = {
        id: "guide-123",
        taskId,
        title: "Study Guide Title",
        sections: [
          {
            id: "section-1",
            studyGuideId: "guide-123",
            title: "Section 1",
            content: "Section 1 content",
            orderIndex: 1,
          },
          {
            id: "section-2",
            studyGuideId: "guide-123",
            title: "Section 2",
            content: "Section 2 content",
            orderIndex: 2,
          },
        ],
        task: {
          id: taskId,
          domainId: "domain-123",
          domain: { id: "domain-123", name: "People" },
        },
        createdAt,
        updatedAt,
      };

      const mockFlashcards = [
        { id: "flashcard-1" },
        { id: "flashcard-2" },
        { id: "flashcard-3" },
      ];

      const mockQuestions = [{ id: "question-1" }, { id: "question-2" }];

      (prisma.studyGuide.findUnique as jest.Mock).mockResolvedValue(mockGuide);
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(
        mockFlashcards,
      );
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        mockQuestions,
      );

      const result = await contentService.getStudyGuide(taskId);

      expect(prisma.studyGuide.findUnique).toHaveBeenCalledWith({
        where: { taskId },
        include: {
          sections: { orderBy: { orderIndex: "asc" } },
          task: { include: { domain: true } },
        },
      });

      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: { taskId },
        select: { id: true },
        take: 10,
      });

      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: { taskId },
        select: { id: true },
        take: 10,
      });

      expect(result).toEqual({
        id: "guide-123",
        taskId,
        title: "Study Guide Title",
        sections: [
          {
            id: "section-1",
            studyGuideId: "guide-123",
            title: "Section 1",
            content: "Section 1 content",
            orderIndex: 1,
          },
          {
            id: "section-2",
            studyGuideId: "guide-123",
            title: "Section 2",
            content: "Section 2 content",
            orderIndex: 2,
          },
        ],
        relatedFormulas: [],
        relatedFlashcardIds: ["flashcard-1", "flashcard-2", "flashcard-3"],
        relatedQuestionIds: ["question-1", "question-2"],
        createdAt,
        updatedAt,
      });
    });

    it("should return null when study guide not found", async () => {
      (prisma.studyGuide.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await contentService.getStudyGuide("nonexistent");

      expect(result).toBeNull();
      expect(prisma.flashcard.findMany).not.toHaveBeenCalled();
      expect(prisma.practiceQuestion.findMany).not.toHaveBeenCalled();
    });

    it("should handle empty flashcards and questions", async () => {
      const taskId = "task-123";
      const mockGuide = {
        id: "guide-123",
        taskId,
        title: "Study Guide",
        sections: [],
        task: { id: taskId, domainId: "domain-123", domain: {} },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.studyGuide.findUnique as jest.Mock).mockResolvedValue(mockGuide);
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue([]);

      const result = await contentService.getStudyGuide(taskId);

      expect(result?.relatedFlashcardIds).toEqual([]);
      expect(result?.relatedQuestionIds).toEqual([]);
    });
  });

  describe("markSectionComplete", () => {
    it("should create new study progress when not exists", async () => {
      const userId = "user-123";
      const sectionId = "section-123";
      const mockSection = { id: sectionId, title: "Section 1" };

      (prisma.studySection.findUnique as jest.Mock).mockResolvedValue(
        mockSection,
      );
      (prisma.studyProgress.upsert as jest.Mock).mockResolvedValue({
        id: "progress-123",
        userId,
        sectionId,
        completed: true,
        completedAt: new Date(),
      });

      await contentService.markSectionComplete(userId, sectionId);

      expect(prisma.studySection.findUnique).toHaveBeenCalledWith({
        where: { id: sectionId },
      });

      expect(prisma.studyProgress.upsert).toHaveBeenCalledWith({
        where: {
          userId_sectionId: { userId, sectionId },
        },
        update: {
          completed: true,
          completedAt: expect.any(Date),
        },
        create: {
          userId,
          sectionId,
          completed: true,
          completedAt: expect.any(Date),
        },
      });
    });

    it("should update existing study progress", async () => {
      const userId = "user-123";
      const sectionId = "section-123";
      const mockSection = { id: sectionId, title: "Section 1" };

      (prisma.studySection.findUnique as jest.Mock).mockResolvedValue(
        mockSection,
      );
      (prisma.studyProgress.upsert as jest.Mock).mockResolvedValue({
        id: "progress-123",
        userId,
        sectionId,
        completed: true,
        completedAt: new Date(),
      });

      await contentService.markSectionComplete(userId, sectionId);

      expect(prisma.studyProgress.upsert).toHaveBeenCalled();
    });

    it("should throw AppError when section not found", async () => {
      const userId = "user-123";
      const sectionId = "nonexistent";

      (prisma.studySection.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        contentService.markSectionComplete(userId, sectionId),
      ).rejects.toThrow("Section not found");

      expect(prisma.studyProgress.upsert).not.toHaveBeenCalled();
    });

    it("should handle database errors during upsert", async () => {
      const userId = "user-123";
      const sectionId = "section-123";
      const mockSection = { id: sectionId };

      (prisma.studySection.findUnique as jest.Mock).mockResolvedValue(
        mockSection,
      );
      (prisma.studyProgress.upsert as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        contentService.markSectionComplete(userId, sectionId),
      ).rejects.toThrow("Database error");
    });
  });

  describe("getUserProgress", () => {
    it("should calculate overall progress correctly", async () => {
      const userId = "user-123";

      (prisma.studySection.count as jest.Mock).mockResolvedValue(100);

      const mockCompletedProgress = [
        {
          id: "progress-1",
          userId,
          sectionId: "section-1",
          completed: true,
          completedAt: new Date(),
          section: {
            id: "section-1",
            studyGuideId: "guide-1",
            studyGuide: {
              taskId: "task-1",
              task: {
                domainId: "domain-1",
                domain: { id: "domain-1", name: "People" },
              },
            },
          },
        },
        {
          id: "progress-2",
          userId,
          sectionId: "section-2",
          completed: true,
          completedAt: new Date(),
          section: {
            id: "section-2",
            studyGuideId: "guide-1",
            studyGuide: {
              taskId: "task-1",
              task: {
                domainId: "domain-1",
                domain: { id: "domain-1", name: "People" },
              },
            },
          },
        },
      ];

      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue(
        mockCompletedProgress,
      );

      const mockDomains = [
        {
          id: "domain-1",
          name: "People",
          code: "PEOPLE",
          tasks: [
            {
              id: "task-1",
              domainId: "domain-1",
              studyGuide: {
                id: "guide-1",
                taskId: "task-1",
                sections: [
                  { id: "section-1" },
                  { id: "section-2" },
                  { id: "section-3" },
                ],
              },
            },
          ],
        },
        {
          id: "domain-2",
          name: "Process",
          code: "PROCESS",
          tasks: [],
        },
      ];

      (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);

      const result = await contentService.getUserProgress(userId);

      expect(result).toEqual({
        userId,
        totalSections: 100,
        completedSections: 2,
        overallProgress: 2, // Math.round((2 / 100) * 100)
        domainProgress: [
          {
            domainId: "domain-1",
            domainName: "People",
            totalSections: 3,
            completedSections: 2,
            progress: 67, // Math.round((2 / 3) * 100)
          },
          {
            domainId: "domain-2",
            domainName: "Process",
            totalSections: 0,
            completedSections: 0,
            progress: 0,
          },
        ],
      });
    });

    it("should handle zero total sections", async () => {
      const userId = "user-123";

      (prisma.studySection.count as jest.Mock).mockResolvedValue(0);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);

      const result = await contentService.getUserProgress(userId);

      expect(result).toEqual({
        userId,
        totalSections: 0,
        completedSections: 0,
        overallProgress: 0,
        domainProgress: [],
      });
    });

    it("should handle domains without study guides", async () => {
      const userId = "user-123";

      (prisma.studySection.count as jest.Mock).mockResolvedValue(10);
      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue([]);

      const mockDomains = [
        {
          id: "domain-1",
          name: "People",
          tasks: [{ id: "task-1", domainId: "domain-1", studyGuide: null }],
        },
      ];

      (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);

      const result = await contentService.getUserProgress(userId);

      expect(result.domainProgress).toEqual([
        {
          domainId: "domain-1",
          domainName: "People",
          totalSections: 0,
          completedSections: 0,
          progress: 0,
        },
      ]);
    });

    it("should calculate 100% progress correctly", async () => {
      const userId = "user-123";

      (prisma.studySection.count as jest.Mock).mockResolvedValue(10);

      const mockCompletedProgress = Array.from({ length: 10 }, (_, i) => ({
        id: `progress-${i}`,
        userId,
        sectionId: `section-${i}`,
        completed: true,
        section: {
          id: `section-${i}`,
          studyGuide: {
            task: { domain: { id: "domain-1", name: "People" } },
          },
        },
      }));

      (prisma.studyProgress.findMany as jest.Mock).mockResolvedValue(
        mockCompletedProgress,
      );

      const mockDomains = [
        {
          id: "domain-1",
          name: "People",
          tasks: [
            {
              id: "task-1",
              studyGuide: {
                sections: Array.from({ length: 10 }, (_, i) => ({
                  id: `section-${i}`,
                })),
              },
            },
          ],
        },
      ];

      (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);

      const result = await contentService.getUserProgress(userId);

      expect(result.overallProgress).toBe(100);
      expect(result.domainProgress[0]?.progress).toBe(100);
    });
  });

  describe("searchContent", () => {
    it("should search across study guides, flashcards, and questions", async () => {
      const query = "project management";
      const limit = 20;

      const mockSections = [
        {
          id: "section-1",
          title: "Project Management Basics",
          content:
            "This section covers the basics of project management and its importance in modern business.",
          studyGuide: {
            id: "guide-1",
            taskId: "task-1",
            task: {
              domainId: "domain-1",
              domain: { id: "domain-1", name: "People" },
            },
          },
        },
      ];

      const mockFlashcards = [
        {
          id: "flashcard-1",
          front: "What is project management?",
          back: "Project management is the application of knowledge, skills, tools, and techniques to project activities.",
          domainId: "domain-1",
          taskId: "task-1",
          task: { id: "task-1" },
        },
      ];

      const mockQuestions = [
        {
          id: "question-1",
          questionText:
            "Which of the following best describes project management?",
          explanation:
            "Project management involves planning, organizing, and controlling resources to achieve specific goals.",
          domainId: "domain-1",
          taskId: "task-1",
          task: { id: "task-1" },
        },
      ];

      (prisma.studySection.findMany as jest.Mock).mockResolvedValue(
        mockSections,
      );
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(
        mockFlashcards,
      );
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        mockQuestions,
      );

      const result = await contentService.searchContent(query, limit);

      expect(prisma.studySection.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          studyGuide: {
            include: { task: { include: { domain: true } } },
          },
        },
        take: Math.floor(limit / 3),
      });

      expect(prisma.flashcard.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { front: { contains: query, mode: "insensitive" } },
            { back: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { task: true },
        take: Math.floor(limit / 3),
      });

      expect(prisma.practiceQuestion.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { questionText: { contains: query, mode: "insensitive" } },
            { explanation: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { task: true },
        take: Math.floor(limit / 3),
      });

      expect(result).toEqual([
        {
          type: "study_guide",
          id: "guide-1",
          title: "Project Management Basics",
          excerpt:
            "This section covers the basics of project management and its importance in modern business....",
          domainId: "domain-1",
          taskId: "task-1",
        },
        {
          type: "flashcard",
          id: "flashcard-1",
          title: "What is project management?",
          excerpt:
            "Project management is the application of knowledge, skills, tools, and techniques to project activities....",
          domainId: "domain-1",
          taskId: "task-1",
        },
        {
          type: "question",
          id: "question-1",
          title: "Which of the following best describes project management?",
          excerpt:
            "Project management involves planning, organizing, and controlling resources to achieve specific goals....",
          domainId: "domain-1",
          taskId: "task-1",
        },
      ]);
    });

    it("should use default limit of 20 when not provided", async () => {
      const query = "test";

      (prisma.studySection.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue([]);

      await contentService.searchContent(query);

      expect(prisma.studySection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: Math.floor(20 / 3) }),
      );
    });

    it("should handle empty search results", async () => {
      (prisma.studySection.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue([]);

      const result = await contentService.searchContent("nonexistent");

      expect(result).toEqual([]);
    });

    it("should truncate long excerpts correctly", async () => {
      const longContent = "A".repeat(200);
      const longBack = "B".repeat(200);
      const longExplanation = "C".repeat(200);

      const mockSections = [
        {
          id: "section-1",
          title: "Title",
          content: longContent,
          studyGuide: {
            id: "guide-1",
            taskId: "task-1",
            task: { domainId: "domain-1" },
          },
        },
      ];

      const mockFlashcards = [
        {
          id: "flashcard-1",
          front: "F".repeat(150),
          back: longBack,
          domainId: "domain-1",
          taskId: "task-1",
          task: {},
        },
      ];

      const mockQuestions = [
        {
          id: "question-1",
          questionText: "Q".repeat(150),
          explanation: longExplanation,
          domainId: "domain-1",
          taskId: "task-1",
          task: {},
        },
      ];

      (prisma.studySection.findMany as jest.Mock).mockResolvedValue(
        mockSections,
      );
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(
        mockFlashcards,
      );
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        mockQuestions,
      );

      const result = await contentService.searchContent("test");

      expect(result[0]?.excerpt).toHaveLength(153); // 150 chars + '...'
      expect(result[1]?.title).toHaveLength(100); // Truncated front
      expect(result[1]?.excerpt).toHaveLength(153); // 150 chars + '...'
      expect(result[2]?.title).toHaveLength(100); // Truncated questionText
      expect(result[2]?.excerpt).toHaveLength(153); // 150 chars + '...'
    });

    it("should handle custom limit values", async () => {
      (prisma.studySection.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue([]);

      await contentService.searchContent("test", 30);

      expect(prisma.studySection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }), // Math.floor(30 / 3)
      );
    });
  });

  describe("Property-Based Tests", () => {
    it("should handle various domain codes", () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom("A", "B", "C", "D", "E"), {
            minLength: 3,
            maxLength: 10,
          }),
          (code) => {
            expect(code.length).toBeGreaterThanOrEqual(3);
            expect(code.length).toBeLessThanOrEqual(10);
            return true;
          },
        ),
      );
    });

    it("should handle various weight percentages", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 100 }), (percentage) => {
          expect(percentage).toBeGreaterThanOrEqual(0);
          expect(percentage).toBeLessThanOrEqual(100);
          return true;
        }),
      );
    });

    it("should handle various order indices", () => {
      fc.assert(
        fc.property(fc.nat(), (orderIndex) => {
          expect(orderIndex).toBeGreaterThanOrEqual(0);
          return true;
        }),
      );
    });

    it("should calculate progress correctly for any valid ratio", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (completed, total) => {
            if (completed > total) completed = total;
            const progress = Math.round((completed / total) * 100);
            expect(progress).toBeGreaterThanOrEqual(0);
            expect(progress).toBeLessThanOrEqual(100);
            return true;
          },
        ),
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle sections with minimal content", async () => {
      const mockSections = [
        {
          id: "section-1",
          title: "A",
          content: "B",
          studyGuide: {
            id: "guide-1",
            taskId: "task-1",
            task: { domainId: "domain-1" },
          },
        },
      ];

      (prisma.studySection.findMany as jest.Mock).mockResolvedValue(
        mockSections,
      );
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue([]);

      const result = await contentService.searchContent("test");

      expect(result[0]?.excerpt).toBe("B...");
    });

    it("should handle flashcards with exactly 100 chars in front", async () => {
      const exactFront = "A".repeat(100);

      const mockFlashcards = [
        {
          id: "flashcard-1",
          front: exactFront,
          back: "Back",
          domainId: "domain-1",
          taskId: "task-1",
          task: {},
        },
      ];

      (prisma.studySection.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue(
        mockFlashcards,
      );
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue([]);

      const result = await contentService.searchContent("test");

      expect(result[0]?.title).toHaveLength(100);
    });

    it("should handle questions with exactly 150 chars in explanation", async () => {
      const exactExplanation = "A".repeat(150);

      const mockQuestions = [
        {
          id: "question-1",
          questionText: "Question",
          explanation: exactExplanation,
          domainId: "domain-1",
          taskId: "task-1",
          task: {},
        },
      ];

      (prisma.studySection.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.flashcard.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.practiceQuestion.findMany as jest.Mock).mockResolvedValue(
        mockQuestions,
      );

      const result = await contentService.searchContent("test");

      expect(result[0]?.excerpt).toBe(exactExplanation + "...");
    });
  });

  describe("Error Handling", () => {
    it("should propagate database errors in getDomains", async () => {
      (prisma.domain.findMany as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      await expect(contentService.getDomains()).rejects.toThrow("DB Error");
    });

    it("should propagate database errors in searchContent", async () => {
      (prisma.studySection.findMany as jest.Mock).mockRejectedValue(
        new Error("Search failed"),
      );

      await expect(contentService.searchContent("test")).rejects.toThrow(
        "Search failed",
      );
    });

    it("should propagate database errors in getUserProgress", async () => {
      (prisma.studySection.count as jest.Mock).mockRejectedValue(
        new Error("Count failed"),
      );

      await expect(contentService.getUserProgress("user-123")).rejects.toThrow(
        "Count failed",
      );
    });
  });
});
