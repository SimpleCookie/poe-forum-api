import { crawlCategoryPage } from "../crawler/crawlCategoryPage"

export class CategoryService {
    private inflight = new Map<string, Promise<any>>();

    async getCategoryPage(category: string, page: number) {
        const key = `${category}-${page}`

        if (this.inflight.has(key)) {
            return this.inflight.get(key)!
        }

        const promise = crawlCategoryPage(category, page)
        this.inflight.set(key, promise)
        const result = await promise
        this.inflight.delete(key)

        return result
    }
}
