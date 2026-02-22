import fs from 'fs'
import path from 'path'
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
    expect(result.title).toBeTruthy()
    expect(result.posts[0]).toMatchObject({
      threadId: '123',
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
      <div class="pagination">
        <a class="current" href="/forum/view-thread/123/page/2">2</a>
        <a href="/forum/view-thread/123/page/3">3</a>
        <a href="/forum/view-thread/123/page/3">Next</a>
      </div>
    `

    const result = extractThreadPage(html, {
      threadId: '123',
      pageNumber: 2,
      isFirstPage: false,
    })

    expect(result.posts).toHaveLength(2)
  })

  it('should extract pagination info on first page', () => {
    const result = extractThreadPage(mockThreadPageHtml, {
      threadId: '123',
      pageNumber: 1,
      isFirstPage: true,
    })

    expect(result.pagination).toMatchObject({
      page: 1,
      totalPages: 52,
      hasNext: true,
      hasPrevious: false,
    })
  })

  it('should extract pagination info on middle page', () => {
    const html = `
      <table class="forumTable">
        <tr><td class="content-container"><div class="content">Post</div></td></tr>
      </table>
      <div class="pagination">
        <a href="/forum/view-thread/123/page/1">Previous</a>
        <a href="/forum/view-thread/123/page/1">1</a>
        <a class="current" href="/forum/view-thread/123/page/25">25</a>
        <a href="/forum/view-thread/123/page/26">26</a>
        <a href="/forum/view-thread/123/page/52">52</a>
        <a href="/forum/view-thread/123/page/26">Next</a>
      </div>
    `

    const result = extractThreadPage(html, {
      threadId: '123',
      pageNumber: 25,
      isFirstPage: false,
    })

    expect(result.pagination).toMatchObject({
      page: 25,
      totalPages: 52,
      hasNext: true,
      hasPrevious: true,
    })
  })

  it('should extract pagination info on last page', () => {
    const html = `
      <table class="forumTable">
        <tr><td class="content-container"><div class="content">Last post</div></td></tr>
      </table>
      <div class="pagination">
        <a href="/forum/view-thread/123/page/51">Previous</a>
        <a href="/forum/view-thread/123/page/1">1</a>
        <a href="/forum/view-thread/123/page/51">51</a>
        <a class="current" href="/forum/view-thread/123/page/52">52</a>
      </div>
    `

    const result = extractThreadPage(html, {
      threadId: '123',
      pageNumber: 52,
      isFirstPage: false,
    })

    expect(result.pagination).toMatchObject({
      page: 52,
      totalPages: 52,
      hasNext: false,
      hasPrevious: true,
    })
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
      <div class="pagination">
        <a class="current" href="/forum/view-thread/123/page/1">1</a>
      </div>
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

  it('should extract thread title on first page only', () => {
    const result = extractThreadPage(mockThreadPageHtml, {
      threadId: '123',
      pageNumber: 1,
      isFirstPage: true,
    })

    expect(result.title).toBeTruthy()
    expect(typeof result.title).toBe('string')
  })

  it('should not extract title on subsequent pages', () => {
    const html = `
      <h1>Some Other Title</h1>
      <table class="forumTable">
        <tr>
          <td class="content-container"><div class="content">Post</div></td>
          <td class="posted-by">
            <div class="profile-link"><a>User</a></div>
            <div class="post_date">2024-02-10 10:00:00</div>
          </td>
          <td><div class="post_anchor" id="1"></div></td>
        </tr>
      </table>
      <div class="pagination">
        <a class="current" href="/forum/view-thread/123/page/2">2</a>
      </div>
    `

    const result = extractThreadPage(html, {
      threadId: '123',
      pageNumber: 2,
      isFirstPage: false,
    })

    expect(result.title).toBeUndefined()
  })

  it('should merge split first GGG news post rows from fixture html', () => {
    const fixturePath = path.resolve(process.cwd(), 'newspost-example.html')
    const rawHtml = fs.readFileSync(fixturePath, 'utf8')
    const html = rawHtml.includes('table class="forumTable"')
      ? rawHtml
      : `<table class="forumTable">${rawHtml}</table>`

    const result = extractThreadPage(html, {
      threadId: '3912574',
      pageNumber: 1,
      isFirstPage: true,
    })

    expect(result.posts.length).toBeGreaterThan(0)
    expect(result.posts[0]).toMatchObject({
      threadId: '3912574',
      indexOnPage: 0,
      author: 'Natalia_GGG',
      postId: 'p26573837',
    })
    expect(result.posts[0].contentText).toContain('GGG Live')
    expect(result.posts[0].contentHtml).toContain('youtube.com/embed/Fch-pZe1_kw')
    expect(result.posts[0].createdAt).toBeTruthy()
  })

  it('should keep normal single-row thread parsing unchanged', () => {
    const result = extractThreadPage(mockThreadPageHtml, {
      threadId: '123',
      pageNumber: 1,
      isFirstPage: true,
    })

    expect(result.posts).toHaveLength(2)
    expect(result.posts[0]).toMatchObject({
      indexOnPage: 0,
      author: 'GGG_Staff',
      postId: '12345',
      contentText: 'First post content here',
    })
    expect(result.posts[1]).toMatchObject({
      indexOnPage: 1,
      author: 'Player123',
      postId: '67890',
      contentText: 'Second post content here',
    })
  })

  it('should not merge split news rows when staff markers are missing', () => {
    const html = `
      <table class="forumTable">
        <tr>
          <td colspan="2">Page Header</td>
        </tr>
        <tr class="newsPost">
          <td colspan="2">
            <div class="content">Non-staff split content should not become a post</div>
          </td>
        </tr>
        <tr class="newsPost newsPostInfo">
          <td colspan="2">
            <div class="posted-by">
              <a class="posted-by-link" href="#p999">Posted by</a>
              <span class="profile-link post_by_account"><a>SomeUser</a></span>
              on <span class="post_date">Feb 19, 2026, 9:00:00 PM</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="content-container"><div class="content">Valid regular post</div></td>
          <td class="post_info">
            <div class="post_info_content">
              <div class="post_anchor" id="p1000"></div>
              <div class="posted-by">
                <span class="profile-link post_by_account"><a>RegularUser</a></span>
                on <span class="post_date">Feb 19, 2026, 9:05:00 PM</span>
              </div>
            </div>
          </td>
        </tr>
      </table>
    `

    const result = extractThreadPage(html, {
      threadId: 'edge-case',
      pageNumber: 1,
      isFirstPage: true,
    })

    expect(result.posts).toHaveLength(1)
    expect(result.posts[0]).toMatchObject({
      author: 'RegularUser',
      postId: 'p1000',
      contentText: 'Valid regular post',
    })
  })
})
