# @devgroup.se/poe-forum-api

Auto-generated API client for the Path of Exile Forum Crawler.

This package is automatically generated from the Swagger/OpenAPI specification of the backend server.

## Installation

```bash
npm install @devgroup.se/poe-forum-api
```

## Usage

### Basic Usage

```typescript
import { getCategories, getCategory, getThread } from '@devgroup.se/poe-forum-api'

// Fetch all categories
const categories = await getCategories()

// Fetch threads from a specific category
const threads = await getCategory('announcements')

// Fetch a specific thread
const thread = await getThread('1234567')
```

### Configuring the Base URL

By default, the client uses the current origin (in browsers) or `http://localhost:3000` (in Node.js).

To set a custom base URL:

```typescript
import { setBaseUrl, getCategories } from '@devgroup.se/poe-forum-api'

// Set API base URL before making requests
setBaseUrl('https://api.example.com')

// Or for development with a different port
setBaseUrl('http://localhost:4000')

// Then use the API functions normally
const categories = await getCategories()
```

### Common Patterns

**React App:**

```typescript
// App.tsx or main.tsx
import { setBaseUrl } from '@devgroup.se/poe-forum-api'

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000'
setBaseUrl(apiUrl)

// Now use the API throughout your app
```

**Express/Node.js Server:**

```typescript
import { setBaseUrl, getCategories } from '@devgroup.se/poe-forum-api'

app.get('/api/categories', async (req, res) => {
  setBaseUrl('http://internal-api-server:3000')
  const categories = await getCategories()
  res.json(categories)
})
```

**Environment Variables:**

```bash
# .env
VITE_API_URL=https://api.production.com

# or for React
REACT_APP_API_URL=https://api.production.com
```

```typescript
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
setBaseUrl(apiUrl)
```

## API Reference

### `setBaseUrl(baseUrl: string)`

Sets the base URL for all subsequent API requests.

```typescript
setBaseUrl('https://api.example.com')
```

### `getBaseUrl(): string`

Returns the currently configured base URL.

```typescript
console.log(getBaseUrl()) // 'https://api.example.com'
```

### `resetBaseUrl()`

Resets the base URL to its default value.

```typescript
resetBaseUrl() // Back to browser origin or http://localhost:3000
```

## API Endpoints

### Categories

- `getCategories()` - Get all forum categories
- `getCategory(categoryId, params?)` - Get threads from a category

### Threads

- `getThread(threadId, params?)` - Get a specific thread

## Development

### Regenerating the Client

When the backend API changes, regenerate the client from the root project:

```bash
npm run generate:api
npm run build:client
```

### Publishing (Maintainers only)

1. Ensure you're authenticated with npm:
   ```bash
   npm login
   ```

2. Update version in `packages/api-client/package.json` following semver

3. Publish:
   ```bash
   npm run publish:client
   ```

## Notes

- The client uses the Fetch API, so it requires a modern browser or Node.js 18+
- Base URL is stored globally, so changing it affects all subsequent requests
- The client preserves the current browser origin by default when running in a browser
- Query parameters are automatically encoded

## License

MIT


