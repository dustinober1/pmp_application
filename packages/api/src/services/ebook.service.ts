import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import type { TierName } from '@pmp/shared';
import { TIER_HIERARCHY } from '@pmp/shared';

// Free chapter slugs that are accessible to all users
const FREE_CHAPTER_SLUGS = new Set(['01-introduction', '05-initiation', '11-exam-prep']);

// Local types for ebook responses
interface ChapterListItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isPremium: boolean;
  minTier: string;
  sectionCount: number;
}

interface ChapterDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isPremium: boolean;
  minTier: string;
  sections: SectionListItem[];
}

interface SectionListItem {
  id: string;
  slug: string;
  title: string;
  orderIndex: number;
}

interface SectionDetail {
  id: string;
  slug: string;
  title: string;
  content: string;
  orderIndex: number;
  chapter: {
    id: string;
    slug: string;
    title: string;
  };
  navigation: {
    prevSection: SectionNavigation | null;
    nextSection: SectionNavigation | null;
  };
}

interface SectionNavigation {
  slug: string;
  title: string;
  chapterSlug: string;
}

interface SearchResult {
  chapterSlug: string;
  chapterTitle: string;
  sectionSlug: string;
  sectionTitle: string;
  excerpt: string;
  relevanceScore: number;
}

export class EbookService {
  /**
   * Get all chapters with metadata
   * All users can see the chapter list, but premium chapters will be marked
   */
  async getAllChapters(): Promise<ChapterListItem[]> {
    const chapters = await prisma.ebookChapter.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { sections: true },
        },
      },
    });

    return chapters.map(chapter => ({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      description: chapter.description,
      orderIndex: chapter.orderIndex,
      isPremium: chapter.isPremium,
      minTier: chapter.minTier,
      sectionCount: chapter._count.sections,
    }));
  }

  /**
   * Get a chapter by slug with all its sections
   * Returns full chapter data with sections list (without content)
   */
  async getChapterBySlug(slug: string): Promise<ChapterDetail> {
    const chapter = await prisma.ebookChapter.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            slug: true,
            title: true,
            orderIndex: true,
          },
        },
      },
    });

    if (!chapter) {
      throw AppError.notFound('Chapter not found', 'CHAPTER_NOT_FOUND');
    }

    return {
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      description: chapter.description,
      orderIndex: chapter.orderIndex,
      isPremium: chapter.isPremium,
      minTier: chapter.minTier,
      sections: chapter.sections,
    };
  }

  /**
   * Get a specific section by chapter and section slugs
   * Includes access control based on subscription tier
   */
  async getSectionBySlug(
    chapterSlug: string,
    sectionSlug: string,
    userTier: TierName | null
  ): Promise<SectionDetail> {
    const chapter = await prisma.ebookChapter.findUnique({
      where: { slug: chapterSlug },
      select: {
        id: true,
        slug: true,
        title: true,
        isPremium: true,
        minTier: true,
      },
    });

    if (!chapter) {
      throw AppError.notFound('Chapter not found', 'CHAPTER_NOT_FOUND');
    }

    // Check access control
    this.checkChapterAccess(chapter.slug, chapter.isPremium, chapter.minTier, userTier);

    const section = await prisma.ebookSection.findFirst({
      where: {
        chapterId: chapter.id,
        slug: sectionSlug,
      },
      include: {
        chapter: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    if (!section) {
      throw AppError.notFound('Section not found', 'SECTION_NOT_FOUND');
    }

    // Get navigation info
    const [prevSection, nextSection] = await Promise.all([
      prisma.ebookSection.findFirst({
        where: {
          chapterId: chapter.id,
          orderIndex: { lt: section.orderIndex },
        },
        orderBy: { orderIndex: 'desc' },
        select: {
          slug: true,
          title: true,
        },
      }),
      prisma.ebookSection.findFirst({
        where: {
          chapterId: chapter.id,
          orderIndex: { gt: section.orderIndex },
        },
        orderBy: { orderIndex: 'asc' },
        select: {
          slug: true,
          title: true,
        },
      }),
    ]);

    return {
      id: section.id,
      slug: section.slug,
      title: section.title,
      content: section.content,
      orderIndex: section.orderIndex,
      chapter: section.chapter,
      navigation: {
        prevSection: prevSection
          ? {
              slug: prevSection.slug,
              title: prevSection.title,
              chapterSlug: chapterSlug,
            }
          : null,
        nextSection: nextSection
          ? {
              slug: nextSection.slug,
              title: nextSection.title,
              chapterSlug: chapterSlug,
            }
          : null,
      },
    };
  }

  /**
   * Search across all section titles and content
   * Returns results with chapter and section info
   */
  async searchContent(query: string, userTier: TierName | null): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerms = query.trim().toLowerCase();

    // Get all chapters to check access
    const chapters = await prisma.ebookChapter.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        isPremium: true,
        minTier: true,
      },
    });

    // Build map of accessible chapter IDs
    const accessibleChapterIds = new Set<string>();
    const chapterSlugToTitle = new Map<string, string>();

    for (const chapter of chapters) {
      chapterSlugToTitle.set(chapter.slug, chapter.title);
      if (this.canAccessChapter(chapter.slug, chapter.isPremium, chapter.minTier, userTier)) {
        accessibleChapterIds.add(chapter.id);
      }
    }

    // Search sections in accessible chapters
    const sections = await prisma.ebookSection.findMany({
      where: {
        chapterId: { in: Array.from(accessibleChapterIds) },
        OR: [
          { title: { contains: searchTerms, mode: 'insensitive' } },
          { content: { contains: searchTerms, mode: 'insensitive' } },
        ],
      },
      include: {
        chapter: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });

    // Calculate relevance scores and format results
    const results: SearchResult[] = sections
      .map(section => {
        const titleLower = section.title.toLowerCase();
        const contentLower = section.content.toLowerCase();

        let relevanceScore = 0;
        if (titleLower.includes(searchTerms)) relevanceScore += 10;
        if (titleLower.startsWith(searchTerms)) relevanceScore += 5;
        relevanceScore += (contentLower.match(new RegExp(searchTerms, 'gi')) || []).length;

        // Get excerpt from content (first 200 chars containing query)
        const matchIndex = contentLower.indexOf(searchTerms);
        let excerpt = '';
        if (matchIndex >= 0) {
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(section.content.length, matchIndex + searchTerms.length + 50);
          excerpt =
            (start > 0 ? '...' : '') +
            section.content.slice(start, end) +
            (end < section.content.length ? '...' : '');
        } else {
          excerpt = section.content.slice(0, 200) + '...';
        }

        return {
          chapterSlug: section.chapter.slug,
          chapterTitle: section.chapter.title,
          sectionSlug: section.slug,
          sectionTitle: section.title,
          excerpt: excerpt.replace(/\n+/g, ' ').trim(),
          relevanceScore,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20); // Limit to 20 results

    return results;
  }

  /**
   * Check if user can access a chapter based on tier
   */
  private checkChapterAccess(
    chapterSlug: string,
    isPremium: boolean,
    minTier: string,
    userTier: TierName | null
  ): void {
    if (!isPremium || FREE_CHAPTER_SLUGS.has(chapterSlug)) {
      return;
    }

    const effectiveUserTier = userTier || 'free';
    const userTierLevel = TIER_HIERARCHY[effectiveUserTier];
    const requiredTierLevel = TIER_HIERARCHY[minTier as TierName];

    if (userTierLevel < requiredTierLevel) {
      throw AppError.forbidden(
        'This content requires a premium subscription',
        'PREMIUM_CONTENT',
        `Upgrade to ${minTier} tier or higher to access this content`
      );
    }
  }

  /**
   * Helper to check if chapter is accessible (for search filtering)
   */
  private canAccessChapter(
    chapterSlug: string,
    isPremium: boolean,
    minTier: string,
    userTier: TierName | null
  ): boolean {
    if (!isPremium || FREE_CHAPTER_SLUGS.has(chapterSlug)) {
      return true;
    }

    const effectiveUserTier = userTier || 'free';
    const userTierLevel = TIER_HIERARCHY[effectiveUserTier];
    const requiredTierLevel = TIER_HIERARCHY[minTier as TierName];

    return userTierLevel >= requiredTierLevel;
  }
}

export const ebookService = new EbookService();
