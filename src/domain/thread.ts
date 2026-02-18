export type ThreadId = string

export interface Post {
  postId: string | null      // if you can derive it
  author: string
  createdAt: string | null   // ISO if you can parse
  contentText: string  // cleaned text
  contentHtml: string // optional, if you want richer rendering
  page: number
  indexOnPage: number
  threadId: string
}

export interface ThreadPage {
  threadId: ThreadId
  page: number
  posts: Post[]
  nextPageUrl: string | null
}