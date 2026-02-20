import { FastifyInstance } from 'fastify'
import { ThreadService } from '../../../service/threadService'
import {
  validateThreadId,
  validatePageNumber,
  ValidationError,
} from '../../../config/inputValidation'
import { getThreadSchema } from './schemas/threadSchemasV1'
import type { Post } from '../../../domain/thread'

const threadService = new ThreadService()

/**
 * V1 Thread Routes - DEPRECATED
 * This API version is maintained for backwards compatibility.
 * Response format includes page and nextPageUrl instead of pagination object.
 * @deprecated Use /api/v2/thread/:id instead
 */
export async function threadRoutesV1(app: FastifyInstance) {
  app.get<{
    Params: { id: string }
    Querystring: { page?: string }
  }>('/v1/thread/:id', { schema: getThreadSchema }, async (request, reply) => {
    try {
      const { id } = request.params
      const pageNumber = Number(request.query.page ?? '1')

      // Validate parameters to prevent SSRF/injection attacks
      validateThreadId(id)
      validatePageNumber(pageNumber)

      const threadPage = await threadService.getThreadPage(id, pageNumber)

      // Transform v2 format to v1 format for backwards compatibility
      return {
        threadId: threadPage.threadId,
        posts: threadPage.posts.map((post: Post) => ({
          ...post,
          page: threadPage.pagination.page,
        })),
        page: threadPage.pagination.page,
        nextPageUrl: threadPage.pagination.hasNext
          ? `/forum/view-thread/${id}/page/${threadPage.pagination.page + 1}`
          : null,
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        return reply.status(400).send({ error: error.message })
      }
      throw error
    }
  })
}
