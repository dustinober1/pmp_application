/**
 * Account Lockout Service
 * Prevents brute force attacks by locking accounts after failed login attempts
 *
 * Addresses Issue #8: Password Management Issues
 */

import { cache } from "./cache";
import Logger from "../utils/logger";

// Lockout configuration
const LOCKOUT_CONFIG = {
  maxAttempts: 5, // Lock after 5 failed attempts
  lockoutDuration: 15 * 60, // 15 minutes in seconds
  attemptWindow: 15 * 60, // Track attempts for 15 minutes
  progressiveLockout: true, // Increase lockout time for repeat offenders
};

// Redis key prefixes
const KEYS = {
  attempts: (email: string) => `lockout:attempts:${email.toLowerCase()}`,
  locked: (email: string) => `lockout:locked:${email.toLowerCase()}`,
  lockoutCount: (email: string) => `lockout:count:${email.toLowerCase()}`,
};

interface LockoutData {
  endsAt: string;
  duration: number;
}

interface LockoutStatus {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutEndsAt: Date | null;
  lockoutDuration: number | null;
}

/**
 * Check if an account is currently locked
 * @param email - User email to check
 * @returns LockoutStatus object
 */
export async function checkAccountLockout(
  email: string,
): Promise<LockoutStatus> {
  const normalizedEmail = email.toLowerCase();

  try {
    // Check if account is locked
    const lockoutData = await cache.get<LockoutData>(
      KEYS.locked(normalizedEmail),
    );

    if (lockoutData) {
      return {
        isLocked: true,
        remainingAttempts: 0,
        lockoutEndsAt: new Date(lockoutData.endsAt),
        lockoutDuration: lockoutData.duration,
      };
    }

    // Get current attempt count
    const attemptsData = await cache.get<number>(
      KEYS.attempts(normalizedEmail),
    );
    const attempts = attemptsData ?? 0;

    return {
      isLocked: false,
      remainingAttempts: Math.max(0, LOCKOUT_CONFIG.maxAttempts - attempts),
      lockoutEndsAt: null,
      lockoutDuration: null,
    };
  } catch (error) {
    Logger.error("Error checking account lockout:", error);
    // Fail open - don't lock out on Redis errors
    return {
      isLocked: false,
      remainingAttempts: LOCKOUT_CONFIG.maxAttempts,
      lockoutEndsAt: null,
      lockoutDuration: null,
    };
  }
}

/**
 * Record a failed login attempt
 * @param email - User email
 * @returns Updated lockout status
 */
export async function recordFailedAttempt(
  email: string,
): Promise<LockoutStatus> {
  const normalizedEmail = email.toLowerCase();

  try {
    // Get current attempt count
    const attemptsKey = KEYS.attempts(normalizedEmail);
    const currentAttempts = await cache.get<number>(attemptsKey);
    const attempts = (currentAttempts ?? 0) + 1;

    // Store updated attempt count
    await cache.set(attemptsKey, attempts, LOCKOUT_CONFIG.attemptWindow);

    // Check if we should lock the account
    if (attempts >= LOCKOUT_CONFIG.maxAttempts) {
      return lockAccount(normalizedEmail);
    }

    Logger.warn(
      `Failed login attempt ${attempts}/${LOCKOUT_CONFIG.maxAttempts} for: ${normalizedEmail}`,
    );

    return {
      isLocked: false,
      remainingAttempts: LOCKOUT_CONFIG.maxAttempts - attempts,
      lockoutEndsAt: null,
      lockoutDuration: null,
    };
  } catch (error) {
    Logger.error("Error recording failed attempt:", error);
    return {
      isLocked: false,
      remainingAttempts: LOCKOUT_CONFIG.maxAttempts,
      lockoutEndsAt: null,
      lockoutDuration: null,
    };
  }
}

/**
 * Lock an account after too many failed attempts
 * @param email - User email to lock
 * @returns Lockout status
 */
async function lockAccount(email: string): Promise<LockoutStatus> {
  try {
    // Get previous lockout count for progressive lockout
    const lockoutCountData = await cache.get<number>(KEYS.lockoutCount(email));
    const lockoutCount = lockoutCountData ?? 0;

    // Calculate lockout duration (progressive)
    let duration = LOCKOUT_CONFIG.lockoutDuration;
    if (LOCKOUT_CONFIG.progressiveLockout && lockoutCount > 0) {
      // Double duration for each subsequent lockout, up to 24 hours
      duration = Math.min(duration * Math.pow(2, lockoutCount), 24 * 60 * 60);
    }

    const endsAt = new Date(Date.now() + duration * 1000);

    // Set lockout data
    const lockoutData: LockoutData = {
      endsAt: endsAt.toISOString(),
      duration,
    };

    await cache.set(KEYS.locked(email), lockoutData, duration);

    // Increment lockout count (persists for 7 days)
    await cache.set(
      KEYS.lockoutCount(email),
      lockoutCount + 1,
      7 * 24 * 60 * 60,
    );

    // Clear attempt counter
    await cache.del(KEYS.attempts(email));

    Logger.warn(
      `Account locked: ${email} for ${duration} seconds (lockout #${lockoutCount + 1})`,
    );

    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutEndsAt: endsAt,
      lockoutDuration: duration,
    };
  } catch (error) {
    Logger.error("Error locking account:", error);
    return {
      isLocked: false,
      remainingAttempts: 0,
      lockoutEndsAt: null,
      lockoutDuration: null,
    };
  }
}

/**
 * Clear lockout and attempts after successful login
 * @param email - User email
 */
export async function clearLockout(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();

  try {
    await Promise.all([
      cache.del(KEYS.attempts(normalizedEmail)),
      cache.del(KEYS.locked(normalizedEmail)),
    ]);

    Logger.debug(`Lockout cleared for: ${normalizedEmail}`);
  } catch (error) {
    Logger.error("Error clearing lockout:", error);
  }
}

/**
 * Manually unlock an account (admin function)
 * @param email - User email to unlock
 */
export async function unlockAccount(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();

  try {
    await Promise.all([
      cache.del(KEYS.attempts(normalizedEmail)),
      cache.del(KEYS.locked(normalizedEmail)),
      cache.del(KEYS.lockoutCount(normalizedEmail)),
    ]);

    Logger.info(`Account manually unlocked: ${normalizedEmail}`);
  } catch (error) {
    Logger.error("Error unlocking account:", error);
    throw error;
  }
}

/**
 * Get lockout configuration (for API responses)
 */
export function getLockoutConfig() {
  return {
    maxAttempts: LOCKOUT_CONFIG.maxAttempts,
    lockoutDurationMinutes: LOCKOUT_CONFIG.lockoutDuration / 60,
    progressiveLockout: LOCKOUT_CONFIG.progressiveLockout,
  };
}
