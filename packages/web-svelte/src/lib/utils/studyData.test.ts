/* eslint-disable @typescript-eslint/no-explicit-any -- Test files use any for mocking */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

let module: typeof import("./studyData");

// Mock flashcards data
const mockFlashcardsData = [
  {
    meta: {
      title: "Team Formation",
      domain: "People",
      task: "Manage Conflict",
      ecoReference: "Task 1.1",
      description: "Managing team conflict effectively",
      file: "people-task-1-1.json",
    },
    flashcards: [
      {
        id: 1,
        category: "Leadership",
        front: "What is conflict?",
        back: "A disagreement",
      },
    ],
  },
  {
    meta: {
      title: "Project Planning",
      domain: "Process",
      task: "Scope Definition",
      ecoReference: "Task 2.3",
      description: "Defining project scope",
      file: "process-task-2-3.json",
    },
    flashcards: [
      {
        id: 1,
        category: "Planning",
        front: "What is scope?",
        back: "Project boundaries",
      },
    ],
  },
  {
    meta: {
      title: "Business Analysis",
      domain: "Business Environment",
      task: "Compliance",
      ecoReference: "Task 3.2",
      description: "Understanding compliance requirements",
      file: "business-task-3-2.json",
    },
    flashcards: [],
  },
];

// Mock testbank data
const mockTestbankData = {
  generatedAt: "2026-01-01T00:00:00Z",
  totalFiles: 3,
  totalQuestions: 150,
  domains: {
    people: { files: 1, questions: 50 },
    process: { files: 1, questions: 60 },
    business: { files: 1, questions: 40 },
  },
  methodologyDistribution: {
    predictive: 60,
    agile: 25,
    hybrid: 15,
  },
  files: [
    {
      filename: "people-task-1-1.json",
      domain: "people",
      taskNumber: 1,
      task: "Manage Conflict",
      ecoTask: "Task 1.1",
      difficulty: "medium",
      questionCount: 50,
    },
    {
      filename: "process-task-2-3.json",
      domain: "process",
      taskNumber: 23,
      task: "Scope Definition",
      ecoTask: "Task 2.3",
      difficulty: "hard",
      questionCount: 60,
    },
    {
      filename: "business-task-3-2.json",
      domain: "business",
      taskNumber: 32,
      task: "Compliance",
      ecoTask: "Task 3.2",
      difficulty: "easy",
      questionCount: 40,
    },
  ],
  questions: [],
};

