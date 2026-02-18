# PoE Forum Mobile API

A high-performance, secure API for browsing Path of Exile forum on mobile devices. Built with Fastify, Puppeteer, and TypeScript.

## Features

✅ **Thread & Category Browsing** - Fetch PoE forum threads and categories with full pagination  
✅ **Security Hardened** - SSRF protection, input validation, rate limiting, security headers  
✅ **Type-Safe** - Full TypeScript support with auto-generated client types  
✅ **Scalable** - Built on Fastify for high performance  
✅ **API Documentation** - Swagger UI at `/documentation`  
✅ **Mobile-First** - Designed for mobile-friendly content delivery  

## Tech Stack

- **Backend**: Fastify 5.7 with Helmet, CORS, Rate Limiting
- **Scraping**: Puppeteer with headless browser
- **HTML Parsing**: Cheerio
- **Validation**: Custom input validators with SSRF protection
- **Documentation**: Fastify Swagger + Swagger UI
- **Client Generation**: Orval (OpenAPI → TypeScript client)
- **Language**: TypeScript 5.7

## Installation

```bash
npm install
```

## Running the Server

```bash
npm run server
```

The API will be available at `http://localhost:3000`

### API Documentation

Once the server is running, view interactive API docs:
```
http://localhost:3000/documentation
```

## API Endpoints

### Get All Categories

```bash
GET /api/categories
```

Returns all available forum categories grouped by game (PoE1/PoE2).

**Response:**
```json
{
  "poe1": [
    {
      "name": "General Discussion",
      "slug": "general-discussion",
      "endpoint": "/api/category/general-discussion",
      "sourceUrl": "https://www.pathofexile.com/forum/view-forum/general-discussion"
    }
  ],
  "poe2": [...]
}
```

### Get Category Threads

```bash
GET /api/category/{category}?page=1
```

Fetch threads from a specific category.

**Parameters:**
- `category` (required): Category slug (e.g., "news", "dev-manifesto")
- `page` (optional): Page number, default: 1

**Response:**
```json
{
  "category": "news",
  "page": 1,
  "threads": [
    {
      "threadId": "3912208",
      "title": "2.0.0 Released",
      "replies": 1250
    }
  ]
}
```

### Get Thread

```bash
GET /api/thread/{id}?page=1
```

Fetch posts from a specific thread.

**Parameters:**
- `id` (required): Thread ID (numeric only)
- `page` (optional): Page number, default: 1

**Response:**
```json
[
  {
    "threadId": "3912208",
    "page": 1,
    "indexOnPage": 0,
    "author": "GGG_Staff",
    "createdAt": "2024-02-18T10:30:00Z",
    "contentText": "Post content...",
    "contentHtml": "<p>Post content...</p>",
    "postId": "12345678"
  }
]
```

## Security Features

### SSRF Protection
- ✅ Input validation restricts to numeric thread IDs and alphanumeric category slugs
- ✅ All URLs constructed server-side (never from user input)
- ✅ Only PoE forum domain allowed in URL construction

### Rate Limiting
- 50 requests per minute per IP
- Configured via `@fastify/rate-limit`

### Security Headers
- HSTS (1 year, preload)
- CSP (Content Security Policy)
- X-Frame-Options (prevent clickjacking)
- X-Content-Type-Options (prevent MIME sniffing)
- Implemented via `@fastify/helmet`

### Input Validation
- Thread IDs: numeric only
- Category slugs: alphanumeric + hyphens/underscores
- Page numbers: 1-200 range
- All validation happens before URL construction

### CORS
- Configured for localhost development
- Update `src/server/app.ts` for production domains

## Generating TypeScript Client

Generate a fully-typed OpenAPI client for your frontend:

```bash
npm run generate:api
```

This generates `src/generated/api.ts` with complete type safety.

**Usage in Frontend:**
```typescript
import { getCategories, getCategory, getThread } from "./generated/api"

// All fully typed!
const categories = await getCategories()
const threads = await getCategory({ 
  params: { category: "news" },
  query: { page: "1" }
})
```

## Project Structure

```
src/
├── crawler/           # Web scraping logic
│   ├── crawlThreadPage.ts
│   ├── crawlCategoryPage.ts
│   ├── extractThreadPage.ts
│   └── fetchHtml.ts
├── server/            # Fastify API
│   ├── app.ts         # Express-like app builder
│   ├── index.ts       # Server entry point
│   ├── routes/        # API endpoints
│   │   ├── threadRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   └── categoriesRoutes.ts
│   └── schemas/       # OpenAPI schemas
├── service/           # Business logic
│   ├── threadService.ts
│   └── categoryService.ts
├── config/            # Configuration
│   ├── categories.ts  # Allowed categories
│   ├── constants.ts   # Base URLs
│   └── inputValidation.ts  # SSRF/injection prevention
└── domain/            # Type definitions
    └── thread.ts

swagger.json           # OpenAPI spec (auto-generated)
orval.config.ts        # Client generation config
```

## Development

### Dependencies

- **@fastify/cors**: Cross-origin requests
- **@fastify/helmet**: Security headers
- **@fastify/rate-limit**: Rate limiting
- **@fastify/swagger**: OpenAPI documentation
- **puppeeter**: Headless browser scraping
- **cheerio**: HTML parsing

### Dev Dependencies

- **orval**: OpenAPI → TypeScript client generator
- **tsx**: TypeScript execution
- **typescript**: Language

## Deployment Notes

### Environment Variables

```env
# Optional configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

### Production Checklist

- [ ] Update CORS origin in `src/server/app.ts`
- [ ] Enable HTTPS with proper SSL certificates
- [ ] Configure rate limiting limits based on expected load
- [ ] Monitor server logs for errors
- [ ] Set up error tracking (Sentry, etc)
- [ ] Regular health checks on `/api/categories`
- [ ] Replace Puppeteer with Cheerio

## Performance Optimization

- Inflight request deduplication (multiple requests for same data wait for single response)
- Puppeteer browser pooling (single browser instance per request)
- Rate limiting prevents abuse
- Response caching optional (add Redis layer if needed)

## Troubleshooting

### API returns empty response

The PoE forum HTML structure hasn't changed. Check:
1. Browser console logs (enable debugging)
2. Verify CSS selectors in `src/crawler/extractThreadPage.ts`
3. Test with a known active thread ID

### SSRF validation errors

Check error message format:
- Thread ID must be numeric: `^\d+$`
- Category must be alphanumeric with hyphens: `^[a-zA-Z0-9_-]+$`
- Page must be 1-200

### Rate limit exceeded

Default: 50 requests/minute per IP. Configure in `src/server/app.ts`:
```typescript
app.register(rateLimit, {
  max: 100,  // Increase limit
  timeWindow: "1 minute",
})
```

## Support

For issues, questions, or contributions, please open an issue or pull request.
