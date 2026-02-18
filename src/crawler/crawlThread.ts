import type { Page } from "puppeteer";
import { fetchHtml } from "./fetchHtml";
import { extractThreadPage } from "./extractThreadPage";
import type { Post } from "../domain/thread";

export async function crawlThread(
  page: Page,
  opts: { startUrl: string; threadId: string; maxPages?: number }
): Promise<Post[]> {
  let url: string | null = opts.startUrl;
  let pageNumber = 1;
  let isFirstPage = true;

  const allPosts: Post[] = [];

  while (url) {
    if (opts.maxPages && pageNumber > opts.maxPages) break;

    await fetchHtml(page, url);

    const threadPage = await extractThreadPage(page, {
      threadId: opts.threadId,
      pageNumber,
      isFirstPage,
    });

    allPosts.push(...threadPage.posts);

    url = threadPage.nextPageUrl;
    pageNumber += 1;
    isFirstPage = false;
  }

  return allPosts;
}
