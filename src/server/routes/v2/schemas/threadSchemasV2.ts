/**
 * V2 Thread Schemas - CURRENT
 * Swagger schemas for current V2 API endpoints with improved pagination.
 */
export const getThreadSchema = {
  tags: ['Threads - V2 (Current)'],
  description: 'Get a specific thread by ID with pagination. RECOMMENDED endpoint. Posts include HTML content with embedded images and blockquotes. Clients should sanitize HTML with DOMPurify or equivalent library before rendering to prevent XSS attacks.',
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
        title: { type: 'string', description: 'Thread title (only on first page)' },
        posts: {
          type: 'array',
          description: 'List of posts on this page',
          items: {
            type: 'object',
            properties: {
              postId: { type: 'string', description: 'Post ID' },
              threadId: { type: 'string', description: 'Thread ID' },
              author: { type: 'string', description: 'Author of the post' },
              createdAt: {
                type: 'string',
                description: 'ISO date when post was created',
              },
              contentText: { type: 'string', description: 'Plain text content (cleaned, for fallback or search)' },
              contentHtml: { type: 'string', description: 'HTML content with formatting, blockquotes, and embedded images. Images appear inline at their original position. IMPORTANT: Sanitize with DOMPurify or similar before rendering to prevent XSS attacks.' },
              indexOnPage: {
                type: 'number',
                description: 'Position on the page (0-indexed)',
              },
            },
          },
        },
        pagination: {
          type: 'object',
          description: 'Pagination metadata',
          properties: {
            page: {
              type: 'number',
              description: 'Current page number (1-indexed)',
            },
            totalPages: {
              type: 'number',
              description: 'Total number of pages',
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page',
            },
            hasPrevious: {
              type: 'boolean',
              description: 'Whether there is a previous page',
            },
            pageSize: {
              type: 'number',
              description: 'Number of items on this page',
            },
          },
        },
      },
    },
  },
}
