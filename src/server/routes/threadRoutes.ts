import { FastifyInstance } from 'fastify'
import { ThreadService } from '../../service/threadService'
import { validateThreadId, validatePageNumber, ValidationError } from '../../config/inputValidation'
import type { Post } from '../../domain/thread'

const threadService = new ThreadService()

/**
 * Unversioned Thread Routes - BACKWARDS COMPATIBILITY
 * This maintains the original API format (V1) for existing clients.
 * New clients should use /api/v2/thread/:id for improved pagination format.
 * @see /api/v1/thread/:id - Explicitly deprecated V1
 * @see /api/v2/thread/:id - Current recommended version
 */
export async function threadRoutes(app: FastifyInstance) {
  app.get<{
    Params: { id: string }
    Querystring: { page?: string }
  }>('/thread/:id', { schema: { tags: ['Threads'], description: 'Get a specific thread by ID' } }, async (request, reply) => {
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
