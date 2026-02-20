export type ThreadId = string

export interface Pageable {
  /**
   * Current page number (1-indexed)
   */
  page: number

  /**
   * Total number of pages
   */
  totalPages: number

  /**
   * Whether there's a next page
   */
  hasNext: boolean

  /**
   * Whether there's a previous page
   */
  hasPrevious: boolean

  /**
   * Total number of items (posts)
   */
  totalItems?: number

  /**
   * Number of items on current page
   */
  pageSize?: number
}

export interface Post {
  postId: string | null // if you can derive it
  author: string
  createdAt: string | null // ISO if you can parse
  contentText: string // cleaned text
  contentHtml: string // optional, if you want richer rendering
  indexOnPage: number // position in the current page
  threadId: string
}

export interface ThreadPage {
  threadId: ThreadId
  posts: Post[]
  pagination: Pageable
}
