/**
 * University Normalization and Matching Utilities
 * 
 * Provides centralized normalization and case-insensitive, whitespace-tolerant
 * university comparison logic for institutional authorization and security.
 */

/**
 * Normalizes a university string by trimming leading/trailing whitespace and converting to lowercase.
 * Returns an empty string if the value is null, undefined, or contains only whitespace.
 */
export function normalizeUniversity(value?: string | null): string {
  if (!value) return '';
  return value.trim().toLowerCase();
}

/**
 * Checks whether a university string is valid (non-null and non-empty after trimming).
 */
export function isValidUniversity(value?: string | null): boolean {
  return normalizeUniversity(value).length > 0;
}

/**
 * Compares two university names in a case-insensitive and whitespace-tolerant manner.
 * Returns true only if both are non-empty and match when normalized.
 */
export function areUniversitiesEqual(a?: string | null, b?: string | null): boolean {
  const normA = normalizeUniversity(a);
  const normB = normalizeUniversity(b);
  if (!normA || !normB) return false;
  return normA === normB;
}

/**
 * Derives a clean, uppercase prefix for the university (e.g., 'ABC' for 'ABC University').
 * Filters out common institutional suffixes/stop words.
 */
export function getUniversityPrefix(university: string): string {
  const trimmed = university.trim();
  if (!trimmed) return 'STU';

  const words = trimmed.split(/\s+/).filter(Boolean);
  const stopWords = new Set([
    'UNIVERSITY',
    'COLLEGE',
    'INSTITUTE',
    'INSTITUTION',
    'SCHOOL',
    'ACADEMY',
    'CAMPUS',
    'OF',
    'THE',
    'AND',
    '&',
  ]);

  const nonStopWords = words.filter((w) => !stopWords.has(w.toUpperCase()));

  if (nonStopWords.length === 1) {
    const clean = nonStopWords[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length > 0) {
      return clean.length > 12 ? clean.substring(0, 4) : clean;
    }
  }

  if (nonStopWords.length > 1) {
    const acronym = words
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, '')[0] || '')
      .join('')
      .toUpperCase();
    if (acronym.length >= 2 && acronym.length <= 6) {
      return acronym;
    }
    const nonStopAcronym = nonStopWords
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, '')[0] || '')
      .join('')
      .toUpperCase();
    if (nonStopAcronym.length >= 2) {
      return nonStopAcronym;
    }
  }

  const fallback = words[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return fallback.length > 0 ? (fallback.length > 6 ? fallback.substring(0, 4) : fallback) : 'STU';
}

/**
 * Formats a sequence number into the standard 6-digit university student ID.
 * Example: 'ABC', 1 -> 'ABC-000001'
 */
export function formatStudentId(prefix: string, seq: number): string {
  return `${prefix}-${String(seq).padStart(6, '0')}`;
}
