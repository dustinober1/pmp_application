import type { OpenAPIV3_1 } from 'openapi-types';

/**
 * Generate Subscription endpoints OpenAPI spec
 */
export const subscriptionPaths: OpenAPIV3_1.PathsObject = {
  '/api/subscriptions/tiers': {
    get: {
      tags: ['Subscriptions'],
      summary: 'Get all subscription tiers',
      description: 'Retrieve all available subscription tiers with pricing and features.',
      security: [],
      responses: {
        '200': {
          description: 'Subscription tiers retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      tiers: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            name: { type: 'string', example: 'Mid-Level' },
                            price: { type: 'number', example: 29.99 },
                            billingPeriod: {
                              type: 'string',
                              enum: ['monthly', 'yearly'],
                            },
                            features: {
                              type: 'object',
                              description: 'Feature limits for this tier',
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

  '/api/subscriptions/current': {
    get: {
      tags: ['Subscriptions'],
      summary: 'Get current subscription',
      description: "Retrieve the authenticated user's current subscription details.",
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Subscription retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      subscription: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          userId: { type: 'string', format: 'uuid' },
                          tierId: { type: 'string', format: 'uuid' },
                          status: {
                            type: 'string',
                            enum: ['active', 'cancelled', 'expired'],
                          },
                          startDate: { type: 'string', format: 'date-time' },
                          endDate: { type: 'string', format: 'date-time' },
                          tier: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', format: 'uuid' },
                              name: { type: 'string' },
                              price: { type: 'number' },
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

  '/api/subscriptions/features': {
    get: {
      tags: ['Subscriptions'],
      summary: 'Get user feature limits',
      description: "Retrieve the authenticated user's feature limits based on their subscription tier.",
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Feature limits retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      features: {
                        type: 'object',
                        properties: {
                          maxPracticeQuestions: { type: 'number', example: 500 },
                          maxFlashcards: { type: 'number', example: 1000 },
                          mockExams: { type: 'boolean', example: true },
                          analytics: { type: 'boolean', example: true },
                          prioritySupport: { type: 'boolean', example: false },
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

  '/api/subscriptions/create': {
    post: {
      tags: ['Subscriptions'],
      summary: 'Create subscription',
      description: 'Create a new subscription. For free tiers, activates immediately. For paid tiers, use /stripe/checkout instead.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['tierId'],
              properties: {
                tierId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Subscription tier ID',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Subscription created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      subscription: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          status: { type: 'string', example: 'active' },
                        },
                      },
                    },
                  },
                  message: { type: 'string', example: 'Subscription activated' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid tier or paid tier requested',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/api/subscriptions/stripe/checkout': {
    post: {
      tags: ['Subscriptions'],
      summary: 'Create Stripe checkout session',
      description: 'Create a Stripe Checkout session for paid subscription tiers.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['tierId'],
              properties: {
                tierId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Paid subscription tier ID',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Checkout session created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      sessionId: {
                        type: 'string',
                        description: 'Stripe Checkout Session ID',
                      },
                      checkoutUrl: {
                        type: 'string',
                        format: 'uri',
                        description: 'URL to redirect user to Stripe Checkout',
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

  '/api/subscriptions/stripe/portal': {
    post: {
      tags: ['Subscriptions'],
      summary: 'Create Stripe billing portal session',
      description: 'Create a session for the Stripe Customer Portal (manage subscription, payment methods).',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Portal session created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      url: {
                        type: 'string',
                        format: 'uri',
                        description: 'URL to Stripe Customer Portal',
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

  '/api/subscriptions/cancel': {
    post: {
      tags: ['Subscriptions'],
      summary: 'Cancel subscription',
      description: 'Cancel the current subscription. Access continues until billing period ends.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Subscription cancelled',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: {
                    type: 'string',
                    example: 'Subscription cancelled. Access will continue until the end of your billing period.',
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/subscriptions/check-expiry': {
    post: {
      tags: ['Subscriptions'],
      summary: 'Check subscription expiry',
      description: 'Trigger subscription expiry check. Used by cron jobs.',
      security: [],
      responses: {
        '200': {
          description: 'Expiry check completed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      processed: {
                        type: 'number',
                        description: 'Number of subscriptions processed',
                      },
                      expired: {
                        type: 'number',
                        description: 'Number of subscriptions expired',
                      },
                    },
                  },
                  message: {
                    type: 'string',
                    example: 'Processed 10 subscriptions. 2 expired.',
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
