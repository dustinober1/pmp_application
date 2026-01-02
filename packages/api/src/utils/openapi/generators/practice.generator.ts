import type { OpenAPIV3_1 } from 'openapi-types';

/**
 * Generate Practice endpoints OpenAPI spec
 */
export const practicePaths: OpenAPIV3_1.PathsObject = {
  '/api/practice/sessions': {
    post: {
      tags: ['Practice'],
      summary: 'Start practice session',
      description: 'Start a new practice session with customizable parameters.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                domainIds: {
                  type: 'array',
                  items: { type: 'string', format: 'uuid' },
                  description: 'Filter by knowledge domains',
                },
                taskIds: {
                  type: 'array',
                  items: { type: 'string', format: 'uuid' },
                  description: 'Filter by tasks',
                },
                difficulty: {
                  type: 'string',
                  enum: ['easy', 'medium', 'hard'],
                  description: 'Question difficulty',
                },
                questionCount: {
                  type: 'number',
                  minimum: 5,
                  maximum: 50,
                  default: 20,
                  description: 'Number of questions',
                },
                mode: {
                  type: 'string',
                  enum: ['practice', 'timed', 'mock_exam'],
                  default: 'practice',
                  description: 'Practice mode',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Session created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      sessionId: { type: 'string', format: 'uuid' },
                      questions: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            text: { type: 'string' },
                            options: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', format: 'uuid' },
                                  text: { type: 'string' },
                                },
                              },
                            },
                          },
                        },
                      },
                      questionCount: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/practice/sessions/{id}': {
    get: {
      tags: ['Practice'],
      summary: 'Get practice session',
      description: 'Retrieve an existing practice session with current progress.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Session ID',
        },
      ],
      responses: {
        '200': {
          description: 'Session retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      session: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          status: { type: 'string', enum: ['in_progress', 'completed'] },
                          questions: {
                            type: 'array',
                            items: { type: 'object' },
                          },
                          answers: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                questionId: { type: 'string', format: 'uuid' },
                                selectedOptionId: { type: 'string', format: 'uuid' },
                                isCorrect: { type: 'boolean' },
                                timeSpentMs: { type: 'number' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '404': {
          description: 'Session not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/api/practice/sessions/{id}/answers/{questionId}': {
    post: {
      tags: ['Practice'],
      summary: 'Submit answer',
      description: 'Submit an answer for a specific question in the session.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Session ID',
        },
        {
          name: 'questionId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Question ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['selectedOptionId', 'timeSpentMs'],
              properties: {
                selectedOptionId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Selected option ID',
                },
                timeSpentMs: {
                  type: 'number',
                  minimum: 0,
                  description: 'Time spent on question (milliseconds)',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Answer submitted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      result: {
                        type: 'object',
                        properties: {
                          isCorrect: { type: 'boolean' },
                          correctOptionId: { type: 'string', format: 'uuid' },
                          explanation: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/practice/sessions/{id}/complete': {
    post: {
      tags: ['Practice'],
      summary: 'Complete session',
      description: 'Mark a practice session as completed and calculate final results.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Session ID',
        },
      ],
      responses: {
        '200': {
          description: 'Session completed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      result: {
                        type: 'object',
                        properties: {
                          sessionId: { type: 'string', format: 'uuid' },
                          score: {
                            type: 'number',
                            description: 'Percentage score',
                            example: 85.5,
                          },
                          correctAnswers: { type: 'number', example: 17 },
                          totalQuestions: { type: 'number', example: 20 },
                          timeSpentMs: { type: 'number' },
                        },
                      },
                    },
                  },
                  message: { type: 'string', example: 'Session completed' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/practice/mock-exams': {
    post: {
      tags: ['Practice'],
      summary: 'Start mock exam',
      description: 'Start a full PMP mock exam (180 questions, 230 minutes). Requires High-End tier.',
      security: [{ bearerAuth: [] }],
      responses: {
        '201': {
          description: 'Mock exam started',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      sessionId: { type: 'string', format: 'uuid' },
                      questions: {
                        type: 'array',
                        items: { type: 'object' },
                      },
                      questionCount: { type: 'number', example: 180 },
                      startedAt: { type: 'string', format: 'date-time' },
                      timeLimitMs: { type: 'number', example: 13800000 },
                    },
                  },
                },
              },
            },
          },
        },
        '403': {
          description: 'Feature requires higher subscription tier',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/api/practice/flagged': {
    get: {
      tags: ['Practice'],
      summary: 'Get flagged questions',
      description: 'Retrieve all questions flagged for review by the user.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Flagged questions retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      questions: {
                        type: 'array',
                        items: { type: 'object' },
                      },
                      count: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/practice/questions/{questionId}/flag': {
    post: {
      tags: ['Practice'],
      summary: 'Flag question',
      description: 'Flag a question for later review.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'questionId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        '200': {
          description: 'Question flagged',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Question flagged for review',
                  },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['Practice'],
      summary: 'Unflag question',
      description: 'Remove flag from a question.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'questionId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        '200': {
          description: 'Question unflagged',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Question unflagged' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/practice/stats': {
    get: {
      tags: ['Practice'],
      summary: 'Get practice statistics',
      description: 'Retrieve user practice statistics and performance metrics.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Statistics retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      stats: {
                        type: 'object',
                        properties: {
                          totalQuestions: { type: 'number', example: 450 },
                          correctAnswers: { type: 'number', example: 360 },
                          averageScore: { type: 'number', example: 80.0 },
                          timeSpentMinutes: { type: 'number', example: 500 },
                          sessionsCompleted: { type: 'number', example: 25 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
