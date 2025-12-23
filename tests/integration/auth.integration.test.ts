import request from 'supertest';
import app from '../../src/server';
import { prisma } from '../../src/services/database';

describe('Auth API Integration Tests', () => {
    const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
    };
    let authToken: string;
    let userId: string;

    // Clean up test users after all tests
    afterAll(async () => {
        if (userId) {
            try {
                await prisma.user.delete({ where: { id: userId } });
            } catch (error) {
                // User may have already been deleted
            }
        }
        await prisma.$disconnect();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Registration successful');
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', testUser.email.toLowerCase());
            expect(response.body.user).not.toHaveProperty('passwordHash');

            authToken = response.body.token;
            userId = response.body.user.id;
        });

        it('should reject duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect('Content-Type', /json/)
                .expect(409);

            expect(response.body.error).toHaveProperty('code', 'CONFLICT');
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ email: 'incomplete@example.com' })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation failed');
            expect(response.body).toHaveProperty('details');
        });

        it('should reject invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'invalid-email',
                })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation failed');
        });

        it('should reject short password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'newuser@example.com',
                    password: 'short',
                })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation failed');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Login successful');
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', testUser.email.toLowerCase());

            authToken = response.body.token;
        });

        it('should reject invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123!',
                })
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
        });

        it('should reject non-existent user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'SomePassword123!',
                })
                .expect(401);

            expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return user profile when authenticated', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('stats');
            expect(response.body.user).toHaveProperty('email', testUser.email.toLowerCase());
        });

        it('should reject request without token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });

        it('should reject request with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(403);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('PUT /api/auth/profile', () => {
        it('should update user profile', async () => {
            const response = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    firstName: 'Updated',
                    lastName: 'Name',
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Profile updated successfully');
            expect(response.body.user).toHaveProperty('firstName', 'Updated');
            expect(response.body.user).toHaveProperty('lastName', 'Name');
        });

        it('should reject unauthenticated request', async () => {
            await request(app)
                .put('/api/auth/profile')
                .send({ firstName: 'Test' })
                .expect(401);
        });
    });

    describe('PUT /api/auth/password', () => {
        const newPassword = 'NewPassword456!';

        it('should change password with valid current password', async () => {
            const response = await request(app)
                .put('/api/auth/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: testUser.password,
                    newPassword: newPassword,
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Password changed successfully');

            // Verify new password works
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: newPassword,
                })
                .expect(200);

            expect(loginResponse.body).toHaveProperty('token');
            authToken = loginResponse.body.token;
        });

        it('should reject incorrect current password', async () => {
            const response = await request(app)
                .put('/api/auth/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'WrongPassword!',
                    newPassword: 'AnotherPassword789!',
                })
                .expect(401);

            expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should return success message', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Logged out successfully');
        });
    });
});
