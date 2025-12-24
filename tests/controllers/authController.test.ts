import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { register, login, getMe, updateProfile, changePassword, logout } from '../../src/controllers/auth';
import { prisma } from '../../src/services/database';
import { generateToken } from '../../src/middleware/auth';

// Mock dependencies
jest.mock('../../src/services/database', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        userProgress: {
            findMany: jest.fn(),
        },
        refreshToken: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}));

jest.mock('../../src/middleware/auth', () => ({
    generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
    generateLongLivedToken: jest.fn().mockReturnValue('mock-long-jwt-token'),
}));

jest.mock('../../src/services/refreshToken', () => ({
    generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
    storeRefreshToken: jest.fn().mockResolvedValue(undefined),
    validateRefreshToken: jest.fn().mockResolvedValue(null),
    rotateRefreshToken: jest.fn().mockResolvedValue('new-refresh-token'),
    revokeAllUserRefreshTokens: jest.fn().mockResolvedValue(undefined),
    revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn(),
}));

describe('Auth Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {
            body: {},
            user: undefined,
            headers: {
                'user-agent': 'test-agent',
            },
            ip: '127.0.0.1',
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock).mockResolvedValue({
                id: 'user-123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'USER',
                createdAt: new Date(),
            });

            await register(mockRequest as Request, mockResponse as Response, mockNext);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
            expect(prisma.user.create).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Registration successful',
                token: 'mock-jwt-token',
            }));
        });

        it('should return error if email already exists', async () => {
            mockRequest.body = {
                email: 'existing@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'existing-user',
                email: 'existing@example.com',
            });

            await register(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 409,
                code: 'CONFLICT',
            }));
        });
    });

    describe('login', () => {
        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            passwordHash: 'hashed-password',
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER',
        };

        it('should login user successfully with valid credentials', async () => {
            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await login(mockRequest as Request, mockResponse as Response, mockNext);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Login successful',
                token: 'mock-jwt-token',
            }));
        });

        it('should return error for invalid email', async () => {
            mockRequest.body = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await login(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 401,
                code: 'UNAUTHORIZED',
            }));
        });

        it('should return error for invalid password', async () => {
            mockRequest.body = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await login(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 401,
                code: 'UNAUTHORIZED',
            }));
        });
    });

    describe('getMe', () => {
        it('should return user profile when authenticated', async () => {
            mockRequest.user = {
                id: 'user-123',
                email: 'test@example.com',
                role: 'USER',
                firstName: 'John',
                lastName: 'Doe',
            };

            const mockUserWithCount = {
                id: 'user-123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'USER',
                createdAt: new Date(),
                _count: {
                    testSessions: 5,
                    flashCardReviews: 100,
                },
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithCount);
            (prisma.userProgress.findMany as jest.Mock).mockResolvedValue([]);

            await getMe(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                user: mockUserWithCount,
                stats: {
                    testsCompleted: 5,
                    flashcardsReviewed: 100,
                },
            }));
        });

        it('should return error when not authenticated', async () => {
            mockRequest.user = undefined;

            await getMe(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 401,
                code: 'UNAUTHORIZED',
            }));
        });
    });

    describe('updateProfile', () => {
        it('should update profile successfully', async () => {
            mockRequest.user = {
                id: 'user-123',
                email: 'test@example.com',
                role: 'USER',
                firstName: 'John',
                lastName: 'Doe',
            };
            mockRequest.body = {
                firstName: 'Jane',
                lastName: 'Smith',
            };

            const updatedUser = {
                id: 'user-123',
                email: 'test@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                role: 'USER',
            };

            (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

            await updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                data: {
                    firstName: 'Jane',
                    lastName: 'Smith',
                },
                select: expect.any(Object),
            });
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Profile updated successfully',
                user: updatedUser,
            }));
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            mockRequest.user = {
                id: 'user-123',
                email: 'test@example.com',
                role: 'USER',
                firstName: 'John',
                lastName: 'Doe',
            };
            mockRequest.body = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword123',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-123',
                email: 'test@example.com',
                passwordHash: 'old-hashed-password',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (prisma.user.update as jest.Mock).mockResolvedValue({});

            await changePassword(mockRequest as Request, mockResponse as Response, mockNext);

            expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', 'old-hashed-password');
            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 12);
            expect(prisma.user.update).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Password changed successfully. Please log in again on all devices.',
            });
        });

        it('should return error for incorrect current password', async () => {
            mockRequest.user = {
                id: 'user-123',
                email: 'test@example.com',
                role: 'USER',
                firstName: 'John',
                lastName: 'Doe',
            };
            mockRequest.body = {
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword123',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-123',
                email: 'test@example.com',
                passwordHash: 'old-hashed-password',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await changePassword(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 401,
                code: 'UNAUTHORIZED',
            }));
        });
    });

    describe('logout', () => {
        it('should return success message', async () => {
            mockRequest.body = {};

            await logout(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Logged out successfully',
            });
        });
    });
});
