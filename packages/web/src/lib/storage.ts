/**
 * Local Storage wrapper for static PMP Study Pro.
 *
 * This module provides a type-safe interface for localStorage with
 * versioned keys to support future migrations.
 */

const STORAGE_PREFIX = "pmp_static_v1:";
const STORAGE_VERSION = 1;

/**
 * Gets a JSON value from localStorage with a fallback.
 *
 * @param key - Storage key (without prefix)
 * @param fallback - Default value if key doesn't exist
 * @returns The parsed value or fallback
 */
export function getJson<T>(key: string, fallback: T): T {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    const item = localStorage.getItem(fullKey);

    if (item === null) {
      return fallback;
    }

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return fallback;
  }
}

/**
 * Sets a JSON value in localStorage.
 *
 * @param key - Storage key (without prefix)
 * @param value - Value to store
 */
export function setJson<T>(key: string, value: T): void {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    localStorage.setItem(fullKey, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
}

/**
 * Updates a JSON value in localStorage using an updater function.
 *
 * @param key - Storage key (without prefix)
 * @param fallback - Default value if key doesn't exist
 * @param updater - Function to transform the current value
 * @returns The updated value
 */
export function updateJson<T>(
  key: string,
  fallback: T,
  updater: (prev: T) => T,
): T {
  const current = getJson(key, fallback);
  const updated = updater(current);
  setJson(key, updated);
  return updated;
}

/**
 * Removes a value from localStorage.
 *
 * @param key - Storage key (without prefix)
 */
export function removeJson(key: string): void {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(fullKey);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

/**
 * Clears all PMP Study Pro data from localStorage.
 * Useful for logging out or resetting progress.
 */
export function clearAllData(): void {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}

/**
 * Gets the storage version.
 * Can be used for future migrations.
 */
export function getStorageVersion(): number {
  return getJson("version", STORAGE_VERSION);
}

/**
 * Sets the storage version.
 */
export function setStorageVersion(version: number): void {
  setJson("version", version);
}

/**
 * Gets storage usage information.
 */
export interface StorageInfo {
  keys: number;
  bytesUsed: number;
  keysList: string[];
}

export function getStorageInfo(): StorageInfo {
  const keysList: string[] = [];
  let bytesUsed = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key);
      keysList.push(key);
      bytesUsed += key.length + (value?.length || 0);
    }
  }

  return {
    keys: keysList.length,
    bytesUsed,
    keysList,
  };
}
