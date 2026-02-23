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
  const pagination = $('div.pagination').first()

  // Get current page from the active page indicator
  const currentPageEl = pagination.find('a.current')
  const currentPageText = currentPageEl.text().trim()
  const currentPage = parseInt(currentPageText, 10) || 1

  // Parse page numbers from anchor inner text only
  const pageNumbers = pagination
    .find('a')
    .toArray()
    .map((link) => $(link).text().trim())
    .filter((text) => /^\d+$/.test(text))
    .map((text) => parseInt(text, 10))
    .filter((value) => Number.isFinite(value) && value > 0)

  // Find the highest visible numeric page number (total pages)
  const totalPages = pageNumbers.length > 0 ? Math.max(...pageNumbers) : currentPage

  // Derive navigation from current/total page numbers
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
