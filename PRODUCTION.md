# Production Deployment Guide

For a simple Render.com deployment, see **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)** ← Start here!

This page has general production concepts for other platforms.

## Quick Build & Test

```bash
# Build for production
npm run build

# Test locally
npm start

# Test health endpoint
curl http://localhost:3000/health
```

## Environment Variables

Set these in your production platform:

```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

Optional:
```env
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1 minute
API_URL=https://api.yourdomain.com
API_TITLE=PoE Forum Mobile API
API_DESCRIPTION=API for browsing Path of Exile forum
API_VERSION=1.0.0
```

## Render.com (Recommended)

Best for getting started with minimal setup:

1. Push your repo to GitHub
2. Create new Web Service on render.com
3. Connect GitHub repo
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Done! Your API is live

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed steps.

## Docker (Advanced)

If you want to use Docker:

```bash
# Build image
docker build -t poe-forum-api .

# Run locally
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=https://yourdomain.com \
  poe-forum-api

# Run with docker-compose
docker-compose up -d
```

## Verification

After deployment, verify everything works:

```bash
# Health check
curl https://api.yourdomain.com/health

# Sample API call
curl https://api.yourdomain.com/api/categories
```

Expected responses:
- `/health` returns 200 with `{"status":"ok"}`
- `/api/categories` returns forum categories
- Request takes < 2 seconds

## Logs

- **Render**: View in dashboard "Logs" tab
- **Docker**: `docker logs <container-id>`
- **Local**: Colorized output to console

## Troubleshooting

### Build fails
```bash
npm run build
```
Run locally to check for errors

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -i :3000  # Find process ID
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### CORS errors
Ensure CORS_ORIGIN matches your frontend domain exactly (include `https://`)

### Health check failing
- Verify the service is actually running
- Check logs for startup errors
- Make sure `npm start` finds `dist/server/index.js`

## What's Deployed

- TypeScript compiled to JavaScript in `dist/`
- Source maps included for debugging
- All dependencies included in build
- Environment-aware logging (JSON for prod, pretty for dev)

## Performance

- API responds in < 500ms typically (depends on PoE forum speed)
- Rate limited to 100 requests/minute by default
- Single Puppeteer instance handles requests sequentially
- Memory usage: ~200-300MB

## Security

- Input validation prevents SSRF attacks
- CORS configured to specific domain (not `*`)
- Security headers via Helmet
- Rate limiting active
- No sensitive data in error messages
