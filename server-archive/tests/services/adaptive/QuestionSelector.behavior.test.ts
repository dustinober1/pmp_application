/**
 * Behavioral tests for QuestionSelector.selectQuestions
 *
 * Validates adaptive selection distribution and difficulty adjustment based on
 * recent performance patterns. These complement the property-based tests by
 * asserting end-to-end behavior with mocked data sources.
 */

const prismaMock = {
  $use: jest.fn(),
  userAnswer: {
    findMany: jest.fn(),
  },
  question: {
    findMany: jest.fn(),
  },
};

jest.mock("../../../src/services/database", () => ({
  prisma: prismaMock,
}));

jest.mock("../../../src/services/adaptive/KnowledgeGapIdentifier", () => ({
  knowledgeGapIdentifier: {
    identifyGaps: jest.fn(),
  },
}));

jest.mock("../../../src/services/adaptive/MasteryCalculator", () => ({
  masteryCalculator: {
    getAllMasteryLevels: jest.fn(),
  },
}));

import { questionSelector } from "../../../src/services/adaptive/QuestionSelector";
import { prisma } from "../../../src/services/database";
import { masteryCalculator } from "../../../src/services/adaptive/MasteryCalculator";
import { knowledgeGapIdentifier } from "../../../src/services/adaptive/KnowledgeGapIdentifier";

describe("QuestionSelector.selectQuestions (behavioral)", () => {
  const userId = "user-1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("distributes selections into gap/maintenance/stretch buckets (60/25/15)", async () => {
    (masteryCalculator.getAllMasteryLevels as jest.Mock).mockResolvedValue([
      { domainId: "gap-domain", score: 40 },
      { domainId: "maintenance-domain", score: 75 },
      { domainId: "stretch-domain", score: 90 },
    ]);

    (knowledgeGapIdentifier.identifyGaps as jest.Mock).mockResolvedValue([
      { domainId: "gap-domain", priorityScore: 10 },
    ]);

    // userAnswer.findMany is called three times inside selectQuestions
    (prisma.userAnswer.findMany as jest.Mock)
      .mockResolvedValueOnce([]) // getRecentDomainAccuracy
      .mockResolvedValueOnce([]) // getConsecutiveAnswerPatterns
      .mockResolvedValueOnce([]); // getQuestionCandidates (recent incorrect)

    (prisma.question.findMany as jest.Mock).mockResolvedValue([
      // Gap candidates (6+)
      ...Array.from({ length: 6 }).map((_, idx) => ({
        id: `gap-${idx}`,
        domainId: "gap-domain",
        domain: { name: "Gap Domain" },
        questionText: `Gap question ${idx}`,
        scenario: null,
        choices: JSON.stringify(["A", "B", "C", "D"]),
        correctAnswerIndex: 0,
        explanation: "Gap explanation",
        difficulty: idx % 2 === 0 ? "EASY" : "MEDIUM",
        methodology: "Agile",
        answers: [],
      })),
      // Maintenance candidates (3)
      ...Array.from({ length: 3 }).map((_, idx) => ({
        id: `maint-${idx}`,
        domainId: "maintenance-domain",
        domain: { name: "Maintenance Domain" },
        questionText: `Maintenance question ${idx}`,
        scenario: null,
        choices: JSON.stringify(["A", "B", "C", "D"]),
        correctAnswerIndex: 1,
        explanation: "Maintenance explanation",
        difficulty: "MEDIUM",
        methodology: "Predictive",
        answers: [],
      })),
      // Stretch candidates (3)
      ...Array.from({ length: 3 }).map((_, idx) => ({
        id: `stretch-${idx}`,
        domainId: "stretch-domain",
        domain: { name: "Stretch Domain" },
        questionText: `Stretch question ${idx}`,
        scenario: null,
        choices: JSON.stringify(["A", "B", "C", "D"]),
        correctAnswerIndex: 2,
        explanation: "Stretch explanation",
        difficulty: "HARD",
        methodology: "Hybrid",
        answers: [],
      })),
    ]);

    const result = await questionSelector.selectQuestions({
      userId,
      count: 10,
    });

    const reasons = result.reduce<Record<string, number>>((acc, q) => {
      acc[q.selectionReason] = (acc[q.selectionReason] || 0) + 1;
      return acc;
    }, {});

    expect(result).toHaveLength(10);
    expect(reasons.gap).toBe(6);
    expect(reasons.maintenance).toBe(3);
    expect(reasons.stretch).toBe(1);
  });

  test("prefers easier questions after consecutive incorrect answers in a domain", async () => {
    (masteryCalculator.getAllMasteryLevels as jest.Mock).mockResolvedValue([
      { domainId: "gap-domain", score: 40 },
    ]);

    (knowledgeGapIdentifier.identifyGaps as jest.Mock).mockResolvedValue([
      { domainId: "gap-domain", priorityScore: 10 },
    ]);

    // Accuracy map empty, but consecutive incorrect >= 3 should force EASY
    (prisma.userAnswer.findMany as jest.Mock)
      .mockResolvedValueOnce([]) // getRecentDomainAccuracy
      .mockResolvedValueOnce([
        {
          isCorrect: false,
          question: { domainId: "gap-domain" },
          answeredAt: new Date(),
        },
        {
          isCorrect: false,
          question: { domainId: "gap-domain" },
          answeredAt: new Date(),
        },
        {
          isCorrect: false,
          question: { domainId: "gap-domain" },
          answeredAt: new Date(),
        },
      ]) // getConsecutiveAnswerPatterns -> 3 incorrect
      .mockResolvedValueOnce([]); // getQuestionCandidates (recent incorrect)

    (prisma.question.findMany as jest.Mock).mockResolvedValue([
      {
        id: "hard-q",
        domainId: "gap-domain",
        domain: { name: "Gap Domain" },
        questionText: "Hard question",
        scenario: null,
        choices: JSON.stringify(["A", "B", "C", "D"]),
        correctAnswerIndex: 0,
        explanation: "Hard explanation",
        difficulty: "HARD",
        methodology: "Agile",
        answers: [],
      },
      {
        id: "easy-q",
        domainId: "gap-domain",
        domain: { name: "Gap Domain" },
        questionText: "Easy question",
        scenario: null,
        choices: JSON.stringify(["A", "B", "C", "D"]),
        correctAnswerIndex: 0,
        explanation: "Easy explanation",
        difficulty: "EASY",
        methodology: "Agile",
        answers: [],
      },
    ]);

    const result = await questionSelector.selectQuestions({
      userId,
      count: 1,
    });

    expect(result).toHaveLength(1);
    expect(result[0].difficulty).toBe("EASY");
  });
});
