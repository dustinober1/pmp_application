import jwt from 'jsonwebtoken';

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface ServiceUser {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
}

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string, secret: string): JWTPayload | null => {
    try {
        return jwt.verify(token, secret) as JWTPayload;
    } catch {
        return null;
    }
};

/**
 * Generate an access token
 */
export const generateAccessToken = (
    user: { id: string; email: string; role: string },
    secret: string,
    expiresIn: string = '15m'
): string => {
    const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Extract token from Authorization header
 */
export const extractBearerToken = (authHeader?: string): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};
