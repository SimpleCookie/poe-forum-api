import dayjs from 'dayjs'
import { load as cheerioLoad } from 'cheerio'
import type { AnyNode } from 'domhandler'
import { cleanContent } from './clean'
import { getNextPageUrl, extractPagination } from './pagination'
import type { ThreadPage, Post } from '../domain/thread'

interface RawPost {
  indexOnPage: number
  contentText: string
  contentHtml: string
  author: string | null
  createdAtRaw: string | null
  postId: string | null
}

function extractPostId($: ReturnType<typeof cheerioLoad>, row: AnyNode): string | null {
  const $row = $(row)
  const anchorId = $row.find('.post_anchor').attr('id')
  if (anchorId) {
    return anchorId
  }

  const postedByHref = $row.find('.posted-by .posted-by-link').attr('href')
  if (postedByHref?.startsWith('#')) {
    return postedByHref.slice(1)
  }

  return null
}

function hasStaffMarker($: ReturnType<typeof cheerioLoad>, row: AnyNode): boolean {
  const $row = $(row)
  const author = $row.find('.posted-by .profile-link a').first().text().trim()
  const roleLabel = $row.find('.posted-by .roleLabel').text().toLowerCase()

  const hasStaffClass =
    $row.find('.posted-by .profile-link').hasClass('staff') ||
    $row.find('.posted-by .post_by_account').hasClass('staff')
  const hasGggRoleLabel = roleLabel.includes('grinding gear games')
  const hasGggAccountPattern = /_ggg(?:$|[#-])/i.test(author)

  return hasStaffClass || hasGggRoleLabel || hasGggAccountPattern
}

function parseSingleRowPost(
  $: ReturnType<typeof cheerioLoad>,
  row: AnyNode,
  indexOnPage: number
): RawPost {
  const $row = $(row)
  const contentEl = $row.find('td.content-container .content, .content').first()
  const authorEl = $row.find('.posted-by .profile-link a').first()
  const dateEl = $row.find('.posted-by .post_date').first()

  return {
    indexOnPage,
    contentText: contentEl.text() || '',
    contentHtml: contentEl.html() || '',
    author: authorEl.text().trim() || null,
    createdAtRaw: dateEl.text().trim() || null,
    postId: extractPostId($, row),
  }
}

function maybeParseSplitNewsPost(
  $: ReturnType<typeof cheerioLoad>,
  rows: AnyNode[],
  rowIndex: number,
  indexOnPage: number
): RawPost | null {
  const contentRow = rows[rowIndex]
  const infoRow = rows[rowIndex + 1]

  if (!infoRow) {
    return null
  }

  const $contentRow = $(contentRow)
  const $infoRow = $(infoRow)

  const isNewsContentRow =
    $contentRow.hasClass('newsPost') && !$contentRow.hasClass('newsPostInfo')
  const isNewsInfoRow =
    $infoRow.hasClass('newsPost') && $infoRow.hasClass('newsPostInfo')

  if (!isNewsContentRow || !isNewsInfoRow || !hasStaffMarker($, infoRow)) {
    return null
  }

  const contentEl = $contentRow.find('.content').first()
  const authorEl = $infoRow.find('.posted-by .profile-link a').first()
  const dateEl = $infoRow.find('.posted-by .post_date').first()

  return {
    indexOnPage,
    contentText: contentEl.text() || '',
    contentHtml: contentEl.html() || '',
    author: authorEl.text().trim() || null,
    createdAtRaw: dateEl.text().trim() || null,
    postId: extractPostId($, infoRow),
  }
}

function isLikelyHeaderRow($: ReturnType<typeof cheerioLoad>, row: AnyNode): boolean {
  const $row = $(row)
  const hasAnyPostSignal =
    $row.hasClass('newsPost') ||
    $row.find('.content').length > 0 ||
    $row.find('.posted-by').length > 0 ||
    $row.find('.post_anchor').length > 0 ||
    $row.find('.post_date').length > 0

  return !hasAnyPostSignal
}

export function extractThreadPage(
  html: string,
  opts: { threadId: string; pageNumber: number; isFirstPage: boolean }
): ThreadPage {
  const $ = cheerioLoad(html)

  // Extract thread title from h1 (only on first page)
  const title = opts.isFirstPage ? $('h1').first().text().trim() : undefined

  const tableRows = $('table.forumTable tr').toArray()
  const rows = tableRows.length > 0 ? tableRows : $('tr').toArray()
  const filtered =
    opts.isFirstPage && rows.length > 0 && isLikelyHeaderRow($, rows[0])
      ? rows.slice(1)
      : rows

  const rawPosts: RawPost[] = []
  for (let rowIndex = 0; rowIndex < filtered.length; rowIndex += 1) {
    const splitNewsPost = maybeParseSplitNewsPost($, filtered, rowIndex, rawPosts.length)
    if (splitNewsPost) {
      rawPosts.push(splitNewsPost)
      rowIndex += 1
      continue
    }

    rawPosts.push(parseSingleRowPost($, filtered[rowIndex], rawPosts.length))
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
