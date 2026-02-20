# API Versioning Guide

## Overview

The PoE Forum API uses semantic versioning to maintain backwards compatibility while allowing for improvements and updates. Multiple API versions are available simultaneously to support gradual client migration.

## Available Versions

### V1 (Deprecated)
- **Endpoint**: `/api/v1/thread/:id`
- **Status**: Deprecated - Maintenance mode only
- **Removal Date**: Q4 2026
- **Use Case**: Legacy clients that cannot be updated immediately

### V2 (Current/Recommended)
- **Endpoint**: `/api/v2/thread/:id`
- **Status**: Recommended - Active development
- **Use Case**: All new development should use V2

## Response Format Comparison

### V1 Response (Deprecated)
```json
{
  "threadId": "3912208",
  "page": 1,
  "posts": [
    {
      "postId": "12345",
      "threadId": "3912208",
      "author": "GGG_Staff",
      "createdAt": "2024-02-10T10:30:00.000Z",
      "contentText": "Post content...",
      "contentHtml": "<p>Post content...</p>",
      "indexOnPage": 0,
      "page": 1
    }
  ],
  "nextPageUrl": "/forum/view-thread/3912208/page/2"
}
```

### V2 Response (Recommended)
```json
{
  "threadId": "3912208",
  "posts": [
    {
      "postId": "12345",
      "threadId": "3912208",
      "author": "GGG_Staff",
      "createdAt": "2024-02-10T10:30:00.000Z",
      "contentText": "Post content...",
      "contentHtml": "<p>Post content...</p>",
      "indexOnPage": 0
    }
  ],
  "pagination": {
    "page": 1,
    "totalPages": 52,
    "hasNext": true,
    "hasPrevious": false,
    "totalItems": null,
    "pageSize": null
  }
}
```

## Migration Guide

### Step 1: Update Endpoint URL
```typescript
// Before (V1)
const response = await fetch('/api/thread/3912208?page=1')

// After (V2)
const response = await fetch('/api/v2/thread/3912208?page=1')
```

### Step 2: Update Response Parsing
```typescript
// V1 - Old way
const page = response.page
const hasMore = response.nextPageUrl !== null
const totalPages = 'unknown' // Not available in V1

// V2 - New way
const page = response.pagination.page
const hasMore = response.pagination.hasNext
const totalPages = response.pagination.totalPages
```

### Step 3: Remove Post Page Field
```typescript
// V1 - Posts included page
response.posts.forEach((post) => {
  console.log(post.page) // Available in V1
})

// V2 - Use pagination object instead
response.posts.forEach((post) => {
  console.log(post.page) // ❌ Not available in V2
  console.log(response.pagination.page) // ✓ Use this instead
})
```

### Step 4: Update UI Logic
```typescript
// V1 - Complex URL parsing
if (response.nextPageUrl) {
  const nextPage = parseInt(response.nextPageUrl.split('page/')[1])
}

// V2 - Simple boolean flag
if (response.pagination.hasNext) {
  const nextPage = response.pagination.page + 1
}
```

## Using the Generated Client

If you're using the `@devgroup.se/poe-forum-api` package:

### V1 (Deprecated)
```typescript
import { getThread as getThreadV1 } from '@devgroup.se/poe-forum-api'

// Calls /api/v1/thread/:id
```

### V2 (Current)
```typescript
import { getThread } from '@devgroup.se/poe-forum-api'

// Calls /api/v2/thread/:id (default)
```

**Note**: The default `getThread` function in newer client versions uses V2. Check your package version for which version is used by default.

## Deprecation Timeline

| Date | Event |
|------|-------|
| Q1 2026 | V2 released, V1 marked as deprecated |
| Q2 2026 | Target date for most clients to migrate to V2 |
| Q3 2026 | Final deprecation warnings added |
| Q4 2026 | V1 endpoints removed |

## Support

- **V2**: Full support - Report issues and feature requests
- **V1**: Maintenance only - Critical fixes only
- **Older**: No longer supported

## Best Practices

1. **Always use the latest version** for new development
2. **Plan migrations** when V1 deprecation is announced
3. **Use generated client** - It handles versioning automatically
4. **Test backwards compatibility** before updating clients
5. **Monitor deprecation notices** in API responses (future enhancement)

## FAQ

**Q: Can I use V1 and V2 in the same codebase?**
A: Yes, both versions are available simultaneously. However, this is not recommended for maintenance reasons.

**Q: What happens if I continue using V1 after Q4 2026?**
A: V1 endpoints will return 410 Gone. You must migrate to V2.

**Q: Is V2 backwards compatible with V1?**
A: No, the response format is different. Use the migration guide above.

**Q: When will V3 be released?**
A: No V3 is currently planned. V2 is expected to be stable long-term.

**Q: How do I report issues?**
A: Please report issues with your API version included in the bug report.
