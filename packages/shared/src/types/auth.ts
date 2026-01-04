/**
 * Authentication related types
 */

export type TierName = "free" | "pro" | "corporate";

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  tier: TierName;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User { }

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  user: UserProfile;
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
