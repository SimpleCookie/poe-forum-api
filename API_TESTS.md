# API Test Suite Summary

## Tests Overview

All tests are **mocking axios** to prevent real HTTP requests to external services. This ensures:
- ✅ **No external dependencies** - tests run in isolation
- ✅ **Predictable behavior** - same data every time
- ✅ **Fast execution** - no network latency
- ✅ **Safe for CI/CD** - no rate limiting or network issues

## Test Files

### 1. **Crawler Unit Tests** (13 tests)
Located in `src/crawler/__tests__/`:
- `pagination.test.ts` - Tests pagination URL extraction from HTML
- `extractThreadPage.test.ts` - Tests thread page parsing (posts, metadata, filtering)
- `crawlCategoryPage.test.ts` - Tests category page parsing (threads, reply counts)

**All use Cheerio to parse mock HTML** - no external requests

### 2. **API Logic Tests** (4 tests) ⭐ NEW
Located in `src/server/__tests__/api.unit.test.ts`:
- ✓ axios is properly mocked (no real HTTP requests)
- ✓ CategoryService can fetch data with **mocked axios**
- ✓ ThreadService can fetch data with **mocked axios**
- ✓ no external HTTP requests were made (only mocked)

## How Mocking Works

### Mock Setup
```typescript
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
```

### Mock Data
```typescript
const mockCategoryHTML = `<table>...</table>` // Mock HTML response
const mockThreadHTML = `<table>...</table>`   // Mock HTML response
```

### Mock Axios in Tests
```typescript
mockedAxios.get.mockResolvedValueOnce({ 
  data: mockCategoryHTML,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
})
```

## Verification

When you run tests, axios is **completely mocked**:
- `fetchHtml()` doesn't make real HTTP requests
- `CategoryService.getCategoryPage()` returns mocked data
- `ThreadService.getThreadPage()` returns mocked data
- No requests to `pathofexile.com` or any external server

## Running Tests

```bash
# Run all tests
npm test

# Run only API tests
npm test api.unit

# Run with watch mode
npm test:watch

# Run with coverage
npm test -- --coverage
```

## Test Results

```
Test Suites: 4 passed, 4 total
Tests:       17 passed, 17 total
Time:        ~2 seconds
```

All tests pass and no external requests are made! ✅
