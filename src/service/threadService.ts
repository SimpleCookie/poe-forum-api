import { crawlThreadPage } from '../crawler/crawlThreadPage'
import { env } from '../config/env'
import type { ThreadPage } from '../domain/thread'
import {
  createThreadCacheRepository,
  type ThreadCacheRepository,
} from './threadCacheRepository'

type CrawlThreadPageFn = (threadId: string, pageNumber: number) => Promise<ThreadPage>

interface ThreadServiceDeps {
  cacheRepository?: ThreadCacheRepository | null
  crawlThreadPageFn?: CrawlThreadPageFn
}

export class ThreadService {
  private inflight = new Map<string, Promise<ThreadPage>>()
  private readonly cacheRepositoryPromise: Promise<ThreadCacheRepository | null>
  private readonly crawlThreadPageFn: CrawlThreadPageFn

  constructor(deps?: ThreadServiceDeps) {
    this.crawlThreadPageFn = deps?.crawlThreadPageFn ?? crawlThreadPage
    this.cacheRepositoryPromise =
      deps?.cacheRepository !== undefined
        ? Promise.resolve(deps.cacheRepository)
        : createThreadCacheRepository()
  }

  async getThreadPage(threadId: string, pageNumber: number): Promise<ThreadPage> {
    const key = `${threadId}-${pageNumber}`

    if (this.inflight.has(key)) {
      return this.inflight.get(key)!
    }

    const promise = this.getThreadPageWithCache(threadId, pageNumber)
    this.inflight.set(key, promise)

    try {
      return await promise
    } finally {
      this.inflight.delete(key)
    }
  }

  private async getThreadPageWithCache(
    threadId: string,
    pageNumber: number
  ): Promise<ThreadPage> {
    const cacheRepository = await this.cacheRepositoryPromise
    let cached = null

    if (cacheRepository) {
      try {
        cached = await cacheRepository.getThreadPage(threadId, pageNumber)
      } catch (error) {
        console.warn('Thread cache read failed, continuing without cache:', error)
      }
    }

    if (cached && !this.isCacheStale(cached.cachedAt)) {
      return cached.page
    }

    try {
      const fresh = await this.crawlThreadPageFn(threadId, pageNumber)
      if (cacheRepository) {
        try {
          await cacheRepository.upsertThreadPage(fresh)
        } catch (error) {
          console.warn('Thread cache write failed, continuing without cache:', error)
        }
      }
      return fresh
    } catch (error) {
      if (cached) {
        return cached.page
      }
      throw error
    }
  }

  private isCacheStale(cachedAt: string): boolean {
    const age = Date.now() - new Date(cachedAt).getTime()
    return age > env.THREAD_CACHE_TTL_MS
  }
}
