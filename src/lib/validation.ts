// src/lib/validation.ts
/**
 * Input Validation Utilities
 *
 * Provides validation and sanitization functions for user input
 * to prevent XSS, injection attacks, and data integrity issues
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string' || email.trim().length === 0) {
    return false;
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Sanitize display name
 * Removes HTML tags and dangerous characters
 */
export function sanitizeDisplayName(name: string): string {
  if (typeof name !== 'string') {
    return '';
  }

  return name
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .substring(0, 100); // Limit length
}

/**
 * Validate display name
 */
export function isValidDisplayName(name: string): boolean {
  const sanitized = sanitizeDisplayName(name);
  return sanitized.length >= 2 && sanitized.length <= 100;
}

/**
 * Validate password strength
 * Requires: 8+ chars, 1 uppercase, 1 lowercase, 1 number
 */
export function isValidPassword(password: string): boolean {
  if (typeof password !== 'string' || password.length < 8) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUppercase && hasLowercase && hasNumber;
}

/**
 * Validate user role
 */
export function isValidRole(role: string): role is 'student' | 'teacher' | 'admin' | 'institution' | 'dev' {
  const validRoles = ['student', 'teacher', 'admin', 'institution', 'dev'];
  return validRoles.includes(role);
}

/**
 * Validate Firebase UID format
 */
export function isValidFirebaseUID(uid: string): boolean {
  if (typeof uid !== 'string') {
    return false;
  }

  // Firebase UIDs are 28 characters alphanumeric
  return /^[a-zA-Z0-9]{20,28}$/.test(uid);
}

/**
 * Sanitize text input (for reasons, descriptions, etc.)
 */
export function sanitizeText(text: string, maxLength: number = 500): string {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, maxLength);
}

/**
 * Validate institutionId
 */
export function isValidInstitutionId(id: string): boolean {
  if (typeof id !== 'string' || id.trim().length === 0) {
    return false;
  }

  // Institution IDs should be alphanumeric with hyphens/underscores
  return /^[a-zA-Z0-9_-]{3,50}$/.test(id);
}

/**
 * Validate account type
 */
export function isValidAccountType(type: string): type is 'individual' | 'institution' {
  return type === 'individual' || type === 'institution';
}

/**
 * Validate XP amount
 */
export function isValidXPAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0 && amount <= 1000;
}

/**
 * Validate badge ID
 */
export function isValidBadgeId(badgeId: string): boolean {
  if (typeof badgeId !== 'string' || badgeId.trim().length === 0) {
    return false;
  }

  // Badge IDs should be lowercase alphanumeric with hyphens
  return /^[a-z0-9-]{3,50}$/.test(badgeId);
}
