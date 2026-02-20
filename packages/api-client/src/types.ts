/**
 * Strongly-typed API response contracts
 * These types replace the weak generated types and ensure type safety in consuming apps
 */

/**
 * Pagination metadata for V2 responses
 */
export interface PaginationV2 {
  page: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  pageSize: number
}

/**
 * Individual post in thread responses
 */
export interface Post {
  postId: string
  threadId: string
  author: string
  createdAt: string
  contentText: string
  contentHtml: string
  indexOnPage: number
}

/**
 * Post in V1 responses (includes page for backwards compatibility)
 */
export interface PostV1 extends Post {
  page: number
}

/**
 * Thread response - V2 format (current recommended)
 * Includes pagination object
 */
export interface ThreadResponseV2 {
  threadId: string
  title?: string
  posts: Post[]
  pagination: PaginationV2
}

/**
 * Thread response - V1 format (deprecated)
 * Includes page and nextPageUrl on root level
 */
export interface ThreadResponseV1 {
  threadId: string
  title?: string
  posts: PostV1[]
  page: number
  nextPageUrl: string | null
}

/**
 * Generic thread response (unversioned endpoint returns V1 format for backwards compatibility)
 */
export type ThreadResponse = ThreadResponseV1

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T
  status: number
  headers: Headers
}

/**
 * Typed thread API response
 */
export type ThreadApiResponseV1 = ApiResponse<ThreadResponseV1>
export type ThreadApiResponseV2 = ApiResponse<ThreadResponseV2>
export type ThreadApiResponse = ApiResponse<ThreadResponse>
