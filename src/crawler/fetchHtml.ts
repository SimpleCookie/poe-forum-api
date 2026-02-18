import type { Page } from "puppeteer";

export async function fetchHtml(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: "domcontentloaded" });
}