import dayjs from "dayjs"
import type { Page } from "puppeteer"
import { cleanContent } from "./clean"

export async function extractThreadPage(
  page: Page,
  opts: { threadId: string; pageNumber: number; isFirstPage: boolean }
) {
  const rawPosts = await page.evaluate((isFirstPage) => {
    const rows = Array.from(document.querySelectorAll("table.forumTable tr"))

    const filtered = isFirstPage ? rows.slice(1) : rows

    return filtered.map((row, indexOnPage) => {
      const contentEl = row.querySelector("td.content-container .content")

      const authorEl = row.querySelector(
        ".posted-by .profile-link a"
      ) as HTMLAnchorElement | null

      const dateEl = row.querySelector(
        ".posted-by .post_date"
      )

      const anchorEl = row.querySelector(
        ".post_anchor"
      ) as HTMLElement | null

      return {
        indexOnPage,
        contentText: contentEl?.textContent || "",
        contentHtml: contentEl?.innerHTML || "",
        author: authorEl?.textContent?.trim() || null,
        createdAtRaw: dateEl?.textContent?.trim() || null,
        postId: anchorEl?.id || null,
      }
    })
  }, opts.isFirstPage)

  return rawPosts
    .filter((p) => p.contentText.length > 0)
    .map((p) => ({
      threadId: opts.threadId,
      page: opts.pageNumber,
      indexOnPage: p.indexOnPage,
      contentText: cleanContent(p.contentText),
      contentHtml: p.contentHtml,
      author: p.author ?? "Unknown",
      createdAt: p.createdAtRaw
        ? dayjs(p.createdAtRaw).toISOString()
        : null,
      postId: p.postId ?? null,
    }))
}
