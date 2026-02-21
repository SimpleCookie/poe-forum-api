import { forumCategories } from '../../config/categories'

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
  tags: ['Categories'],
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
