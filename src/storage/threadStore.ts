import type { Post } from "../domain/thread";

export interface ThreadStore {
  saveThread(threadId: string, posts: Post[]): Promise<void>;
  loadThread(threadId: string): Promise<Post[] | null>;
}
