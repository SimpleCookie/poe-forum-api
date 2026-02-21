import { FastifyInstance } from 'fastify'
import { load as cheerioLoad } from 'cheerio'
import { ThreadService } from '../../../service/threadService'
import {
  validateThreadId,
  validatePageNumber,
  ValidationError,
} from '../../../config/inputValidation'
import type { Post } from '../../../domain/thread'
import { getThreadSchemaV4 } from './schemas/threadSchemasV4'

const threadService = new ThreadService()

function toSimpleQuoteContent(contentHtml: string): string {
  const $ = cheerioLoad(`<div id="__content_root__">${contentHtml}</div>`)
  const root = $('#__content_root__')

  root.find('blockquote').each((_, blockquote) => {
    const quoteEl = $(blockquote)
    const rawAuthor = quoteEl.find('cite .profile-link a').first().text().trim()
    const author = rawAuthor.replace(/"/g, '\\"')

    const bot = quoteEl.find('.bot').first().clone()
    bot.find('.clear').remove()

    const quoteBody = (bot.html() || '')
      .replace(/\r?\n\s*/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()

    const quoteOpen = author.length > 0 ? `[quote="${author}"]` : '[quote]'
    quoteEl.replaceWith(`${quoteOpen}${quoteBody}[/quote]`)
  })

  return (root.html() || '')
    .replace(/<br\s*\/?\s*>/gi, '<br/>')
    .replace(/\r?\n\s*/g, '\n')
    .trim()
}

/**
 * V4 Thread Routes
 * Simplified post payloads with a single content field.
 */
export async function threadRoutesV4(app: FastifyInstance) {
  app.get<{
    Params: { id: string }
    Querystring: { page?: string }
  }>('/thread/:id', { schema: getThreadSchemaV4 }, async (request, reply) => {
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
          content: toSimpleQuoteContent(post.contentHtml),
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
