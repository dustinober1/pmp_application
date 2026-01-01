/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Path to the PMP-2026 guide markdown files
const GUIDE_BASE_PATH = '/Users/dustinober/PMP-2026/guide';

// Define chapter configuration
const CHAPTERS = [
  // FREE chapters
  { slug: '01-introduction', orderIndex: 1, isPremium: false, titlePrefix: '1' },
  { slug: '02-strategic', orderIndex: 2, isPremium: true, titlePrefix: '2' },
  { slug: '03-team-leadership', orderIndex: 3, isPremium: true, titlePrefix: '3' },
  { slug: '04-stakeholder', orderIndex: 4, isPremium: true, titlePrefix: '4' },
  { slug: '05-initiation', orderIndex: 5, isPremium: false, titlePrefix: '5' },
  { slug: '06-project-planning', orderIndex: 6, isPremium: true, titlePrefix: '6' },
  { slug: '07-risk-quality', orderIndex: 7, isPremium: true, titlePrefix: '7' },
  { slug: '08-execution', orderIndex: 8, isPremium: true, titlePrefix: '8' },
  { slug: '09-monitoring', orderIndex: 9, isPremium: true, titlePrefix: '9' },
  { slug: '10-ai-pm', orderIndex: 10, isPremium: true, titlePrefix: '10' },
  { slug: '11-exam-prep', orderIndex: 11, isPremium: false, titlePrefix: '11' },
  { slug: 'appendices', orderIndex: 12, isPremium: true, titlePrefix: 'A' },
];

/**
 * Extract title from markdown content
 * Looks for first h1 heading (# Title) or derives from filename
 */
function extractTitleFromMarkdown(content: string, filename: string): string {
  // Try to find first h1 heading
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }

  // Derive from filename
  return filename
    .replace(/\.md$/, '')
    .split('-')
    .map(word => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
}

/**
 * Extract description from index.md
 * Takes the first paragraph or a summary from the beginning
 */
function extractDescriptionFromIndex(content: string): string {
  // Remove the title line
  const lines = content.split('\n').filter(line => !line.match(/^#\s+/));

  // Find the first paragraph (non-empty line that's not a heading)
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('<') && trimmed.length > 20) {
      // Take up to 500 characters for description
      return trimmed.substring(0, 500) + (trimmed.length > 500 ? '...' : '');
    }
  }

  return 'Chapter content and study materials.';
}

/**
 * Parse chapter title from index.md
 */
function parseChapterTitle(indexContent: string, chapterSlug: string): string {
  const h1Match = indexContent.match(/^#\s+(.+)$/m);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }

  // Fallback: derive from slug
  return (
    chapterSlug
      .split('-')
      .map(word => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
      .join(' ') + ' (Chapter)'
  );
}

/**
 * Convert filename to slug
 */
function filenameToSlug(filename: string): string {
  return filename.replace(/\.md$/, '');
}

/**
 * Read all markdown files from a directory
 */
function getMarkdownFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);
  return files.filter(file => file.endsWith('.md'));
}

/**
 * Parse and import a single chapter
 */
async function importChapter(chapterConfig: {
  slug: string;
  orderIndex: number;
  isPremium: boolean;
  titlePrefix: string;
}): Promise<void> {
  const chapterPath = path.join(GUIDE_BASE_PATH, chapterConfig.slug);
  const indexPath = path.join(chapterPath, 'index.md');

  if (!fs.existsSync(chapterPath)) {
    console.warn(`    ⚠️ Chapter directory not found: ${chapterConfig.slug}`);
    return;
  }

  if (!fs.existsSync(indexPath)) {
    console.warn(`    ⚠️ index.md not found for chapter: ${chapterConfig.slug}`);
    return;
  }

  // Read index.md for chapter metadata
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  const chapterTitle = parseChapterTitle(indexContent, chapterConfig.slug);
  const chapterDescription = extractDescriptionFromIndex(indexContent);

  // Create or update chapter
  const chapter = await prisma.ebookChapter.upsert({
    where: { slug: chapterConfig.slug },
    update: {
      title: chapterTitle,
      description: chapterDescription,
      orderIndex: chapterConfig.orderIndex,
      isPremium: chapterConfig.isPremium,
      minTier: chapterConfig.isPremium ? 'mid-level' : 'free',
    },
    create: {
      slug: chapterConfig.slug,
      title: chapterTitle,
      description: chapterDescription,
      orderIndex: chapterConfig.orderIndex,
      isPremium: chapterConfig.isPremium,
      minTier: chapterConfig.isPremium ? 'mid-level' : 'free',
    },
  });

  console.log(
    `    ${chapterConfig.isPremium ? '🔒' : '📖'} ${chapterTitle} (${chapterConfig.slug})`
  );

  // Get all markdown files except index.md
  const mdFiles = getMarkdownFiles(chapterPath).filter(f => f !== 'index.md');
  mdFiles.sort(); // Alphabetical sort for consistent ordering

  const sections: Array<{ id: string; slug: string; orderIndex: number }> = [];

  // Import each section
  for (let i = 0; i < mdFiles.length; i++) {
    const file = mdFiles[i]!;
    const filePath = path.join(chapterPath, file);
    const slug = filenameToSlug(file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const title = extractTitleFromMarkdown(content, file);

    const prevFile = mdFiles[i - 1];
    const nextFile = mdFiles[i + 1];

    const section = await prisma.ebookSection.upsert({
      where: {
        chapterId_slug: {
          chapterId: chapter.id,
          slug: slug,
        },
      },
      update: {
        title: title,
        content: content,
        orderIndex: i,
        prevSection: prevFile ? filenameToSlug(prevFile) : null,
        nextSection: nextFile ? filenameToSlug(nextFile) : null,
      },
      create: {
        chapterId: chapter.id,
        slug: slug,
        title: title,
        content: content,
        orderIndex: i,
        prevSection: prevFile ? filenameToSlug(prevFile) : null,
        nextSection: nextFile ? filenameToSlug(nextFile) : null,
      },
    });

    sections.push({ id: section.id, slug: section.slug, orderIndex: i });
  }

  console.log(`       ✅ Imported ${sections.length} sections`);
}

async function main() {
  console.log('📚 Seeding PMP 2026 Ebook from markdown files...');
  console.log(`   Source: ${GUIDE_BASE_PATH}`);

  // Verify guide directory exists
  if (!fs.existsSync(GUIDE_BASE_PATH)) {
    console.error(`❌ Guide directory not found: ${GUIDE_BASE_PATH}`);
    console.error('   Please ensure the PMP-2026/guide directory exists.');
    process.exit(1);
  }

  let totalChapters = 0;
  let totalSections = 0;

  // Import each chapter
  for (const chapterConfig of CHAPTERS) {
    await importChapter(chapterConfig);
    totalChapters++;

    // Count sections
    const chapterPath = path.join(GUIDE_BASE_PATH, chapterConfig.slug);
    if (fs.existsSync(chapterPath)) {
      const mdFiles = getMarkdownFiles(chapterPath).filter(f => f !== 'index.md');
      totalSections += mdFiles.length;
    }
  }

  console.log(`\n✅ Ebook seed completed!`);
  console.log(`   📖 Chapters imported: ${totalChapters}`);
  console.log(`   📄 Sections imported: ${totalSections}`);
  console.log(`   📁 Source: ${GUIDE_BASE_PATH}`);
}

main()
  .catch(e => {
    console.error('❌ Ebook seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
