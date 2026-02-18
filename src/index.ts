import puppeteer, { Page } from "puppeteer"
import { analyzeWithChatGPT } from "./analyser"
import { saveToFile } from "./fileHandler"

const baseUrl = "https://www.pathofexile.com"
const startUrl = `${baseUrl}/forum/view-thread/3912208`

// Utility functions
const cleanContent = (content: string): string =>
  content
    .replace(/\n/g, "") // Remove breaklines
    .replace(/\[quote.*?\].*?\[\/quote\]/gi, "") // Remove quotes
    .trim() // Remove extra spaces

const fetchHtml = async (url: string, page: Page): Promise<Page> => {
  await page.goto(url, { waitUntil: "domcontentloaded" })
  return page
}

const extractContent = async (
  page: Page,
  isFirstPage: boolean
): Promise<string[]> => {
  const rows = await page.evaluate((isFirstPage) => {
    const allRows = Array.from(document.querySelectorAll("table.forumTable tr"))
    const filteredRows = isFirstPage ? allRows.slice(1) : allRows
    return filteredRows.map(
      (row) => row.querySelector("div.content")?.textContent || ""
    )
  }, isFirstPage)

  return rows
    .filter((content) => content.length > 0) // Remove empty rows
    .map(cleanContent) // Clean the content
}

const getNextPageUrl = async (page: Page): Promise<string | null> => {
  return await page.evaluate(() => {
    // Get all links in pagination
    const paginationLinks = Array.from(
      document.querySelectorAll("div.pagination a")
    )
    // Find the "Next" button
    const nextButton = paginationLinks.find(
      (link) => link.textContent?.trim() === "Next"
    )
    return nextButton ? (nextButton as HTMLAnchorElement).href : null
  })
}

const crawlPages = async (
  url: string | null,
  page: Page,
  contentList: string[] = [],
  isFirstPage = true
): Promise<string[]> => {
  if (!url) return contentList

  await fetchHtml(url, page)
  const pageContent = await extractContent(page, isFirstPage)
  const nextPageUrl = await getNextPageUrl(page)

  // Recursively process the next page
  return await crawlPages(
    nextPageUrl,
    page,
    contentList.concat(pageContent),
    false
  )
}

const startCrawling = async (): Promise<void> => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  try {
    const contentList = await crawlPages(startUrl, page)
    console.log("Collected content:", contentList)

    // Save crawled content to a file
    const fileName = "crawled_content.txt"
    await saveToFile(fileName, contentList)

    // const summary = await analyzeWithChatGPT(contentList)
    // console.log("Weighted Summary:", summary)
  } catch (error) {
    console.error("Error during crawling:", error)
  } finally {
    await browser.close()
  }
}

// Start the crawler
startCrawling()
