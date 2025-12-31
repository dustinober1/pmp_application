import { Domain, Task, StudyGuide, SearchResult, UserStudyProgress, DomainProgress } from '@pmp/shared';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class ContentService {
    /**
     * Get all domains
     */
    async getDomains(): Promise<Domain[]> {
        const domains = await prisma.domain.findMany({
            orderBy: { orderIndex: 'asc' },
            include: {
                _count: {
                    select: { tasks: true },
                },
            },
        });

        return domains.map(domain => ({
            id: domain.id,
            name: domain.name,
            code: domain.code,
            description: domain.description,
            weightPercentage: domain.weightPercentage,
            orderIndex: domain.orderIndex,
        }));
    }

    /**
     * Get domain by ID
     */
    async getDomainById(domainId: string): Promise<Domain | null> {
        const domain = await prisma.domain.findUnique({
            where: { id: domainId },
            include: { tasks: { orderBy: { orderIndex: 'asc' } } },
        });

        if (!domain) return null;

        return {
            id: domain.id,
            name: domain.name,
            code: domain.code,
            description: domain.description,
            weightPercentage: domain.weightPercentage,
            orderIndex: domain.orderIndex,
            tasks: domain.tasks.map(task => ({
                id: task.id,
                domainId: task.domainId,
                code: task.code,
                name: task.name,
                description: task.description,
                enablers: task.enablers as string[],
                orderIndex: task.orderIndex,
            })),
        };
    }

    /**
     * Get tasks by domain
     */
    async getTasksByDomain(domainId: string): Promise<Task[]> {
        const tasks = await prisma.task.findMany({
            where: { domainId },
            orderBy: { orderIndex: 'asc' },
            include: { domain: true },
        });

        return tasks.map(task => ({
            id: task.id,
            domainId: task.domainId,
            code: task.code,
            name: task.name,
            description: task.description,
            enablers: task.enablers as string[],
            orderIndex: task.orderIndex,
        }));
    }

    /**
     * Get task by ID
     */
    async getTaskById(taskId: string): Promise<Task | null> {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { domain: true },
        });

        if (!task) return null;

        return {
            id: task.id,
            domainId: task.domainId,
            code: task.code,
            name: task.name,
            description: task.description,
            enablers: task.enablers as string[],
            orderIndex: task.orderIndex,
        };
    }

    /**
     * Get study guide for a task
     */
    async getStudyGuide(taskId: string): Promise<StudyGuide | null> {
        const guide = await prisma.studyGuide.findUnique({
            where: { taskId },
            include: {
                sections: { orderBy: { orderIndex: 'asc' } },
                task: { include: { domain: true } },
            },
        });

        if (!guide) return null;

        // Get related flashcards and questions
        const [flashcards, questions] = await Promise.all([
            prisma.flashcard.findMany({
                where: { taskId },
                select: { id: true },
                take: 10,
            }),
            prisma.practiceQuestion.findMany({
                where: { taskId },
                select: { id: true },
                take: 10,
            }),
        ]);

        return {
            id: guide.id,
            taskId: guide.taskId,
            title: guide.title,
            sections: guide.sections.map(section => ({
                id: section.id,
                studyGuideId: section.studyGuideId,
                title: section.title,
                content: section.content,
                orderIndex: section.orderIndex,
            })),
            relatedFormulas: [], // TODO: Add formula relations
            relatedFlashcardIds: flashcards.map(f => f.id),
            relatedQuestionIds: questions.map(q => q.id),
            createdAt: guide.createdAt,
            updatedAt: guide.updatedAt,
        };
    }

    /**
     * Mark a study section as complete
     */
    async markSectionComplete(userId: string, sectionId: string): Promise<void> {
        // Verify section exists
        const section = await prisma.studySection.findUnique({
            where: { id: sectionId },
        });

        if (!section) {
            throw AppError.notFound('Section not found');
        }

        await prisma.studyProgress.upsert({
            where: {
                userId_sectionId: { userId, sectionId },
            },
            update: {
                completed: true,
                completedAt: new Date(),
            },
            create: {
                userId,
                sectionId,
                completed: true,
                completedAt: new Date(),
            },
        });
    }

    /**
     * Get user's study progress
     */
    async getUserProgress(userId: string): Promise<UserStudyProgress> {
        // Get all sections count
        const totalSections = await prisma.studySection.count();

        // Get completed sections for user
        const completedProgress = await prisma.studyProgress.findMany({
            where: { userId, completed: true },
            include: {
                section: {
                    include: {
                        studyGuide: {
                            include: { task: { include: { domain: true } } },
                        },
                    },
                },
            },
        });

        // Get progress by domain
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

        const domainProgress: DomainProgress[] = domains.map(domain => {
            let totalDomainSections = 0;
            let completedDomainSections = 0;

            domain.tasks.forEach(task => {
                if (task.studyGuide) {
                    totalDomainSections += task.studyGuide.sections.length;
                    task.studyGuide.sections.forEach(section => {
                        if (completedProgress.some(p => p.sectionId === section.id)) {
                            completedDomainSections++;
                        }
                    });
                }
            });

            return {
                domainId: domain.id,
                domainName: domain.name,
                totalSections: totalDomainSections,
                completedSections: completedDomainSections,
                progress: totalDomainSections > 0
                    ? Math.round((completedDomainSections / totalDomainSections) * 100)
                    : 0,
            };
        });

        return {
            userId,
            totalSections,
            completedSections: completedProgress.length,
            overallProgress: totalSections > 0
                ? Math.round((completedProgress.length / totalSections) * 100)
                : 0,
            domainProgress,
        };
    }

    /**
     * Search content across study guides, flashcards, and questions
     */
    async searchContent(query: string, limit: number = 20): Promise<SearchResult[]> {
        const results: SearchResult[] = [];

        // Search study guide sections
        const sections = await prisma.studySection.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: {
                studyGuide: {
                    include: { task: { include: { domain: true } } },
                },
            },
            take: Math.floor(limit / 3),
        });

        sections.forEach(section => {
            results.push({
                type: 'study_guide',
                id: section.studyGuide.id,
                title: section.title,
                excerpt: section.content.substring(0, 150) + '...',
                domainId: section.studyGuide.task.domainId,
                taskId: section.studyGuide.taskId,
            });
        });

        // Search flashcards
        const flashcards = await prisma.flashcard.findMany({
            where: {
                OR: [
                    { front: { contains: query, mode: 'insensitive' } },
                    { back: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: { task: true },
            take: Math.floor(limit / 3),
        });

        flashcards.forEach(card => {
            results.push({
                type: 'flashcard',
                id: card.id,
                title: card.front.substring(0, 100),
                excerpt: card.back.substring(0, 150) + '...',
                domainId: card.domainId,
                taskId: card.taskId,
            });
        });

        // Search questions
        const questions = await prisma.practiceQuestion.findMany({
            where: {
                OR: [
                    { questionText: { contains: query, mode: 'insensitive' } },
                    { explanation: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: { task: true },
            take: Math.floor(limit / 3),
        });

        questions.forEach(question => {
            results.push({
                type: 'question',
                id: question.id,
                title: question.questionText.substring(0, 100),
                excerpt: question.explanation.substring(0, 150) + '...',
                domainId: question.domainId,
                taskId: question.taskId,
            });
        });

        return results;
    }
}

export const contentService = new ContentService();
