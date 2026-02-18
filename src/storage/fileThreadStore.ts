import { promises as fs } from "node:fs";
import path from "node:path";
import type { ThreadStore } from "./threadStore";
import type { Post } from "../domain/thread";

export class FileThreadStore implements ThreadStore {
  constructor(private dir = "data") {}

  private file(threadId: string) {
    return path.join(this.dir, `thread-${threadId}.json`);
  }

  async saveThread(threadId: string, posts: Post[]): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(this.file(threadId), JSON.stringify(posts, null, 2), "utf8");
  }

  async loadThread(threadId: string): Promise<Post[] | null> {
    try {
      const json = await fs.readFile(this.file(threadId), "utf8");
      return JSON.parse(json) as Post[];
    } catch {
      return null;
    }
  }
}
