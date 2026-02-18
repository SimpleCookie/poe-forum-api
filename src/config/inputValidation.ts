export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates that a thread ID contains only numeric characters
 * Prevents path traversal and injection attacks
 *
 * @param threadId - The thread ID parameter from user input
 * @throws {ValidationError} If thread ID is invalid
 */
export function validateThreadId(threadId: string): void {
  if (!threadId || !/^\d+$/.test(threadId)) {
    throw new ValidationError(
      `Invalid thread ID: must be numeric, got "${threadId}"`
    );
  }
}

/**
 * Validates that a category slug contains only safe characters
 * Prevents path traversal and injection attacks
 *
 * @param categorySlug - The category slug parameter from user input
 * @throws {ValidationError} If slug is invalid
 */
export function validateCategorySlug(categorySlug: string): void {
  if (!categorySlug || !/^[a-zA-Z0-9_-]+$/.test(categorySlug)) {
    throw new ValidationError(
      `Invalid category slug: must contain only alphanumeric characters, hyphens, and underscores, got "${categorySlug}"`
    );
  }
}

/**
 * Validates that a page number is a positive integer
 * Prevents invalid pagination attacks
 *
 * @param pageNumber - The page number parameter
 * @throws {ValidationError} If page number is invalid
 */
export function validatePageNumber(pageNumber: number, maxPage = 200): void {
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > maxPage) {
    throw new ValidationError(
      `Invalid page number: must be between 1 and ${maxPage}, got ${pageNumber}`
    );
  }
}
