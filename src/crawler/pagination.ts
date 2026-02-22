import { load as cheerioLoad } from 'cheerio'
import type { Pageable } from '../domain/thread'

export function getNextPageUrl(html: string): string | null {
  const $ = cheerioLoad(html)
  const links = $('div.pagination a').toArray()
  const next = links.find((link) => $(link).text().trim() === 'Next')
  return next ? $(next).attr('href') || null : null
}

/**
 * Extract pagination information from HTML
 * @param html - The HTML content containing pagination
 * @returns Pageable object with current page, total pages, and navigation state
 */
export function extractPagination(html: string, pageSize: number): Pageable {
  const $ = cheerioLoad(html)

  // Get current page from the active page indicator
  const currentPageEl = $('div.pagination a.current')
  const currentPageText = currentPageEl.text().trim()
  const currentPage = parseInt(currentPageText, 10) || 1

  // Parse page numbers from link text and href because visible labels can be truncated/windowed
  const pageNumbers = $('div.pagination a')
    .toArray()
    .flatMap((link) => {
      const values: number[] = []

      const text = $(link).text().trim()
      const textLower = text.toLowerCase()
      const isNavigationOnlyLabel = ['next', 'previous', 'prev', 'first'].includes(textLower)

      if (/^\d+$/.test(text)) {
        values.push(parseInt(text, 10))
      }

      const href = $(link).attr('href') || ''
      const hrefMatch = href.match(/\/page\/(\d+)(?:\b|\/|$)/)
      const isCurrent = $(link).hasClass('current')
      const isLastLabel = textLower === 'last'

      if (hrefMatch && (!isNavigationOnlyLabel || isCurrent || isLastLabel)) {
        values.push(parseInt(hrefMatch[1], 10))
      }

      return values.filter((value) => Number.isFinite(value) && value > 0)
    })

  // Find the highest page number (total pages)
  const totalPages = pageNumbers.length > 0 ? Math.max(currentPage, ...pageNumbers) : currentPage

  // Derive navigation from page numbers to avoid label/markup variance (e.g. localized or missing Next/Previous links)
  const hasNext = currentPage < totalPages
  const hasPrevious = currentPage > 1

  return {
    page: currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    pageSize,
  }
}
