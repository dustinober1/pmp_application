/**
 * Unit Tests for Adaptive Controller
 * 
 * Tests the adaptive learning API endpoints with mocked dependencies.
 */

import fc from 'fast-check';

// Mock the database service before importing anything else
jest.mock('../../src/services/database', () => ({
  prisma: {
    learningProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    domain: {
      findMany: jest.fn(),
    },
    user: {
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

// Mock the adaptive services
jest.mock('../../src/services/adaptive/MasteryCalculator');
jest.mock('../../src/services/adaptive/KnowledgeGapIdentifier');
jest.mock('../../src/services/adaptive/QuestionSelector');
jest.mock('../../src/services/adaptive/InsightGenerator');

import { prisma } from '../../src/services/database';

describe('Adaptive Controller', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock JWT verification
    jest.mock('jsonwebtoken', () => ({
      verify: jest.fn().mockReturnValue({ userId: mockUser.id, email: mockUser.email }),
    }));
  });

  describe('GET /api/adaptive/profile', () => {
    /**
     * Property 12: Default Learning Profile Creation
     * 
     * For any user without a profile, requesting their profile SHALL create one with 50% mastery.
     * 
     * **Validates: Requirements 6.5**
     * **Feature: adaptive-learning-engine, Property 12: Default Learning Profile Creation**
     */
    test('Property 12: should create default profile with 50% mastery for new users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            email: fc.emailAddress(),
          }),
          async (userData) => {
            // Mock no existing profile
            (prisma.learningProfile.findUnique as jest.Mock).mockResolvedValue(null);
            
            // Mock domains for default profile creation
            const mockDomains = [
              { id: 'domain-1', name: 'People' },
              { id: 'domain-2', name: 'Process' },
              { id: 'domain-3', name: 'Business Environment' },
            ];
            (prisma.domain.findMany as jest.Mock).mockResolvedValue(mockDomains);
            
            // Mock profile creation
            const mockCreatedProfile = {
              id: 'profile-id',
              userId: userData.userId,
              lastCalculatedAt: new Date(),
              domainMasteries: mockDomains.map(domain => ({
                domainId: domain.id,
                score: 50,
                trend: 'stable',
                accuracyRate: 0,
                consistencyScore: 50,
                difficultyScore: 50,
                questionCount: 0,
                peakScore: 50,
                domain,
              })),
              insights: [],
            };
            (prisma.learningProfile.create as jest.Mock).mockResolvedValue(mockCreatedProfile);
            
            // Mock mastery calculator
            const mockMasteryLevels = mockDomains.map(domain => ({
              domainId: domain.id,
              domainName: domain.name,
              score: 50,
              trend: 'stable',
              accuracyRate: 0,
              consistencyScore: 50,
              difficultyScore: 50,
              questionCount: 0,
              lastActivityAt: new Date(),
            }));
            
            const { masteryCalculator } = require('../../src/services/adaptive/MasteryCalculator');
            masteryCalculator.getAllMasteryLevels = jest.fn().mockResolvedValue(mockMasteryLevels);
            
            // Mock knowledge gap identifier
            const { knowledgeGapIdentifier } = require('../../src/services/adaptive/KnowledgeGapIdentifier');
            knowledgeGapIdentifier.getPrioritizedGaps = jest.fn().mockResolvedValue([]);
            
            // Mock authenticated request
            const mockAuthMiddleware = (req: any, res: any, next: any) => {
              req.user = { id: userData.userId, email: userData.email };
              next();
            };
            
            // Override auth middleware for this test
            jest.doMock('../../src/middleware/auth', () => ({
              authenticateToken: mockAuthMiddleware,
            }));
            
            // Make request (this would normally require authentication)
            // For unit testing, we'll test the controller logic directly
            const { getLearningProfile } = require('../../src/controllers/adaptiveController');
            
            const mockReq = {
              user: { id: userData.userId, email: userData.email },
            };
            const mockRes = {
              json: jest.fn(),
            };
            const mockNext = jest.fn();
            
            await getLearningProfile(mockReq, mockRes, mockNext);
            
            // Verify profile creation was called
            expect(prisma.learningProfile.findUnique).toHaveBeenCalledWith({
              where: { userId: userData.userId },
              include: expect.any(Object),
            });
            
            // Verify default profile creation
            expect(prisma.learningProfile.create).toHaveBeenCalledWith({
              data: {
                userId: userData.userId,
                domainMasteries: {
                  create: expect.arrayContaining([
                    expect.objectContaining({
                      score: 50,
                      trend: 'stable',
                      accuracyRate: 0,
                      consistencyScore: 50,
                      difficultyScore: 50,
                      questionCount: 0,
                      peakScore: 50,
                    }),
                  ]),
                },
              },
              include: expect.any(Object),
            });
            
            // Verify response contains profile with 50% mastery
            expect(mockRes.json).toHaveBeenCalledWith(
              expect.objectContaining({
                userId: userData.userId,
                domainMasteries: expect.arrayContaining([
                  expect.objectContaining({
                    score: 50,
                  }),
                ]),
              })
            );
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });

    test('should not create duplicate profiles for existing users', async () => {
      // Mock existing profile
      const existingProfile = {
        id: 'existing-profile-id',
        userId: mockUser.id,
        lastCalculatedAt: new Date(),
        domainMasteries: [
          {
            domainId: 'domain-1',
            score: 75,
            trend: 'improving',
            domain: { id: 'domain-1', name: 'People' },
          },
        ],
        insights: [],
      };
      
      (prisma.learningProfile.findUnique as jest.Mock).mockResolvedValue(existingProfile);
      
      // Mock mastery calculator
      const { masteryCalculator } = require('../../src/services/adaptive/MasteryCalculator');
      masteryCalculator.getAllMasteryLevels = jest.fn().mockResolvedValue([
        {
          domainId: 'domain-1',
          domainName: 'People',
          score: 75,
          trend: 'improving',
        },
      ]);
      
      // Mock knowledge gap identifier
      const { knowledgeGapIdentifier } = require('../../src/services/adaptive/KnowledgeGapIdentifier');
      knowledgeGapIdentifier.getPrioritizedGaps = jest.fn().mockResolvedValue([]);
      
      const { getLearningProfile } = require('../../src/controllers/adaptiveController');
      
      const mockReq = {
        user: mockUser,
      };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();
      
      await getLearningProfile(mockReq, mockRes, mockNext);
      
      // Verify no profile creation was attempted
      expect(prisma.learningProfile.create).not.toHaveBeenCalled();
      
      // Verify existing profile was returned
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
        })
      );
    });
  });

  describe('GET /api/adaptive/questions', () => {
    test('should return recommended questions with proper validation', async () => {
      const { questionSelector } = require('../../src/services/adaptive/QuestionSelector');
      questionSelector.selectQuestions = jest.fn().mockResolvedValue([
        {
          id: 'question-1',
          domainId: 'domain-1',
          domainName: 'People',
          questionText: 'Test question',
          choices: '["A", "B", "C", "D"]',
          correctAnswerIndex: 0,
          explanation: 'Test explanation',
          difficulty: 'MEDIUM',
          methodology: 'Agile',
          selectionReason: 'gap',
        },
      ]);
      
      const { getRecommendedQuestions } = require('../../src/controllers/adaptiveController');
      
      const mockReq = {
        user: mockUser,
        query: {
          count: '5',
          domainFilter: 'domain-1',
          difficultyMin: 'EASY',
          difficultyMax: 'HARD',
          excludeRecentDays: '7',
        },
      };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();
      
      await getRecommendedQuestions(mockReq, mockRes, mockNext);
      
      expect(questionSelector.selectQuestions).toHaveBeenCalledWith({
        userId: mockUser.id,
        count: 5,
        domainFilter: 'domain-1',
        difficultyRange: {
          min: 'EASY',
          max: 'HARD',
        },
        excludeRecentDays: 7,
      });
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: expect.arrayContaining([
            expect.objectContaining({
              id: 'question-1',
              choices: ['A', 'B', 'C', 'D'], // Should be parsed from JSON
            }),
          ]),
          metadata: expect.objectContaining({
            totalSelected: 1,
            requestedCount: 5,
          }),
        })
      );
    });
  });

  describe('GET /api/adaptive/gaps', () => {
    test('should return prioritized knowledge gaps', async () => {
      const { knowledgeGapIdentifier } = require('../../src/services/adaptive/KnowledgeGapIdentifier');
      knowledgeGapIdentifier.getPrioritizedGaps = jest.fn().mockResolvedValue([
        {
          domainId: 'domain-1',
          domainName: 'People',
          currentMastery: 45,
          targetThreshold: 70,
          severity: 'critical',
          gapType: 'never_learned',
          examWeight: 0.42,
          recommendation: 'Focus on people management concepts',
          priorityScore: 25,
        },
      ]);
      
      const { getKnowledgeGaps } = require('../../src/controllers/adaptiveController');
      
      const mockReq = {
        user: mockUser,
        query: { limit: '5' },
      };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();
      
      await getKnowledgeGaps(mockReq, mockRes, mockNext);
      
      expect(knowledgeGapIdentifier.getPrioritizedGaps).toHaveBeenCalledWith(mockUser.id, 5);
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          knowledgeGaps: expect.arrayContaining([
            expect.objectContaining({
              domainId: 'domain-1',
              severity: 'critical',
              priorityScore: 25,
            }),
          ]),
        })
      );
    });
  });

  describe('GET /api/adaptive/insights', () => {
    test('should return recent insights', async () => {
      const { insightGenerator } = require('../../src/services/adaptive/InsightGenerator');
      insightGenerator.getRecentInsights = jest.fn().mockResolvedValue([
        {
          id: 'insight-1',
          type: 'improvement',
          title: 'Great Progress!',
          message: 'You have improved in People domain',
          priority: 'medium',
          actionUrl: null,
          isRead: false,
          createdAt: new Date(),
        },
      ]);
      
      const { getRecentInsights } = require('../../src/controllers/adaptiveController');
      
      const mockReq = {
        user: mockUser,
        query: { limit: '10' },
      };
      const mockRes = {
        json: jest.fn(),
      };
      const mockNext = jest.fn();
      
      await getRecentInsights(mockReq, mockRes, mockNext);
      
      expect(insightGenerator.getRecentInsights).toHaveBeenCalledWith(mockUser.id, 10);
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          insights: expect.arrayContaining([
            expect.objectContaining({
              id: 'insight-1',
              type: 'improvement',
              title: 'Great Progress!',
            }),
          ]),
        })
      );
    });
  });
});