describe("studyData", () => {
  beforeEach(async () => {
    // Mock fetch responses
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/data/flashcards.json")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockFlashcardsData,
        } as Response);
      }
      if (url.includes("/data/testbank.json")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTestbankData,
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        statusText: "Not Found",
      } as Response);
    }) as any;

    // Clear module cache
    vi.resetModules();

    // Import the module
    module = await import("./studyData");

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loadDomains", () => {
    it("should load all three domains", async () => {
      const domains = await module.loadDomains();

      expect(domains).toHaveLength(3);
    });

    it("should return domains in correct order", async () => {
      const domains = await module.loadDomains();

      expect(domains[0].id).toBe("people");
      expect(domains[0].orderIndex).toBe(1);
      expect(domains[1].id).toBe("process");
      expect(domains[1].orderIndex).toBe(2);
      expect(domains[2].id).toBe("business");
      expect(domains[2].orderIndex).toBe(3);
    });

    it("should populate domain metadata correctly", async () => {
      const domains = await module.loadDomains();
      const peopleDomain = domains.find((d) => d.id === "people");

      expect(peopleDomain).toBeDefined();
      expect(peopleDomain?.name).toBe("People");
      expect(peopleDomain?.code).toBe("PEOPLE");
      expect(peopleDomain?.weightPercentage).toBe(33);
      expect(peopleDomain?.description).toContain("team management");
    });

    it("should include tasks for each domain", async () => {
      const domains = await module.loadDomains();

      for (const domain of domains) {
        expect(domain.tasks).toBeDefined();
        expect(domain.tasks?.length).toBeGreaterThan(0);
      }
    });

    it("should cache loaded domains", async () => {
      const firstCall = await module.loadDomains();
      const secondCall = await module.loadDomains();

      expect(firstCall).toBe(secondCall);
      expect(global.fetch).toHaveBeenCalledTimes(2); // flashcards + testbank
    });

    it("should return empty array on fetch failure", async () => {
      // Mock fetch failure
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: "Internal Server Error",
        } as Response),
      ) as any;

      vi.resetModules();
      module = await import("./studyData");
      module.clearCache();

      const domains = await module.loadDomains();

      expect(domains).toEqual([]);
    });
  });

  describe("getDomain", () => {
    it("should return a domain by ID", async () => {
      const domain = await module.getDomain("people");

      expect(domain).toBeDefined();
      expect(domain?.id).toBe("people");
      expect(domain?.name).toBe("People");
    });

    it("should return null for non-existent domain", async () => {
      const domain = await module.getDomain("non-existent");

      expect(domain).toBeNull();
    });

    it("should cache domain map for subsequent calls", async () => {
      await module.getDomain("people");
      await module.getDomain("process");

      // No additional fetch calls after first loadDomains
      const domains = await module.loadDomains();
      expect(domains).toHaveLength(3);
    });
  });

  describe("loadTasks", () => {
    it("should load all tasks from all domains", async () => {
      const tasks = await module.loadTasks();

      expect(tasks).toHaveLength(3);
    });

    it("should include domain reference in each task", async () => {
      const tasks = await module.loadTasks();

      for (const task of tasks) {
        expect(task.domain).toBeDefined();
        expect(task.domain?.id).toBe(task.domainId);
      }
    });

    it("should cache loaded tasks", async () => {
      const firstCall = await module.loadTasks();
      const secondCall = await module.loadTasks();

      expect(firstCall).toBe(secondCall);
    });
  });

  describe("getTasksByDomain", () => {
    it("should return tasks for a specific domain", async () => {
      const peopleTasks = await module.getTasksByDomain("people");

      expect(peopleTasks).toBeDefined();
      expect(peopleTasks.length).toBeGreaterThan(0);
      expect(peopleTasks[0].domainId).toBe("people");
    });

    it("should return empty array for domain with no tasks", async () => {
      const tasks = await module.getTasksByDomain("non-existent");

      expect(tasks).toEqual([]);
    });
  });

  describe("getTaskById", () => {
    it("should return a task by its ID", async () => {
      const task = await module.getTaskById("task-1.1");

      expect(task).toBeDefined();
      expect(task?.id).toBe("task-1.1");
    });

    it("should return null for non-existent task", async () => {
      const task = await module.getTaskById("non-existent-task");

      expect(task).toBeNull();
    });
  });

  describe("getStudyGuide", () => {
    it("should return study guide for valid task", async () => {
      const guide = await module.getStudyGuide("task-1.1");

      expect(guide).toBeDefined();
      expect(guide?.taskId).toBe("task-1.1");
      expect(guide?.sections).toBeDefined();
      expect(guide?.sections.length).toBeGreaterThan(0);
    });

    it("should return null for non-existent task", async () => {
      const guide = await module.getStudyGuide("non-existent-task");

      expect(guide).toBeNull();
    });

    it("should include overview section", async () => {
      const guide = await module.getStudyGuide("task-1.1");

      const overviewSection = guide?.sections.find(
        (s) => s.title === "Overview",
      );
      expect(overviewSection).toBeDefined();
      expect(overviewSection?.content).toContain("# Manage Conflict");
    });
  });

  describe("getStudyStats", () => {
    it("should return comprehensive study statistics", async () => {
      const stats = await module.getStudyStats();

      expect(stats).toBeDefined();
      expect(stats.totalDomains).toBe(3);
      expect(stats.totalTasks).toBe(3);
      expect(stats.totalFlashcards).toBe(2); // 2 flashcards in mock data
      expect(stats.totalQuestions).toBe(150); // From mock testbank
    });

    it("should include domain breakdown", async () => {
      const stats = await module.getStudyStats();

      expect(stats.domainBreakdown).toHaveLength(3);

      const peopleStats = stats.domainBreakdown.find(
        (d) => d.domainId === "people",
      );
      expect(peopleStats).toBeDefined();
      expect(peopleStats?.domainName).toBe("People");
      expect(peopleStats?.code).toBe("PEOPLE");
      expect(peopleStats?.weightPercentage).toBe(33);
    });
  });

  describe("searchTasks", () => {
    it("should find tasks by name", async () => {
      const results = await module.searchTasks("conflict");

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toContain("conflict");
    });

    it("should find tasks by description", async () => {
      const results = await module.searchTasks("compliance");

      expect(results.length).toBeGreaterThan(0);
    });

    it("should be case insensitive", async () => {
      const lowerResults = await module.searchTasks("scope");
      const upperResults = await module.searchTasks("SCOPE");

      expect(lowerResults).toEqual(upperResults);
    });

    it("should return empty array for no matches", async () => {
      const results = await module.searchTasks("non-existent task term");

      expect(results).toEqual([]);
    });
  });

  describe("clearCache", () => {
    it("should clear cached domains", async () => {
      await module.loadDomains();
      module.clearCache();

      // After clearing cache, domains should be reloaded
      const domains = await module.loadDomains();
      expect(domains).toHaveLength(3);
    });

    it("should clear cached tasks", async () => {
      await module.loadTasks();
      module.clearCache();

      const tasks = await module.loadTasks();
      expect(tasks).toHaveLength(3);
    });
  });

  describe("Domain Configuration", () => {
    it("should have correct weight percentages per 2026 ECO", async () => {
      const domains = await module.loadDomains();

      const people = domains.find((d) => d.id === "people");
      const process = domains.find((d) => d.id === "process");
      const business = domains.find((d) => d.id === "business");

      expect(people?.weightPercentage).toBe(33);
      expect(process?.weightPercentage).toBe(41);
      expect(business?.weightPercentage).toBe(26);
    });

    it("should have correct domain codes", async () => {
      const domains = await module.loadDomains();

      const people = domains.find((d) => d.id === "people");
      const process = domains.find((d) => d.id === "process");
      const business = domains.find((d) => d.id === "business");

      expect(people?.code).toBe("PEOPLE");
      expect(process?.code).toBe("PROCESS");
      expect(business?.code).toBe("BUSINESS_ENVIRONMENT");
    });
  });
});
