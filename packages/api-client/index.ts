// Configuration
export { setBaseUrl, getBaseUrl, resetBaseUrl } from './config'

// API Client with dynamic base URL support
export { getCategories, getCategory, getThread } from './client'

// Types
export * from './generated/api.schemas'
export type { getCategoriesResponse, getCategoryResponse, getThreadResponse } from './client'
