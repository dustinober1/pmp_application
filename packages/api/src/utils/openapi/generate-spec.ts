import openapiConfig from "../../config/openapi";
import { authPaths } from "./generators/auth.generator";
import { subscriptionPaths } from "./generators/subscription.generator";
import { ebookPaths } from "./generators/ebook.generator";
import { practicePaths } from "./generators/practice.generator";
import { healthPaths } from "./generators/health.generator";
import { dashboardPaths } from "./generators/dashboard.generator";

/**
 * Generate complete OpenAPI specification
 * Combines base config with all route generators
 */
export function generateOpenAPISpec(): any {
  return {
    ...openapiConfig,
    paths: {
      ...healthPaths,
      ...authPaths,
      ...subscriptionPaths,
      ...ebookPaths,
      ...practicePaths,
      ...dashboardPaths,
      // Add remaining routes as stubs for now
      "/api/flashcards": {
        get: {
          tags: ["Flashcards"],
          summary: "Get flashcards",
          description:
            "Retrieve flashcards for study (requires authentication)",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Flashcards retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          flashcards: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string", format: "uuid" },
                                question: { type: "string" },
                                answer: { type: "string" },
                                domain: { type: "string" },
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
      "/api/domains": {
        get: {
          tags: ["Domains"],
          summary: "Get knowledge domains",
          description: "Retrieve all PMP knowledge domains",
          security: [],
          responses: {
            "200": {
              description: "Domains retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          domains: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string", format: "uuid" },
                                name: { type: "string", example: "People" },
                                description: { type: "string" },
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
      "/api/formulas": {
        get: {
          tags: ["Formulas"],
          summary: "Get PMP formulas",
          description: "Retrieve PMP formulas and calculation reference",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Formulas retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          formulas: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string", format: "uuid" },
                                name: { type: "string" },
                                formula: { type: "string" },
                                description: { type: "string" },
                                example: { type: "string" },
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
      "/api/teams": {
        get: {
          tags: ["Teams"],
          summary: "Get team members (corporate accounts)",
          description: "Retrieve team members for corporate accounts",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Team members retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          members: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string", format: "uuid" },
                                name: { type: "string" },
                                email: { type: "string" },
                                role: { type: "string" },
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
      "/api/search": {
        get: {
          tags: ["Search"],
          summary: "Global search",
          description: "Search across all content types",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Search query",
            },
          ],
          responses: {
            "200": {
              description: "Search results",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          results: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                type: {
                                  type: "string",
                                  enum: [
                                    "chapter",
                                    "question",
                                    "flashcard",
                                    "formula",
                                  ],
                                },
                                title: { type: "string" },
                                snippet: { type: "string" },
                                url: { type: "string" },
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
      "/webhooks/stripe": {
        post: {
          tags: ["Webhooks"],
          summary: "Stripe webhook handler",
          description:
            "Process Stripe webhook events (payment.success, subscription.cancelled, etc.)",
          security: [],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    type: { type: "string" },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Webhook processed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      received: { type: "boolean", example: true },
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
}

export default generateOpenAPISpec;
