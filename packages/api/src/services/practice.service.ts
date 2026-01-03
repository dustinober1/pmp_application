import type {
  PracticeQuestion,
  PracticeSessionResult,
  AnswerResult,
  DomainScore,
  PracticeOptions,
  Difficulty,
  QuestionOption,
} from "@pmp/shared";
import { PMP_EXAM } from "@pmp/shared";
import prisma from "../config/database";
import { AppError } from "../middleware/error.middleware";
import { SESSION_ERRORS } from "@pmp/shared";
import * as fs from "fs";
import * as path from "path";

interface MockExamConfig {
  id: number;
  name: string;
  description: string;
  questions: string[];
  domainBreakdown: {
    domainId: string;
    domainName: string;
    count: number;
    percentage: number;
  }[];
}

export class PracticeService {
  private mockExamsCache: MockExamConfig[] | null = null;

  /**
   * Load mock exams configuration from JSON file
   */
  private loadMockExamsConfig(): MockExamConfig[] {
    if (this.mockExamsCache) {
      return this.mockExamsCache;
    }

    try {
      const configPath = path.join(__dirname, "../../prisma/mock-exams.json");
      const rawData = fs.readFileSync(configPath, "utf-8");
      this.mockExamsCache = JSON.parse(rawData) as MockExamConfig[];
      return this.mockExamsCache;
    } catch (error) {
      console.error("Failed to load mock exams configuration:", error);
      throw AppError.internal("Mock exams configuration not available");
    }
  }

