/**
 * V3 Categories Schemas
 * Swagger schemas for V3 API endpoints
 */
export const getCategoriesSchema = {
  tags: ['Categories - V3'],
  description: 'Get all available forum categories',
}

export const getCategorySchema = {
  tags: ['Categories - V3'],
  description: 'Get threads from a category',
  params: {
    type: 'object',
    properties: {
      category: { type: 'string', description: 'Category slug' },
    },
    required: ['category'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'string', description: 'Page number (default: 1)' },
    },
  },
}
