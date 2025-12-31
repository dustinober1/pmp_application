import prisma from '../config/database';

// Local types for dashboard responses
interface DashboardResponse {
  userId: string;
  streak: StudyStreakResponse;
  overallProgress: number;
  domainProgress: DomainProgressResponse[];
  recentActivity: ActivityResponse[];
  upcomingReviews: ReviewResponse[];
  weakAreas: WeakAreaResponse[];
}

interface StudyStreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
}

interface DomainProgressResponse {
  domainId: string;
  domainName: string;
  domainCode: string;
  progress: number;
  questionsAnswered: number;
  accuracy: number;
}

interface ActivityResponse {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  durationMs: number;
}

interface ReviewResponse {
  cardId: string;
  cardFront: string;
  taskName: string;
  dueDate: Date;
  repetitions: number;
}

interface WeakAreaResponse {
  taskId: string;
  taskName: string;
  domainName: string;
  accuracy: number;
  questionsAttempted: number;
  recommendation: string;
}

interface ReadinessResponse {
  overallScore: number;
  confidence: 'high' | 'medium' | 'low';
  breakdown: {
    contentCoverage: number;
    practiceAccuracy: number;
    flashcardRetention: number;
  };
  recommendation: string;
  estimatedReadyDate: Date | null;
}

interface RecommendationResponse {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetId?: string;
  estimatedTimeMinutes: number;
}

export class DashboardService {
  /**
   * Get user's dashboard data
   */
  async getDashboardData(userId: string): Promise<DashboardResponse> {
    const [streak, domainProgress, recentActivity, upcomingReviews, weakAreas] = await Promise.all([
      this.getStudyStreak(userId),
      this.getDomainProgress(userId),
      this.getRecentActivity(userId, 5),
      this.getUpcomingReviews(userId, 5),
      this.getWeakAreas(userId),
    ]);

    // Calculate overall progress
    const totalProgress =
      domainProgress.length > 0
        ? Math.round(domainProgress.reduce((sum, d) => sum + d.progress, 0) / domainProgress.length)
        : 0;

    return {
      userId,
      streak,
      overallProgress: totalProgress,
      domainProgress,
      recentActivity,
      upcomingReviews,
      weakAreas,
    };
  }

  /**
   * Get user's study streak
   */
  async getStudyStreak(userId: string): Promise<StudyStreakResponse> {
    // Get all study activities for the user, ordered by date
    const activities = await prisma.studyActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (activities.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastStudyDate: null };
    }

