/**
 * V5 Thread Schemas
 * Single structured content field per post.
 */
export const getThreadSchemaV5 = {
  tags: ['Threads - V5'],
  description: 'Get a specific thread by ID with pagination. V5 returns one structured content field with typed blocks for easier client rendering.',
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
              content: {
                type: 'object',
                required: ['type', 'blocks'],
                properties: {
                  type: { type: 'string', enum: ['doc'] },
                  blocks: {
                    type: 'array',
                    items: {
                      oneOf: [
                        {
                          type: 'object',
                          required: ['type', 'text'],
                          properties: {
                            type: { type: 'string', enum: ['paragraph'] },
                            text: { type: 'string' },
                          },
                        },
                        {
                          type: 'object',
                          required: ['type', 'url'],
                          properties: {
                            type: { type: 'string', enum: ['image'] },
                            url: { type: 'string' },
                            alt: { type: 'string' },
                          },
                        },
                        {
                          type: 'object',
                          required: ['type', 'provider', 'kind', 'url', 'embedUrl'],
                          properties: {
                            type: { type: 'string', enum: ['embed'] },
                            provider: { type: 'string', enum: ['youtube', 'unknown'] },
                            kind: { type: 'string', enum: ['video', 'iframe'] },
                            url: { type: 'string' },
                            embedUrl: { type: 'string' },
                            videoId: { type: 'string' },
                          },
                        },
                        {
                          type: 'object',
                          required: ['type', 'text', 'depth'],
                          properties: {
                            type: { type: 'string', enum: ['quote'] },
                            author: { type: 'string' },
                            text: { type: 'string' },
                            depth: { type: 'number', minimum: 1 },
                          },
                        },
                      ],
                    },
                  },
                },
              },
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
