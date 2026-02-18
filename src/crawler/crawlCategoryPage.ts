import { load as cheerioLoad } from "cheerio"
import { fetchHtml } from "./fetchHtml"
import { BASE_URL } from "../config/constants"

export interface CategoryThread {
    threadId: string
    title: string
    replies: number
}

function extractThreadsFromCategory(html: string): CategoryThread[] {
    const $ = cheerioLoad(html)
    const rows = $("tbody tr").toArray()

    return rows
        .map((row) => {
            const $row = $(row)
            const titleLink = $row.find(".thread .thread_title .title a")
            const repliesEl = $row.find("td.views span")

            if (!titleLink.length) return null

            const href = titleLink.attr("href") || ""
            const match = href.match(/view-thread\/(\d+)/)

            return {
                threadId: match ? match[1] : "",
                title: titleLink.text().trim() || "",
                replies: repliesEl.length
                    ? Number(repliesEl.text().trim() || "0")
                    : 0,
            }
        })
        .filter(
            (thread): thread is CategoryThread => thread !== null
        )
}

export async function crawlCategoryPage(
    categorySlug: string,
    pageNumber: number
) {
    const url =
        pageNumber === 1
            ? `${BASE_URL}/forum/view-forum/${categorySlug}`
            : `${BASE_URL}/forum/view-forum/${categorySlug}/page/${pageNumber}`

    console.log("Fetching category URL:", url)

    const html = await fetchHtml(url)
    const threads = extractThreadsFromCategory(html)

    return {
        category: categorySlug,
        page: pageNumber,
        threads,
    }
}