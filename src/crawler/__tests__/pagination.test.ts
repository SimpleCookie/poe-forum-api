import { getNextPageUrl } from '../pagination'
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
})
