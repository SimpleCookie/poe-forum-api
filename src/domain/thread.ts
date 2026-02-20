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
  postId: string
  author: string
  createdAt: string
  contentText: string
  contentHtml: string
  indexOnPage: number
  threadId: string
}

export interface ThreadPage {
  threadId: ThreadId
  title?: string
  posts: Post[]
  pagination: Pageable
}