  /**
   * Get list of available mock exams
   */
  async getAvailableMockExams(): Promise<
    Array<{
      id: number;
      name: string;
      description: string;
      totalQuestions: number;
      domainBreakdown: MockExamConfig["domainBreakdown"];
    }>
  > {
    const exams = this.loadMockExamsConfig();

    return exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
      description: exam.description,
      totalQuestions: exam.questions.length,
      domainBreakdown: exam.domainBreakdown,
    }));
  }

  /**
   * Start a new practice session
   * Returns session metadata only - questions loaded separately via paginated endpoint
   */
  async startSession(
    userId: string,
    options: PracticeOptions,
  ): Promise<{ sessionId: string; totalQuestions: number }> {
    const where: Record<string, unknown> = {};

    if (options.domainIds?.length) where.domainId = { in: options.domainIds };
    if (options.taskIds?.length) where.taskId = { in: options.taskIds };
    if (options.difficulty?.length)
      where.difficulty = { in: options.difficulty };

    // Get questions matching criteria
    const rawQuestions = await prisma.practiceQuestion.findMany({
      where,
      include: { options: true },
      take: options.questionCount || 20,
    });

    // Shuffle questions for variety
    const shuffledQuestions = this.shuffleArray(rawQuestions);

    // Create session with questions linked (orderIndex will be auto-populated)
    const session = await prisma.practiceSession.create({
      data: {
        userId,
        totalQuestions: shuffledQuestions.length,
        questions: {
          create: shuffledQuestions.map((q, index) => ({
            questionId: q.id,
            orderIndex: index,
          })),
        },
      },
    });

    return {
      sessionId: session.id,
      totalQuestions: session.totalQuestions,
    };
  }

  /**
   * Get paginated questions for a session
   * Enables lazy loading of questions in batches
   */
  async getSessionQuestions(
    sessionId: string,
    userId: string,
    offset: number = 0,
    limit: number = 20,
  ): Promise<{
    questions: PracticeQuestion[];
    total: number;
    hasMore: boolean;
  }> {
    // Verify session exists and belongs to user
    const session = await prisma.practiceSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw AppError.notFound(
        SESSION_ERRORS.SESSION_001.message,
        SESSION_ERRORS.SESSION_001.code,
      );
    }

    // Get paginated questions with session state (answers, flags)
    const sessionQuestions = await prisma.practiceSessionQuestion.findMany({
      where: { sessionId },
      orderBy: { orderIndex: "asc" },
      skip: offset,
      take: limit,
      include: {
        question: {
          include: { options: true },
        },
      },
    });

    // Get total count for pagination metadata
    const totalCount = await prisma.practiceSessionQuestion.count({
      where: { sessionId },
    });

    // Map to API response format
    const mappedQuestions: PracticeQuestion[] = sessionQuestions.map((sq) => {
      const q = sq.question;
      const isAnswered = !!sq.selectedOptionId;

      return {
        id: q.id,
        domainId: q.domainId,
        taskId: q.taskId,
        questionText: q.questionText,
        options: q.options.map(
          (o): QuestionOption => ({
            id: o.id,
            questionId: o.questionId,
            text: o.text,
            isCorrect: isAnswered ? o.isCorrect : false,
          }),
        ),
        correctOptionId: isAnswered
          ? q.options.find((o) => o.isCorrect)?.id || ""
          : "",
        difficulty: q.difficulty as Difficulty,
        explanation: isAnswered ? q.explanation : "",
        relatedFormulaIds: [],
        createdAt: q.createdAt,
        userAnswerId: sq.selectedOptionId || undefined,
        orderIndex: sq.orderIndex,
      } as PracticeQuestion & { userAnswerId?: string; orderIndex: number };
    });

    return {
      questions: mappedQuestions,
      total: totalCount,
      hasMore: offset + limit < totalCount,
    };
  }

  /**
   * Get current session streak (consecutive correct answers)
   */
  async getSessionStreak(
    sessionId: string,
    userId: string,
  ): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalAnswered: number;
    correctCount: number;
  }> {
    const session = await prisma.practiceSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw AppError.notFound(
        SESSION_ERRORS.SESSION_001.message,
        SESSION_ERRORS.SESSION_001.code,
      );
    }

    // Get all answered questions in order
    const answeredQuestions = await prisma.practiceSessionQuestion.findMany({
      where: { sessionId, selectedOptionId: { not: null } },
      orderBy: { orderIndex: "asc" },
      include: {
        question: {
          include: { options: true },
        },
      },
    });

    // Calculate streak metrics
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const totalAnswered = answeredQuestions.length;
    let correctCount = 0;

    for (const sq of answeredQuestions) {
      const isCorrect = sq.isCorrect ?? false;
      if (isCorrect) {
        correctCount++;
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        // Only count towards current streak if we're at the end
        if (sq === answeredQuestions[answeredQuestions.length - 1]) {
          currentStreak = tempStreak;
        }
      } else {
        // Streak is broken
        currentStreak = 0;
        tempStreak = 0;
      }
    }

    // If all answered and last was correct, currentStreak is set above
    // If last was incorrect or no questions, currentStreak is 0
    if (answeredQuestions.length > 0) {
      const lastSQ = answeredQuestions[answeredQuestions.length - 1];
      if (lastSQ?.isCorrect) {
        // Count backwards from end to find current streak
        currentStreak = 0;
        for (let i = answeredQuestions.length - 1; i >= 0; i--) {
          if (answeredQuestions[i]?.isCorrect) {
            currentStreak++;
          } else {
            break;
          }
        }
      } else {
        currentStreak = 0;
      }
    }

    return {
      currentStreak,
      longestStreak,
      totalAnswered,
      correctCount,
    };
  }

  /**
   * Get an existing session with questions
   */
  async getSession(
    sessionId: string,
    userId: string,
  ): Promise<{
    sessionId: string;
    questions: PracticeQuestion[];
    progress: { total: number; answered: number };
    timeRemainingMs?: number;
    timeLimitMs?: number;
    startedAt?: Date;
  } | null> {
    const session = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          include: {
            question: {
              include: { options: true },
            },
          },
          orderBy: { question: { createdAt: "asc" } }, // Or some specific order
        },
      },
    });

    if (!session || session.userId !== userId) return null;

    const answeredCount = session.questions.filter(
      (q) => q.selectedOptionId,
    ).length;

    const timeLimitMs = session.isMockExam
      ? session.timeLimit || undefined
      : undefined;
    const startedAt = session.isMockExam ? session.startedAt : undefined;
    const timeRemainingMs =
      session.isMockExam && session.timeLimit
        ? Math.max(
            0,
            session.timeLimit - (Date.now() - session.startedAt.getTime()),
          )
        : undefined;

    const mappedQuestions: PracticeQuestion[] = session.questions.map((sq) => {
      const q = sq.question;
      const isAnswered = !!sq.selectedOptionId;

      return {
        id: q.id,
        domainId: q.domainId,
        taskId: q.taskId,
        questionText: q.questionText,
        options: q.options.map(
          (o): QuestionOption => ({
            id: o.id,
            questionId: o.questionId,
            text: o.text,
            isCorrect: isAnswered ? o.isCorrect : false, // Reveal if answered? Or generally keep hidden until end?
            // For practice mode, usually reveal immediately. For exam, hide.
            // We'll stick to hiding unless we fetch answer specifically or pass a "showAnswers" flag.
            // Current submitAnswer returns key info. Here we default to hidden for security/integrity.
          }),
        ),
        correctOptionId: isAnswered
          ? q.options.find((o) => o.isCorrect)?.id || ""
          : "",
        difficulty: q.difficulty as Difficulty,
        explanation: isAnswered ? q.explanation : "",
        relatedFormulaIds: [],
        createdAt: q.createdAt,
        // Helper prop for frontend to know it's answered
        userAnswerId: sq.selectedOptionId || undefined,
      } as PracticeQuestion & { userAnswerId?: string };
    });

    return {
      sessionId: session.id,
      questions: mappedQuestions,
      progress: {
        total: session.totalQuestions,
        answered: answeredCount,
      },
      timeRemainingMs,
      timeLimitMs,
      startedAt,
    };
  }

  /**
   * Submit an answer for a question
   */
  async submitAnswer(
    sessionId: string,
    questionId: string,
    userId: string,
    selectedOptionId: string,
    timeSpentMs: number,
  ): Promise<AnswerResult> {
    const session = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: { select: { questionId: true, selectedOptionId: true } },
      },
    });

    if (!session || session.userId !== userId) {
      throw AppError.notFound(
        SESSION_ERRORS.SESSION_001.message,
        SESSION_ERRORS.SESSION_001.code,
      );
    }

    if (session.completedAt) {
      throw AppError.badRequest(
        SESSION_ERRORS.SESSION_002.message,
        SESSION_ERRORS.SESSION_002.code,
      );
    }

    const isInSession = session.questions.some(
      (q) => q.questionId === questionId,
    );
    if (!isInSession) {
      throw AppError.badRequest(
        SESSION_ERRORS.SESSION_003.message,
        SESSION_ERRORS.SESSION_003.code,
      );
    }

    if (
      session.isMockExam &&
      session.timeLimit &&
      Date.now() - session.startedAt.getTime() > session.timeLimit
    ) {
      throw AppError.forbidden(
        SESSION_ERRORS.SESSION_004.message,
        SESSION_ERRORS.SESSION_004.code,
        "Mock exam time limit exceeded",
      );
    }

    // Get the question with correct answer
    const question = await prisma.practiceQuestion.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!question) {
      throw AppError.notFound("Question not found");
    }

    const correctOption = question.options.find((o) => o.isCorrect);
    const isCorrect = correctOption?.id === selectedOptionId;

    // Record the attempt
    await prisma.questionAttempt.create({
      data: {
        userId,
        questionId,
        sessionId,
        selectedOptionId,
        isCorrect,
        timeSpentMs,
      },
    });

    // Update session question state
    // We need to find the specific PracticeSessionQuestion record.
    // Ensure we find the one belonging to this session.
    // Since unique constraint on (sessionId, questionId) isn't explicit in generic findUnique, use findFirst or updateMany
    await prisma.practiceSessionQuestion.updateMany({
      where: { sessionId, questionId },
      data: {
        selectedOptionId,
        isCorrect,
        timeSpentMs,
        answeredAt: new Date(),
      },
    });

    return {
      isCorrect,
      correctOptionId: correctOption?.id || "",
      explanation: question.explanation,
      timeSpentMs,
    };
  }

  /**
   * Complete a practice session
   */
  async completeSession(
    sessionId: string,
    userId: string,
  ): Promise<PracticeSessionResult> {
    const session = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw AppError.notFound("Session not found");
    }

    // Get all attempts for this session
    const attempts = await prisma.questionAttempt.findMany({
      where: { sessionId },
      include: {
        question: {
          include: { domain: true },
        },
      },
    });

    // Calculate results
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    // Use total questions from session for accurate scoring (treat unanswered as incorrect)
    const totalQuestions = session.totalQuestions || attempts.length;
    const scorePercentage =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;
    const totalTimeMs = attempts.reduce(
      (sum, a) => sum + (a.timeSpentMs || 0),
      0,
    );

    // Calculate domain scores
    const domainMap = new Map<
      string,
      { correct: number; total: number; name: string }
    >();

    attempts.forEach((attempt) => {
      const domainId = attempt.question.domainId;
      const domainName = attempt.question.domain.name;
      const current = domainMap.get(domainId) || {
        correct: 0,
        total: 0,
        name: domainName,
      };
      current.total++;
      if (attempt.isCorrect) current.correct++;
      domainMap.set(domainId, current);
    });

    const domainBreakdown: DomainScore[] = Array.from(domainMap.entries()).map(
      ([domainId, data]) => ({
        domainId,
        domainName: data.name,
        totalQuestions: data.total,
        correctAnswers: data.correct,
        scorePercentage: Math.round((data.correct / data.total) * 100),
      }),
    );

    // Update session
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        correctAnswers: correctCount,
        totalTimeMs,
      },
    });

    // Log study activity
    await prisma.studyActivity.create({
      data: {
        userId,
        activityType: "practice_complete",
        targetId: sessionId,
        metadata: { scorePercentage, correctCount, totalQuestions },
      },
    });

    return {
      sessionId,
      totalQuestions,
      correctAnswers: correctCount,
      scorePercentage,
      totalTimeMs,
      averageTimePerQuestion:
        totalQuestions > 0 ? Math.round(totalTimeMs / totalQuestions) : 0,
      domainBreakdown,
      flaggedQuestions: [],
    };
  }

  /**
   * Start a mock exam (High-End/Corporate tier)
   * Uses pre-built mock exams for instant loading
   * Returns session metadata only - questions loaded separately via paginated endpoint
   */
  async startMockExam(
    userId: string,
    examId: number = 1,
  ): Promise<{
    sessionId: string;
    totalQuestions: number;
    startedAt: Date;
    examName: string;
  }> {
    // Load pre-built mock exam configuration
    const exams = this.loadMockExamsConfig();
    const selectedExam = exams.find((e) => e.id === examId);

    if (!selectedExam) {
      throw AppError.notFound(`Mock exam ${examId} not found`);
    }

    const startedAt = new Date();

    // Create mock exam session with pre-selected questions (orderIndex for pagination)
    const session = await prisma.practiceSession.create({
      data: {
        userId,
        startedAt,
        isMockExam: true,
        totalQuestions: selectedExam.questions.length,
        timeLimit: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
        questions: {
          create: selectedExam.questions.map((questionId, index) => ({
            questionId,
            orderIndex: index,
          })),
        },
      },
    });

    return {
      sessionId: session.id,
      totalQuestions: session.totalQuestions,
      startedAt,
      examName: selectedExam.name,
    };
  }

  /**
   * Flag a question for review
   */
  async flagQuestion(userId: string, questionId: string): Promise<void> {
    // Update any existing attempts for this question
    await prisma.questionAttempt.updateMany({
      where: { userId, questionId },
      data: { flagged: true },
    });
  }

  /**
   * Unflag a question
   */
  async unflagQuestion(userId: string, questionId: string): Promise<void> {
    await prisma.questionAttempt.updateMany({
      where: { userId, questionId },
      data: { flagged: false },
    });
  }

  /**
   * Get flagged questions
   */
  async getFlaggedQuestions(userId: string): Promise<PracticeQuestion[]> {
    const flagged = await prisma.questionAttempt.findMany({
      where: { userId, flagged: true },
      include: {
        question: {
          include: { options: true },
        },
      },
      distinct: ["questionId"],
    });

    return flagged.map((f) => ({
      id: f.question.id,
      domainId: f.question.domainId,
      taskId: f.question.taskId,
      questionText: f.question.questionText,
      options: f.question.options.map(
        (o): QuestionOption => ({
          id: o.id,
          questionId: o.questionId,
          text: o.text,
          isCorrect: false,
        }),
      ),
      correctOptionId: "",
      difficulty: f.question.difficulty as Difficulty,
      explanation: "",
      relatedFormulaIds: [],
      createdAt: f.question.createdAt,
    }));
  }

  /**
   * Get user's practice statistics
   */
  async getPracticeStats(userId: string): Promise<{
    totalSessions: number;
    totalQuestions: number;
    averageScore: number;
    bestScore: number;
    weakDomains: string[];
  }> {
    const sessions = await prisma.practiceSession.findMany({
      where: { userId, completedAt: { not: null } },
    });

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalQuestions: 0,
        averageScore: 0,
        bestScore: 0,
        weakDomains: [],
      };
    }

    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce(
      (sum, s) => sum + s.totalQuestions,
      0,
    );

    // Calculate scores from sessions
    const scores = sessions.map((s) => {
      const total = s.totalQuestions;
      const correct = s.correctAnswers;
      return total > 0 ? Math.round((correct / total) * 100) : 0;
    });

    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Find weak domains (below 70% accuracy)
    const attempts = await prisma.questionAttempt.findMany({
      where: { userId },
      include: { question: { select: { domainId: true } } },
    });

    const domainStats = new Map<string, { correct: number; total: number }>();
    attempts.forEach((a) => {
      const current = domainStats.get(a.question.domainId) || {
        correct: 0,
        total: 0,
      };
      current.total++;
      if (a.isCorrect) current.correct++;
      domainStats.set(a.question.domainId, current);
    });

    const weakDomainIds: string[] = [];
    domainStats.forEach((stats, domainId) => {
      if (stats.total >= 5 && stats.correct / stats.total < 0.7) {
        weakDomainIds.push(domainId);
      }
    });

    const weakDomains = await prisma.domain.findMany({
      where: { id: { in: weakDomainIds } },
      select: { name: true },
    });

    return {
      totalSessions,
      totalQuestions,
      averageScore,
      bestScore,
      weakDomains: weakDomains.map((d) => d.name),
    };
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }
    return shuffled;
  }
}

export const practiceService = new PracticeService();
