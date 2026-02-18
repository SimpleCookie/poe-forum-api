# @devgroup.se/poe-forum-api

Auto-generated API client for the Path of Exile Forum Crawler.

This package is automatically generated from the Swagger/OpenAPI specification of the backend server.

## Installation

```bash
npm install @devgroup.se/poe-forum-api
```

## Usage

```typescript
import { 
  getCategoriesId, 
  getThreadsId,
  // ... other exported functions and types
} from '@devgroup.se/poe-forum-api'

// Fetch categories
const categories = await getCategoriesId()

// Fetch a specific thread
const thread = await getThreadsId({ id: '123' })
```

## Configuration

The API client uses the Fetch API. Configure your API URL by setting the environment variable:

```typescript
// The client will use the current origin by default
// Or explicitly configure when initializing
```

## Development

### Regenerating the Client

When the backend API changes, regenerate the client from the root project:

```bash
npm run generate:api
npm run build:client
npm run publish:client  # when ready to publish a new version
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

## Regeneration

This package is auto-generated from the OpenAPI spec. Do not edit generated files directly.

## License

MIT

