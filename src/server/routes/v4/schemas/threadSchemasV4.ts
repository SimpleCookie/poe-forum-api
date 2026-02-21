/**
 * V4 Thread Schemas
 * Simplified response contract with single content field per post.
 */
export const getThreadSchemaV4 = {
  tags: ['Threads - V4'],
  description: 'Get a specific thread by ID with pagination. V4 returns a single content field per post using simple quote markup like [quote="Author"]...[/quote].',
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
      required: ['threadId', 'posts', 'pagination'],
      properties: {
        threadId: { type: 'string', description: 'Thread ID' },
        title: { type: 'string', description: 'Thread title (only on first page)' },
        posts: {
          type: 'array',
          description: 'List of posts on this page',
          items: {
            type: 'object',
            required: ['postId', 'threadId', 'author', 'createdAt', 'content', 'indexOnPage'],
            properties: {
              postId: { type: 'string', description: 'Post ID' },
              threadId: { type: 'string', description: 'Thread ID' },
              author: { type: 'string', description: 'Author of the post' },
              createdAt: { type: 'string', description: 'ISO date when post was created' },
              content: { type: 'string', description: 'Post content with simple quote markup like [quote="Author"]...[/quote].' },
              indexOnPage: { type: 'number', description: 'Position on the page (0-indexed)' },
            },
          },
        },
        pagination: {
          type: 'object',
          required: ['page', 'totalPages', 'hasNext', 'hasPrevious', 'pageSize'],
          description: 'Pagination metadata',
          properties: {
            page: { type: 'number', description: 'Current page number (1-indexed)' },
            totalPages: { type: 'number', description: 'Total number of pages' },
            hasNext: { type: 'boolean', description: 'Whether there is a next page' },
            hasPrevious: { type: 'boolean', description: 'Whether there is a previous page' },
            pageSize: { type: 'number', description: 'Number of items on this page' },
          },
        },
      },
    },
  },
}
