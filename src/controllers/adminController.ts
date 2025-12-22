import { Request, Response } from 'express';
import { prisma } from '../services/database';

/**
 * Get admin dashboard statistics
 * GET /api/admin/dashboard
 */
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [
            totalUsers,
            totalQuestions,
            totalFlashcards,
            totalTests,
            totalSessions,
            recentUsers,
            recentSessions,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.question.count(),
            prisma.flashCard.count(),
            prisma.practiceTest.count(),
            prisma.userTestSession.count(),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    createdAt: true,
                },
            }),
            prisma.userTestSession.findMany({
                take: 10,
                orderBy: { startedAt: 'desc' },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    test: {
                        select: { name: true },
                    },
                },
            }),
        ]);

        // Get question counts by domain
        const questionsByDomain = await prisma.question.groupBy({
            by: ['domainId'],
            _count: true,
        });

        const domains = await prisma.domain.findMany();
        const domainStats = domains.map(domain => ({
            ...domain,
            questionCount: questionsByDomain.find(q => q.domainId === domain.id)?._count || 0,
        }));

        // Get completion stats
        const completedSessions = await prisma.userTestSession.count({
            where: { status: 'COMPLETED' },
        });

        const avgScore = await prisma.userTestSession.aggregate({
            where: { status: 'COMPLETED', score: { not: null } },
            _avg: { score: true },
        });

        return res.json({
            overview: {
                totalUsers,
                totalQuestions,
                totalFlashcards,
                totalTests,
                totalSessions,
                completedSessions,
                avgScore: avgScore._avg.score || 0,
            },
            domainStats,
            recentUsers,
            recentSessions,
        });
    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

/**
 * Get all users with pagination
 * GET /api/admin/users
 */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = search
            ? {
                OR: [
                    { email: { contains: String(search) } },
                    { firstName: { contains: String(search) } },
                    { lastName: { contains: String(search) } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    emailVerified: true,
                    createdAt: true,
                    _count: {
                        select: {
                            testSessions: true,
                            flashCardReviews: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        return res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
};

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['USER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Use USER or ADMIN' });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        return res.json({ message: 'Role updated successfully', user });
    } catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({ error: 'Failed to update user role' });
    }
};

/**
 * Delete a user
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (req.user && req.user.id === id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await prisma.user.delete({ where: { id } });

        return res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: 'Failed to delete user' });
    }
};

/**
 * Get all questions with pagination
 * GET /api/admin/questions
 */
export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, domain = '', search = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (domain) where.domainId = domain;
        if (search) {
            where.questionText = { contains: String(search) };
        }

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    domain: {
                        select: { id: true, name: true, color: true },
                    },
                },
            }),
            prisma.question.count({ where }),
        ]);

        // Parse choices for each question
        const formattedQuestions = questions.map(q => ({
            ...q,
            choices: JSON.parse(q.choices),
        }));

        return res.json({
            questions: formattedQuestions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({ error: 'Failed to fetch questions' });
    }
};

/**
 * Create a new question
 * POST /api/admin/questions
 */
export const createQuestion = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const {
            domainId,
            questionText,
            scenario,
            choices,
            correctAnswerIndex,
            explanation,
            difficulty,
            methodology,
        } = req.body;

        // Validate required fields
        if (!domainId || !questionText || !choices || correctAnswerIndex === undefined || !explanation) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const question = await prisma.question.create({
            data: {
                domainId,
                questionText,
                scenario: scenario || null,
                choices: JSON.stringify(choices),
                correctAnswerIndex,
                explanation,
                difficulty: difficulty || 'MEDIUM',
                methodology: methodology || 'Hybrid',
                createdBy: req.user.id,
            },
            include: {
                domain: { select: { id: true, name: true, color: true } },
            },
        });

        return res.status(201).json({
            message: 'Question created successfully',
            question: {
                ...question,
                choices: JSON.parse(question.choices),
            },
        });
    } catch (error) {
        console.error('Error creating question:', error);
        return res.status(500).json({ error: 'Failed to create question' });
    }
};

/**
 * Update a question
 * PUT /api/admin/questions/:id
 */
export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            domainId,
            questionText,
            scenario,
            choices,
            correctAnswerIndex,
            explanation,
            difficulty,
            methodology,
            isActive,
        } = req.body;

        const updateData: any = {};
        if (domainId !== undefined) updateData.domainId = domainId;
        if (questionText !== undefined) updateData.questionText = questionText;
        if (scenario !== undefined) updateData.scenario = scenario;
        if (choices !== undefined) updateData.choices = JSON.stringify(choices);
        if (correctAnswerIndex !== undefined) updateData.correctAnswerIndex = correctAnswerIndex;
        if (explanation !== undefined) updateData.explanation = explanation;
        if (difficulty !== undefined) updateData.difficulty = difficulty;
        if (methodology !== undefined) updateData.methodology = methodology;
        if (isActive !== undefined) updateData.isActive = isActive;

        const question = await prisma.question.update({
            where: { id },
            data: updateData,
            include: {
                domain: { select: { id: true, name: true, color: true } },
            },
        });

        return res.json({
            message: 'Question updated successfully',
            question: {
                ...question,
                choices: JSON.parse(question.choices),
            },
        });
    } catch (error) {
        console.error('Error updating question:', error);
        return res.status(500).json({ error: 'Failed to update question' });
    }
};

