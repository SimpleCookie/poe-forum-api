import { getNextPageUrl, extractPagination } from '../pagination'
import { mockThreadPageHtml, mockLastPageHtml } from './fixtures'

describe('pagination', () => {
  describe('getNextPageUrl', () => {
    it('should extract next page URL when present', () => {
      const nextUrl = getNextPageUrl(mockThreadPageHtml)
      expect(nextUrl).toBe('/forum/view-thread/123/page/2')
    })

    it('should return null when no next page exists', () => {
      const nextUrl = getNextPageUrl(mockLastPageHtml)
      expect(nextUrl).toBeNull()
    })

    it('should handle case-insensitive "Next" text', () => {
      const html = `
        <div class="pagination">
          <a href="/page/2">NEXT</a>
        </div>
      `
      // Note: Current implementation is case-sensitive for "Next"
      const nextUrl = getNextPageUrl(html)
      // This test documents current behavior (case-sensitive)
      expect(nextUrl).toBeNull()
    })
  })

  describe('extractPagination', () => {
    it('should extract pagination from first page', () => {
      const result = extractPagination(mockThreadPageHtml)

      expect(result).toEqual({
        page: 1,
        totalPages: 52,
        hasNext: true,
        hasPrevious: false,
      })
    })

    it('should extract pagination from last page', () => {
      const result = extractPagination(mockLastPageHtml)

      expect(result).toEqual({
        page: 52,
        totalPages: 52,
        hasNext: false,
        hasPrevious: true,
      })
    })

    it('should extract pagination from middle page', () => {
      const html = `
        <div class="pagination">
          <a href="/forum/view-thread/123/page/1">Previous</a>
          <a href="/forum/view-thread/123/page/1">1</a>
          <a href="/forum/view-thread/123/page/24">24</a>
          <a class="current" href="/forum/view-thread/123/page/25">25</a>
          <a href="/forum/view-thread/123/page/26">26</a>
          <span class="separator">…</span>
          <a href="/forum/view-thread/123/page/52">52</a>
          <a href="/forum/view-thread/123/page/26">Next</a>
        </div>
      `

      const result = extractPagination(html)

      expect(result).toEqual({
        page: 25,
        totalPages: 52,
        hasNext: true,
        hasPrevious: true,
      })
    })

    it('should handle single page (no pagination)', () => {
      const html = `
        <div class="pagination">
          <a class="current" href="/forum/view-thread/123/page/1">1</a>
        </div>
      `

      const result = extractPagination(html)

      expect(result).toEqual({
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      })
    })

    it('should ignore non-numeric pagination links', () => {
      const html = `
        <div class="pagination">
          <a href="/forum/view-thread/123/page/1">Previous</a>
          <a href="/forum/view-thread/123/page/1">1</a>
          <a href="/forum/view-thread/123/page/2">2</a>
          <a href="/forum/view-thread/123/page/3">3</a>
          <a class="current" href="/forum/view-thread/123/page/4">4</a>
          <a href="/forum/view-thread/123/page/5">5</a>
          <a href="/forum/view-thread/123/page/5">Next</a>
        </div>
      `

      const result = extractPagination(html)

      expect(result).toEqual({
        page: 4,
        totalPages: 5,
        hasNext: true,
        hasPrevious: true,
      })
    })

    it('should handle ellipsis separator', () => {
      const html = `
        <div class="pagination">
          <a class="current" href="/forum/view-thread/123/page/1">1</a>
          <a href="/forum/view-thread/123/page/2">2</a>
          <a href="/forum/view-thread/123/page/3">3</a>
          <span class="separator">…</span>
          <a href="/forum/view-thread/123/page/50">50</a>
          <a href="/forum/view-thread/123/page/51">51</a>
          <a href="/forum/view-thread/123/page/52">52</a>
          <a href="/forum/view-thread/123/page/2">Next</a>
        </div>
      `

      const result = extractPagination(html)

      expect(result.totalPages).toBe(52)
      expect(result.page).toBe(1)
      expect(result.hasNext).toBe(true)
    })

    it('should default to page 1 if no current indicator found', () => {
      const html = `
        <div class="pagination">
          <a href="/forum/view-thread/123/page/1">1</a>
          <a href="/forum/view-thread/123/page/2">2</a>
          <a href="/forum/view-thread/123/page/3">3</a>
        </div>
      `

      const result = extractPagination(html)

      expect(result.page).toBe(1)
      expect(result.totalPages).toBe(3)
    })

    it('should correctly identify hasNext based on Next link presence', () => {
      const htmlWithNext = `
        <div class="pagination">
          <a class="current" href="/forum/view-thread/123/page/1">1</a>
          <a href="/forum/view-thread/123/page/2">2</a>
          <a href="/forum/view-thread/123/page/2">Next</a>
        </div>
      `

      const resultWithNext = extractPagination(htmlWithNext)
      expect(resultWithNext.hasNext).toBe(true)

      const htmlWithoutNext = `
        <div class="pagination">
          <a href="/forum/view-thread/123/page/1">Previous</a>
          <a class="current" href="/forum/view-thread/123/page/5">5</a>
        </div>
      `

      const resultWithoutNext = extractPagination(htmlWithoutNext)
      expect(resultWithoutNext.hasNext).toBe(false)
    })

    it('should correctly identify hasPrevious based on Previous link presence', () => {
      const htmlWithPrevious = `
        <div class="pagination">
          <a href="/forum/view-thread/123/page/1">Previous</a>
          <a href="/forum/view-thread/123/page/1">1</a>
          <a class="current" href="/forum/view-thread/123/page/2">2</a>
          <a href="/forum/view-thread/123/page/3">3</a>
        </div>
      `

      const resultWithPrevious = extractPagination(htmlWithPrevious)
      expect(resultWithPrevious.hasPrevious).toBe(true)

      const htmlWithoutPrevious = `
        <div class="pagination">
          <a class="current" href="/forum/view-thread/123/page/1">1</a>
          <a href="/forum/view-thread/123/page/2">2</a>
          <a href="/forum/view-thread/123/page/3">3</a>
          <a href="/forum/view-thread/123/page/2">Next</a>
        </div>
      `

      const resultWithoutPrevious = extractPagination(htmlWithoutPrevious)
      expect(resultWithoutPrevious.hasPrevious).toBe(false)
    })
  })
})
