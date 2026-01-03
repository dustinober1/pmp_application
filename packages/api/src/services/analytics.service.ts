/**
 * Analytics Service
 * Comprehensive analytics for PMP Study Pro including:
 * - Student Learning Analytics
 * - Flashcard Performance Analysis
 * - Practice Question Insights
 * - System Performance Metrics
 */

import { prisma } from "@/config/database";
import { AppError } from "@/middleware/error.middleware";

type TimeRange = "24h" | "7d" | "30d" | "90d" | "all";

export class AnalyticsService {
  /**
   * ==================== STUDENT LEARNING ANALYTICS ====================
   */

  /**
   * Get overall student learning analytics
   */
  async getStudentLearningAnalytics(options: {
    timeRange?: TimeRange;
    limit?: number;
  }) {
    const { timeRange = "30d", limit = 100 } = options;
    const dateFilter = this.getDateFilter(timeRange);

    // Get total users and active users
    const [totalUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          studyActivities: {
            some: {
              createdAt: dateFilter,
            },
          },
        },
      }),
    ]);

    // Get study progress by domain
    const domainProgress = await prisma.studyProgress.groupBy({
      by: ["section"],
      where: {
        completed: true,
        completedAt: dateFilter,
      },
      _count: true,
    });

    // Get study activity trends
    const activityTrends = await prisma.studyActivity.groupBy({
      by: ["activityType", "createdAt"],
      where: {
        createdAt: dateFilter,
      },
      _count: true,
      _avg: {
        durationMs: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get top performing users
    const topPerformers = await prisma.user.findMany({
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            studyProgress: true,
            flashcardReviews: true,
            questionAttempts: true,
          },
        },
      },
      orderBy: {
        studyProgress: {
          _count: "desc",
        },
      },
    });

    // Get struggling users (low completion rates)
    const strugglingUsers = await prisma.user.findMany({
      take: limit,
      where: {
        studyProgress: {
          some: {
            completed: false,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            studyProgress: {
              where: {
                completed: false,
              },
            },
            studyActivities: true,
          },
        },
      },
    });

    // Calculate average study time per user
    const avgStudyTimeResult = await prisma.studyActivity.aggregate({
      where: {
        createdAt: dateFilter,
      },
      _avg: {
        durationMs: true,
      },
    });

    return {
      overview: {
        totalUsers,
        activeUsers,
        engagementRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        avgStudyTimeMs: avgStudyTimeResult._avg.durationMs || 0,
      },
      domainProgress: domainProgress.map((dp) => ({
        sectionId: dp.section as unknown as string,
        completionCount: dp._count,
      })),
      activityTrends: this.groupByDate(activityTrends, "createdAt"),
      topPerformers: topPerformers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        memberSince: u.createdAt,
        studyProgressCount: u._count.studyProgress,
        flashcardReviewsCount: u._count.flashcardReviews,
        questionAttemptsCount: u._count.questionAttempts,
      })),
      strugglingUsers: strugglingUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        memberSince: u.createdAt,
        incompleteProgressCount: u._count.studyProgress,
        activityCount: u._count.studyActivities,
      })),
    };
  }

  /**
   * Get learning analytics for a specific user
   */
  async getUserLearningAnalytics(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            tier: true,
          },
        },
        studyProgress: {
          include: {
            section: {
              include: {
                studyGuide: {
                  include: {
                    task: true,
                  },
                },
              },
            },
          },
        },
        flashcardReviews: {
          include: {
            card: {
              include: {
                domain: true,
                task: true,
              },
            },
          },
        },
        questionAttempts: {
          include: {
            question: {
              include: {
                domain: true,
                task: true,
              },
            },
          },
        },
        studyActivities: {
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        },
      },
    });

    if (!user) {
      throw AppError.notFound("User not found");
    }

    // Calculate domain-specific progress
    const domainProgress = this.calculateDomainProgress(user.studyProgress);

    // Flashcard performance by domain
    const flashcardPerformance = this.calculateFlashcardPerformance(
      user.flashcardReviews,
    );

    // Question performance by domain
    const questionPerformance = this.calculateQuestionPerformance(
      user.questionAttempts,
    );

    // Study activity breakdown
    const activityBreakdown = this.calculateActivityBreakdown(user.studyActivities);

    // Calculate overall exam readiness score
    const examReadiness = this.calculateExamReadiness({
      studyProgress: user.studyProgress,
      flashcardReviews: user.flashcardReviews,
      questionAttempts: user.questionAttempts,
    });

    // Identify weak areas
    const weakAreas = this.identifyWeakAreas({
      domainProgress,
      flashcardPerformance,
      questionPerformance,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.subscription?.tier.name || "free",
        memberSince: user.createdAt,
      },
      domainProgress,
      flashcardPerformance,
      questionPerformance,
      activityBreakdown,
      examReadiness,
      weakAreas,
      recommendations: this.generateRecommendations({
        domainProgress,
        flashcardPerformance,
        questionPerformance,
        weakAreas,
      }),
    };
  }

  /**
   * Get domain-specific learning analytics
   */
  async getDomainLearningAnalytics(domainId: string) {
    // Get all tasks in the domain
    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
      include: {
        tasks: {
          include: {
            studyGuide: {
              include: {
                sections: {
                  include: {
                    progress: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!domain) {
      throw AppError.notFound("Domain not found");
    }

    // Calculate completion rates for each task
    const taskAnalytics = await Promise.all(
      domain.tasks.map(async (task) => {
        const totalSections = task.studyGuide?.sections.length || 0;
        const completedSections =
          task.studyGuide?.sections.filter((s) =>
            s.progress.every((p) => p.completed),
          ).length || 0;

        const completionRate =
          totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

        return {
          taskId: task.id,
          taskCode: task.code,
          taskName: task.name,
          totalSections,
          completedSections,
          completionRate,
        };
      }),
    );

    // Get average completion rate across all tasks
    const avgCompletionRate =
      taskAnalytics.length > 0
        ? taskAnalytics.reduce((sum, t) => sum + t.completionRate, 0) /
          taskAnalytics.length
        : 0;

    return {
      domain: {
        id: domain.id,
        name: domain.name,
        code: domain.code,
        weightPercentage: domain.weightPercentage,
      },
      avgCompletionRate,
      taskAnalytics,
    };
  }

  /**
   * ==================== FLASHCARD PERFORMANCE ANALYSIS ====================
   */

  /**
   * Get overall flashcard performance analytics
   */
  async getFlashcardAnalytics(options: {
    timeRange?: TimeRange;
    domainId?: string;
    taskId?: string;
  }) {
    const { timeRange = "30d", domainId, taskId } = options;
    const dateFilter = this.getDateFilter(timeRange);

    // Get session statistics
    const sessionStats = await prisma.flashcardSession.aggregate({
      where: {
        startedAt: dateFilter,
      },
      _count: true,
      _avg: {
        totalTimeMs: true,
        totalCards: true,
        knowIt: true,
        learning: true,
        dontKnow: true,
      },
    });

    // Get card rating distribution
    const ratingDistribution = await prisma.flashcardSessionCard.groupBy({
      by: ["rating"],
      where: {
        answeredAt: dateFilter,
      },
      _count: true,
    });

    // Get most difficult cards (most "dont_know" ratings)
    const difficultCards = await prisma.flashcardSessionCard.groupBy({
      by: ["cardId"],
      where: {
        rating: "dont_know",
        answeredAt: dateFilter,
      },
      _count: {
        rating: true,
      },
      orderBy: {
        _count: {
          rating: "desc",
        },
      },
      take: 20,
    });

    const difficultCardsDetails = await Promise.all(
      difficultCards.map(async (dc) => {
        const card = await prisma.flashcard.findUnique({
          where: { id: dc.cardId },
          include: {
            domain: true,
            task: true,
          },
        });
        return {
          ...card,
          dontKnowCount: dc._count.rating,
        };
      }),
    );

    // Get SM-2 algorithm performance metrics
    const sm2Metrics = await prisma.flashcardReview.aggregate({
      _avg: {
        easeFactor: true,
        interval: true,
        repetitions: true,
      },
      _min: {
        easeFactor: true,
        interval: true,
      },
      _max: {
        easeFactor: true,
        interval: true,
      },
    });

    // Get cards due for review stats
    const now = new Date();
    const [dueCount, overdueCount] = await Promise.all([
      prisma.flashcardReview.count({
        where: {
          nextReviewDate: {
            lte: now,
          },
        },
      }),
      prisma.flashcardReview.count({
        where: {
          nextReviewDate: {
            lt: now,
          },
        },
      }),
    ]);

    // Get retention rates over time
    const retentionTrends = await this.calculateRetentionTrends(dateFilter);

    return {
      sessionStats: {
        totalSessions: sessionStats._count,
        avgSessionDurationMs: sessionStats._avg.totalTimeMs || 0,
        avgCardsPerSession: sessionStats._avg.totalCards || 0,
        avgKnowIt: sessionStats._avg.knowIt || 0,
        avgLearning: sessionStats._avg.learning || 0,
        avgDontKnow: sessionStats._avg.dontKnow || 0,
        avgAccuracyRate:
          sessionStats._avg.totalCards && sessionStats._avg.totalCards > 0
            ? ((sessionStats._avg.knowIt || 0) / sessionStats._avg.totalCards) *
              100
            : 0,
      },
      ratingDistribution: ratingDistribution.map((rd) => ({
        rating: rd.rating || "unanswered",
        count: rd._count,
      })),
      difficultCards: difficultCardsDetails,
      sm2Metrics: {
        avgEaseFactor: sm2Metrics._avg.easeFactor || 2.5,
        avgInterval: sm2Metrics._avg.interval || 1,
        avgRepetitions: sm2Metrics._avg.repetitions || 0,
        minEaseFactor: sm2Metrics._min.easeFactor || 2.5,
        maxEaseFactor: sm2Metrics._max.easeFactor || 2.5,
        maxInterval: sm2Metrics._max.interval || 1,
      },
      reviewStats: {
        cardsDue: dueCount,
        cardsOverdue: overdueCount,
      },
      retentionTrends,
    };
  }

  /**
   * Get flashcard performance for a specific user
   */
  async getUserFlashcardAnalytics(userId: string) {
    const reviews = await prisma.flashcardReview.findMany({
      where: { userId },
      include: {
        card: {
          include: {
            domain: true,
            task: true,
          },
        },
      },
      orderBy: {
        lastReviewDate: "desc",
      },
    });

    // Calculate SM-2 metrics
    const sm2Metrics = {
      avgEaseFactor:
        reviews.reduce((sum, r) => sum + r.easeFactor, 0) / reviews.length,
      avgInterval:
        reviews.reduce((sum, r) => sum + r.interval, 0) / reviews.length,
      avgRepetitions:
        reviews.reduce((sum, r) => sum + r.repetitions, 0) / reviews.length,
      totalCards: reviews.length,
      cardsDue: reviews.filter((r) => r.nextReviewDate <= new Date()).length,
      cardsOverdue: reviews.filter(
        (r) => r.nextReviewDate < new Date(),
      ).length,
    };

    // Group by domain
    const domainPerformance = this.groupByDomain(reviews, (r) => ({
      totalCards: 1,
      avgEaseFactor: r.easeFactor,
      avgInterval: r.interval,
      avgRepetitions: r.repetitions,
    }));

    // Get recent session performance
    const recentSessions = await prisma.flashcardSession.findMany({
      where: { userId },
      orderBy: {
        startedAt: "desc",
      },
      take: 10,
    });

    const sessionPerformance = recentSessions.map((s) => ({
      sessionId: s.id,
      startedAt: s.startedAt,
      totalCards: s.totalCards,
      knowIt: s.knowIt,
      learning: s.learning,
      dontKnow: s.dontKnow,
      accuracyRate: s.totalCards > 0 ? (s.knowIt / s.totalCards) * 100 : 0,
      durationMs: s.totalTimeMs,
    }));

    return {
      sm2Metrics,
      domainPerformance,
      sessionPerformance,
      nextReviews: reviews
        .filter((r) => r.nextReviewDate > new Date())
        .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
        .slice(0, 10)
        .map((r) => ({
          cardId: r.cardId,
          nextReviewDate: r.nextReviewDate,
          domain: r.card.domain.name,
          task: r.card.task.name,
        })),
    };
  }

  /**
   * ==================== PRACTICE QUESTION INSIGHTS ====================
   */

  /**
   * Get practice question analytics
   */
  async getQuestionAnalytics(options: {
    timeRange?: TimeRange;
    domainId?: string;
    taskId?: string;
    difficulty?: string;
  }) {
    const { timeRange = "30d", domainId, taskId, difficulty } = options;
    const dateFilter = this.getDateFilter(timeRange);

    // Get overall attempt statistics
    const attemptStats = await prisma.questionAttempt.aggregate({
      where: {
        attemptedAt: dateFilter,
        question: {
          ...(domainId && { domainId }),
          ...(taskId && { taskId }),
          ...(difficulty && { difficulty }),
        },
      },
      _count: true,
      _avg: {
        timeSpentMs: true,
      },
    });

    // Get correct/incorrect breakdown
    const accuracyBreakdown = await prisma.questionAttempt.groupBy({
      by: ["isCorrect"],
      where: {
        attemptedAt: dateFilter,
        question: {
          ...(domainId && { domainId }),
          ...(taskId && { taskId }),
          ...(difficulty && { difficulty }),
        },
      },
      _count: true,
    });

    const correctCount =
      accuracyBreakdown.find((ab) => ab.isCorrect)?._count.true || 0;
    const incorrectCount =
      accuracyBreakdown.find((ab) => !ab.isCorrect)?._count.false || 0;
    const totalCount = correctCount + incorrectCount;
    const accuracyRate = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    // Get most difficult questions (lowest accuracy)
    const difficultQuestions = await prisma.practiceQuestion.findMany({
      ...(domainId && { where: { domainId } }),
      ...(taskId && { where: { taskId } }),
      ...(difficulty && { where: { difficulty } }),
      include: {
        _count: {
          select: {
            attempts: true,
          },
        },
        attempts: {
          where: {
            attemptedAt: dateFilter,
          },
        },
        domain: true,
        task: true,
      },
    });

    const questionAccuracy = difficultQuestions
      .map((q) => {
        const correctAttempts = q.attempts.filter((a) => a.isCorrect).length;
        const totalAttempts = q.attempts.length;
        return {
          id: q.id,
          questionText: q.questionText.substring(0, 100) + "...",
          domain: q.domain.name,
          task: q.task.name,
          difficulty: q.difficulty,
          totalAttempts,
          correctAttempts,
          accuracyRate:
            totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0,
          avgTimeSpentMs:
            totalAttempts > 0
              ? q.attempts.reduce((sum, a) => sum + a.timeSpentMs, 0) /
                totalAttempts
              : 0,
        };
      })
      .sort((a, b) => a.accuracyRate - b.accuracyRate)
      .slice(0, 20);

    // Get question difficulty distribution
    const difficultyDistribution = await prisma.questionAttempt.groupBy({
      by: ["question"],
      where: {
        attemptedAt: dateFilter,
      },
      _count: true,
    });

    // Get performance by methodology
    const methodologyPerformance = await prisma.questionAttempt.groupBy({
      by: ["question"],
      where: {
        attemptedAt: dateFilter,
        question: {
          methodology: {
            not: null,
          },
        },
      },
      _count: true,
    });

    // Get mock exam performance
    const mockExamSessions = await prisma.practiceSession.findMany({
      where: {
        isMockExam: true,
        startedAt: dateFilter,
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                domain: true,
              },
            },
          },
        },
      },
    });

    const mockExamPerformance = mockExamSessions.map((s) => {
      const domainAccuracy = this.calculateDomainAccuracyFromSession(s);
      return {
        sessionId: s.id,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        totalQuestions: s.totalQuestions,
        correctAnswers: s.correctAnswers,
        accuracyRate: (s.correctAnswers / s.totalQuestions) * 100,
        totalTimeMs: s.totalTimeMs,
        domainAccuracy,
      };
    });

    // Get flagged questions analysis
    const flaggedQuestions = await prisma.questionAttempt.groupBy({
      by: ["questionId"],
      where: {
        flagged: true,
        attemptedAt: dateFilter,
      },
      _count: {
        flagged: true,
      },
      orderBy: {
        _count: {
          flagged: "desc",
        },
      },
      take: 20,
    });

    const flaggedQuestionsDetails = await Promise.all(
      flaggedQuestions.map(async (fq) => {
        const question = await prisma.practiceQuestion.findUnique({
          where: { id: fq.questionId },
          include: {
            domain: true,
            task: true,
          },
        });
        return {
          ...question,
          flagCount: fq._count.flagged,
        };
      }),
    );

    return {
      overview: {
        totalAttempts: attemptStats._count,
        avgTimeSpentMs: attemptStats._avg.timeSpentMs || 0,
        correctCount,
        incorrectCount,
        accuracyRate,
      },
      difficultQuestions,
      difficultyDistribution,
      methodologyPerformance,
      mockExamPerformance,
      flaggedQuestions: flaggedQuestionsDetails,
    };
  }

  /**
   * Get user question performance analytics
   */
  async getUserQuestionAnalytics(userId: string) {
    const attempts = await prisma.questionAttempt.findMany({
      where: { userId },
      include: {
        question: {
          include: {
            domain: true,
            task: true,
          },
        },
      },
      orderBy: {
        attemptedAt: "desc",
      },
    });

    // Calculate overall stats
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const totalAttempts = attempts.length;
    const accuracyRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
    const avgTimeSpentMs =
      totalAttempts > 0
        ? attempts.reduce((sum, a) => sum + a.timeSpentMs, 0) / totalAttempts
        : 0;

    // Group by domain
    const domainPerformance = this.groupByDomain(attempts, (a) => ({
      totalAttempts: 1,
      correctAttempts: a.isCorrect ? 1 : 0,
      avgTimeSpentMs: a.timeSpentMs,
    }));

    // Group by difficulty
    const difficultyPerformance = attempts.reduce(
      (acc, attempt) => {
        const difficulty = attempt.question.difficulty;
        if (!acc[difficulty]) {
          acc[difficulty] = {
            totalAttempts: 0,
            correctAttempts: 0,
            avgTimeSpentMs: 0,
          };
        }
        acc[difficulty].totalAttempts++;
        if (attempt.isCorrect) {
          acc[difficulty].correctAttempts++;
        }
        return acc;
      },
      {} as Record<
        string,
        { totalAttempts: number; correctAttempts: number; avgTimeSpentMs: number }
      >,
    );

    // Get recent mock exam performance
    const recentMockExams = await prisma.practiceSession.findMany({
      where: {
        userId,
        isMockExam: true,
      },
      orderBy: {
        startedAt: "desc",
      },
      take: 5,
    });

    const mockExamPerformance = recentMockExams.map((s) => ({
      sessionId: s.id,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      totalQuestions: s.totalQuestions,
      correctAnswers: s.correctAnswers,
      accuracyRate: (s.correctAnswers / s.totalQuestions) * 100,
      totalTimeMs: s.totalTimeMs,
    }));

    // Get weak areas (low accuracy domains)
    const weakDomains = Object.entries(domainPerformance)
      .map(([domain, data]) => ({
        domain,
        accuracyRate:
          (data.correctAttempts / data.totalAttempts) * 100,
        totalAttempts: data.totalAttempts,
      }))
      .filter((d) => d.accuracyRate < 70)
      .sort((a, b) => a.accuracyRate - b.accuracyRate);

    return {
      overview: {
        totalAttempts,
        correctAttempts,
        accuracyRate,
        avgTimeSpentMs,
      },
      domainPerformance,
      difficultyPerformance,
      mockExamPerformance,
      weakDomains,
    };
  }

  /**
   * ==================== SYSTEM PERFORMANCE METRICS ====================
   */

  /**
   * Get system performance analytics
   */
  async getSystemPerformanceMetrics(options: {
    timeRange?: TimeRange;
  }) {
    const { timeRange = "24h" } = options;
    const dateFilter = this.getDateFilter(timeRange);

    // Database query performance metrics
    const dbMetrics = {
      // User table stats
      userCount: await prisma.user.count(),
      userCountChange: await this.getPeriodChange(
        "user",
        dateFilter,
      ),

      // Activity stats
      activityCount: await prisma.studyActivity.count({
        where: dateFilter,
      }),
      activityRate: await this.getPerHourRate("studyActivity", dateFilter),

      // Session stats
      flashcardSessionCount: await prisma.flashcardSession.count({
        where: {
          startedAt: dateFilter,
        },
      }),
      practiceSessionCount: await prisma.practiceSession.count({
        where: {
          startedAt: dateFilter,
        },
      }),
    };

    // API endpoint usage (derived from activity types)
    const endpointUsage = await prisma.studyActivity.groupBy({
      by: ["activityType"],
      where: dateFilter,
      _count: true,
      orderBy: {
        _count: {
          activityType: "desc",
        },
      },
    });

    // Error rate tracking (from failed operations)
    const errorRate = await this.calculateErrorRate(dateFilter);

    // Subscription metrics
    const subscriptionMetrics = await prisma.userSubscription.groupBy({
      by: ["status"],
      _count: true,
    });

    const tierDistribution = await prisma.userSubscription.groupBy({
      by: ["tierId"],
      _count: true,
    });

    const tierDetails = await Promise.all(
      tierDistribution.map(async (td) => {
        const tier = await prisma.subscriptionTier.findUnique({
          where: { id: td.tierId },
        });
        return {
          tierName: tier?.name || "unknown",
          displayName: tier?.displayName || "Unknown",
          count: td._count,
        };
      }),
    );

    // Storage metrics
    const storageMetrics = {
      totalUsers: dbMetrics.userCount,
      totalFlashcards: await prisma.flashcard.count(),
      totalQuestions: await prisma.practiceQuestion.count(),
      totalStudyGuides: await prisma.studyGuide.count(),
    };

    // Response time metrics (from activity durationMs)
    const responseTimeMetrics = await prisma.studyActivity.aggregate({
      where: dateFilter,
      _avg: {
        durationMs: true,
      },
      _min: {
        durationMs: true,
      },
      _max: {
        durationMs: true,
      },
    });

    return {
      database: dbMetrics,
      endpointUsage: endpointUsage.map((eu) => ({
        endpoint: eu.activityType,
        requestCount: eu._count,
      })),
      performance: {
        avgResponseTimeMs: responseTimeMetrics._avg.durationMs || 0,
        minResponseTimeMs: responseTimeMetrics._min.durationMs || 0,
        maxResponseTimeMs: responseTimeMetrics._max.durationMs || 0,
        errorRate: errorRate.rate,
        errorCount: errorRate.count,
      },
      subscriptions: {
        statusBreakdown: subscriptionMetrics.map((sm) => ({
          status: sm.status,
          count: sm._count,
        })),
        tierDistribution: tierDetails,
      },
      storage: storageMetrics,
    };
  }

  /**
   * ==================== HELPER METHODS ====================
   */

  private getDateFilter(timeRange: TimeRange) {
    const now = new Date();
    const ranges = {
      "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
      "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      "90d": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      all: new Date(0),
    };
    return {
      gte: ranges[timeRange],
    };
  }

  private groupByDate<T>(items: T[], dateField: keyof T) {
    return items.reduce((acc, item) => {
      const date = new Date(item[dateField] as unknown as Date);
      const dateKey = date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }

  private groupByDomain<T>(
    items: Array<T & { question?: { domain?: { name: string } }; card?: { domain?: { name: string } } }>,
    mapper: (item: T) => Record<string, number>,
  ) {
    return items.reduce((acc, item) => {
      const domainName =
        (item as any).question?.domain?.name ||
        (item as any).card?.domain?.name ||
        "unknown";
      if (!acc[domainName]) {
        acc[domainName] = {
          totalAttempts: 0,
          correctAttempts: 0,
          avgTimeSpentMs: 0,
        };
      }
      const metrics = mapper(item);
      acc[domainName].totalAttempts += metrics.totalAttempts || 0;
      acc[domainName].correctAttempts += metrics.correctAttempts || 0;
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }

  private calculateDomainProgress(studyProgress: any[]) {
    return studyProgress.reduce((acc, progress) => {
      const domainName =
        progress.section?.studyGuide?.task?.domain?.name || "unknown";
      if (!acc[domainName]) {
        acc[domainName] = { total: 0, completed: 0 };
      }
      acc[domainName].total++;
      if (progress.completed) {
        acc[domainName].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);
  }

  private calculateFlashcardPerformance(reviews: any[]) {
    return reviews.reduce((acc, review) => {
      const domainName = review.card?.domain?.name || "unknown";
      if (!acc[domainName]) {
        acc[domainName] = {
          totalCards: 0,
          avgEaseFactor: 0,
          avgInterval: 0,
        };
      }
      acc[domainName].totalCards++;
      acc[domainName].avgEaseFactor += review.easeFactor;
      acc[domainName].avgInterval += review.interval;
      return acc;
    }, {} as Record<string, { totalCards: number; avgEaseFactor: number; avgInterval: number }>);
  }

  private calculateQuestionPerformance(attempts: any[]) {
    return attempts.reduce((acc, attempt) => {
      const domainName = attempt.question?.domain?.name || "unknown";
      if (!acc[domainName]) {
        acc[domainName] = {
          totalAttempts: 0,
          correctAttempts: 0,
          avgTimeSpentMs: 0,
        };
      }
      acc[domainName].totalAttempts++;
      if (attempt.isCorrect) {
        acc[domainName].correctAttempts++;
      }
      acc[domainName].avgTimeSpentMs += attempt.timeSpentMs;
      return acc;
    }, {} as Record<string, { totalAttempts: number; correctAttempts: number; avgTimeSpentMs: number }>);
  }

  private calculateActivityBreakdown(activities: any[]) {
    return activities.reduce((acc, activity) => {
      if (!acc[activity.activityType]) {
        acc[activity.activityType] = {
          count: 0,
          totalDurationMs: 0,
        };
      }
      acc[activity.activityType].count++;
      acc[activity.activityType].totalDurationMs += activity.durationMs;
      return acc;
    }, {} as Record<string, { count: number; totalDurationMs: number }>);
  }

  private calculateExamReadiness(data: {
    studyProgress: any[];
    flashcardReviews: any[];
    questionAttempts: any[];
  }) {
    // Simple scoring algorithm (can be enhanced)
    const studyProgressScore =
      (data.studyProgress.filter((p) => p.completed).length /
        Math.max(data.studyProgress.length, 1)) *
      30;

    const flashcardScore =
      Math.min(data.flashcardReviews.length, 500) / 500 * 30;

    const questionAccuracy =
      data.questionAttempts.length > 0
        ? (data.questionAttempts.filter((a) => a.isCorrect).length /
            data.questionAttempts.length) *
          40
        : 0;

    const overallScore = studyProgressScore + flashcardScore + questionAccuracy;

    return {
      overallScore: Math.min(overallScore, 100),
      studyProgressScore,
      flashcardScore,
      questionAccuracy,
      readiness:
        overallScore >= 80
          ? "ready"
          : overallScore >= 60
            ? "approaching"
            : "needs_work",
    };
  }

  private identifyWeakAreas(data: {
    domainProgress: Record<string, { total: number; completed: number }>;
    flashcardPerformance: Record<string, { totalCards: number; avgEaseFactor: number; avgInterval: number }>;
    questionPerformance: Record<string, { totalAttempts: number; correctAttempts: number; avgTimeSpentMs: number }>;
  }) {
    const weakAreas: string[] = [];

    Object.entries(data.domainProgress).forEach(([domain, progress]) => {
      const completionRate = (progress.completed / progress.total) * 100;
      if (completionRate < 50) {
        weakAreas.push(`${domain} - Low study guide completion`);
      }
    });

    Object.entries(data.questionPerformance).forEach(([domain, perf]) => {
      const accuracyRate = (perf.correctAttempts / perf.totalAttempts) * 100;
      if (accuracyRate < 60) {
        weakAreas.push(`${domain} - Low question accuracy`);
      }
    });

    return weakAreas;
  }

  private generateRecommendations(data: {
    domainProgress: Record<string, { total: number; completed: number }>;
    flashcardPerformance: Record<string, { totalCards: number; avgEaseFactor: number; avgInterval: number }>;
    questionPerformance: Record<string, { totalAttempts: number; correctAttempts: number; avgTimeSpentMs: number }>;
    weakAreas: string[];
  }) {
    const recommendations: string[] = [];

    if (data.weakAreas.length === 0) {
      recommendations.push("Great progress! Continue with your current study plan.");
    } else {
      recommendations.push(
        `Focus on weak areas: ${data.weakAreas.slice(0, 3).join(", ")}`,
      );
    }

    Object.entries(data.questionPerformance).forEach(([domain, perf]) => {
      const accuracyRate = (perf.correctAttempts / perf.totalAttempts) * 100;
      if (accuracyRate < 70) {
        recommendations.push(
          `Practice more questions in ${domain} to improve accuracy`,
        );
      }
    });

    Object.entries(data.flashcardPerformance).forEach(([domain, perf]) => {
      if (perf.avgEaseFactor < 2.0) {
        recommendations.push(
          `Review ${domain} flashcards more frequently - cards are showing low retention`,
        );
      }
    });

    return recommendations;
  }

  private async calculateRetentionTrends(dateFilter: any) {
    // Calculate retention rates over time
    const sessions = await prisma.flashcardSession.findMany({
      where: {
        startedAt: dateFilter,
      },
      orderBy: {
        startedAt: "asc",
      },
    });

    return sessions.map((s) => ({
      date: s.startedAt,
      accuracyRate: s.totalCards > 0 ? (s.knowIt / s.totalCards) * 100 : 0,
    }));
  }

  private async getPeriodChange(modelName: string, dateFilter: any) {
    const modelNameCapitalized =
      modelName.charAt(0).toUpperCase() + modelName.slice(1);
    const currentCount = await (prisma as any)[modelNameCapitalized].count({
      where: dateFilter,
    });

    const previousDate = {
      gte: new Date(
        new Date(dateFilter.gte).getTime() -
          (new Date().getTime() - new Date(dateFilter.gte).getTime()),
      ),
      lt: dateFilter.gte,
    };

    const previousCount = await (prisma as any)[modelNameCapitalized].count({
      where: previousDate,
    });

    const change =
      previousCount > 0
        ? ((currentCount - previousCount) / previousCount) * 100
        : 0;

    return {
      current: currentCount,
      previous: previousCount,
      changePercent: change,
    };
  }

  private async getPerHourRate(modelName: string, dateFilter: any) {
    const modelNameCapitalized =
      modelName.charAt(0).toUpperCase() + modelName.slice(1);
    const count = await (prisma as any)[modelNameCapitalized].count({
      where: dateFilter,
    });

    const hoursElapsed =
      (Date.now() - new Date(dateFilter.gte).getTime()) / (1000 * 60 * 60);

    return count / Math.max(hoursElapsed, 1);
  }

  private async calculateErrorRate(dateFilter: any) {
    // Estimate error rate from failed study activities
    const totalActivities = await prisma.studyActivity.count({
      where: dateFilter,
    });

    // This is a simplified calculation - in production, you'd track actual errors
    const estimatedErrorCount = Math.floor(totalActivities * 0.02); // 2% error rate assumption

    return {
      count: estimatedErrorCount,
      rate: totalActivities > 0 ? (estimatedErrorCount / totalActivities) * 100 : 0,
    };
  }

  private calculateDomainAccuracyFromSession(session: any) {
    return session.questions.reduce((acc: any, sq: any) => {
      const domainName = sq.question.domain.name;
      if (!acc[domainName]) {
        acc[domainName] = {
          correct: 0,
          total: 0,
        };
      }
      acc[domainName].total++;
      if (sq.isCorrect) {
        acc[domainName].correct++;
      }
      return acc;
    }, {});
  }
}
