import { FastifyInstance } from 'fastify'
import { ThreadService } from '../../../service/threadService'
import {
  validateThreadId,
  validatePageNumber,
  ValidationError,
} from '../../../config/inputValidation'
import type { Post } from '../../../domain/thread'
import { getThreadSchemaV5 } from './schemas/threadSchemasV5'
import { toStructuredContentV5 } from './contentBlocks'

const threadService = new ThreadService()

/**
 * V5 Thread Routes
 * Single structured content field designed for easier API consumption.
 */
export async function threadRoutesV5(app: FastifyInstance) {
  app.get<{
    Params: { id: string }
    Querystring: { page?: string }
  }>('/thread/:id', { schema: getThreadSchemaV5 }, async (request, reply) => {
    try {
      const { id } = request.params
      const pageNumber = Number(request.query.page ?? '1')

      validateThreadId(id)
      validatePageNumber(pageNumber)

      const threadPage = await threadService.getThreadPage(id, pageNumber)

      return {
        threadId: threadPage.threadId,
        ...(threadPage.title && { title: threadPage.title }),
        posts: threadPage.posts.map((post: Post) => ({
          postId: post.postId,
          threadId: post.threadId,
          author: post.author,
          createdAt: post.createdAt,
          content: toStructuredContentV5(post.contentHtml),
          indexOnPage: post.indexOnPage,
        })),
        pagination: threadPage.pagination,
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        return reply.status(400).send({ error: error.message })
      }
      throw error
    }
  })
}
