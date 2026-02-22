// Configuration
export { setBaseUrl, getBaseUrl, resetBaseUrl } from './config'

// Versioned APIs - Each version has all functions
import { getThreadV1, getThreadV1Deprecated, getThreadV2, getThreadV3, getThreadV4, getThreadV5 } from './client'
import {
  getCategoriesV1,
  getCategoryV1,
  getCategoriesV3,
  getCategoryV3,
  getCategoriesV4,
  getCategoryV4,
  getCategoriesV5,
  getCategoryV5,
} from './client'

/**
 * V1 API - Deprecated format
 * threads return: { page, nextPageUrl, posts with page field }
 * categories are unversioned
 */
export const v1 = {
  getThread: getThreadV1Deprecated,
  getCategories: getCategoriesV1,
  getCategory: getCategoryV1,
}

/**
 * V2 API - Current format with pagination object
 * threads return: { pagination: { page, totalPages, hasNext, hasPrevious, pageSize }, posts }
 * categories are unversioned
 */
export const v2 = {
  getThread: getThreadV2,
  getCategories: getCategoriesV1,
  getCategory: getCategoryV1,
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

/**
 * V4 API - Simplified content format
 * threads return posts with a single content field
 * categories and threads are both under /api/v4/
 */
export const v4 = {
  getThread: getThreadV4,
  getCategories: getCategoriesV4,
  getCategory: getCategoryV4,
}

/**
 * V5 API - Structured content blocks with single content field
 * threads return posts with content: { type: 'doc', blocks: [...] }
 * categories and threads are both under /api/v5/
 */
export const v5 = {
  getThread: getThreadV5,
  getCategories: getCategoriesV5,
  getCategory: getCategoryV5,
}

// Types - Strong response contracts for UI consumption
export type {
  ThreadApiResponse,
  ThreadApiResponseV1,
  ThreadApiResponseV2,
  ThreadApiResponseV4,
  ThreadApiResponseV5,
  ThreadResponseV1,
  ThreadResponseV2,
  ThreadResponseV4,
  ThreadResponseV5,
  Post,
  PostV1,
  PostV4,
  PostV5,
  PostContentV5,
  ContentBlockV5,
  Pageable,
  ApiResponse,
} from './types'

// Generated API types
export * from './generated/api.schemas'
export type { getApiCategoriesResponse200, getApiCategoryCategoryResponse200 } from './client'
