// Configuration
export { setBaseUrl, getBaseUrl, resetBaseUrl } from './config'

// Versioned APIs - Each version has all functions
import { getThread, getThreadV1, getThreadV2, getThreadV3 } from './client'
import { getCategories, getCategory, getCategoriesV3, getCategoryV3 } from './client'

/**
 * V1 API - Deprecated format
 * threads return: { page, nextPageUrl, posts with page field }
 * categories are unversioned
 */
export const v1 = {
  getThread: getThreadV1,
  getCategories,
  getCategory,
}

/**
 * V2 API - Current format with pagination object
 * threads return: { pagination: { page, totalPages, hasNext, hasPrevious, pageSize }, posts }
 * categories are unversioned
 */
export const v2 = {
  getThread: getThreadV2,
  getCategories,
  getCategory,
}

/**
 * V3 API - Unified and recommended
 * All endpoints under /api/v3/
 * threads return: { pagination: { page, totalPages, hasNext, hasPrevious, pageSize }, posts }
 * categories under /api/v3/
 */
export const v3 = {
  getThread: getThreadV3,
  getCategories: getCategoriesV3,
  getCategory: getCategoryV3,
}

// Types - Strong response contracts for UI consumption
export type {
  ThreadApiResponse,
  ThreadApiResponseV1,
  ThreadApiResponseV2,
  ThreadResponseV1,
  ThreadResponseV2,
  Post,
  PostV1,
  Pageable,
  ApiResponse,
} from './types'

// Generated API types
export * from './generated/api.schemas'
export type { getApiCategoriesResponse200, getApiCategoryCategoryResponse200 } from './client'
