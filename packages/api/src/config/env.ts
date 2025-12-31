import { z } from 'zod';

const envSchema = z.object({
    // Server
    PORT: z.string().default('3001').transform(Number),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),

    // Database
    DATABASE_URL: z.string(),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // PayPal
    PAYPAL_CLIENT_ID: z.string().optional(),
    PAYPAL_CLIENT_SECRET: z.string().optional(),
    PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),

    // Redis (optional)
    REDIS_URL: z.string().optional(),

    // Email
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    FROM_EMAIL: z.string().default('noreply@pmp-study.com'),

    // Logging
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues.map((issue) => issue.path.join('.'));
            console.error('❌ Missing or invalid environment variables:', missingVars);
            throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
        }
        throw error;
    }
}

export const env = validateEnv();
