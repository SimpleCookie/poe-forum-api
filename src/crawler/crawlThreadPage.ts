import puppeteer from "puppeteer"
import { extractThreadPage } from "./extractThreadPage"
import { BASE_URL } from "../config/constants"

export async function crawlThreadPage(
    threadId: string,
    pageNumber: number
) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    try {
        const url =
            pageNumber === 1
                ? `${BASE_URL}/forum/view-thread/${threadId}`
                : `${BASE_URL}/forum/view-thread/${threadId}/page/${pageNumber}`

        await page.goto(url, { waitUntil: "domcontentloaded" })

        return await extractThreadPage(page, {
            threadId,
            pageNumber,
            isFirstPage: pageNumber === 1,
        })
    } finally {
        await browser.close()
    }
}
