export const getThreadSchema = {
    tags: ['Threads'],
    description: 'Get a specific thread by ID with pagination',
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
                            postId: { type: ['string', 'null'], description: 'Post ID' },
                            threadId: { type: 'string', description: 'Thread ID' },
                            author: { type: 'string', description: 'Author of the post' },
                            createdAt: {
                                type: ['string', 'null'],
                                description: 'ISO date when post was created',
                            },
                            contentText: { type: 'string', description: 'Plain text content' },
                            contentHtml: { type: 'string', description: 'HTML content' },
                            indexOnPage: { type: 'number', description: 'Position on the page (0-indexed)' },
                        },
                    },
                },
                pagination: {
                    type: 'object',
                    description: 'Pagination metadata',
                    properties: {
                        page: { type: 'number', description: 'Current page number (1-indexed)' },
                        totalPages: { type: 'number', description: 'Total number of pages' },
                        hasNext: { type: 'boolean', description: 'Whether there is a next page' },
                        hasPrevious: { type: 'boolean', description: 'Whether there is a previous page' },
                        totalItems: {
                            type: ['number', 'null'],
                            description: 'Total number of posts (optional)',
                        },
                        pageSize: {
                            type: ['number', 'null'],
                            description: 'Number of items on current page (optional)',
                        },
                    },
                },
            },
        },
    },
}
