import { FastifyInstance } from 'fastify'
import { ThreadService } from '../../service/threadService'
import { validateThreadId, validatePageNumber, ValidationError } from '../../config/inputValidation'
import { getThreadSchema } from '../schemas/threadSchemas'

const threadService = new ThreadService()

export async function threadRoutes(app: FastifyInstance) {
  app.get<{
    Params: { id: string }
    Querystring: { page?: string }
  }>('/thread/:id', { schema: getThreadSchema }, async (request, reply) => {
    try {
      const { id } = request.params
      const pageNumber = Number(request.query.page ?? '1')

      // Validate parameters to prevent SSRF/injection attacks
      validateThreadId(id)
      validatePageNumber(pageNumber)

      const threadPage = await threadService.getThreadPage(id, pageNumber)

      return threadPage
    } catch (error) {
      if (error instanceof ValidationError) {
        return reply.status(400).send({ error: error.message })
      }
      throw error
    }
  })
}
