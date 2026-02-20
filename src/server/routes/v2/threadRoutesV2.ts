import { FastifyInstance } from 'fastify'
import { ThreadService } from '../../../service/threadService'
import {
  validateThreadId,
  validatePageNumber,
  ValidationError,
} from '../../../config/inputValidation'
import { getThreadSchema } from './schemas/threadSchemasV2'

const threadService = new ThreadService()

/**
 * V2 Thread Routes - CURRENT
 * Updated API with improved pagination response format.
 */
export async function threadRoutesV2(app: FastifyInstance) {
  app.get<{
    Params: { id: string }
    Querystring: { page?: string }
  }>('/v2/thread/:id', { schema: getThreadSchema }, async (request, reply) => {
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
