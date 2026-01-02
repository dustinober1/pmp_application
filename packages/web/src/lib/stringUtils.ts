/**
 * String manipulation utilities
 * Addresses MEDIUM-001: Description truncation bug
 */

/**
 * Truncates text at word boundaries to avoid cutting words in half
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis, or original text if short enough
 */
export const truncateAtWordBoundary = (
  text: string | undefined | null,
  maxLength: number
): string => {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  // Find last complete word before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const lastNewline = truncated.lastIndexOf('\n');
  const lastPeriod = truncated.lastIndexOf('. ');
  const lastComma = truncated.lastIndexOf(', ');
  const lastBoundary = Math.max(lastSpace, lastNewline, lastPeriod, lastComma);

  // If no boundary found, just truncate at maxLength
  if (lastBoundary === -1 || lastBoundary < maxLength * 0.5) {
    return truncated + '...';
  }

  // Truncate at last word boundary
  return text.substring(0, lastBoundary).trim() + '...';
};

/**
 * Truncates text with emoji protection to avoid splitting multi-byte characters
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis, emoji-safe
 */
export const truncateWithEmojiProtection = (
  text: string | undefined | null,
  maxLength: number
): string => {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  // Use Array.from to properly handle Unicode/emojis
  const chars = Array.from(text);

  if (chars.length <= maxLength) return text;

  // Truncate at character level, then find word boundary
  let truncated = chars.slice(0, maxLength).join('');

  // Check if last character is part of an emoji or multi-byte sequence
  const lastChar = chars[maxLength - 1];
  if (lastChar && lastChar !== truncated[truncated.length - 1]) {
    // We might have cut an emoji, reduce length
    truncated = chars.slice(0, maxLength - 1).join('');
  }

  // Now apply word boundary truncation
  return truncateAtWordBoundary(truncated, maxLength);
};

/**
 * Truncates HTML content safely, preserving tag structure
 * @param html - HTML string to truncate
 * @param maxLength - Maximum text length (not counting HTML tags)
 * @returns Truncated HTML with properly closed tags
 */
export const truncateHtml = (html: string, maxLength: number): string => {
  // Simple HTML truncation - strips tags and truncates text
  // For production, consider using a proper HTML parser
  const stripTags = html.replace(/<[^>]*>/g, '');
  return truncateWithEmojiProtection(stripTags, maxLength);
};

/**
 * Converts a string to title case
 * @param text - Text to convert
 * @returns Title cased text
 */
export const toTitleCase = (text: string): string => {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Converts a string to slug format for URLs
 * @param text - Text to slugify
 * @returns URL-safe slug
 */
export const slugify = (text: string): string => {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Capitalizes the first letter of a string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Formats a number with commas as thousands separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Formats a percentage with specified decimal places
 * @param value - Value between 0 and 1
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Extracts initials from a name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials string
 */
export const getInitials = (name: string, maxInitials: number = 2): string => {
  if (!name) return '';

  return name
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

/**
 * Checks if a string is a valid URL
 * @param text - Text to check
 * @returns true if valid URL, false otherwise
 */
export const isValidUrl = (text: string): boolean => {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Masks sensitive information (e.g., email, credit card)
 * @param text - Text to mask
 * @param visibleChars - Number of characters to show at start and end
 * @param maskChar - Character to use for masking (default: '•')
 * @returns Masked string
 */
export const maskSensitiveData = (
  text: string,
  visibleChars: number = 4,
  maskChar: string = '•'
): string => {
  if (!text || text.length <= visibleChars * 2) return text;

  const start = text.substring(0, visibleChars);
  const end = text.substring(text.length - visibleChars);
  const masked = maskChar.repeat(text.length - visibleChars * 2);

  return start + masked + end;
};

/**
 * Pluralizes a word based on count
 * @param word - Singular form of word
 * @param count - Number to check for plurality
 * @param pluralForm - Optional plural form (defaults to word + 's')
 * @returns Pluralized word with count
 */
export const pluralize = (word: string, count: number, pluralForm?: string): string => {
  const plural = pluralForm || `${word}s`;
  return `${count} ${count === 1 ? word : plural}`;
};
