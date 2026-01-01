/**
 * Comprehensive tests for ebook-progress.service
 * Targeting 80%+ code coverage
 */

import { EbookProgressService } from './ebook-progress.service';
import prisma from '../config/database';

// Mock Prisma Client
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    ebookChapter: {
      findUnique: jest.fn(),
    },
    ebookSection: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    userEbookProgress: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('EbookProgressService', () => {
  let ebookProgressService: EbookProgressService;
  const userId = 'user-123';
  const chapterSlug = '01-introduction';
  const sectionSlug = 'understanding-exam';
  const chapterId = 'chapter-1';
  const sectionId = 'section-1';

  beforeEach(() => {
    ebookProgressService = new EbookProgressService();
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    it('should create new progress record when none exists', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
      });

      (prisma.ebookSection.findUnique as jest.Mock).mockResolvedValue({
        id: sectionId,
      });

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue(null);

      const newProgress = {
        userId,
        lastChapterId: chapterId,
        lastSectionId: sectionId,
        completedSections: [sectionId],
      };

      (prisma.userEbookProgress.create as jest.Mock).mockResolvedValue(newProgress);
      (prisma.ebookSection.count as jest.Mock).mockResolvedValue(100);

      const result = await ebookProgressService.updateProgress(userId, chapterSlug, sectionSlug);

      expect(result.lastChapterId).toBe(chapterId);
      expect(result.lastSectionId).toBe(sectionId);
      expect(result.completedSections).toEqual([sectionId]);
      expect(result.overallProgress).toBe(1);
      expect(result.totalSections).toBe(100);
      expect(prisma.userEbookProgress.create).toHaveBeenCalledWith({
        data: {
          userId,
          lastChapterId: chapterId,
          lastSectionId: sectionId,
          completedSections: [sectionId],
        },
      });
    });

    it('should update existing progress record', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
      });

      (prisma.ebookSection.findUnique as jest.Mock).mockResolvedValue({
        id: sectionId,
      });

      const existingProgress = {
        userId,
        lastChapterId: 'old-chapter',
        lastSectionId: 'old-section',
        completedSections: ['old-section-id'],
      };

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue(existingProgress);

      const updatedProgress = {
        userId,
        lastChapterId: chapterId,
        lastSectionId: sectionId,
        completedSections: ['old-section-id', sectionId],
      };

      (prisma.userEbookProgress.update as jest.Mock).mockResolvedValue(updatedProgress);
      (prisma.ebookSection.count as jest.Mock).mockResolvedValue(100);

      const result = await ebookProgressService.updateProgress(userId, chapterSlug, sectionSlug);

      expect(result.lastChapterId).toBe(chapterId);
      expect(result.lastSectionId).toBe(sectionId);
      expect(result.completedSections).toEqual(['old-section-id', sectionId]);
      expect(result.overallProgress).toBe(2);
      expect(prisma.userEbookProgress.update).toHaveBeenCalled();
    });

    it('should not duplicate completed sections', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
      });

      (prisma.ebookSection.findUnique as jest.Mock).mockResolvedValue({
        id: sectionId,
      });

      const existingProgress = {
        userId,
        lastChapterId: chapterId,
        lastSectionId: sectionId,
        completedSections: [sectionId],
      };

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue(existingProgress);

      const updatedProgress = {
        userId,
        lastChapterId: chapterId,
        lastSectionId: sectionId,
        completedSections: [sectionId],
      };

      (prisma.userEbookProgress.update as jest.Mock).mockResolvedValue(updatedProgress);
      (prisma.ebookSection.count as jest.Mock).mockResolvedValue(100);

      const result = await ebookProgressService.updateProgress(userId, chapterSlug, sectionSlug);

      expect(result.completedSections).toEqual([sectionId]);
      expect(result.completedSections.length).toBe(1);
    });

    it('should throw error when chapter not found', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        ebookProgressService.updateProgress(userId, chapterSlug, sectionSlug)
      ).rejects.toThrow(`Chapter not found: ${chapterSlug}`);
    });

    it('should throw error when section not found', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
      });

      (prisma.ebookSection.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        ebookProgressService.updateProgress(userId, chapterSlug, sectionSlug)
      ).rejects.toThrow(`Section not found: ${sectionSlug} in chapter: ${chapterSlug}`);
    });

    it('should calculate 0% progress when no sections exist', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
      });

      (prisma.ebookSection.findUnique as jest.Mock).mockResolvedValue({
        id: sectionId,
      });

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue(null);

      (prisma.userEbookProgress.create as jest.Mock).mockResolvedValue({
        userId,
        lastChapterId: chapterId,
        lastSectionId: sectionId,
        completedSections: [sectionId],
      });

      (prisma.ebookSection.count as jest.Mock).mockResolvedValue(0);

      const result = await ebookProgressService.updateProgress(userId, chapterSlug, sectionSlug);

      expect(result.overallProgress).toBe(0);
    });
  });

  describe('getProgress', () => {
    it('should return existing progress', async () => {
      const existingProgress = {
        userId,
        lastChapterId: chapterId,
        lastSectionId: sectionId,
        completedSections: [sectionId, 'section-2'],
      };

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue(existingProgress);
      (prisma.ebookSection.count as jest.Mock).mockResolvedValue(100);

      const result = await ebookProgressService.getProgress(userId);

      expect(result.lastChapterId).toBe(chapterId);
      expect(result.lastSectionId).toBe(sectionId);
      expect(result.completedSections).toEqual([sectionId, 'section-2']);
      expect(result.overallProgress).toBe(2);
      expect(result.totalSections).toBe(100);
    });

    it('should return empty progress when none exists', async () => {
      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.ebookSection.count as jest.Mock).mockResolvedValue(50);

      const result = await ebookProgressService.getProgress(userId);

      expect(result.lastChapterId).toBeNull();
      expect(result.lastSectionId).toBeNull();
      expect(result.completedSections).toEqual([]);
      expect(result.overallProgress).toBe(0);
      expect(result.totalSections).toBe(50);
    });

    it('should calculate 100% progress when all sections completed', async () => {
      const completedSections = Array.from({ length: 100 }, (_, i) => `section-${i}`);

      const existingProgress = {
        userId,
        lastChapterId: chapterId,
        lastSectionId: sectionId,
        completedSections,
      };

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue(existingProgress);
      (prisma.ebookSection.count as jest.Mock).mockResolvedValue(100);

      const result = await ebookProgressService.getProgress(userId);

      expect(result.overallProgress).toBe(100);
    });
  });

  describe('getChapterProgress', () => {
    const chapterTitle = 'Chapter 1: Fundamentals';

    it('should return chapter progress with completed sections', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
        title: chapterTitle,
      });

      const sections = [{ id: 'section-1' }, { id: 'section-2' }, { id: 'section-3' }];

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue(sections);

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue({
        completedSections: ['section-1', 'section-3'],
      });

      const result = await ebookProgressService.getChapterProgress(userId, chapterSlug);

      expect(result.chapterSlug).toBe(chapterSlug);
      expect(result.chapterTitle).toBe(chapterTitle);
      expect(result.completedSections).toEqual(['section-1', 'section-3']);
      expect(result.totalSections).toBe(3);
      expect(result.progressPercentage).toBe(67);
    });

    it('should return 0% progress for new chapter', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
        title: chapterTitle,
      });

      const sections = [{ id: 'section-1' }, { id: 'section-2' }];

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue(sections);

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue({
        completedSections: [],
      });

      const result = await ebookProgressService.getChapterProgress(userId, chapterSlug);

      expect(result.progressPercentage).toBe(0);
      expect(result.completedSections).toEqual([]);
    });

    it('should return 100% progress for completed chapter', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
        title: chapterTitle,
      });

      const sections = [{ id: 'section-1' }, { id: 'section-2' }, { id: 'section-3' }];

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue(sections);

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue({
        completedSections: ['section-1', 'section-2', 'section-3'],
      });

      const result = await ebookProgressService.getChapterProgress(userId, chapterSlug);

      expect(result.progressPercentage).toBe(100);
    });

    it('should handle user with no progress record', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
        title: chapterTitle,
      });

      const sections = [{ id: 'section-1' }, { id: 'section-2' }];

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue(sections);

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await ebookProgressService.getChapterProgress(userId, chapterSlug);

      expect(result.progressPercentage).toBe(0);
      expect(result.completedSections).toEqual([]);
    });

    it('should throw error when chapter not found', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(ebookProgressService.getChapterProgress(userId, chapterSlug)).rejects.toThrow(
        `Chapter not found: ${chapterSlug}`
      );
    });
  });

  describe('markSectionComplete', () => {
    it('should create progress record if none exists', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
      });

      (prisma.ebookSection.findUnique as jest.Mock).mockResolvedValue({
        id: sectionId,
      });

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.userEbookProgress.create as jest.Mock).mockResolvedValue({});

      await ebookProgressService.markSectionComplete(userId, chapterSlug, sectionSlug);

      expect(prisma.userEbookProgress.create).toHaveBeenCalledWith({
        data: {
          userId,
          lastChapterId: chapterId,
          lastSectionId: sectionId,
          completedSections: [sectionId],
        },
      });
    });

    it('should add section to completed sections if not already present', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
      });

      (prisma.ebookSection.findUnique as jest.Mock).mockResolvedValue({
        id: sectionId,
      });

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue({
        completedSections: ['other-section'],
      });
      (prisma.userEbookProgress.update as jest.Mock).mockResolvedValue({});

      await ebookProgressService.markSectionComplete(userId, chapterSlug, sectionSlug);

      expect(prisma.userEbookProgress.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          completedSections: ['other-section', sectionId],
        },
      });
    });

    it('should not duplicate section in completed sections', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
      });

      (prisma.ebookSection.findUnique as jest.Mock).mockResolvedValue({
        id: sectionId,
      });

      (prisma.userEbookProgress.findUnique as jest.Mock).mockResolvedValue({
        completedSections: [sectionId],
      });

      await ebookProgressService.markSectionComplete(userId, chapterSlug, sectionSlug);

      expect(prisma.userEbookProgress.update).not.toHaveBeenCalled();
    });

    it('should throw error when chapter not found', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        ebookProgressService.markSectionComplete(userId, chapterSlug, sectionSlug)
      ).rejects.toThrow(`Chapter not found: ${chapterSlug}`);
    });

    it('should throw error when section not found', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        id: chapterId,
      });

      (prisma.ebookSection.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        ebookProgressService.markSectionComplete(userId, chapterSlug, sectionSlug)
      ).rejects.toThrow(`Section not found: ${sectionSlug} in chapter: ${chapterSlug}`);
    });
  });

  describe('resetProgress', () => {
    it('should reset all progress for user', async () => {
      (prisma.userEbookProgress.update as jest.Mock).mockResolvedValue({});

      await ebookProgressService.resetProgress(userId);

      expect(prisma.userEbookProgress.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          lastChapterId: null,
          lastSectionId: null,
          completedSections: [],
        },
      });
    });
  });
});
