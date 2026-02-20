import { crawlThreadPage } from '../crawler/crawlThreadPage'

export class ThreadService {
  private inflight = new Map<string, Promise<any>>()

  async getThreadPage(threadId: string, pageNumber: number) {
    const key = `${threadId}-${pageNumber}`

    if (this.inflight.has(key)) {
      return this.inflight.get(key)!
    }

    const promise = crawlThreadPage(threadId, pageNumber)
    this.inflight.set(key, promise)
    const result = await promise
    this.inflight.delete(key)
    return result
  }
}
