import { ThreadService } from '../threadService'
import type { ThreadPage } from '../../domain/thread'
import type { ThreadCacheRepository, CachedThreadPage } from '../threadCacheRepository'

function makeThreadPage(overrides?: Partial<ThreadPage>): ThreadPage {
  return {
    threadId: '123',
    posts: [
      {
        threadId: '123',
        postId: 'p1',
        author: 'User1',
        createdAt: '2026-02-21T00:00:00.000Z',
        contentText: 'Hello',
        contentHtml: '<p>Hello</p>',
        indexOnPage: 0,
      },
    ],
    pagination: {
      page: 1,
      totalPages: 2,
      hasNext: true,
      hasPrevious: false,
      pageSize: 1,
    },
    ...overrides,
  }
}

class InMemoryThreadCacheRepository implements ThreadCacheRepository {
  private readonly entry: CachedThreadPage | null
  upsertThreadPage = jest.fn(async () => { })

  constructor(entry: CachedThreadPage | null) {
    this.entry = entry
  }

  async getThreadPage(): Promise<CachedThreadPage | null> {
    return this.entry
  }
}

class FailingReadThreadCacheRepository implements ThreadCacheRepository {
  upsertThreadPage = jest.fn(async () => { })

  async getThreadPage(): Promise<CachedThreadPage | null> {
    throw new Error('db read failed')
  }
}

class FailingWriteThreadCacheRepository implements ThreadCacheRepository {
  private readonly entry: CachedThreadPage | null

  constructor(entry: CachedThreadPage | null) {
    this.entry = entry
  }

  async getThreadPage(): Promise<CachedThreadPage | null> {
    return this.entry
  }

  async upsertThreadPage(): Promise<void> {
    throw new Error('db write failed')
  }
}

describe('ThreadService', () => {
  it('returns fresh cached page without crawling', async () => {
    const cachedPage = makeThreadPage()
    const cache = new InMemoryThreadCacheRepository({
      page: cachedPage,
      cachedAt: new Date().toISOString(),
    })
    const crawlThreadPageFn = jest.fn(async () => makeThreadPage())

    const service = new ThreadService({
      cacheRepository: cache,
      crawlThreadPageFn,
    })

    const result = await service.getThreadPage('123', 1)

    expect(result).toEqual(cachedPage)
    expect(crawlThreadPageFn).not.toHaveBeenCalled()
    expect(cache.upsertThreadPage).not.toHaveBeenCalled()
  })

  it('crawls and upserts when cache is stale', async () => {
    const staleCached = makeThreadPage()
    const fresh = makeThreadPage({
      posts: [
        {
          threadId: '123',
          postId: 'p1',
          author: 'User1',
          createdAt: '2026-02-21T00:00:00.000Z',
          contentText: 'Updated',
          contentHtml: '<p>Updated</p>',
          indexOnPage: 0,
        },
      ],
    })

    const cache = new InMemoryThreadCacheRepository({
      page: staleCached,
      cachedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    })
    const crawlThreadPageFn = jest.fn(async () => fresh)

    const service = new ThreadService({
      cacheRepository: cache,
      crawlThreadPageFn,
    })

    const result = await service.getThreadPage('123', 1)

    expect(result).toEqual(fresh)
    expect(crawlThreadPageFn).toHaveBeenCalledTimes(1)
    expect(cache.upsertThreadPage).toHaveBeenCalledWith(fresh)
  })

  it('falls back to cached page if crawling fails', async () => {
    const staleCached = makeThreadPage()
    const cache = new InMemoryThreadCacheRepository({
      page: staleCached,
      cachedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    })
    const crawlThreadPageFn = jest.fn(async () => {
      throw new Error('network down')
    })

    const service = new ThreadService({
      cacheRepository: cache,
      crawlThreadPageFn,
    })

    const result = await service.getThreadPage('123', 1)

    expect(result).toEqual(staleCached)
    expect(crawlThreadPageFn).toHaveBeenCalledTimes(1)
  })

  it('still returns crawled data when cache read fails', async () => {
    const fresh = makeThreadPage()
    const cache = new FailingReadThreadCacheRepository()
    const crawlThreadPageFn = jest.fn(async () => fresh)

    const service = new ThreadService({
      cacheRepository: cache,
      crawlThreadPageFn,
    })

    const result = await service.getThreadPage('123', 1)

    expect(result).toEqual(fresh)
    expect(crawlThreadPageFn).toHaveBeenCalledTimes(1)
    expect(cache.upsertThreadPage).toHaveBeenCalledWith(fresh)
  })

  it('still returns crawled data when cache write fails', async () => {
    const staleCached = makeThreadPage()
    const fresh = makeThreadPage({
      posts: [
        {
          threadId: '123',
          postId: 'p1',
          author: 'User1',
          createdAt: '2026-02-21T00:00:00.000Z',
          contentText: 'Fresh after write failure',
          contentHtml: '<p>Fresh after write failure</p>',
          indexOnPage: 0,
        },
      ],
    })
    const cache = new FailingWriteThreadCacheRepository({
      page: staleCached,
      cachedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    })
    const crawlThreadPageFn = jest.fn(async () => fresh)

    const service = new ThreadService({
      cacheRepository: cache,
      crawlThreadPageFn,
    })

    const result = await service.getThreadPage('123', 1)

    expect(result).toEqual(fresh)
    expect(crawlThreadPageFn).toHaveBeenCalledTimes(1)
  })
})
