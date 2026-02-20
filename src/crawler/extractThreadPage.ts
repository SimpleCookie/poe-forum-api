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

  // Extract thread title from h1 (only on first page)
  const title = opts.isFirstPage ? $('h1').first().text().trim() : undefined

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

  interface RawPost {
    indexOnPage: number
    contentText: string
    contentHtml: string
    author: string | null
    createdAtRaw: string | null
    postId: string | null
  }

  const posts: Post[] = rawPosts
    .filter(
      (p): p is RawPost & { postId: string; createdAtRaw: string } =>
        p.contentText.length > 0 &&
        p.postId !== null &&
        p.createdAtRaw !== null
    )
    .map((p) => ({
      threadId: opts.threadId,
      indexOnPage: p.indexOnPage,
      contentText: cleanContent(p.contentText),
      contentHtml: p.contentHtml,
      author: p.author ?? 'Unknown',
      createdAt: dayjs(p.createdAtRaw).toISOString(),
      postId: p.postId,
    }))

  // Extract pagination information from any page
  const pagination = extractPagination(html, posts.length)

  return {
    threadId: opts.threadId,
    ...(title && { title }),
    posts,
    pagination,
  }
}
