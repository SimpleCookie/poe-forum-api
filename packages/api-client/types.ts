/**
 * Strong Response Contracts for API Clients
 * These types provide stable contracts that UI can import directly
 * without needing client-side normalization
 */

/**
 * Post with all fields extracted from thread page
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
 * Post for V1 API format (includes page field)
 */
export interface PostV1 extends Post {
  page: number
}

/**
 * Pagination information
 */
export interface Pageable {
  page: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  pageSize: number
}

/**
 * Thread response for V2 API (current format with pagination object)
 * Recommended format for new clients
 */
export interface ThreadResponseV2 {
  threadId: string
  title?: string
  posts: Post[]
  pagination: Pageable
}

/**
 * Thread response for V1 API (deprecated format)
 * Uses page and nextPageUrl on root level
 */
export interface ThreadResponseV1 {
  threadId: string
  title?: string
  posts: PostV1[]
  page: number
  nextPageUrl?: string
}

/**
 * Thread response for unversioned endpoint (defaults to V1 for backwards compatibility)
 */
export type ThreadResponse = ThreadResponseV1

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T
  status: number
  headers: Headers
}

/**
 * Typed API responses for thread endpoints
 */
export type ThreadApiResponse = ApiResponse<ThreadResponseV1>
export type ThreadApiResponseV1 = ApiResponse<ThreadResponseV1>
export type ThreadApiResponseV2 = ApiResponse<ThreadResponseV2>