/**
 * Delete a question
 * DELETE /api/admin/questions/:id
 */
export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.question.delete({ where: { id } });

        return res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        return res.status(500).json({ error: 'Failed to delete question' });
    }
};

/**
 * Get all practice tests
 * GET /api/admin/tests
 */
export const getTests = async (req: Request, res: Response) => {
    try {
        const tests = await prisma.practiceTest.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        testQuestions: true,
                        sessions: true,
                    },
                },
            },
        });

        return res.json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        return res.status(500).json({ error: 'Failed to fetch tests' });
    }
};

/**
 * Create a practice test
 * POST /api/admin/tests
 */
export const createTest = async (req: Request, res: Response) => {
    try {
        const { name, description, timeLimitMinutes, questionIds } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }

        const test = await prisma.practiceTest.create({
            data: {
                name,
                description,
                timeLimitMinutes: timeLimitMinutes || 230,
                totalQuestions: questionIds?.length || 0,
            },
        });

        // Add questions if provided
        if (questionIds && questionIds.length > 0) {
            await prisma.testQuestion.createMany({
                data: questionIds.map((qId: string, index: number) => ({
                    testId: test.id,
                    questionId: qId,
                    orderIndex: index,
                })),
            });
        }

        return res.status(201).json({
            message: 'Practice test created successfully',
            test,
        });
    } catch (error) {
        console.error('Error creating test:', error);
        return res.status(500).json({ error: 'Failed to create test' });
    }
};

/**
 * Update a practice test
 * PUT /api/admin/tests/:id
 */
export const updateTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, timeLimitMinutes, isActive } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (timeLimitMinutes !== undefined) updateData.timeLimitMinutes = timeLimitMinutes;
        if (isActive !== undefined) updateData.isActive = isActive;

        const test = await prisma.practiceTest.update({
            where: { id },
            data: updateData,
        });

        return res.json({ message: 'Test updated successfully', test });
    } catch (error) {
        console.error('Error updating test:', error);
        return res.status(500).json({ error: 'Failed to update test' });
    }
};

/**
 * Delete a practice test
 * DELETE /api/admin/tests/:id
 */
export const deleteTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.practiceTest.delete({ where: { id } });

        return res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        console.error('Error deleting test:', error);
        return res.status(500).json({ error: 'Failed to delete test' });
    }
};

/**
 * Get all flashcards with pagination
 * GET /api/admin/flashcards
 */
export const getFlashcards = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, domain = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (domain) where.domainId = domain;

        const [flashcards, total] = await Promise.all([
            prisma.flashCard.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    domain: { select: { id: true, name: true, color: true } },
                },
            }),
            prisma.flashCard.count({ where }),
        ]);

        return res.json({
            flashcards,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching flashcards:', error);
        return res.status(500).json({ error: 'Failed to fetch flashcards' });
    }
};

/**
 * Create a flashcard
 * POST /api/admin/flashcards
 */
export const createFlashcard = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { domainId, frontText, backText, category, difficulty } = req.body;

        if (!domainId || !frontText || !backText || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const flashcard = await prisma.flashCard.create({
            data: {
                domainId,
                frontText,
                backText,
                category,
                difficulty: difficulty || 'MEDIUM',
                createdBy: req.user.id,
            },
            include: {
                domain: { select: { id: true, name: true, color: true } },
            },
        });

        return res.status(201).json({
            message: 'Flashcard created successfully',
            flashcard,
        });
    } catch (error) {
        console.error('Error creating flashcard:', error);
        return res.status(500).json({ error: 'Failed to create flashcard' });
    }
};

/**
 * Update a flashcard
 * PUT /api/admin/flashcards/:id
 */
export const updateFlashcard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { domainId, frontText, backText, category, difficulty, isActive } = req.body;

        const updateData: any = {};
        if (domainId !== undefined) updateData.domainId = domainId;
        if (frontText !== undefined) updateData.frontText = frontText;
        if (backText !== undefined) updateData.backText = backText;
        if (category !== undefined) updateData.category = category;
        if (difficulty !== undefined) updateData.difficulty = difficulty;
        if (isActive !== undefined) updateData.isActive = isActive;

        const flashcard = await prisma.flashCard.update({
            where: { id },
            data: updateData,
            include: {
                domain: { select: { id: true, name: true, color: true } },
            },
        });

        return res.json({ message: 'Flashcard updated successfully', flashcard });
    } catch (error) {
        console.error('Error updating flashcard:', error);
        return res.status(500).json({ error: 'Failed to update flashcard' });
    }
};

/**
 * Delete a flashcard
 * DELETE /api/admin/flashcards/:id
 */
export const deleteFlashcard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.flashCard.delete({ where: { id } });

        return res.json({ message: 'Flashcard deleted successfully' });
    } catch (error) {
        console.error('Error deleting flashcard:', error);
        return res.status(500).json({ error: 'Failed to delete flashcard' });
    }
};
