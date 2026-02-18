import puppeteer from "puppeteer";
import { crawlThread } from "../crawler/crawlThread";
import { FileThreadStore } from "../storage/fileThreadStore";

const baseUrl = "https://www.pathofexile.com";
const threadId = "3645467";
const startUrl = `${baseUrl}/forum/view-thread/${threadId}`;

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const store = new FileThreadStore("data");

  try {
    const posts = await crawlThread(page, { startUrl, threadId });
    await store.saveThread(threadId, posts);
    console.log(`Saved ${posts.length} posts`);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
