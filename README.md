# PoE Forum Mobile API

A high-performance, secure API for browsing Path of Exile forum on mobile devices. Built with Fastify, Puppeteer, and TypeScript.

## Features

✅ **Thread & Category Browsing** - Fetch PoE forum threads and categories with full pagination  
✅ **Long-Lived Thread Cache** - PostgreSQL-backed thread/post cache with edit detection  
✅ **Security Hardened** - SSRF protection, input validation, rate limiting, security headers  
✅ **Type-Safe** - Full TypeScript support with auto-generated client types  
✅ **Scalable** - Built on Fastify for high performance  
✅ **API Documentation** - Swagger UI at `/documentation`  
✅ **Mobile-First** - Designed for mobile-friendly content delivery  

## Tech Stack

- **Backend**: Fastify 5.7 with Helmet, CORS, Rate Limiting
- **Scraping**: Puppeteer with headless browser
- **HTML Parsing**: Cheerio
- **Database**: PostgreSQL (optional, for durable cache)
- **Validation**: Custom input validators with SSRF protection
- **Documentation**: Fastify Swagger + Swagger UI
- **Client Generation**: Orval (OpenAPI → TypeScript client)
- **Language**: TypeScript 5.7

## Installation

```bash
npm install
```

## Running the Server

### Development

```bash
npm run dev
```

### Production Build & Run

```bash
# Build TypeScript to JavaScript
npm run build

# Start the compiled server
npm start
```

The API will be available at `http://localhost:3000`

## Long-Lived Cache (PostgreSQL)

Thread pages can be cached in PostgreSQL to avoid re-crawling unchanged pages and to persist data across restarts.

- Cache key: `threadId + page`
- Post identity: `threadId + postId`
- Edit detection: content hash (`contentText + contentHtml`) updates `last_changed_at`
- Soft delete: posts removed from a crawled page are marked `is_deleted=true`

### Local development with Docker Desktop

```bash
# from project root
cp .env.example .env
docker-compose up -d postgres
npm run dev
```

Or start both API and Postgres with Docker:

```bash
docker-compose up -d
```

The API auto-creates required cache tables on startup when `THREAD_CACHE_ENABLED=true` and `DATABASE_URL` is set.

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

## Deployment & Production

### Environment Configuration

1. **Copy `.env.example` to `.env`**:
```bash
cp .env.example .env
```

2. **Update environment variables for production**:
```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# CORS Configuration (CRITICAL: change to your domain)
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info

# Rate Limiting (requests per minute)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1 minute

# API Documentation
API_URL=https://api.yourdomain.com
API_TITLE=PoE Forum Mobile API
API_VERSION=1.0.0
```

### Docker Deployment

**Build and run with Docker**:
```bash
docker build -t poe-forum-api .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=https://yourdomain.com \
  poe-forum-api
```

**Using Docker Compose** (recommended):
```bash
# Create .env file with production values
cp .env.example .env
# Edit .env with your production settings

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop the service
docker-compose down
```

### Health Checks

The API provides health check endpoints:

- **Liveness Check**: `GET /health` - Returns status and uptime
- **Readiness Check**: `GET /ready` - Returns readiness for traffic

Example:
```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2026-02-18T10:30:00Z","uptime":1234.5}
```

### Production Checklist

- [ ] **Environment Variables**: Copy and configure `.env` file
- [ ] **CORS Origin**: Update `CORS_ORIGIN` to your frontend domain
- [ ] **Logging**: Set `LOG_LEVEL=info` or `warn` for production
- [ ] **Rate Limiting**: Adjust `RATE_LIMIT_MAX` based on expected load
- [ ] **HTTPS/SSL**: Configure reverse proxy (Nginx, CloudFlare, etc)
- [ ] **Build & Test**: Run `npm run build` before deployment
- [ ] **Docker Image**: Build and test Docker image locally
- [ ] **Health Monitoring**: Set up health checks pointing to `/health`
- [ ] **Error Tracking**: Integrate Sentry or similar error tracking
- [ ] **Logging**: Use container orchestration logs (CloudWatch, ECS, etc)
- [ ] **Resource Limits**: Set CPU/memory limits in docker-compose.yml
- [ ] **Graceful Shutdown**: Ensure proper signal handling (handled by dumb-init)

### Deployment Platforms

#### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set CORS_ORIGIN=https://your-frontend.herokuapp.com
heroku logs --tail
```

#### AWS ECS / Fargate
1. Build and push Docker image to ECR
2. Create ECS task definition using the image
3. Set environment variables in task definition
4. Configure load balancer with health checks pointing to `/health`

#### Railway / Fly.io
1. Create `Dockerfile` (included)
2. Deploy: `railway up` or `flyctl deploy`
3. Set environment variables via platform CLI

#### Azure / DigitalOcean App Platform
1. Build Docker image
2. Deploy to container service
3. Configure environment variables and domains

### Production Monitoring

**Log Levels**:
- `trace`: Detailed debugging (not recommended for production)
- `debug`: Development-level debugging
- `info`: General information (recommended)
- `warn`: Warnings only
- `error`: Errors only
- `fatal`: Critical errors only

**Monitor these metrics**:
- Response time (`/api/*/` endpoints)
- Error rate (4xx, 5xx responses)
- Rate limit hits (429 responses)
- Health check status
- CPU and memory usage
- Disk space on container host

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
