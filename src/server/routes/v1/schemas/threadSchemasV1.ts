/**
 * V1 Thread Schemas - DEPRECATED
 * Swagger schemas for V1 API endpoints
 * @deprecated Use threadSchemasV2 instead
 */
export const getThreadSchema = {
  tags: ['Threads - V1 (Deprecated)'],
  description: 'Get a specific thread by ID (deprecated format). Posts include HTML content with embedded images and blockquotes. Clients should sanitize HTML with DOMPurify or equivalent library before rendering. Use /api/v2/thread/:id for current version.',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Thread ID' },
    },
    required: ['id'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'string', description: 'Page number (default: 1)' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        threadId: { type: 'string', description: 'Thread ID' },
        title: { type: ['string', 'null'], description: 'Thread title (only on first page)' },
        posts: {
          type: 'array',
          description: 'List of posts on this page',
          items: {
            type: 'object',
            properties: {
              postId: { type: ['string', 'null'] },
              threadId: { type: 'string' },
              author: { type: 'string' },
              createdAt: { type: ['string', 'null'] },
              contentText: { type: 'string', description: 'Plain text content (cleaned, for fallback or search)' },
              contentHtml: { type: 'string', description: 'HTML content with formatting, blockquotes, and embedded images. IMPORTANT: Sanitize with DOMPurify before rendering to prevent XSS.' },
              indexOnPage: { type: 'number' },
              page: { type: 'number', description: 'Page number (deprecated)' },
            },
          },
        },
        page: { type: 'number', description: 'Current page number (deprecated)' },
        nextPageUrl: {
          type: ['string', 'null'],
          description: 'URL to next page (deprecated)',
        },
      },
    },
  },
}
