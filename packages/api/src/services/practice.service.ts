import {
  PracticeQuestion,
  PracticeSessionResult,
  AnswerResult,
  DomainScore,
  PracticeOptions,
  Difficulty,
  PMP_EXAM,
  QuestionOption,
} from '@pmp/shared';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class PracticeService {
  /**
   * Start a new practice session
   */
  async startSession(
    userId: string,
    options: PracticeOptions
  ): Promise<{ sessionId: string; questions: PracticeQuestion[] }> {
    const where: Record<string, unknown> = {};

    if (options.domainIds?.length) where.domainId = { in: options.domainIds };
    if (options.taskIds?.length) where.taskId = { in: options.taskIds };
    if (options.difficulty?.length) where.difficulty = { in: options.difficulty };

    // Get questions matching criteria
    const rawQuestions = await prisma.practiceQuestion.findMany({
      where,
      include: { options: true },
      take: options.questionCount || 20,
    });

    // Shuffle questions for variety
    const shuffledQuestions = this.shuffleArray(rawQuestions);

    // Create session
    const session = await prisma.practiceSession.create({
      data: {
        userId,
        totalQuestions: shuffledQuestions.length,
      },
    });

    // Map to API response format
    const mappedQuestions: PracticeQuestion[] = shuffledQuestions.map(q => {
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
            isCorrect: false, // Don't reveal correct answer
          })
        ),
        correctOptionId: '', // Don't reveal until answered
        difficulty: q.difficulty as Difficulty,
        explanation: '', // Don't reveal explanation until answered
        relatedFormulaIds: [],
        createdAt: q.createdAt,
      };
    });

    return {
      sessionId: session.id,
      questions: mappedQuestions,
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
    timeSpentMs: number
  ): Promise<AnswerResult> {
    // Get the question with correct answer
    const question = await prisma.practiceQuestion.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!question) {
      throw AppError.notFound('Question not found');
    }

    const correctOption = question.options.find(o => o.isCorrect);
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

    return {
      isCorrect,
      correctOptionId: correctOption?.id || '',
      explanation: question.explanation,
      timeSpentMs,
    };
  }

  /**
   * Complete a practice session
   */
  async completeSession(sessionId: string, userId: string): Promise<PracticeSessionResult> {
    const session = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw AppError.notFound('Session not found');
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
    const correctCount = attempts.filter(a => a.isCorrect).length;
    const totalQuestions = attempts.length;
    const scorePercentage =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const totalTimeMs = attempts.reduce((sum, a) => sum + (a.timeSpentMs || 0), 0);

    // Calculate domain scores
    const domainMap = new Map<string, { correct: number; total: number; name: string }>();

    attempts.forEach(attempt => {
      const domainId = attempt.question.domainId;
      const domainName = attempt.question.domain.name;
      const current = domainMap.get(domainId) || { correct: 0, total: 0, name: domainName };
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
      })
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
        activityType: 'practice_complete',
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
      averageTimePerQuestion: totalQuestions > 0 ? Math.round(totalTimeMs / totalQuestions) : 0,
      domainBreakdown,
      flaggedQuestions: [],
    };
  }

  /**
   * Start a mock exam (High-End/Corporate tier)
   */
  async startMockExam(
    userId: string
  ): Promise<{ sessionId: string; questions: PracticeQuestion[] }> {
    // Get questions proportional to domain weights
    const domains = await prisma.domain.findMany();
    const allQuestions: PracticeQuestion[] = [];

    for (const domain of domains) {
      // Calculate how many questions for this domain (based on weight)
      const questionCount = Math.round((domain.weightPercentage / 100) * PMP_EXAM.TOTAL_QUESTIONS);

      const domainQuestions = await prisma.practiceQuestion.findMany({
        where: { domainId: domain.id },
        include: { options: true },
        take: questionCount,
      });

      domainQuestions.forEach(q => {
        allQuestions.push({
          id: q.id,
          domainId: q.domainId,
          taskId: q.taskId,
          questionText: q.questionText,
          options: q.options.map(
            (o): QuestionOption => ({
              id: o.id,
              questionId: o.questionId,
              text: o.text,
              isCorrect: false,
            })
          ),
          correctOptionId: '',
          difficulty: q.difficulty as Difficulty,
          explanation: '',
          relatedFormulaIds: [],
          createdAt: q.createdAt,
        });
      });
    }

    // Shuffle all questions
    const shuffledQuestions = this.shuffleArray(allQuestions);

    // Create mock exam session
    const session = await prisma.practiceSession.create({
      data: {
        userId,
        isMockExam: true,
        totalQuestions: Math.min(shuffledQuestions.length, PMP_EXAM.TOTAL_QUESTIONS),
        timeLimit: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
      },
    });

    return {
      sessionId: session.id,
      questions: shuffledQuestions.slice(0, PMP_EXAM.TOTAL_QUESTIONS),
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
      distinct: ['questionId'],
    });

    return flagged.map(f => ({
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
        })
      ),
      correctOptionId: '',
      difficulty: f.question.difficulty as Difficulty,
      explanation: '',
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
    const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);

    // Calculate scores from sessions
    const scores = sessions.map(s => {
      const total = s.totalQuestions;
      const correct = s.correctAnswers;
      return total > 0 ? Math.round((correct / total) * 100) : 0;
    });

    const averageScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Find weak domains (below 70% accuracy)
    const attempts = await prisma.questionAttempt.findMany({
      where: { userId },
      include: { question: { select: { domainId: true } } },
    });

    const domainStats = new Map<string, { correct: number; total: number }>();
    attempts.forEach(a => {
      const current = domainStats.get(a.question.domainId) || { correct: 0, total: 0 };
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
      weakDomains: weakDomains.map(d => d.name),
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
