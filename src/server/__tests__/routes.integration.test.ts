import fastify from 'fastify'
import { threadRoutes } from '../routes/threadRoutes'
import { threadRoutesV1 } from '../routes/v1/threadRoutesV1'
import { threadRoutesV2 } from '../routes/v2/threadRoutesV2'
import { threadRoutesV4 } from '../routes/v4/threadRoutesV4'
import { ThreadService } from '../../service/threadService'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const mockThreadHTML = `<table class="forumTable"><tr><td colspan="100">Header</td></tr><tr><td class="content-container"><div class="content">Post 1</div></td><td class="posted-by"><div class="profile-link"><a>User1</a></div><div class="post_date">2024-02-18 10:00:00</div></td><td><div class="post_anchor" id="p1"></div></td></tr><tr><td class="content-container"><div class="content">Post 2</div></td><td class="posted-by"><div class="profile-link"><a>User2</a></div><div class="post_date">2024-02-18 10:05:00</div></td><td><div class="post_anchor" id="p2"></div></td></tr></table><div class="pagination"><a class="current" href="/forum/view-thread/123/page/1">1</a><a href="/forum/view-thread/123/page/2">2</a><a href="/forum/view-thread/123/page/3">3</a><a href="/forum/view-thread/123/page/2">Next</a></div>`

const mockLastPageHTML = `<table class="forumTable"><tr><td colspan="100">Header</td></tr><tr><td class="content-container"><div class="content">Last Post</div></td><td class="posted-by"><div class="profile-link"><a>User3</a></div><div class="post_date">2024-02-18 11:00:00</div></td><td><div class="post_anchor" id="p5"></div></td></tr></table><div class="pagination"><a href="/forum/view-thread/123/page/2">Previous</a><a href="/forum/view-thread/123/page/1">1</a><a href="/forum/view-thread/123/page/2">2</a><a class="current" href="/forum/view-thread/123/page/3">3</a></div>`

const mockQuotedThreadHTML = `<table class="forumTable"><tr><td colspan="100">Header</td></tr><tr><td class="content-container"><div class="content"><blockquote class=""><span class="quote">"</span><div class="top"><cite><span class="profile-link"><a href="/account/view-profile/TwistedTrip-5344">TwistedTrip#5344</a></span> wrote:</cite></div><div class="bot">Quoted line one.<br>Quoted line two.<div class="clear"></div></div></blockquote><br>Reply after quote.</div></td><td class="posted-by"><div class="profile-link"><a>Simple2012#6247</a></div><div class="post_date">2026-02-18 02:39:30</div></td><td><div class="post_anchor" id="p26572904"></div></td></tr></table><div class="pagination"><a class="current" href="/forum/view-thread/3912208/page/1">1</a></div>`

