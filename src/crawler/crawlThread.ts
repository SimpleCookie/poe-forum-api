import { fetchHtml } from './fetchHtml'
import { extractThreadPage } from './extractThreadPage'
import { getNextPageUrl } from './pagination'
import type { Post } from '../domain/thread'

export async function crawlThread(opts: {
  startUrl: string
  threadId: string
  maxPages?: number
}): Promise<Post[]> {
  let url: string | null = opts.startUrl
  let pageNumber = 1
  let isFirstPage = true

  const allPosts: Post[] = []

  while (url) {
    if (opts.maxPages && pageNumber > opts.maxPages) break

    const html = await fetchHtml(url)

    const threadPage = extractThreadPage(html, {
      threadId: opts.threadId,
      pageNumber,
      isFirstPage,
    })

    allPosts.push(...threadPage.posts)

    url = getNextPageUrl(html)
    pageNumber += 1
    isFirstPage = false
  }

  return allPosts
}
