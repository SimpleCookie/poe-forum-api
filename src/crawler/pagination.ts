import { load as cheerioLoad } from "cheerio"

export function getNextPageUrl(html: string): string | null {
  const $ = cheerioLoad(html)
  const links = $("div.pagination a").toArray()
  const next = links.find((link) => $(link).text().trim() === "Next")
  return next ? $(next).attr("href") || null : null
}