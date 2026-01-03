import type { OpenAPIV3_1 } from "openapi-types";

/**
 * Generate Ebook endpoints OpenAPI spec
 */
export const ebookPaths: OpenAPIV3_1.PathsObject = {
  "/api/ebook": {
    get: {
      tags: ["Ebooks"],
      summary: "Get all ebook chapters",
      description:
        "Retrieve all chapters with metadata. Premium chapters are marked.",
      security: [],
      responses: {
        "200": {
          description: "Chapters retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      chapters: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            slug: { type: "string", example: "introduction" },
                            title: {
                              type: "string",
                              example: "Introduction to PMP",
                            },
                            order: { type: "number", example: 1 },
                            isPremium: {
                              type: "boolean",
                              description:
                                "Whether chapter requires premium subscription",
                            },
                            sectionCount: { type: "number", example: 10 },
                          },
                        },
                      },
                      count: { type: "number", example: 12 },
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

  "/api/ebook/chapters/{slug}": {
    get: {
      tags: ["Ebooks"],
      summary: "Get chapter details",
      description:
        "Retrieve chapter metadata and list of sections (no content).",
      security: [],
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Chapter slug",
          example: "introduction",
        },
      ],
      responses: {
        "200": {
          description: "Chapter details retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      chapter: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          slug: { type: "string" },
                          title: { type: "string" },
                          content: { type: "string" },
                          sections: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string", format: "uuid" },
                                slug: { type: "string" },
                                title: { type: "string" },
                                order: { type: "number" },
                                isPremium: { type: "boolean" },
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
        "404": {
          description: "Chapter not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },

  "/api/ebook/chapters/{chapterSlug}/sections/{sectionSlug}": {
    get: {
      tags: ["Ebooks"],
      summary: "Get section content",
      description:
        "Retrieve full section content with access control based on subscription tier.",
      security: [],
      parameters: [
        {
          name: "chapterSlug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Chapter slug",
        },
        {
          name: "sectionSlug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Section slug",
        },
      ],
      responses: {
        "200": {
          description: "Section content retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      section: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          title: { type: "string" },
                          content: {
                            type: "string",
                            description: "Full section content (Markdown)",
                          },
                          isPremium: { type: "boolean" },
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
          description: "Premium content requires subscription",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "404": {
          description: "Section not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },

  "/api/ebook/search": {
    get: {
      tags: ["Ebooks"],
      summary: "Search ebook content",
      description:
        "Search across all ebook content. Premium content requires subscription.",
      security: [],
      parameters: [
        {
          name: "q",
          in: "query",
          required: true,
          schema: { type: "string" },
          description: "Search query",
          example: "stakeholder management",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", minimum: 1, default: 1 },
          description: "Page number",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          description: "Results per page",
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
                            chapter: {
                              type: "object",
                              properties: {
                                slug: { type: "string" },
                                title: { type: "string" },
                              },
                            },
                            section: {
                              type: "object",
                              properties: {
                                slug: { type: "string" },
                                title: { type: "string" },
                              },
                            },
                            snippet: {
                              type: "string",
                              description: "Relevant text excerpt",
                            },
                            isPremium: { type: "boolean" },
                          },
                        },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          page: { type: "integer" },
                          limit: { type: "integer" },
                          total: { type: "integer" },
                          totalPages: { type: "integer" },
                          hasNext: { type: "boolean" },
                          hasPrev: { type: "boolean" },
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

  "/api/ebook/progress": {
    get: {
      tags: ["Ebooks"],
      summary: "Get reading progress",
      description: "Retrieve user's overall ebook reading progress.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Progress retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      progress: {
                        type: "object",
                        properties: {
                          lastChapterSlug: { type: "string" },
                          lastSectionSlug: { type: "string" },
                          completedSections: {
                            type: "array",
                            items: {
                              type: "string",
                              format: "uuid",
                            },
                          },
                          overallPercentage: {
                            type: "number",
                            description: "Overall completion percentage",
                            example: 35.5,
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
    post: {
      tags: ["Ebooks"],
      summary: "Update reading progress",
      description:
        "Update user's reading progress. Automatically tracks sections read.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["chapterSlug", "sectionSlug"],
              properties: {
                chapterSlug: { type: "string" },
                sectionSlug: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Progress updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      progress: {
                        type: "object",
                        properties: {
                          lastChapterSlug: { type: "string" },
                          lastSectionSlug: { type: "string" },
                          completedSections: {
                            type: "array",
                            items: { type: "string", format: "uuid" },
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

  "/api/ebook/progress/chapter/{chapterSlug}": {
    get: {
      tags: ["Ebooks"],
      summary: "Get chapter progress",
      description: "Retrieve user's progress for a specific chapter.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "chapterSlug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Chapter slug",
        },
      ],
      responses: {
        "200": {
          description: "Chapter progress retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      progress: {
                        type: "object",
                        properties: {
                          chapterSlug: { type: "string" },
                          completedSections: {
                            type: "array",
                            items: { type: "string", format: "uuid" },
                          },
                          chapterPercentage: {
                            type: "number",
                            example: 60.0,
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

  "/api/ebook/progress/complete": {
    post: {
      tags: ["Ebooks"],
      summary: "Mark section complete",
      description: "Manually mark a section as completed.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["chapterSlug", "sectionSlug"],
              properties: {
                chapterSlug: { type: "string" },
                sectionSlug: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Section marked complete",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Section marked as complete",
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/ebook/progress/reset": {
    post: {
      tags: ["Ebooks"],
      summary: "Reset reading progress",
      description: "Reset all reading progress for the authenticated user.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Progress reset",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Progress reset successfully",
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
