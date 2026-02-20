import dayjs from 'dayjs'
import { load as cheerioLoad } from 'cheerio'
import { cleanContent } from './clean'
import { getNextPageUrl, extractPagination } from './pagination'
import type { ThreadPage, Post } from '../domain/thread'

export function extractThreadPage(
  html: string,
  opts: { threadId: string; pageNumber: number; isFirstPage: boolean }
): ThreadPage {
  const $ = cheerioLoad(html)
  const rows = $('table.forumTable tr').toArray()
  const filtered = opts.isFirstPage ? rows.slice(1) : rows

  const rawPosts = filtered.map((row, indexOnPage) => {
    const $row = $(row)
    const contentEl = $row.find('td.content-container .content')
    const authorEl = $row.find('.posted-by .profile-link a')
    const dateEl = $row.find('.posted-by .post_date')
    const anchorEl = $row.find('.post_anchor')

    return {
      indexOnPage,
      contentText: contentEl.text() || '',
      contentHtml: contentEl.html() || '',
      author: authorEl.text().trim() || null,
      createdAtRaw: dateEl.text().trim() || null,
      postId: anchorEl.attr('id') || null,
    }
  })

  const posts: Post[] = rawPosts
    .filter((p) => p.contentText.length > 0)
    .map((p) => ({
      threadId: opts.threadId,
      indexOnPage: p.indexOnPage,
      contentText: cleanContent(p.contentText),
      contentHtml: p.contentHtml,
      author: p.author ?? 'Unknown',
      createdAt: p.createdAtRaw ? dayjs(p.createdAtRaw).toISOString() : null,
      postId: p.postId ?? null,
    }))

  // Extract pagination information from any page
  const pagination = extractPagination(html)

  return {
    threadId: opts.threadId,
    posts,
    pagination,
  }
}
