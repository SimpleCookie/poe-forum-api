export type ThreadId = string;

export interface Post {
  postId: string;      // if you can derive it
  author: string;
  createdAt: string;   // ISO if you can parse
  contentText: string;  // cleaned text
  contentHtml: string; // optional, if you want richer rendering
  page: number;
  indexOnPage: number;
}

export interface ThreadPage {
  threadId: ThreadId;
  page: number;
  posts: Post[];
  nextPageUrl: string | null;
}