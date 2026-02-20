import { CategoryService } from '../../service/categoryService'
import { ThreadService } from '../../service/threadService'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const mockCategoryHTML = `<table><tbody><tr><td class="thread"><div class="thread_title"><div class="title"><a href="/forum/view-thread/123">Test</a></div></div></td><td class="views"><span>10</span></td></tr></tbody></table>`
const mockThreadHTML = `<table class="forumTable"><tr><td colspan="100">Header</td></tr><tr><td class="content-container"><div class="content">Post</div></td><td class="posted-by"><div class="profile-link"><a>User</a></div><div class="post_date">2024-02-18 10:00:00</div></td><td><div class="post_anchor" id="p1"></div></td></tr></table><div class="pagination"><a class="current" href="/forum/view-thread/123/page/1">1</a><a href="/forum/view-thread/123/page/2">2</a><a href="/forum/view-thread/123/page/2">Next</a></div>`

describe('API Logic Tests (Unit)', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear()
  })

  it('✓ axios is properly mocked (no real HTTP requests)', () => {
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })

  it('✓ CategoryService can fetch data with mocked axios', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockCategoryHTML })

    const service = new CategoryService()
    const result = await service.getCategoryPage('general', 1)

    expect(result).toBeDefined()
    expect(result.category).toBe('general')
    expect(result.page).toBe(1)
    expect(result.threads).toBeDefined()
    expect(Array.isArray(result.threads)).toBe(true)
    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    console.log('✓ CategoryService works - extracted', result.threads.length, 'threads')
  })

  it('✓ ThreadService can fetch data with mocked axios', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })

    const service = new ThreadService()
    const result = await service.getThreadPage('123', 1)

    expect(result).toBeDefined()
    expect(result.posts).toBeDefined()
    expect(Array.isArray(result.posts)).toBe(true)
    expect(result.pagination).toBeDefined()
    expect(result.pagination.page).toBe(1)
    expect(result.pagination.totalPages).toBe(2)
    expect(result.pagination.hasNext).toBe(true)
    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    console.log(
      '✓ ThreadService works - extracted',
      result.posts.length,
      'posts from page',
      result.pagination.page,
      'of',
      result.pagination.totalPages
    )
    console.log('✓ All requests were mocked - no real HTTP calls made')
  })
})