    // Calculate streaks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityDates = new Set(
      activities.map(a => {
        const date = new Date(a.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check each day starting from today
    const checkDate = new Date(today);

    while (activityDates.has(checkDate.getTime())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // If no activity today, check if there was activity yesterday
    if (currentStreak === 0) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (activityDates.has(yesterday.getTime())) {
        checkDate.setTime(yesterday.getTime());
        while (activityDates.has(checkDate.getTime())) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    // Calculate longest streak from all activities
    const sortedDates = Array.from(activityDates).sort((a, b) => b - a);
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0 || sortedDates[i]! === sortedDates[i - 1]! - 86400000) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const lastDate = activities[0] ? new Date(activities[0].createdAt) : null;

    return {
      currentStreak,
      longestStreak,
      lastStudyDate: lastDate,
    };
  }

  /**
   * Get domain progress for user
   */
  async getDomainProgress(userId: string): Promise<DomainProgressResponse[]> {
    const domains = await prisma.domain.findMany({
      include: {
        tasks: {
          include: {
            studyGuide: {
              include: { sections: true },
            },
          },
        },
      },
    });

    const completedSections = await prisma.studyProgress.findMany({
      where: { userId, completed: true },
      select: { sectionId: true },
    });

    const completedSectionIds = new Set(completedSections.map(s => s.sectionId));

    // Get practice stats by domain
    const practiceAttempts = await prisma.questionAttempt.findMany({
      where: { userId },
      include: { question: { select: { domainId: true } } },
    });

    const domainPracticeStats = new Map<string, { correct: number; total: number }>();
    practiceAttempts.forEach(a => {
      const current = domainPracticeStats.get(a.question.domainId) || { correct: 0, total: 0 };
      current.total++;
      if (a.isCorrect) current.correct++;
      domainPracticeStats.set(a.question.domainId, current);
    });

    return domains.map(domain => {
      let totalSections = 0;
      let completedCount = 0;

      domain.tasks.forEach(task => {
        if (task.studyGuide) {
          task.studyGuide.sections.forEach(section => {
            totalSections++;
            if (completedSectionIds.has(section.id)) {
              completedCount++;
            }
          });
        }
      });

      const progress = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;
      const practiceStats = domainPracticeStats.get(domain.id) || { correct: 0, total: 0 };
      const accuracy =
        practiceStats.total > 0
          ? Math.round((practiceStats.correct / practiceStats.total) * 100)
          : 0;

      return {
        domainId: domain.id,
        domainName: domain.name,
        domainCode: domain.code,
        progress,
        questionsAnswered: practiceStats.total,
        accuracy,
      };
    });
  }

  /**
   * Get recent study activity
   */
  async getRecentActivity(userId: string, limit: number = 10): Promise<ActivityResponse[]> {
    const activities = await prisma.studyActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities.map(a => ({
      id: a.id,
      type: a.activityType,
      description: this.getActivityDescription(
        a.activityType,
        a.metadata as Record<string, unknown>
      ),
      timestamp: a.createdAt,
      durationMs: a.durationMs,
    }));
  }

  /**
   * Get upcoming flashcard reviews
   */
  async getUpcomingReviews(userId: string, limit: number = 10): Promise<ReviewResponse[]> {
    const reviews = await prisma.flashcardReview.findMany({
      where: {
        userId,
        nextReviewDate: { gte: new Date() },
      },
      include: {
        card: {
          include: { task: true },
        },
      },
      orderBy: { nextReviewDate: 'asc' },
      take: limit,
    });

    return reviews.map(r => ({
      cardId: r.cardId,
      cardFront: r.card.front.substring(0, 100),
      taskName: r.card.task.name,
      dueDate: r.nextReviewDate,
      repetitions: r.repetitions,
    }));
  }

  /**
   * Get user's weak areas
   */
  async getWeakAreas(userId: string): Promise<WeakAreaResponse[]> {
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
    });

    // Group by task
    const taskStats = new Map<
      string,
      {
        correct: number;
        total: number;
        taskName: string;
        domainName: string;
        taskId: string;
      }
    >();

    attempts.forEach(a => {
      const current = taskStats.get(a.question.taskId) || {
        correct: 0,
        total: 0,
        taskName: a.question.task.name,
        domainName: a.question.domain.name,
        taskId: a.question.taskId,
      };
      current.total++;
      if (a.isCorrect) current.correct++;
      taskStats.set(a.question.taskId, current);
    });

    // Find weak areas (less than 70% accuracy with at least 5 attempts)
    const weakAreas: WeakAreaResponse[] = [];

    taskStats.forEach(stats => {
      if (stats.total >= 5) {
        const accuracy = (stats.correct / stats.total) * 100;
        if (accuracy < 70) {
          weakAreas.push({
            taskId: stats.taskId,
            taskName: stats.taskName,
            domainName: stats.domainName,
            accuracy: Math.round(accuracy),
            questionsAttempted: stats.total,
            recommendation: `Review ${stats.taskName} - accuracy is ${Math.round(accuracy)}%`,
          });
        }
      }
    });

    return weakAreas.sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
  }

  /**
   * Get exam readiness score (Mid-Level+ tier)
   */
  async getReadinessScore(userId: string): Promise<ReadinessResponse> {
    const [domainProgress, practiceStats, flashcardStats] = await Promise.all([
      this.getDomainProgress(userId),
      this.getPracticeOverview(userId),
      this.getFlashcardOverview(userId),
    ]);

    // Calculate weighted score
    let contentScore = 0;
    let practiceScore = 0;
    let retentionScore = 0;

    // Content coverage (40% weight)
    if (domainProgress.length > 0) {
      contentScore = Math.round(
        domainProgress.reduce((sum, d) => sum + d.progress, 0) / domainProgress.length
      );
    }

    // Practice accuracy (40% weight)
    practiceScore = practiceStats.averageAccuracy;

    // Flashcard retention (20% weight)
    retentionScore = flashcardStats.masteredPercentage;

    const overallScore = Math.round(
      contentScore * 0.4 + practiceScore * 0.4 + retentionScore * 0.2
    );

    let confidence: 'high' | 'medium' | 'low';
    if (overallScore >= 80) confidence = 'high';
    else if (overallScore >= 60) confidence = 'medium';
    else confidence = 'low';

    const recommendation = this.getReadinessRecommendation(
      overallScore,
      contentScore,
      practiceScore,
      retentionScore
    );

    return {
      overallScore,
      confidence,
      breakdown: {
        contentCoverage: contentScore,
        practiceAccuracy: practiceScore,
        flashcardRetention: retentionScore,
      },
      recommendation,
      estimatedReadyDate: this.estimateReadyDate(overallScore),
    };
  }

  /**
   * Get personalized recommendations (High-End+ tier)
   */
  async getRecommendations(userId: string): Promise<RecommendationResponse[]> {
    const [weakAreas, upcomingReviews, domainProgress] = await Promise.all([
      this.getWeakAreas(userId),
      this.getUpcomingReviews(userId, 10),
      this.getDomainProgress(userId),
    ]);

    const recommendations: RecommendationResponse[] = [];

    // Recommend reviewing weak areas
    weakAreas.forEach((area, index) => {
      recommendations.push({
        id: `weak-${area.taskId}`,
        type: 'practice',
        title: `Improve ${area.taskName}`,
        description: `Your accuracy on ${area.taskName} is ${area.accuracy}%. Practice more questions to improve.`,
        priority: index === 0 ? 'high' : 'medium',
        targetId: area.taskId,
        estimatedTimeMinutes: 15,
      });
    });

    // Recommend flashcard reviews
    if (upcomingReviews.length > 0) {
      recommendations.push({
        id: 'flashcard-review',
        type: 'flashcard',
        title: 'Review Due Flashcards',
        description: `You have ${upcomingReviews.length} flashcards due for review. Regular review helps retention.`,
        priority: 'high',
        estimatedTimeMinutes: Math.min(upcomingReviews.length * 2, 30),
      });
    }

    // Recommend studying incomplete domains
    const incompleteDomains = domainProgress.filter(d => d.progress < 100);
    incompleteDomains.forEach(domain => {
      if (domain.progress < 50) {
        recommendations.push({
          id: `study-${domain.domainId}`,
          type: 'study_guide',
          title: `Continue ${domain.domainName}`,
          description: `You've completed ${domain.progress}% of ${domain.domainName}. Keep studying to improve coverage.`,
          priority: 'medium',
          targetId: domain.domainId,
          estimatedTimeMinutes: 30,
        });
      }
    });

    return recommendations.slice(0, 5);
  }

  /**
   * Helper: Get practice overview
   */
  private async getPracticeOverview(
    userId: string
  ): Promise<{ averageAccuracy: number; totalAttempts: number }> {
    const attempts = await prisma.questionAttempt.findMany({
      where: { userId },
      select: { isCorrect: true },
    });

    const totalAttempts = attempts.length;
    const correctCount = attempts.filter(a => a.isCorrect).length;
    const averageAccuracy =
      totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

    return { averageAccuracy, totalAttempts };
  }

  /**
   * Helper: Get flashcard overview
   */
  private async getFlashcardOverview(
    userId: string
  ): Promise<{ masteredPercentage: number; totalCards: number }> {
    const reviews = await prisma.flashcardReview.findMany({
      where: { userId },
    });

    const totalCards = reviews.length;
    const mastered = reviews.filter(r => r.repetitions >= 3 && r.easeFactor >= 2.5).length;
    const masteredPercentage = totalCards > 0 ? Math.round((mastered / totalCards) * 100) : 0;

    return { masteredPercentage, totalCards };
  }

  /**
   * Helper: Get activity description
   */
  private getActivityDescription(type: string, metadata: Record<string, unknown> | null): string {
    switch (type) {
      case 'study_guide_view':
        return `Viewed study guide`;
      case 'flashcard_session':
        return `Completed flashcard session`;
      case 'practice_complete':
        const score = metadata?.scorePercentage as number;
        return score
          ? `Completed practice session with ${score}% score`
          : 'Completed practice session';
      case 'mock_exam':
        return 'Completed mock exam';
      default:
        return 'Study activity';
    }
  }

  /**
   * Helper: Get readiness recommendation
   */
  private getReadinessRecommendation(
    overall: number,
    content: number,
    practice: number,
    retention: number
  ): string {
    if (overall >= 80) {
      return 'You appear ready for the exam! Consider taking a mock exam to verify.';
    }

    const weakest = Math.min(content, practice, retention);
    if (weakest === content) {
      return 'Focus on completing more study guide content to improve your readiness.';
    }
    if (weakest === practice) {
      return 'Practice more questions to improve your accuracy and exam performance.';
    }
    return 'Review flashcards more regularly to improve your retention of key concepts.';
  }

  /**
   * Helper: Estimate ready date
   */
  private estimateReadyDate(currentScore: number): Date | null {
    if (currentScore >= 80) return null; // Already ready

    // Estimate 2-3 points improvement per week with consistent study
    const pointsNeeded = 80 - currentScore;
    const weeksNeeded = Math.ceil(pointsNeeded / 2.5);

    const readyDate = new Date();
    readyDate.setDate(readyDate.getDate() + weeksNeeded * 7);
    return readyDate;
  }
}

export const dashboardService = new DashboardService();
