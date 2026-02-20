import axios from 'axios'
import { env } from '../config/env'

type CacheEntry = {
  data: string
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const cacheEnabled =
  env.NODE_ENV !== 'test' && env.FETCH_CACHE_TTL_MS > 0 && env.FETCH_CACHE_MAX_ENTRIES > 0

function getCached(url: string): string | null {
  if (!cacheEnabled) {
    return null
  }

  const entry = cache.get(url)
  if (!entry) {
    return null
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(url)
    return null
  }

  return entry.data
}

function setCached(url: string, data: string) {
  if (!cacheEnabled) {
    return
  }

  cache.set(url, {
    data,
    expiresAt: Date.now() + env.FETCH_CACHE_TTL_MS,
  })

  if (cache.size > env.FETCH_CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) {
      cache.delete(oldestKey)
    }
  }
}

function isRetryable(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return true
  }

  const status = error.response?.status
  if (!status) {
    return true
  }

  return status === 429 || status >= 500
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchHtml(url: string): Promise<string> {
  const cached = getCached(url)
  if (cached) {
    return cached
  }

  let attempt = 0
  let lastError: unknown

  while (attempt < env.FETCH_RETRY_MAX) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })
      setCached(url, data)
      return data
    } catch (error) {
      lastError = error

      if (!isRetryable(error) || attempt === env.FETCH_RETRY_MAX - 1) {
        break
      }

      const delay = env.FETCH_RETRY_DELAY_MS * Math.pow(2, attempt)
      await sleep(delay)
      attempt += 1
    }
  }

  throw lastError
}
