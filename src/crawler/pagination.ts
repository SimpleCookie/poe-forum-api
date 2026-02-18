import type { Page } from "puppeteer";

export async function getNextPageUrl(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("div.pagination a"));
    const next = links.find(a => a.textContent?.trim() === "Next");
    return next ? (next as HTMLAnchorElement).href : null;
  });
}