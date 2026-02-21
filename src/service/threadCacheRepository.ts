import crypto from 'crypto'
import { Prisma, PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import type { ThreadPage } from '../domain/thread'

export interface CachedThreadPage {
  page: ThreadPage
  cachedAt: string
}

export interface ThreadCacheRepository {
  getThreadPage(threadId: string, pageNumber: number): Promise<CachedThreadPage | null>
  upsertThreadPage(threadPage: ThreadPage): Promise<void>
}

type ThreadPagePostMapping = {
  indexOnPage: number
  post: {
    postId: string
    threadId: string
    author: string
    createdAt: Date
    contentText: string
    contentHtml: string
    isDeleted: boolean
  }
}

type PostIdMapping = { postId: string }

const CREATE_THREAD_PAGES_SQL = `
CREATE TABLE IF NOT EXISTS thread_pages (
  thread_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  title TEXT,
  total_pages INTEGER NOT NULL,
  has_next BOOLEAN NOT NULL,
  has_previous BOOLEAN NOT NULL,
  page_size INTEGER NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (thread_id, page_number)
);
`

const CREATE_POSTS_SQL = `
CREATE TABLE IF NOT EXISTS posts (
  thread_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  content_text TEXT NOT NULL,
  content_html TEXT NOT NULL,
  index_on_page INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (thread_id, post_id)
);
`

const CREATE_THREAD_PAGE_POSTS_SQL = `
CREATE TABLE IF NOT EXISTS thread_page_posts (
  thread_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  post_id TEXT NOT NULL,
  index_on_page INTEGER NOT NULL,
  PRIMARY KEY (thread_id, page_number, post_id),
  FOREIGN KEY (thread_id, page_number)
    REFERENCES thread_pages(thread_id, page_number)
    ON DELETE CASCADE,
  FOREIGN KEY (thread_id, post_id)
    REFERENCES posts(thread_id, post_id)
    ON DELETE CASCADE
);
`

class PostgresThreadCacheRepository implements ThreadCacheRepository {
  private readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getThreadPage(threadId: string, pageNumber: number): Promise<CachedThreadPage | null> {
    const pageRow = await this.prisma.threadPage.findUnique({
      where: {
        threadId_pageNumber: {
          threadId,
          pageNumber,
        },
      },
      include: {
        posts: {
          include: {
            post: true,
          },
          orderBy: {
            indexOnPage: 'asc',
          },
        },
      },
    })

    if (!pageRow) {
      return null
    }

    return {
      cachedAt: pageRow.cachedAt.toISOString(),
      page: {
        threadId: pageRow.threadId,
        ...(pageRow.title ? { title: pageRow.title } : {}),
        posts: (pageRow.posts as ThreadPagePostMapping[])
          .filter((mapping: ThreadPagePostMapping) => !mapping.post.isDeleted)
          .map((mapping: ThreadPagePostMapping) => ({
            postId: mapping.post.postId,
            threadId: mapping.post.threadId,
            author: mapping.post.author,
            createdAt: mapping.post.createdAt.toISOString(),
            contentText: mapping.post.contentText,
            contentHtml: mapping.post.contentHtml,
            indexOnPage: mapping.indexOnPage,
          })),
        pagination: {
          page: pageRow.pageNumber,
          totalPages: pageRow.totalPages,
          hasNext: pageRow.hasNext,
          hasPrevious: pageRow.hasPrevious,
          pageSize: pageRow.pageSize,
        },
      },
    }
  }

  async upsertThreadPage(threadPage: ThreadPage): Promise<void> {
    const now = new Date()

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.threadPage.upsert({
        where: {
          threadId_pageNumber: {
            threadId: threadPage.threadId,
            pageNumber: threadPage.pagination.page,
          },
        },
        create: {
          threadId: threadPage.threadId,
          pageNumber: threadPage.pagination.page,
          title: threadPage.title ?? null,
          totalPages: threadPage.pagination.totalPages,
          hasNext: threadPage.pagination.hasNext,
          hasPrevious: threadPage.pagination.hasPrevious,
          pageSize: threadPage.pagination.pageSize ?? threadPage.posts.length,
          cachedAt: now,
        },
        update: {
          title: threadPage.title ?? null,
          totalPages: threadPage.pagination.totalPages,
          hasNext: threadPage.pagination.hasNext,
          hasPrevious: threadPage.pagination.hasPrevious,
          pageSize: threadPage.pagination.pageSize ?? threadPage.posts.length,
          cachedAt: now,
        },
      })

      for (const post of threadPage.posts) {
        const contentHash = this.hashContent(post.contentText, post.contentHtml)

        const existingPost = await tx.post.findUnique({
          where: {
            threadId_postId: {
              threadId: post.threadId,
              postId: post.postId,
            },
          },
        })

        if (!existingPost) {
          await tx.post.create({
            data: {
              threadId: post.threadId,
              postId: post.postId,
              author: post.author,
              createdAt: new Date(post.createdAt),
              contentText: post.contentText,
              contentHtml: post.contentHtml,
              indexOnPage: post.indexOnPage,
              contentHash,
              firstSeenAt: now,
              lastSeenAt: now,
              lastChangedAt: now,
              isDeleted: false,
            },
          })
        } else {
          await tx.post.update({
            where: {
              threadId_postId: {
                threadId: post.threadId,
                postId: post.postId,
              },
            },
            data: {
              author: post.author,
              createdAt: new Date(post.createdAt),
              contentText: post.contentText,
              contentHtml: post.contentHtml,
              indexOnPage: post.indexOnPage,
              lastSeenAt: now,
              isDeleted: false,
              lastChangedAt:
                existingPost.contentHash !== contentHash
                  ? now
                  : existingPost.lastChangedAt,
              contentHash,
            },
          })
        }

        await tx.threadPagePost.upsert({
          where: {
            threadId_pageNumber_postId: {
              threadId: post.threadId,
              pageNumber: threadPage.pagination.page,
              postId: post.postId,
            },
          },
          create: {
            threadId: post.threadId,
            pageNumber: threadPage.pagination.page,
            postId: post.postId,
            indexOnPage: post.indexOnPage,
          },
          update: {
            indexOnPage: post.indexOnPage,
          },
        })
      }

      const postIdsOnPage = threadPage.posts.map((post) => post.postId)
      await this.markRemovedPostsAsDeleted(
        tx,
        threadPage.threadId,
        threadPage.pagination.page,
        postIdsOnPage,
        now
      )
    })
  }

  private async markRemovedPostsAsDeleted(
    tx: Prisma.TransactionClient,
    threadId: string,
    pageNumber: number,
    postIdsOnPage: string[],
    now: Date
  ): Promise<void> {
    const mappings = (await tx.threadPagePost.findMany({
      where: {
        threadId,
        pageNumber,
      },
      select: {
        postId: true,
      },
    })) as PostIdMapping[]

    const removedPostIds = mappings
      .map((mapping: PostIdMapping) => mapping.postId)
      .filter((postId: string) => !postIdsOnPage.includes(postId))

    if (removedPostIds.length === 0) {
      return
    }

    await tx.threadPagePost.deleteMany({
      where: {
        threadId,
        pageNumber,
        postId: {
          in: removedPostIds,
        },
      },
    })

    await tx.post.updateMany({
      where: {
        threadId,
        postId: {
          in: removedPostIds,
        },
      },
      data: {
        isDeleted: true,
        lastSeenAt: now,
      },
    })
  }

  private hashContent(contentText: string, contentHtml: string): string {
    return crypto
      .createHash('sha256')
      .update(contentText)
      .update('|')
      .update(contentHtml)
      .digest('hex')
  }
}

