// Configuration
export { setBaseUrl, getBaseUrl, resetBaseUrl } from './config'

// API Client with dynamic base URL support
export { getCategories, getCategory } from './client'

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
}

// Types
export * from './generated/api.schemas'
export type { getCategoriesResponse, getCategoryResponse, getThreadResponse } from './client'
