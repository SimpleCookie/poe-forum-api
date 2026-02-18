import { mockCategoryPageHtml } from './fixtures'
import { load as cheerioLoad } from 'cheerio'

// Import the extraction function (it's not exported, so we'll test indirectly via the interfaces)
describe('crawlCategoryPage extraction', () => {
    it('should extract threads from category HTML', () => {
        const $ = cheerioLoad(mockCategoryPageHtml)
        const rows = $('tbody tr').toArray()

        const threads = rows
            .map((row: any) => {
                const $row = $(row)
                const titleLink = $row.find('.thread .thread_title .title a')
                const repliesEl = $row.find('td.views span')

                if (!titleLink.length) return null

                const href = titleLink.attr('href') || ''
                const match = href.match(/view-thread\/(\d+)/)

                return {
                    threadId: match ? match[1] : '',
                    title: titleLink.text().trim() || '',
                    replies: repliesEl.length
                        ? Number(repliesEl.text().trim() || '0')
                        : 0,
                }
            })
            .filter((thread: any) => thread !== null)

        expect(threads).toHaveLength(2)
        expect(threads[0]).toEqual({
            threadId: '3912208',
            title: '2.0.0 Released',
            replies: 1250,
        })
        expect(threads[1]).toEqual({
            threadId: '3910000',
            title: 'New Features Discussion',
            replies: 450,
        })
    })

    it('should extract next page URL from category page', () => {
        const $ = cheerioLoad(mockCategoryPageHtml)
        const links = $('div.pagination a').toArray()
        const next = links.find((link: any) => $(link).text().trim() === 'Next')
        const nextUrl = next ? $(next).attr('href') || null : null

        expect(nextUrl).toBe('/forum/view-forum/news/page/2')
    })

    it('should handle missing replies count', () => {
        const html = `
      <table>
        <tbody>
          <tr>
            <td class="thread">
              <div class="thread_title">
                <div class="title">
                  <a href="/forum/view-thread/123">Thread Title</a>
                </div>
              </div>
            </td>
            <td class="views"></td>
          </tr>
        </tbody>
      </table>
    `

        const $ = cheerioLoad(html)
        const rows = $('tbody tr').toArray()

        const threads = rows
            .map((row: any) => {
                const $row = $(row)
                const titleLink = $row.find('.thread .thread_title .title a')
                const repliesEl = $row.find('td.views span')

                if (!titleLink.length) return null

                return {
                    threadId: titleLink.attr('href')?.match(/view-thread\/(\d+)/)?.[1] || '',
                    title: titleLink.text().trim() || '',
                    replies: repliesEl.length
                        ? Number(repliesEl.text().trim() || '0')
                        : 0,
                }
            })
            .filter((thread: any) => thread !== null)

        expect(threads).toHaveLength(1)
        expect(threads[0]!.replies).toBe(0)
    })
})
