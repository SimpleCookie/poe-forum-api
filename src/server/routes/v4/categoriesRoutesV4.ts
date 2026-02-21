import { FastifyInstance } from 'fastify'
import { forumCategories, assertAllowedCategory } from '../../../config/categories'
import { FORUM_BASE_URL } from '../../../config/constants'
import {
  validateCategorySlug,
  validatePageNumber,
  ValidationError,
} from '../../../config/inputValidation'
import { CategoryService } from '../../../service/categoryService'
import { getCategoriesSchemaV4, getCategorySchemaV4 } from './schemas/categoriesSchemasV4'

const categoryService = new CategoryService()

export async function categoriesRoutesV4(app: FastifyInstance) {
  app.get('/categories', { schema: getCategoriesSchemaV4 }, async () => {
    const grouped = {
      poe1: [] as Array<{ name: string; slug: string; endpoint: string; sourceUrl: string }>,
      poe2: [] as Array<{ name: string; slug: string; endpoint: string; sourceUrl: string }>,
    }

    forumCategories.forEach((cat) => {
      grouped[cat.game].push({
        name: cat.name,
        slug: cat.slug,
        endpoint: `/api/v4/category/${cat.slug}`,
        sourceUrl: `${FORUM_BASE_URL}${cat.slug}`,
      })
    })

    return grouped
  })

  app.get<{
    Params: { category: string }
    Querystring: { page?: string }
  }>('/category/:category', { schema: getCategorySchemaV4 }, async (request, reply) => {
    try {
      const { category } = request.params
      const pageNumber = Number(request.query.page ?? '1')

      validateCategorySlug(category)
      validatePageNumber(pageNumber)
      assertAllowedCategory(category)

      return await categoryService.getCategoryPage(category, pageNumber)
    } catch (error) {
      if (error instanceof ValidationError) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(404).send({ error: 'Category not supported' })
    }
  })
}
