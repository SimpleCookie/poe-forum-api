import { FastifyInstance } from 'fastify'
import { forumCategories } from '../../../config/categories'
import { FORUM_BASE_URL } from '../../../config/constants'
import { getCategoriesSchema, getCategorySchema } from './schemas/categoriesSchemasV3'
import { CategoryService } from '../../../service/categoryService'

const categoryService = new CategoryService()

/**
 * V3 Categories Routes
 * All category endpoints unified under /api/v3/
 */
export async function categoriesRoutesV3(app: FastifyInstance) {
  app.get('/categories', { schema: getCategoriesSchema }, async () => {
    const grouped = {
      poe1: [] as any[],
      poe2: [] as any[],
    }

    forumCategories.forEach((cat) => {
      const apiEndpoint = `/api/v3/category/${cat.slug}`

      grouped[cat.game].push({
        name: cat.name,
        slug: cat.slug,
        endpoint: apiEndpoint,
        sourceUrl: `${FORUM_BASE_URL}${cat.slug}`,
      })
    })

    return grouped
  })

  app.get<{
    Params: { category: string }
    Querystring: { page?: string }
  }>('/category/:category', { schema: getCategorySchema }, async (request, reply) => {
    try {
      const { category } = request.params
      const pageNumber = Number(request.query.page ?? '1')

      const threads = await categoryService.getCategoryPage(category, pageNumber)
      return threads
    } catch (error) {
      return reply.status(400).send({ error: 'Category not found' })
    }
  })
}
