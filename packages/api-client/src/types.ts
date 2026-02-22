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
 * Individual post in V4 thread responses (single content field)
 */
export interface PostV4 {
  postId: string
  threadId: string
  author: string
  createdAt: string
  content: string
  indexOnPage: number
}

export type ContentBlockV5 =
  | { type: 'paragraph'; text: string }
  | { type: 'image'; url: string; alt?: string }
  | {
    type: 'embed'
    provider: 'youtube' | 'unknown'
    kind: 'video' | 'iframe'
    url: string
    embedUrl: string
    videoId?: string
  }
  | { type: 'quote'; author?: string; text: string; depth: number }

export interface PostContentV5 {
  type: 'doc'
  blocks: ContentBlockV5[]
}

export interface PostV5 {
  postId: string
  threadId: string
  author: string
  createdAt: string
  content: PostContentV5
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
 * Thread response - V4 format
 * Uses a single content field on posts
 */
export interface ThreadResponseV4 {
  threadId: string
  title?: string
  posts: PostV4[]
  pagination: PaginationV2
}

export interface ThreadResponseV5 {
  threadId: string
  title?: string
  posts: PostV5[]
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
export type ThreadApiResponseV4 = ApiResponse<ThreadResponseV4>
export type ThreadApiResponseV5 = ApiResponse<ThreadResponseV5>
export type ThreadApiResponse = ApiResponse<ThreadResponse>
