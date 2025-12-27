import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PMP Application API",
      version: "1.0.0",
      description: "API documentation for the PMP Study Application",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
          },
        },
        Question: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            domainId: { type: "string", format: "uuid" },
            questionText: { type: "string" },
            choices: { type: "string" },
            correctAnswerIndex: { type: "integer" },
            explanation: { type: "string" },
            difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"] },
          },
        },
        Domain: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            weightPercentage: { type: "number" },
            color: { type: "string" },
          },
        },
        FlashCard: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            domainId: { type: "string", format: "uuid" },
            frontText: { type: "string" },
            backText: { type: "string" },
            category: { type: "string" },
            difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"] },
          },
        },
        PracticeTest: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            totalQuestions: { type: "integer" },
            timeLimitMinutes: { type: "integer" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            error: { type: "string" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Questions", description: "Question management" },
      { name: "Flashcards", description: "Flashcard management" },
      { name: "Practice", description: "Practice test sessions" },
      { name: "Progress", description: "User progress tracking" },
      { name: "Admin", description: "Admin-only endpoints" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
