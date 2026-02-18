import { fetchHtml } from "./fetchHtml"
import { extractThreadPage } from "./extractThreadPage"
import { BASE_URL } from "../config/constants"

export async function crawlThreadPage(
    threadId: string,
    pageNumber: number
) {
    const url =
        pageNumber === 1
            ? `${BASE_URL}/forum/view-thread/${threadId}`
            : `${BASE_URL}/forum/view-thread/${threadId}/page/${pageNumber}`

    const html = await fetchHtml(url)

    return extractThreadPage(html, {
        threadId,
        pageNumber,
        isFirstPage: pageNumber === 1,
    })
}
