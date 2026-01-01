/**
 * Comprehensive tests for ebook.service with tier-based access control
 * Targeting 80%+ code coverage
 */

import { EbookService } from './ebook.service';
import prisma from '../config/database';
import type { TierName } from '@pmp/shared';

// Mock Prisma Client
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    ebookChapter: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    ebookSection: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('EbookService - Tier-Based Access Control', () => {
  let ebookService: EbookService;

  beforeEach(() => {
    ebookService = new EbookService();
    jest.resetAllMocks();
  });

  const mockChapter = (overrides: { slug: string; isPremium?: boolean; minTier?: string }) => ({
    id: 'chapter-1',
    slug: overrides.slug,
    title: 'Chapter Title',
    description: 'Chapter description',
    orderIndex: 1,
    isPremium: overrides.isPremium ?? false,
    minTier: overrides.minTier ?? 'free',
  });

  const mockSection = (overrides: { chapterId: string; slug: string; orderIndex?: number }) => ({
    id: 'section-1',
    chapterId: overrides.chapterId,
    slug: overrides.slug,
    title: 'Section Title',
    content: 'Section content with some text',
    orderIndex: overrides.orderIndex ?? 1,
    chapter: {
      id: 'chapter-1',
      slug: 'chapter-slug',
      title: 'Chapter Title',
    },
  });

  describe('getAllChapters', () => {
    it('should return all chapters with metadata', async () => {
      const chapters = [
        mockChapter({ slug: '01-introduction', isPremium: false, minTier: 'free' }),
        mockChapter({ slug: '02-planning', isPremium: true, minTier: 'mid-level' }),
      ];

      (prisma.ebookChapter.findMany as jest.Mock).mockResolvedValue([
        { ...chapters[0], _count: { sections: 5 } },
        { ...chapters[1], _count: { sections: 10 } },
      ]);

      const result = await ebookService.getAllChapters();

      expect(result).toHaveLength(2);
      if (result[0]) {
        expect(result[0].slug).toBe('01-introduction');
        expect(result[0].isPremium).toBe(false);
        expect(result[0].minTier).toBe('free');
        expect(result[0].sectionCount).toBe(5);
      }
      if (result[1]) {
        expect(result[1].slug).toBe('02-planning');
        expect(result[1].isPremium).toBe(true);
        expect(result[1].minTier).toBe('mid-level');
        expect(result[1].sectionCount).toBe(10);
      }
    });

    it('should return empty array when no chapters exist', async () => {
      (prisma.ebookChapter.findMany as jest.Mock).mockResolvedValue([]);

      const result = await ebookService.getAllChapters();

      expect(result).toEqual([]);
    });
  });

  describe('getChapterBySlug', () => {
    it('should return chapter with sections', async () => {
      const chapter = mockChapter({ slug: '01-introduction', isPremium: false, minTier: 'free' });

      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue({
        ...chapter,
        sections: [
          { id: 'section-1', slug: 'section-1', title: 'Section 1', orderIndex: 1 },
          { id: 'section-2', slug: 'section-2', title: 'Section 2', orderIndex: 2 },
        ],
      });

      const result = await ebookService.getChapterBySlug('01-introduction');

      expect(result.slug).toBe('01-introduction');
      expect(result.sections).toHaveLength(2);
      if (result.sections[0]) {
        expect(result.sections[0].slug).toBe('section-1');
      }
    });

    it('should throw error when chapter not found', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(ebookService.getChapterBySlug('non-existent')).rejects.toMatchObject({
        statusCode: 404,
        code: 'CHAPTER_NOT_FOUND',
      });
    });
  });

  describe('getSectionBySlug - Free Chapters (accessible to all)', () => {
    const freeChapterSlugs = ['01-introduction', '05-initiation', '11-exam-prep'];

    test.each(freeChapterSlugs)(
      'should allow access to free chapter %s for anonymous user',
      async chapterSlug => {
        const chapter = mockChapter({ slug: chapterSlug, isPremium: false, minTier: 'free' });

        (prisma.ebookChapter.findUnique as jest.Mock)
          .mockResolvedValueOnce(chapter)
          .mockResolvedValueOnce(chapter);

        (prisma.ebookSection.findFirst as jest.Mock).mockResolvedValue(
          mockSection({ chapterId: 'chapter-1', slug: 'section-1' })
        );

        const result = await ebookService.getSectionBySlug(chapterSlug, 'section-1', null);

        expect(result.slug).toBe('section-1');
        expect(result.content).toBeDefined();
      }
    );

    test.each(freeChapterSlugs)(
      'should allow access to free chapter %s for free user',
      async chapterSlug => {
        const chapter = mockChapter({ slug: chapterSlug, isPremium: false, minTier: 'free' });

        (prisma.ebookChapter.findUnique as jest.Mock)
          .mockResolvedValueOnce(chapter)
          .mockResolvedValueOnce(chapter);

        (prisma.ebookSection.findFirst as jest.Mock).mockResolvedValue(
          mockSection({ chapterId: 'chapter-1', slug: 'section-1' })
        );

        const result = await ebookService.getSectionBySlug(chapterSlug, 'section-1', 'free');

        expect(result.slug).toBe('section-1');
        expect(result.content).toBeDefined();
      }
    );

    test.each(freeChapterSlugs)(
      'should allow access to free chapter %s for mid-level user',
      async chapterSlug => {
        const chapter = mockChapter({ slug: chapterSlug, isPremium: false, minTier: 'free' });

        (prisma.ebookChapter.findUnique as jest.Mock)
          .mockResolvedValueOnce(chapter)
          .mockResolvedValueOnce(chapter);

        (prisma.ebookSection.findFirst as jest.Mock).mockResolvedValue(
          mockSection({ chapterId: 'chapter-1', slug: 'section-1' })
        );

        const result = await ebookService.getSectionBySlug(chapterSlug, 'section-1', 'mid-level');

        expect(result.slug).toBe('section-1');
        expect(result.content).toBeDefined();
      }
    );
  });

  describe('getSectionBySlug - Premium Chapters (tier-based access)', () => {
    it('should deny access to premium chapter for free user', async () => {
      const chapter = mockChapter({ slug: '02-planning', isPremium: true, minTier: 'mid-level' });

      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValueOnce(chapter);

      await expect(
        ebookService.getSectionBySlug('02-planning', 'section-1', 'free')
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'PREMIUM_CONTENT',
      });
    });

    it('should deny access to premium chapter for anonymous user', async () => {
      const chapter = mockChapter({ slug: '02-planning', isPremium: true, minTier: 'mid-level' });

      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValueOnce(chapter);

      await expect(
        ebookService.getSectionBySlug('02-planning', 'section-1', null)
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'PREMIUM_CONTENT',
      });
    });

    it('should allow access to mid-level premium chapter for mid-level user', async () => {
      const chapter = mockChapter({ slug: '02-planning', isPremium: true, minTier: 'mid-level' });

      (prisma.ebookChapter.findUnique as jest.Mock)
        .mockResolvedValueOnce(chapter)
        .mockResolvedValueOnce(chapter);

      (prisma.ebookSection.findFirst as jest.Mock).mockResolvedValue(
        mockSection({ chapterId: 'chapter-1', slug: 'section-1' })
      );

      const result = await ebookService.getSectionBySlug('02-planning', 'section-1', 'mid-level');

      expect(result.slug).toBe('section-1');
      expect(result.content).toBeDefined();
    });

    it('should allow access to mid-level premium chapter for high-end user', async () => {
      const chapter = mockChapter({ slug: '02-planning', isPremium: true, minTier: 'mid-level' });

      (prisma.ebookChapter.findUnique as jest.Mock)
        .mockResolvedValueOnce(chapter)
        .mockResolvedValueOnce(chapter);

      (prisma.ebookSection.findFirst as jest.Mock).mockResolvedValue(
        mockSection({ chapterId: 'chapter-1', slug: 'section-1' })
      );

      const result = await ebookService.getSectionBySlug('02-planning', 'section-1', 'high-end');

      expect(result.slug).toBe('section-1');
      expect(result.content).toBeDefined();
    });

    it('should allow access to mid-level premium chapter for corporate user', async () => {
      const chapter = mockChapter({ slug: '02-planning', isPremium: true, minTier: 'mid-level' });

      (prisma.ebookChapter.findUnique as jest.Mock)
        .mockResolvedValueOnce(chapter)
        .mockResolvedValueOnce(chapter);

      (prisma.ebookSection.findFirst as jest.Mock).mockResolvedValue(
        mockSection({ chapterId: 'chapter-1', slug: 'section-1' })
      );

      const result = await ebookService.getSectionBySlug('02-planning', 'section-1', 'corporate');

      expect(result.slug).toBe('section-1');
      expect(result.content).toBeDefined();
    });

    it('should deny access to high-end premium chapter for mid-level user', async () => {
      const chapter = mockChapter({ slug: '03-advanced', isPremium: true, minTier: 'high-end' });

      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValueOnce(chapter);

      await expect(
        ebookService.getSectionBySlug('03-advanced', 'section-1', 'mid-level')
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'PREMIUM_CONTENT',
      });
    });

    it('should allow access to high-end premium chapter for high-end user', async () => {
      const chapter = mockChapter({ slug: '03-advanced', isPremium: true, minTier: 'high-end' });

      (prisma.ebookChapter.findUnique as jest.Mock)
        .mockResolvedValueOnce(chapter)
        .mockResolvedValueOnce(chapter);

      (prisma.ebookSection.findFirst as jest.Mock).mockResolvedValue(
        mockSection({ chapterId: 'chapter-1', slug: 'section-1' })
      );

      const result = await ebookService.getSectionBySlug('03-advanced', 'section-1', 'high-end');

      expect(result.slug).toBe('section-1');
      expect(result.content).toBeDefined();
    });

    it('should allow access to high-end premium chapter for corporate user', async () => {
      const chapter = mockChapter({ slug: '03-advanced', isPremium: true, minTier: 'high-end' });

      (prisma.ebookChapter.findUnique as jest.Mock)
        .mockResolvedValueOnce(chapter)
        .mockResolvedValueOnce(chapter);

      (prisma.ebookSection.findFirst as jest.Mock).mockResolvedValue(
        mockSection({ chapterId: 'chapter-1', slug: 'section-1' })
      );

      const result = await ebookService.getSectionBySlug('03-advanced', 'section-1', 'corporate');

      expect(result.slug).toBe('section-1');
      expect(result.content).toBeDefined();
    });
  });

  describe('getSectionBySlug - Navigation', () => {
    it('should include navigation with previous and next sections', async () => {
      const chapter = mockChapter({ slug: '01-introduction', isPremium: false, minTier: 'free' });

      (prisma.ebookChapter.findUnique as jest.Mock)
        .mockResolvedValueOnce(chapter)
        .mockResolvedValueOnce(chapter);

      (prisma.ebookSection.findFirst as jest.Mock)
        .mockResolvedValueOnce(
          mockSection({ chapterId: 'chapter-1', slug: 'section-2', orderIndex: 2 })
        )
        .mockResolvedValueOnce({ slug: 'section-1', title: 'Section 1' }) // prev
        .mockResolvedValueOnce({ slug: 'section-3', title: 'Section 3' }); // next

      const result = await ebookService.getSectionBySlug('01-introduction', 'section-2', null);

      expect(result.navigation.prevSection).toEqual({
        slug: 'section-1',
        title: 'Section 1',
        chapterSlug: '01-introduction',
      });
      expect(result.navigation.nextSection).toEqual({
        slug: 'section-3',
        title: 'Section 3',
        chapterSlug: '01-introduction',
      });
    });

    it('should return null for prevSection when at first section', async () => {
      const chapter = mockChapter({ slug: '01-introduction', isPremium: false, minTier: 'free' });

      (prisma.ebookChapter.findUnique as jest.Mock)
        .mockResolvedValueOnce(chapter)
        .mockResolvedValueOnce(chapter);

      (prisma.ebookSection.findFirst as jest.Mock)
        .mockResolvedValueOnce(
          mockSection({ chapterId: 'chapter-1', slug: 'section-1', orderIndex: 1 })
        )
        .mockResolvedValueOnce(null) // prev
        .mockResolvedValueOnce({ slug: 'section-2', title: 'Section 2' }); // next

      const result = await ebookService.getSectionBySlug('01-introduction', 'section-1', null);

      expect(result.navigation.prevSection).toBeNull();
      expect(result.navigation.nextSection).not.toBeNull();
    });
  });

  describe('getSectionBySlug - Error Cases', () => {
    it('should throw error when chapter not found', async () => {
      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        ebookService.getSectionBySlug('non-existent', 'section-1', 'free')
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'CHAPTER_NOT_FOUND',
      });
    });

    it('should throw error when section not found', async () => {
      const chapter = mockChapter({ slug: '01-introduction', isPremium: false, minTier: 'free' });

      (prisma.ebookChapter.findUnique as jest.Mock)
        .mockResolvedValueOnce(chapter)
        .mockResolvedValueOnce(chapter);

      (prisma.ebookSection.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        ebookService.getSectionBySlug('01-introduction', 'non-existent', 'free')
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'SECTION_NOT_FOUND',
      });
    });
  });

  describe('searchContent - Tier-based filtering', () => {
    const mockChapters = [
      mockChapter({ slug: '01-introduction', isPremium: false, minTier: 'free' }),
      mockChapter({ slug: '02-planning', isPremium: true, minTier: 'mid-level' }),
      mockChapter({ slug: '03-advanced', isPremium: true, minTier: 'high-end' }),
    ];

    it('should return only free content for anonymous user', async () => {
      (prisma.ebookChapter.findMany as jest.Mock).mockResolvedValue(mockChapters);

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue([
        {
          title: 'Introduction Section',
          content: 'This is about project management fundamentals',
          chapter: { slug: '01-introduction', title: 'Introduction' },
        },
      ]);

      const searchResult = await ebookService.searchContent('project management', null);

      expect(searchResult.results).toHaveLength(1);
      expect(searchResult.results[0]?.chapterSlug).toBe('01-introduction');
    });

    it('should return free + mid-level content for mid-level user', async () => {
      (prisma.ebookChapter.findMany as jest.Mock).mockResolvedValue(mockChapters);

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue([
        {
          title: 'Introduction Section',
          content: 'This is about project management fundamentals',
          chapter: { slug: '01-introduction', title: 'Introduction' },
        },
        {
          title: 'Planning Section',
          content: 'Advanced planning techniques for projects',
          chapter: { slug: '02-planning', title: 'Planning' },
        },
      ]);

      const searchResult = await ebookService.searchContent('project', 'mid-level');

      expect(searchResult.results).toHaveLength(2);
      const chapterSlugs = searchResult.results.map(r => r.chapterSlug);
      expect(chapterSlugs).toContain('01-introduction');
      expect(chapterSlugs).toContain('02-planning');
    });

    it('should return all content for corporate user', async () => {
      (prisma.ebookChapter.findMany as jest.Mock).mockResolvedValue(mockChapters);

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue([
        {
          title: 'Introduction Section',
          content: 'This is about project management fundamentals',
          chapter: { slug: '01-introduction', title: 'Introduction' },
        },
        {
          title: 'Planning Section',
          content: 'Advanced planning techniques for projects',
          chapter: { slug: '02-planning', title: 'Planning' },
        },
        {
          title: 'Advanced Section',
          content: 'Advanced topics in project management',
          chapter: { slug: '03-advanced', title: 'Advanced' },
        },
      ]);

      const searchResult = await ebookService.searchContent('project', 'corporate');

      expect(searchResult.results).toHaveLength(3);
    });

    it('should return empty array for short query', async () => {
      const searchResult = await ebookService.searchContent('x', 'free');

      expect(searchResult.results).toEqual([]);
      expect(searchResult.pagination.total).toBe(0);
    });

    it('should return empty array for empty query', async () => {
      const searchResult = await ebookService.searchContent('', 'free');

      expect(searchResult.results).toEqual([]);
      expect(searchResult.pagination.total).toBe(0);
    });

    it('should rank results by relevance score', async () => {
      (prisma.ebookChapter.findMany as jest.Mock).mockResolvedValue([mockChapters[0]]);

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue([
        {
          title: 'Project Management Fundamentals',
          content: 'project management fundamentals',
          chapter: { slug: '01-introduction', title: 'Introduction' },
        },
        {
          title: 'Some Other Topic',
          content: 'This mentions project management in passing',
          chapter: { slug: '01-introduction', title: 'Introduction' },
        },
      ]);

      const searchResult = await ebookService.searchContent('project management', 'free');

      if (searchResult.results[0] && searchResult.results[1]) {
        expect(searchResult.results[0].relevanceScore).toBeGreaterThan(
          searchResult.results[1].relevanceScore
        );
      }
    });

    it('should limit results to default page size', async () => {
      (prisma.ebookChapter.findMany as jest.Mock).mockResolvedValue([mockChapters[0]]);

      const manySections = Array.from({ length: 30 }, (_, i) => ({
        title: `Section ${i}`,
        content: 'project management content',
        chapter: { slug: '01-introduction', title: 'Introduction' },
      }));

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue(manySections);

      const searchResult = await ebookService.searchContent('project', 'free');

      expect(searchResult.results.length).toBeLessThanOrEqual(20);
      expect(searchResult.pagination.total).toBe(30);
    });

    it('should generate excerpts from content', async () => {
      (prisma.ebookChapter.findMany as jest.Mock).mockResolvedValue([mockChapters[0]]);

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue([
        {
          title: 'Test Section',
          content: 'This is a long text with the search term project management in the middle',
          chapter: { slug: '01-introduction', title: 'Introduction' },
        },
      ]);

      const searchResult = await ebookService.searchContent('project management', 'free');

      expect(searchResult.results[0]?.excerpt).toContain('project management');
      expect(searchResult.results[0]?.excerpt.length).toBeGreaterThan(0);
    });

    it('should respect custom page and limit options', async () => {
      (prisma.ebookChapter.findMany as jest.Mock).mockResolvedValue([mockChapters[0]]);

      const manySections = Array.from({ length: 25 }, (_, i) => ({
        title: `Section ${i}`,
        content: 'project management content',
        chapter: { slug: '01-introduction', title: 'Introduction' },
      }));

      (prisma.ebookSection.findMany as jest.Mock).mockResolvedValue(manySections);

      const searchResult = await ebookService.searchContent('project', 'free', {
        page: 2,
        limit: 10,
      });

      expect(searchResult.results.length).toBeLessThanOrEqual(10);
      expect(searchResult.pagination.page).toBe(2);
      expect(searchResult.pagination.limit).toBe(10);
      expect(searchResult.pagination.hasNext).toBe(true);
      expect(searchResult.pagination.hasPrev).toBe(true);
    });
  });

  describe('Tier hierarchy edge cases', () => {
    it('should handle null userTier as free tier', async () => {
      const chapter = mockChapter({ slug: '02-planning', isPremium: true, minTier: 'mid-level' });

      (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValueOnce(chapter);

      await expect(
        ebookService.getSectionBySlug('02-planning', 'section-1', null)
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'PREMIUM_CONTENT',
      });
    });

    it('should handle all tier levels correctly', async () => {
      const tierLevels: Array<TierName> = ['free', 'mid-level', 'high-end', 'corporate'];

      for (const tier of tierLevels) {
        jest.clearAllMocks();
        const chapter = mockChapter({ slug: '02-planning', isPremium: true, minTier: 'mid-level' });

        (prisma.ebookChapter.findUnique as jest.Mock).mockResolvedValueOnce(chapter);

        if (tier === 'free') {
          await expect(
            ebookService.getSectionBySlug('02-planning', 'section-1', tier)
          ).rejects.toMatchObject({
            statusCode: 403,
            code: 'PREMIUM_CONTENT',
          });
        } else {
          (prisma.ebookChapter.findUnique as jest.Mock)
            .mockResolvedValueOnce(chapter)
            .mockResolvedValueOnce(chapter);
          (prisma.ebookSection.findFirst as jest.Mock).mockResolvedValueOnce(
            mockSection({ chapterId: 'chapter-1', slug: 'section-1' })
          );

          const result = await ebookService.getSectionBySlug('02-planning', 'section-1', tier);
          expect(result.slug).toBe('section-1');
        }
      }
    });
  });
});
