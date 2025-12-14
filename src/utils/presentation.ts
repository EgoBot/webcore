/**
 * Presentation Utilities
 * Pure formatting functions with no dependencies on content or assets
 */

/**
 * Convert text to URL-safe slug
 * @example slugify("Hello World!") // "hello-world"
 */
export function slugify(text: string): string {
  return text
    .toString()                      // Ensure it's a string
    .normalize('NFD')                 // Normalize characters (e.g., é becomes e)
    .replace(/[\u0300-\u036f]/g, '')  // Remove diacritics
    .toLowerCase()                   // Convert to lowercase
    .trim()                           // Remove leading/trailing spaces
    .replace(/[^a-z0-9 -]/g, '')      // Remove non-alphanumeric characters
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/-+/g, '-');             // Replace multiple hyphens with one
}

/**
 * Format date for display
 * @example formatDate(new Date()) // "Dec 14, 2025"
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
