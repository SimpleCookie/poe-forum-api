// Configuration
export { setBaseUrl, getBaseUrl, resetBaseUrl } from './config'

// API Client with dynamic base URL support - Unversioned (backwards compat)
export { getCategories, getCategory } from './client'

// V3 Unified API - RECOMMENDED
import { getCategoriesV3, getCategoryV3, getThreadV3 } from './client'

export const categoriesV3 = {
  getCategories: getCategoriesV3,
  getCategory: getCategoryV3,
}

// Versioned Thread API
import { getThread, getThreadV1, getThreadV2 } from './client'

export const thread = {
  getThread,
  v1: {
    getThread: getThreadV1,
  },
  v2: {
    getThread: getThreadV2,
  },
  v3: {
    getThread: getThreadV3,
  },
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
