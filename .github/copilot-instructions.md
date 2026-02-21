# Copilot Instructions for `poe-forum-mobile`

## Big picture architecture
- Fastify API server entrypoint is `src/server/index.ts`; app wiring lives in `src/server/app.ts`.
- Core flow is **Route -> Service -> Crawler/Cache -> Domain model**.
  - Routes: `src/server/routes/**`
  - Services: `src/service/**`
  - Crawling/parsing: `src/crawler/**`
  - Shared contracts: `src/domain/thread.ts`
- `ThreadService` (`src/service/threadService.ts`) is cache-first with resilient fallback:
  - read PostgreSQL cache (if enabled)
  - if stale/miss, crawl live forum
  - write cache best-effort
  - if crawl fails and stale cache exists, return stale cache
- Durable cache is Prisma-backed in `src/service/threadCacheRepository.ts` with edit detection (`content_hash`) and soft delete (`is_deleted`).

## API versioning conventions
- Every breaking API change must create a new version (e.g. `v5`) instead of changing existing contracts.
- Each new API version should expose the full route surface (threads + categories + future endpoints), not partial coverage.
- No partial version launches: do not ship a new version where consumers must combine endpoints from old and new versions.
- Goal: once API consumers are migrated, deprecate and remove older versions quickly to avoid obsolete code.
- Keep older-version code only as long as active consumers still depend on it.
- Treat unversioned routes as compatibility bridges only; new behavior belongs in explicit `/api/vX/*` routes.
- Update integration tests to prioritize the latest version first, while keeping minimal compatibility checks for still-supported older versions.

### Version launch checklist (required)
- New `vX` includes full route surface used by clients (threads + categories + related endpoints).
- Latest-version integration tests cover that full surface first.
- API client exposes the new version at top level (`vX`) with version-consistent function names.
- API client remains strictly typed end-to-end (no `any` in public API surface).
- Consumer ergonomics: importing `vX` should be sufficient (e.g. `v5.getThread()`, `v5.getCategories()`, `v5.getCategory()`).
- Migration path is documented so consumers can move fully to `vX`.
- Older versions are marked for removal as soon as active consumers finish migration.

## Parsing and pagination rules
- Thread HTML extraction lives in `src/crawler/extractThreadPage.ts`.
- Pagination derivation lives in `src/crawler/pagination.ts`; maintain deterministic page-state logic (`hasNext/hasPrevious` from page numbers).
- When changing parser behavior, update fixtures/tests in `src/crawler/__tests__/fixtures.ts` and `src/crawler/__tests__/pagination.test.ts`.

## Validation and safety patterns
- Validate route params with `validateThreadId`, `validateCategorySlug`, `validatePageNumber` from `src/config/inputValidation.ts` before calling services.
- Route handlers return `400` for `ValidationError`; keep this pattern across new endpoints.

## Developer workflows
- Install/build/test from repo root:
  - `npm install`
  - `npm run dev` (server)
  - `npm run build`
  - `npm test`
- Focused tests commonly used in this repo:
  - `npm test -- src/crawler/__tests__/pagination.test.ts`
  - `npm test -- src/server/__tests__/routes.integration.test.ts`
  - `npm test -- src/service/__tests__/threadService.test.ts`
- Health/docs endpoints after startup:
  - `/health`
  - `/documentation`
- After any API change, always run this sequence from repo root:
  - `npm test`
  - `npm run build`
  - `npm run generate:api`
  - `npm run build:client`

## Testing strategy (scenario-first)
- Prefer scenario tests (black-box integration tests): test behavior via HTTP requests and assert outputs from inputs.
- Primary pattern: run app (or register routes) and test endpoints like an API consumer (`src/server/__tests__/routes.integration.test.ts`).
- Keep implementation-detail unit tests small and targeted; add them when they improve feedback speed for pure logic (e.g. parser/pagination).
- For API changes, update or add scenario tests for the latest version before adding low-level tests.
- Avoid over-testing internals when route-level behavior already proves correctness.

## Design principles for changes
- Open/Closed principle: prefer extending via new versions/routes over modifying stable contracts.
- Single Responsibility: keep route handlers focused on transport/validation, and business logic in services/crawler.
- Favor immutability and pure transformations where practical (especially parser/mapping code).

## API client generation and publishing
- OpenAPI generation pipeline:
  - `npm run generate:api` (fetches swagger + runs Orval + copies generated code into `packages/api-client/generated`)
  - `npm run build:client`
- Client package exports top-level version objects (`v1`, `v2`, `v3`, `v4`) from `packages/api-client/index.ts`; keep versioned function names consistent.
- Latest API version must always be exposed as a top-level object (`vX`) that contains the full route surface for that version.
- Keep exported client functions and response types version-suffixed and strictly typed to preserve clear contracts per version.
- Before publish, verify package contents with `cd packages/api-client && npm pack --dry-run`.

## Practical edit guidance
- Prefer minimal, version-safe changes; for breaking changes, create a new version rather than altering existing contracts.
- Preserve existing logging/error-tolerance behavior in cache paths (DB failures must not break API responses).
- Add scenario tests adjacent to changed behavior rather than broad refactors.