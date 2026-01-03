import type { OpenAPIV3_1 } from "openapi-types";

/**
 * Generate Dashboard endpoints OpenAPI spec
 */
export const dashboardPaths: OpenAPIV3_1.PathsObject = {
  "/api/dashboard": {
    get: {
      tags: ["Dashboard"],
      summary: "Get dashboard data",
      description:
        "Retrieve comprehensive dashboard data for the authenticated user.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Dashboard data retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      dashboard: {
                        type: "object",
                        properties: {
                          user: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              email: { type: "string" },
                              subscriptionTier: { type: "string" },
                            },
                          },
                          studyStreak: {
                            type: "object",
                            properties: {
                              currentStreak: { type: "number", example: 15 },
                              longestStreak: { type: "number", example: 30 },
                            },
                          },
                          practiceStats: {
                            type: "object",
                            properties: {
                              totalSessions: { type: "number" },
                              averageScore: { type: "number" },
                              questionsCompleted: { type: "number" },
                            },
                          },
                          ebookProgress: {
                            type: "object",
                            properties: {
                              chaptersCompleted: { type: "number" },
                              totalChapters: { type: "number" },
                              progressPercentage: { type: "number" },
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
    },
  },

  "/api/dashboard/streak": {
    get: {
      tags: ["Dashboard"],
      summary: "Get study streak",
      description: "Retrieve user study streak information.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Study streak retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      streak: {
                        type: "object",
                        properties: {
                          currentStreak: { type: "number", example: 7 },
                          longestStreak: { type: "number", example: 21 },
                          lastStudyDate: { type: "string", format: "date" },
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

  "/api/dashboard/progress": {
    get: {
      tags: ["Dashboard"],
      summary: "Get domain progress",
      description: "Retrieve progress across all PMP knowledge domains.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Domain progress retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      domainProgress: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            domain: {
                              type: "object",
                              properties: {
                                id: { type: "string", format: "uuid" },
                                name: { type: "string", example: "People" },
                                percentage: { type: "number", example: 42 },
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
      },
    },
  },

  "/api/dashboard/activity": {
    get: {
      tags: ["Dashboard"],
      summary: "Get recent activity",
      description: "Retrieve recent user activity.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
          description: "Number of activities to return",
        },
      ],
      responses: {
        "200": {
          description: "Recent activity retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      activity: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            type: {
                              type: "string",
                              enum: [
                                "practice_session",
                                "chapter_read",
                                "flashcard_review",
                              ],
                            },
                            timestamp: { type: "string", format: "date-time" },
                            details: { type: "object" },
                          },
                        },
                      },
                      count: { type: "number" },
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

  "/api/dashboard/reviews": {
    get: {
      tags: ["Dashboard"],
      summary: "Get upcoming flashcard reviews",
      description: "Retrieve flashcards due for review.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
          description: "Number of reviews to return",
        },
      ],
      responses: {
        "200": {
          description: "Upcoming reviews retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      reviews: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            flashcardId: { type: "string", format: "uuid" },
                            question: { type: "string" },
                            nextReviewDate: {
                              type: "string",
                              format: "date-time",
                            },
                          },
                        },
                      },
                      count: { type: "number" },
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

  "/api/dashboard/weak-areas": {
    get: {
      tags: ["Dashboard"],
      summary: "Get weak areas",
      description:
        "Retrieve knowledge domains or topics where user performance is low.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Weak areas retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      weakAreas: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            domain: { type: "string" },
                            topic: { type: "string" },
                            score: { type: "number" },
                            recommendation: { type: "string" },
                          },
                        },
                      },
                      count: { type: "number" },
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

  "/api/dashboard/readiness": {
    get: {
      tags: ["Dashboard"],
      summary: "Get exam readiness score",
      description:
        "Calculate exam readiness based on practice performance and study progress. Requires Mid-Level tier.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Readiness score calculated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      readiness: {
                        type: "object",
                        properties: {
                          score: {
                            type: "number",
                            minimum: 0,
                            maximum: 100,
                            example: 75,
                          },
                          level: {
                            type: "string",
                            enum: [
                              "beginner",
                              "intermediate",
                              "advanced",
                              "ready",
                            ],
                            example: "advanced",
                          },
                          factors: {
                            type: "object",
                            properties: {
                              practiceScore: { type: "number" },
                              contentCoverage: { type: "number" },
                              consistencyScore: { type: "number" },
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
        "403": {
          description: "Feature requires higher subscription tier",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },

  "/api/dashboard/recommendations": {
    get: {
      tags: ["Dashboard"],
      summary: "Get personalized recommendations",
      description:
        "AI-powered study recommendations based on performance. Requires High-End tier.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Recommendations retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      recommendations: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            type: {
                              type: "string",
                              enum: [
                                "study_topic",
                                "practice_focus",
                                "review_area",
                              ],
                            },
                            priority: {
                              type: "string",
                              enum: ["high", "medium", "low"],
                            },
                            title: { type: "string" },
                            description: { type: "string" },
                            actionItems: {
                              type: "array",
                              items: { type: "string" },
                            },
                          },
                        },
                      },
                      count: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
        "403": {
          description: "Feature requires higher subscription tier",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },
};
