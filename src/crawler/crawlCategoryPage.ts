import puppeteer from "puppeteer"
import type { Page } from "puppeteer"
import { BASE_URL } from "../config/constants"

export interface CategoryThread {
    threadId: string
    title: string
    replies: number
}

async function extractThreadsFromCategory(page: Page): Promise<CategoryThread[]> {
    return page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll("tbody tr"))

        return rows
            .map((row) => {
                const titleLink = row.querySelector(
                    ".thread .thread_title .title a"
                ) as HTMLAnchorElement | null

                const repliesEl = row.querySelector("td.views span")

                if (!titleLink) return null

                const href = titleLink.getAttribute("href") || ""
                const match = href.match(/view-thread\/(\d+)/)

                return {
                    threadId: match ? match[1] : "",
                    title: titleLink.textContent?.trim() || "",
                    replies: repliesEl
                        ? Number(repliesEl.textContent?.trim() || "0")
                        : 0,
                }
            })
            .filter(
                (thread): thread is CategoryThread => thread !== null
            )
    })
}

export async function crawlCategoryPage(
    categorySlug: string,
    pageNumber: number
) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    try {
        const url =
            pageNumber === 1
                ? `${BASE_URL}/forum/view-forum/${categorySlug}`
                : `${BASE_URL}/forum/view-forum/${categorySlug}/page/${pageNumber}`

        console.log("Fetching category URL:", url)

        await page.goto(url, { waitUntil: "domcontentloaded" })

        const threads = await extractThreadsFromCategory(page)

        return {
            category: categorySlug,
            page: pageNumber,
            threads,
        }
    } finally {
        await browser.close()
    }
}