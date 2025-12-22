import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireAdmin, optionalAuth, generateToken } from '../../src/middleware/auth';

// Mock express request/response
const mockRequest = (overrides = {}): Partial<Request> => ({
    headers: {},
    user: undefined,
    ...overrides,
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext: NextFunction = jest.fn();

// Mock Prisma
jest.mock('../../src/services/database', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}));

import { prisma } from '../../src/services/database';

describe('Auth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            const user = { id: 'user-123', email: 'test@example.com', role: 'USER' };
            const token = generateToken(user);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        });

        it('should include user info in token payload', () => {
            const user = { id: 'user-123', email: 'test@example.com', role: 'ADMIN' };
            const token = generateToken(user);

            const decoded = jwt.decode(token) as any;
            expect(decoded.userId).toBe(user.id);
            expect(decoded.email).toBe(user.email);
            expect(decoded.role).toBe(user.role);
        });
    });

    describe('authenticateToken', () => {
        it('should return 401 if no token is provided', async () => {
            const req = mockRequest({ headers: {} }) as Request;
            const res = mockResponse() as Response;

            await authenticateToken(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 403 for invalid token', async () => {
            const req = mockRequest({
                headers: { authorization: 'Bearer invalid-token' },
            }) as Request;
            const res = mockResponse() as Response;

            await authenticateToken(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
        });

        it('should attach user to request for valid token', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                role: 'USER',
                firstName: 'Test',
                lastName: 'User',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const token = generateToken({ id: mockUser.id, email: mockUser.email, role: mockUser.role });
            const req = mockRequest({
                headers: { authorization: `Bearer ${token}` },
            }) as Request;
            const res = mockResponse() as Response;

            await authenticateToken(req, res, mockNext);

            expect(req.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should return 401 if user not found in database', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const token = generateToken({ id: 'deleted-user', email: 'deleted@example.com', role: 'USER' });
            const req = mockRequest({
                headers: { authorization: `Bearer ${token}` },
            }) as Request;
            const res = mockResponse() as Response;

            await authenticateToken(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });

    describe('requireAdmin', () => {
        it('should return 401 if no user on request', () => {
            const req = mockRequest() as Request;
            const res = mockResponse() as Response;

            requireAdmin(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
        });

        it('should return 403 if user is not admin', () => {
            const req = mockRequest({
                user: { id: 'user-123', role: 'USER' },
            }) as Request;
            const res = mockResponse() as Response;

            requireAdmin(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
        });

        it('should call next() for admin users', () => {
            const req = mockRequest({
                user: { id: 'admin-123', role: 'ADMIN' },
            }) as Request;
            const res = mockResponse() as Response;

            requireAdmin(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe('optionalAuth', () => {
        it('should call next() without error if no token', async () => {
            const req = mockRequest({ headers: {} }) as Request;
            const res = mockResponse() as Response;

            await optionalAuth(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        });

        it('should attach user for valid token', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                role: 'USER',
                firstName: 'Test',
                lastName: 'User',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const token = generateToken({ id: mockUser.id, email: mockUser.email, role: mockUser.role });
            const req = mockRequest({
                headers: { authorization: `Bearer ${token}` },
            }) as Request;
            const res = mockResponse() as Response;

            await optionalAuth(req, res, mockNext);

            expect(req.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should call next() without user for invalid token', async () => {
            const req = mockRequest({
                headers: { authorization: 'Bearer invalid-token' },
            }) as Request;
            const res = mockResponse() as Response;

            await optionalAuth(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        });
    });
});
