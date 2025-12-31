/**
 * Authentication related types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  tokens: TokenPair;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  tierId: string;
  iat: number;
  exp: number;
}
