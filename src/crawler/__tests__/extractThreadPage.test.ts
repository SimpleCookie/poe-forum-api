import { extractThreadPage } from '../extractThreadPage'
import { mockThreadPageHtml } from './fixtures'

describe('extractThreadPage', () => {
    it('should extract posts from thread page', () => {
        const result = extractThreadPage(mockThreadPageHtml, {
            threadId: '123',
            pageNumber: 1,
            isFirstPage: true,
        })

        expect(result.posts).toHaveLength(2)
        expect(result.posts[0]).toMatchObject({
            threadId: '123',
            page: 1,
            indexOnPage: 0,
            author: 'GGG_Staff',
            postId: '12345',
        })
    })

    it('should skip first row only on first page', () => {
        const result = extractThreadPage(mockThreadPageHtml, {
            threadId: '123',
            pageNumber: 1,
            isFirstPage: true,
        })

        // Should have 2 posts (header row removed)
        expect(result.posts).toHaveLength(2)
    })

    it('should include all rows on subsequent pages', () => {
        const html = `
      <table class="forumTable">
        <tr>
          <td class="content-container"><div class="content">Post 1</div></td>
          <td class="posted-by">
            <div class="profile-link"><a href="/profile/user1">User1</a></div>
            <div class="post_date">2024-02-10 10:00:00</div>
          </td>
          <td><div class="post_anchor" id="1"></div></td>
        </tr>
        <tr>
          <td class="content-container"><div class="content">Post 2</div></td>
          <td class="posted-by">
            <div class="profile-link"><a href="/profile/user2">User2</a></div>
            <div class="post_date">2024-02-10 11:00:00</div>
          </td>
          <td><div class="post_anchor" id="2"></div></td>
        </tr>
      </table>
    `

        const result = extractThreadPage(html, {
            threadId: '123',
            pageNumber: 2,
            isFirstPage: false,
        })

        expect(result.posts).toHaveLength(2)
    })

    it('should extract next page URL', () => {
        const result = extractThreadPage(mockThreadPageHtml, {
            threadId: '123',
            pageNumber: 1,
            isFirstPage: true,
        })

        expect(result.nextPageUrl).toBe('/forum/view-thread/123/page/2')
    })

    it('should extract post metadata correctly', () => {
        const result = extractThreadPage(mockThreadPageHtml, {
            threadId: '123',
            pageNumber: 1,
            isFirstPage: true,
        })

        const firstPost = result.posts[0]
        expect(firstPost.author).toBe('GGG_Staff')
        expect(firstPost.postId).toBe('12345')
        expect(firstPost.contentText).toBeTruthy()
        expect(firstPost.createdAt).toBeTruthy()
    })

    it('should filter empty posts', () => {
        const html = `
      <table class="forumTable">
        <tr>
          <td class="content-container"><div class="content"></div></td>
          <td class="posted-by">
            <div class="profile-link"><a href="/profile/user1">User1</a></div>
            <div class="post_date">2024-02-10 10:00:00</div>
          </td>
          <td><div class="post_anchor" id="1"></div></td>
        </tr>
        <tr>
          <td class="content-container"><div class="content">Valid post</div></td>
          <td class="posted-by">
            <div class="profile-link"><a href="/profile/user2">User2</a></div>
            <div class="post_date">2024-02-10 11:00:00</div>
          </td>
          <td><div class="post_anchor" id="2"></div></td>
        </tr>
      </table>
    `

        const result = extractThreadPage(html, {
            threadId: '123',
            pageNumber: 1,
            isFirstPage: false,
        })

        // Should only have 1 post (empty post filtered out)
        expect(result.posts).toHaveLength(1)
        expect(result.posts[0].contentText).toBe('Valid post')
    })

    it('should handle missing author gracefully', () => {
        const html = `
      <table class="forumTable">
        <tr>
          <td class="content-container"><div class="content">Post content</div></td>
          <td class="posted-by">
            <div class="post_date">2024-02-10 10:00:00</div>
          </td>
          <td><div class="post_anchor" id="1"></div></td>
        </tr>
      </table>
    `

        const result = extractThreadPage(html, {
            threadId: '123',
            pageNumber: 1,
            isFirstPage: false,
        })

        expect(result.posts).toHaveLength(1)
        expect(result.posts[0].author).toBe('Unknown')
    })
})
