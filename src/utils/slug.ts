/**
 * Slug generation and parsing utilities for case URLs
 * 
 * Converts case titles to URL-friendly slugs and extracts case IDs from slugged URLs
 * Example: "Rabi Lamichhane Cooperative Fraud" -> "rabi-lamichhane-cooperative-fraud"
 * URL format: /case/207-rabi-lamichhane-cooperative-fraud
 */

/**
 * Generate a URL-friendly slug from a string
 * Converts to lowercase, replaces spaces/special chars with hyphens
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Nepali and special characters with spaces first
    .replace(/[^\w\s-]/g, ' ')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a slugged URL path for a case
 * @param caseId - The case ID
 * @param caseTitle - The case title to convert to slug
 * @returns Slugged URL path (e.g., "207-rabi-lamichhane-cooperative-fraud")
 */
export function generateCaseSlug(caseId: number | string, caseTitle: string): string {
  const slug = generateSlug(caseTitle);
  // If slug is empty (e.g., Nepali-only text), just return the ID
  if (!slug) {
    return `${caseId}`;
  }
  return `${caseId}-${slug}`;
}

/**
 * Extract case ID from a slugged URL parameter
 * Splits by hyphen and gets the first segment which should be the numeric ID
 * @param sluggedParam - The slugged URL parameter (e.g., "207-rabi-lamichhane-cooperative-fraud")
 * @returns The extracted case ID, or null if invalid
 */
export function extractIdFromSlug(sluggedParam: string): number | null {
  if (!sluggedParam) return null;
  
  // Split by hyphen and get the first part
  const parts = sluggedParam.split('-');
  const idString = parts[0];
  
  // Parse as integer
  const id = parseInt(idString, 10);
  
  // Validate it's a valid number
  if (isNaN(id) || id <= 0) {
    return null;
  }
  
  return id;
}
