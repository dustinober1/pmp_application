import prisma from "../config/database";

// Types for ebook progress responses
interface EbookProgressResponse {
  lastChapterId: string | null;
  lastSectionId: string | null;
  completedSections: string[];
  overallProgress: number;
  totalSections: number;
}

interface ChapterProgressResponse {
  chapterSlug: string;
  chapterTitle: string;
  completedSections: string[];
  totalSections: number;
  progressPercentage: number;
}

export class EbookProgressService {
  /**
   * Update reading progress for a user
   * Creates UserEbookProgress if not exists
   * Updates lastChapterId, lastSectionId
   * Adds sectionId to completedSections array
   */
  async updateProgress(
    userId: string,
    chapterSlug: string,
    sectionSlug: string,
  ): Promise<EbookProgressResponse> {
    // Find the chapter and section to get IDs
    const chapter = await prisma.ebookChapter.findUnique({
      where: { slug: chapterSlug },
      select: { id: true },
    });

    if (!chapter) {
      throw new Error(`Chapter not found: ${chapterSlug}`);
    }

    const section = await prisma.ebookSection.findUnique({
      where: {
        chapterId_slug: {
          chapterId: chapter.id,
          slug: sectionSlug,
        },
      },
      select: { id: true },
    });

    if (!section) {
      throw new Error(
        `Section not found: ${sectionSlug} in chapter: ${chapterSlug}`,
      );
    }

    // Get or create user progress
    let progress = await prisma.userEbookProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      progress = await prisma.userEbookProgress.create({
        data: {
          userId,
          lastChapterId: chapter.id,
          lastSectionId: section.id,
          completedSections: [section.id],
        },
      });
    } else {
      // Update last read position
      const updatedCompletedSections = progress.completedSections.includes(
        section.id,
      )
        ? progress.completedSections
        : [...progress.completedSections, section.id];

      progress = await prisma.userEbookProgress.update({
        where: { userId },
        data: {
          lastChapterId: chapter.id,
          lastSectionId: section.id,
          completedSections: updatedCompletedSections,
        },
      });
    }

    // Calculate overall progress
    const totalSections = await prisma.ebookSection.count();
    const overallProgress =
      totalSections > 0
        ? Math.round((progress.completedSections.length / totalSections) * 100)
        : 0;

    return {
      lastChapterId: progress.lastChapterId,
      lastSectionId: progress.lastSectionId,
      completedSections: progress.completedSections,
      overallProgress,
      totalSections,
    };
  }

  /**
   * Get current user's ebook progress
   * Returns lastChapterId, lastSectionId, completedSections array
   * Calculates overall progress percentage
   */
  async getProgress(userId: string): Promise<EbookProgressResponse> {
    const progress = await prisma.userEbookProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      const totalSections = await prisma.ebookSection.count();
      return {
        lastChapterId: null,
        lastSectionId: null,
        completedSections: [],
        overallProgress: 0,
        totalSections,
      };
    }

    const totalSections = await prisma.ebookSection.count();
    const overallProgress =
      totalSections > 0
        ? Math.round((progress.completedSections.length / totalSections) * 100)
        : 0;

    return {
      lastChapterId: progress.lastChapterId,
      lastSectionId: progress.lastSectionId,
      completedSections: progress.completedSections,
      overallProgress,
      totalSections,
    };
  }

  /**
   * Get progress for a specific chapter
   * Returns which sections are completed
   * Shows chapter progress percentage
   */
  async getChapterProgress(
    userId: string,
    chapterSlug: string,
  ): Promise<ChapterProgressResponse> {
    const chapter = await prisma.ebookChapter.findUnique({
      where: { slug: chapterSlug },
      select: { id: true, title: true },
    });

    if (!chapter) {
      throw new Error(`Chapter not found: ${chapterSlug}`);
    }

    const [sections, progress] = await Promise.all([
      prisma.ebookSection.findMany({
        where: { chapterId: chapter.id },
        select: { id: true },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.userEbookProgress.findUnique({
        where: { userId },
        select: { completedSections: true },
      }),
    ]);

    const totalSections = sections.length;
    const completedSectionIds = progress?.completedSections ?? [];
    const completedSectionsInChapter = sections.filter(
      (s: (typeof sections)[0]) => completedSectionIds.includes(s.id),
    );

    const progressPercentage =
      totalSections > 0
        ? Math.round((completedSectionsInChapter.length / totalSections) * 100)
        : 0;

    return {
      chapterSlug,
      chapterTitle: chapter.title,
      completedSections: completedSectionsInChapter.map((s) => s.id),
      totalSections,
      progressPercentage,
    };
  }

  /**
   * Mark section as completed
   * Adds sectionId to completedSections array if not already present
   */
  async markSectionComplete(
    userId: string,
    chapterSlug: string,
    sectionSlug: string,
  ): Promise<void> {
    const chapter = await prisma.ebookChapter.findUnique({
      where: { slug: chapterSlug },
      select: { id: true },
    });

    if (!chapter) {
      throw new Error(`Chapter not found: ${chapterSlug}`);
    }

    const section = await prisma.ebookSection.findUnique({
      where: {
        chapterId_slug: {
          chapterId: chapter.id,
          slug: sectionSlug,
        },
      },
      select: { id: true },
    });

    if (!section) {
      throw new Error(
        `Section not found: ${sectionSlug} in chapter: ${chapterSlug}`,
      );
    }

    const progress = await prisma.userEbookProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      await prisma.userEbookProgress.create({
        data: {
          userId,
          lastChapterId: chapter.id,
          lastSectionId: section.id,
          completedSections: [section.id],
        },
      });
    } else if (!progress.completedSections.includes(section.id)) {
      await prisma.userEbookProgress.update({
        where: { userId },
        data: {
          completedSections: [...progress.completedSections, section.id],
        },
      });
    }
  }

  /**
   * Reset all progress for a user
   */
  async resetProgress(userId: string): Promise<void> {
    await prisma.userEbookProgress.update({
      where: { userId },
      data: {
        lastChapterId: null,
        lastSectionId: null,
        completedSections: [],
      },
    });
  }
}

export const ebookProgressService = new EbookProgressService();