describe('Thread Routes Integration Tests', () => {
  let app: ReturnType<typeof fastify>

  beforeEach(() => {
    mockedAxios.get.mockClear()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('V1 Routes (Backwards Compatibility)', () => {
    beforeEach(async () => {
      app = fastify()
      await app.register(threadRoutesV1)
    })

    it('✓ GET /api/v1/thread/:id returns old format with page field on posts', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/v1/thread/123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)

      // V1 format: page field on each post
      expect(body).toHaveProperty('threadId', '123')
      expect(body).toHaveProperty('posts')
      expect(body).toHaveProperty('page', 1)
      expect(body).toHaveProperty('nextPageUrl')
      expect(Array.isArray(body.posts)).toBe(true)
      expect(body.posts.length).toBe(2)

      // Each post should have page field (v1 specific)
      body.posts.forEach((post: any) => {
        expect(post).toHaveProperty('page', 1)
        expect(post).toHaveProperty('postId')
        expect(post).toHaveProperty('author')
        expect(post).toHaveProperty('contentText')
      })

      console.log('✓ V1 endpoint returns old format with page on posts')
    })

    it('✓ GET /api/v1/thread/:id returns nextPageUrl when not last page', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/v1/thread/123?page=1',
      })

      const body = JSON.parse(response.payload)
      expect(body.nextPageUrl).toBe('/forum/view-thread/123/page/2')
      console.log('✓ V1 nextPageUrl set correctly for non-last page')
    })

    it('✓ GET /api/v1/thread/:id returns null nextPageUrl on last page', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockLastPageHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/v1/thread/123?page=3',
      })

      const body = JSON.parse(response.payload)
      expect(body.nextPageUrl).toBeNull()
      expect(body.page).toBe(3)
      console.log('✓ V1 nextPageUrl is null on last page')
    })

    it('✓ GET /api/v1/thread/:id respects page query parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockLastPageHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/v1/thread/123?page=3',
      })

      const body = JSON.parse(response.payload)
      expect(body.page).toBe(3)
      expect(mockedAxios.get).toHaveBeenCalled()
      console.log('✓ V1 respects page query parameter')
    })

    it('✓ GET /api/v1/thread/:id rejects invalid thread ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/thread/invalid-id-with-letters',
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.payload)
      expect(body).toHaveProperty('error')
      console.log('✓ V1 rejects invalid thread ID')
    })

    it('✓ GET /api/v1/thread/:id rejects invalid page number', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/thread/123?page=0',
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.payload)
      expect(body).toHaveProperty('error')
      console.log('✓ V1 rejects invalid page number (< 1)')
    })
  })

  describe('Unversioned Routes (Backwards Compatibility)', () => {
    beforeEach(async () => {
      app = fastify()
      await app.register(threadRoutes)
    })

    it('✓ GET /api/thread/:id returns old format with page field on posts', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/thread/123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)

      // Unversioned should match V1 format for backwards compatibility
      expect(body).toHaveProperty('threadId', '123')
      expect(body).toHaveProperty('posts')
      expect(body).toHaveProperty('page', 1)
      expect(body).toHaveProperty('nextPageUrl')
      expect(Array.isArray(body.posts)).toBe(true)

      // Posts should have page field (V1 format)
      body.posts.forEach((post: any) => {
        expect(post).toHaveProperty('page', 1)
      })

      console.log('✓ Unversioned endpoint returns V1 format for backwards compatibility')
    })

    it('✓ GET /api/thread/:id is identical to /api/v1/thread/:id', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })
      const unversionedResponse = await app.inject({
        method: 'GET',
        url: '/thread/456',
      })
      const unversionedBody = JSON.parse(unversionedResponse.payload)

      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })
      const app1 = fastify()
      await app1.register(threadRoutesV1)
      const v1Response = await app1.inject({
        method: 'GET',
        url: '/v1/thread/456',
      })
      const v1Body = JSON.parse(v1Response.payload)

      // Both should have identical structure
      expect(unversionedBody).toEqual(v1Body)
      console.log('✓ Unversioned and V1 endpoints return identical responses')
      await app1.close()
    })
  })

  describe('V2 Routes (Current)', () => {
    beforeEach(async () => {
      app = fastify()
      await app.register(threadRoutesV2)
    })

    it('✓ GET /api/v2/thread/:id returns new format with pagination object', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/v2/thread/123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)

      // V2 format: pagination object
      expect(body).toHaveProperty('threadId', '123')
      expect(body).toHaveProperty('posts')
      expect(body).toHaveProperty('pagination')
      expect(Array.isArray(body.posts)).toBe(true)
      expect(body.posts.length).toBe(2)

      // Pagination object structure
      expect(body.pagination).toHaveProperty('page', 1)
      expect(body.pagination).toHaveProperty('totalPages', 3)
      expect(body.pagination).toHaveProperty('hasNext', true)
      expect(body.pagination).toHaveProperty('hasPrevious', false)

      // Posts should NOT have page field (moved to pagination)
      body.posts.forEach((post: any) => {
        expect(post).not.toHaveProperty('page')
        expect(post).toHaveProperty('postId')
        expect(post).toHaveProperty('author')
        expect(post).toHaveProperty('contentText')
      })

      console.log('✓ V2 endpoint returns new format with pagination object')
    })

    it('✓ GET /api/v2/thread/:id has hasNext true when not last page', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/v2/thread/123?page=1',
      })

      const body = JSON.parse(response.payload)
      expect(body.pagination.hasNext).toBe(true)
      expect(body.pagination.hasPrevious).toBe(false)
      console.log('✓ V2 hasNext correct for non-last page')
    })

    it('✓ GET /api/v2/thread/:id has hasNext false on last page', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockLastPageHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/v2/thread/123?page=3',
      })

      const body = JSON.parse(response.payload)
      expect(body.pagination.hasNext).toBe(false)
      expect(body.pagination.hasPrevious).toBe(true)
      console.log('✓ V2 hasNext false on last page')
    })

    it('✓ GET /api/v2/thread/:id respects page query parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockLastPageHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/v2/thread/123?page=3',
      })

      const body = JSON.parse(response.payload)
      expect(body.pagination.page).toBe(3)
      expect(body.pagination.totalPages).toBe(3)
      console.log('✓ V2 respects page query parameter')
    })

    it('✓ GET /api/v2/thread/:id rejects invalid thread ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v2/thread/invalid-id-with-letters',
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.payload)
      expect(body).toHaveProperty('error')
      console.log('✓ V2 rejects invalid thread ID')
    })

    it('✓ GET /api/v2/thread/:id rejects invalid page number', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v2/thread/123?page=9999',
      })

      expect(response.statusCode).toBe(400)
      expect(mockedAxios.get).not.toHaveBeenCalled()
      console.log('✓ V2 rejects unreasonably high page numbers')
    })
  })

  describe('V4 Routes (Simplified content)', () => {
    beforeEach(async () => {
      app = fastify()
      await app.register(threadRoutesV4)
    })

    it('✓ GET /api/v4/thread/:id returns posts with single content field', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/thread/123',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)

      expect(body).toHaveProperty('threadId', '123')
      expect(body).toHaveProperty('posts')
      expect(body).toHaveProperty('pagination')
      expect(body.posts[0]).toHaveProperty('content')
      expect(body.posts[0]).not.toHaveProperty('contentText')
      expect(body.posts[0]).not.toHaveProperty('contentHtml')
    })

    it('✓ GET /api/v4/thread/:id converts blockquote HTML to quote markup', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockQuotedThreadHTML })

      const response = await app.inject({
        method: 'GET',
        url: '/thread/3912208',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.posts[0].content).toContain('[quote="TwistedTrip#5344"]Quoted line one.<br/>Quoted line two.[/quote]')
      expect(body.posts[0].content).toContain('Reply after quote.')
    })
  })

  describe('API Versions Compatibility', () => {
    it('✓ Unversioned, V1, and V2 call ThreadService with same parameters', async () => {
      const app1 = fastify()
      const app2 = fastify()
      const app3 = fastify()

      await app1.register(threadRoutes)
      await app2.register(threadRoutesV1)
      await app3.register(threadRoutesV2)

      // Request unversioned
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })
      await app1.inject({
        method: 'GET',
        url: '/thread/789?page=2',
      })

      const firstCall = mockedAxios.get.mock.calls[0]

      // Request V1
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })
      await app2.inject({
        method: 'GET',
        url: '/v1/thread/789?page=2',
      })

      const secondCall = mockedAxios.get.mock.calls[1]

      // Request V2
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })
      await app3.inject({
        method: 'GET',
        url: '/v2/thread/789?page=2',
      })

      const thirdCall = mockedAxios.get.mock.calls[2]

      // All should fetch same data from service
      expect(firstCall).toEqual(secondCall)
      expect(secondCall).toEqual(thirdCall)
      console.log('✓ All endpoint versions fetch same data from service')

      await app1.close()
      await app2.close()
      await app3.close()
    })

    it('✓ Unversioned and V1 have identical responses (both V1 format)', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })
      const app1 = fastify()
      await app1.register(threadRoutes)
      const unversionedResponse = await app1.inject({
        method: 'GET',
        url: '/thread/999',
      })
      const unversionedBody = JSON.parse(unversionedResponse.payload)

      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })
      const app2 = fastify()
      await app2.register(threadRoutesV1)
      const v1Response = await app2.inject({
        method: 'GET',
        url: '/v1/thread/999',
      })
      const v1Body = JSON.parse(v1Response.payload)

      // Both should be V1 format
      expect(unversionedBody.posts[0]).toHaveProperty('page')
      expect(v1Body.posts[0]).toHaveProperty('page')
      expect(unversionedBody).toEqual(v1Body)

      console.log('✓ Unversioned and V1 responses are identical (V1 format)')

      await app1.close()
      await app2.close()
    })

    it('✓ V2 has different structure (pagination object, no page on posts)', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })
      const app1 = fastify()
      await app1.register(threadRoutesV1)
      const v1Response = await app1.inject({
        method: 'GET',
        url: '/v1/thread/888',
      })
      const v1Body = JSON.parse(v1Response.payload)

      mockedAxios.get.mockResolvedValueOnce({ data: mockThreadHTML })
      const app2 = fastify()
      await app2.register(threadRoutesV2)
      const v2Response = await app2.inject({
        method: 'GET',
        url: '/v2/thread/888',
      })
      const v2Body = JSON.parse(v2Response.payload)

      // V1: posts have page, no pagination object
      expect(v1Body.posts[0]).toHaveProperty('page')
      expect(v1Body).toHaveProperty('page')
      expect(v1Body).toHaveProperty('nextPageUrl')
      expect(v1Body).not.toHaveProperty('pagination')

      // V2: posts don't have page, but pagination object exists
      expect(v2Body.posts[0]).not.toHaveProperty('page')
      expect(v2Body).not.toHaveProperty('page')
      expect(v2Body).not.toHaveProperty('nextPageUrl')
      expect(v2Body).toHaveProperty('pagination')
      expect(v2Body.pagination).toHaveProperty('hasNext')

      // Same thread data
      expect(v1Body.threadId).toBe(v2Body.threadId)
      expect(v1Body.posts.length).toBe(v2Body.posts.length)

      console.log('✓ V2 has distinct structure from V1 (pagination object)')

      await app1.close()
      await app2.close()
    })
  })
})