let cacheRepositoryPromise: Promise<ThreadCacheRepository | null> | null = null

export function createThreadCacheRepository(): Promise<ThreadCacheRepository | null> {
  if (cacheRepositoryPromise) {
    return cacheRepositoryPromise
  }

  cacheRepositoryPromise = (async () => {
    if (!env.THREAD_CACHE_ENABLED || !env.DATABASE_URL) {
      return null
    }

    const databaseUrl = getPrismaDatabaseUrl(env.DATABASE_URL, env.DATABASE_SSL)
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    })

    await prisma.$executeRawUnsafe(CREATE_THREAD_PAGES_SQL)
    await prisma.$executeRawUnsafe(CREATE_POSTS_SQL)
    await prisma.$executeRawUnsafe(CREATE_THREAD_PAGE_POSTS_SQL)

    return new PostgresThreadCacheRepository(prisma)
  })().catch((error) => {
    console.error('⚠️ Failed to initialize thread cache repository:', error)
    return null
  })

  return cacheRepositoryPromise
}

function getPrismaDatabaseUrl(databaseUrl: string, useSsl: boolean): string {
  if (!useSsl || databaseUrl.includes('sslmode=')) {
    return databaseUrl
  }

  const separator = databaseUrl.includes('?') ? '&' : '?'
  return `${databaseUrl}${separator}sslmode=require`
}
