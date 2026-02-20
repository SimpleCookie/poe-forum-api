/**
 * API Version Documentation
 *
 * This document outlines the versioning strategy for the PoE Forum API.
 * Each version is maintained separately for backwards compatibility.
 */

// ============================================================================
// V1 - DEPRECATED (Maintained for backwards compatibility)
// ============================================================================
//
// Endpoint: GET /api/v1/thread/:id?page=1
//
// Response format:
// {
//   threadId: string
//   posts: Post[]  // includes 'page' property
//   page: number
//   nextPageUrl: string | null
// }
//
// Issues with V1:
// - Page information spread across response and posts
// - nextPageUrl is URL-only, no easy way to check if more pages exist
// - No total pages information
// - Redundant page field in each post
//
// When to migrate away: After all clients have been updated to V2
// Removal planned for: Next major version

// ============================================================================
// V2 - CURRENT (Recommended)
// ============================================================================
//
// Endpoint: GET /api/v2/thread/:id?page=1
//
// Response format:
// {
//   threadId: string
//   posts: Post[]
//   pagination: {
//     page: number           // Current page (1-indexed)
//     totalPages: number     // Total pages available
//     hasNext: boolean       // Easy check for next page
//     hasPrevious: boolean   // Easy check for previous page
//     totalItems?: number    // Optional: total posts
//     pageSize?: number      // Optional: posts per page
//   }
// }
//
// Benefits of V2:
// - Clear pagination semantics (Pageable pattern)
// - Easy to determine if more pages exist
// - Total pages available upfront
// - No redundant data
// - Follows REST API best practices
//
// Migration from V1:
// 1. Change endpoint from /v1/thread to /v2/thread
// 2. Update response parsing:
//    - page → pagination.page
//    - nextPageUrl → pagination.hasNext
//    - Remove page from posts
// 3. Use pagination.totalPages for pagination UI
// 4. Use hasNext/hasPrevious for button enable/disable logic
//
// Estimated V2 adoption: Q2 2026
// V1 deprecation notice added: Q1 2026
// V1 removal planned: Q4 2026

// ============================================================================
// UNVERSIONED ENDPOINTS
// ============================================================================
//
// Categories endpoints currently available at:
// - GET /api/categories
// - GET /api/category/:id
//
// These will be versioned in a future update for consistency.
// Currently pointing to latest implementation.
//
// Planning:
// - Categories V1: Current implementation  
// - Categories V2: Future enhancement (e.g., pagination support)

// ============================================================================
// MIGRATION CHECKLIST FOR CLIENTS
// ============================================================================
//
// When migrating from V1 to V2:
// □ Update all thread endpoint calls to use /v2/
// □ Update response parsing for pagination object
// □ Remove post.page property handling
// □ Use pagination.hasNext instead of checking nextPageUrl
// □ Update pagination UI to use pagination.totalPages
// □ Test with different page numbers
// □ Update version requirements/docs
// □ Deploy and verify
//
// After all clients are updated:
// □ Remove V1 routes directory
// □ Update Swagger documentation
// □ Remove deprecation notices
// □ Update this file

export const API_VERSIONS = {
  v1: {
    status: 'deprecated',
    path: '/api/v1',
    description: 'Legacy API with original response format',
    maintenanceMode: true,
    removalPlanned: 'Q4 2026',
  },
  v2: {
    status: 'current',
    path: '/api/v2',
    description: 'Current API with improved pagination',
    maintenanceMode: false,
    recommended: true,
  },
} as const
