import { FastifyInstance } from 'fastify'
import { CategoryService } from '../../service/categoryService'
import { assertAllowedCategory } from '../../config/categories'
import {
  validateCategorySlug,
  validatePageNumber,
  ValidationError,
} from '../../config/inputValidation'
import { getCategorySchema } from '../schemas/categorySchemas'

const categoryService = new CategoryService()

export default async function categoryRoutes(app: FastifyInstance) {
  app.get<{
    Params: { category: string }
    Querystring: { page?: string }
  }>('/category/:category', { schema: getCategorySchema }, async (request, reply) => {
    try {
      const { category } = request.params
      const page = Number(request.query.page ?? '1')

      // Validate category slug to prevent injection attacks
      validateCategorySlug(category)
      // Validate page number
      validatePageNumber(page)
      // Check if category is in allowed list
      assertAllowedCategory(category)

      const result = await categoryService.getCategoryPage(category, page)

      return result
    } catch (error) {
      if (error instanceof ValidationError) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(404).send({ error: 'Category not supported' })
    }
  })
}
