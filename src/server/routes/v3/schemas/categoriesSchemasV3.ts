/**
 * V3 Categories Schemas
 * Swagger schemas for V3 API endpoints
 */
import { forumCategories } from '../../../../config/categories'

const categorySlugEnum = forumCategories.map((category) => category.slug)

const categoryItemSchema = {
  type: 'object',
  required: ['name', 'slug', 'endpoint', 'sourceUrl'],
  properties: {
    name: { type: 'string' },
    slug: { type: 'string', enum: categorySlugEnum },
    endpoint: { type: 'string' },
    sourceUrl: { type: 'string' },
  },
} as const

export const getCategoriesSchema = {
  tags: ['Categories - V3'],
  description: 'Get all available forum categories',
  response: {
    200: {
      type: 'object',
      required: ['poe1', 'poe2'],
      properties: {
        poe1: {
          type: 'array',
          items: categoryItemSchema,
        },
        poe2: {
          type: 'array',
          items: categoryItemSchema,
        },
      },
    },
  },
}

export const getCategorySchema = {
  tags: ['Categories - V3'],
  description: 'Get threads from a category',
  params: {
    type: 'object',
    properties: {
      category: { type: 'string', enum: categorySlugEnum, description: 'Category slug' },
    },
    required: ['category'],
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
      required: ['category', 'page', 'threads'],
      properties: {
        category: { type: 'string', enum: categorySlugEnum },
        page: { type: 'number' },
        threads: {
          type: 'array',
          items: {
            type: 'object',
            required: ['threadId', 'title', 'replies'],
            properties: {
              threadId: { type: 'string' },
              title: { type: 'string' },
              replies: { type: 'number' },
            },
          },
        },
      },
    },
  },
}
