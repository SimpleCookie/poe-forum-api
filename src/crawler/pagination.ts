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

  // Get all numeric page links (not "Next", "Previous", etc.)
  const pageLinks = $('div.pagination a')
    .toArray()
    .filter((link) => {
      const text = $(link).text().trim()
      return /^\d+$/.test(text) // Only numeric pages
    })
    .map((link) => parseInt($(link).text().trim(), 10))

  // Find the highest page number (total pages)
  const totalPages = pageLinks.length > 0 ? Math.max(...pageLinks) : currentPage

  // Check for next/previous links
  const links = $('div.pagination a').toArray()
  const hasNext = links.some((link) => $(link).text().trim() === 'Next')
  const hasPrevious = links.some((link) => $(link).text().trim() === 'Previous')

  return {
    page: currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    pageSize,
  }
}
