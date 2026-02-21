/**
 * API Client Wrappers
 * Wraps generated API functions to support dynamic base URLs
 */

import { getBaseUrl } from './config'
import type { getApiCategoriesResponse200, getApiCategoryCategoryResponse200 } from './generated/categories/categories'
import type { GetApiCategoryCategoryParams } from './generated/api.schemas'
import type { ThreadApiResponseV1, ThreadApiResponseV2, ThreadApiResponseV4 } from './types'

function parseResponseBody<T>(body: string | null): T {
    if (!body) {
        return {} as T
    }

    return JSON.parse(body) as T
}

// Categories API Wrappers

export const getCategoriesV1 = async (options?: RequestInit): Promise<getApiCategoriesResponse200 & { headers: Headers }> => {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/categories`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<getApiCategoriesResponse200['data']>(body)
    return { data, status: res.status, headers: res.headers } as getApiCategoriesResponse200 & { headers: Headers }
}

export const getCategoryV1 = async (
    category: string,
    params?: GetApiCategoryCategoryParams,
    options?: RequestInit
): Promise<getApiCategoryCategoryResponse200 & { headers: Headers }> => {
    const baseUrl = getBaseUrl()
    const queryStr = params?.page ? `?page=${params.page}` : ''
    const url = `${baseUrl}/api/category/${category}${queryStr}`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<getApiCategoryCategoryResponse200['data']>(body)
    return { data, status: res.status, headers: res.headers } as getApiCategoryCategoryResponse200 & { headers: Headers }
}

// Threads API Wrappers

/**
 * Get thread using unversioned endpoint (defaults to V1 format for backwards compatibility)
 * Returns V1 format with page and nextPageUrl
 */
export const getThreadV1 = async (
    id: string,
    page?: string,
    options?: RequestInit
): Promise<ThreadApiResponseV1> => {
    const baseUrl = getBaseUrl()
    const queryStr = page ? `?page=${page}` : ''
    const url = `${baseUrl}/api/thread/${id}${queryStr}`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<ThreadApiResponseV1['data']>(body)
    return { data, status: res.status, headers: res.headers } as ThreadApiResponseV1
}

/**
 * Get thread using explicit V1 API path (deprecated)
 */
export const getThreadV1Deprecated = async (
    id: string,
    page?: string,
    options?: RequestInit
): Promise<ThreadApiResponseV1> => {
    const baseUrl = getBaseUrl()
    const queryStr = page ? `?page=${page}` : ''
    const url = `${baseUrl}/api/v1/thread/${id}${queryStr}`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<ThreadApiResponseV1['data']>(body)
    return { data, status: res.status, headers: res.headers } as ThreadApiResponseV1
}

/**
 * Get thread using V2 API (current format with pagination object)
 * Strongly typed with proper ThreadResponseV2 contract
 */
export const getThreadV2 = async (
    id: string,
    page?: string,
    options?: RequestInit
): Promise<ThreadApiResponseV2> => {
    const baseUrl = getBaseUrl()
    const queryStr = page ? `?page=${page}` : ''
    const url = `${baseUrl}/api/v2/thread/${id}${queryStr}`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<ThreadApiResponseV2['data']>(body)
    return { data, status: res.status, headers: res.headers } as ThreadApiResponseV2
}

/**
 * Get thread using V3 API (unified, recommended)
 * All endpoints (categories + threads) under /api/v3/
 * Returns pagination object with totalPages, hasNext, hasPrevious, pageSize
 */
export const getThreadV3 = async (
    id: string,
    page?: string,
    options?: RequestInit
): Promise<ThreadApiResponseV2> => {
    const baseUrl = getBaseUrl()
    const queryStr = page ? `?page=${page}` : ''
    const url = `${baseUrl}/api/v3/thread/${id}${queryStr}`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<ThreadApiResponseV2['data']>(body)
    return { data, status: res.status, headers: res.headers } as ThreadApiResponseV2
}

/**
 * Get thread using V4 API (single content field on posts)
 */
export const getThreadV4 = async (
    id: string,
    page?: string,
    options?: RequestInit
): Promise<ThreadApiResponseV4> => {
    const baseUrl = getBaseUrl()
    const queryStr = page ? `?page=${page}` : ''
    const url = `${baseUrl}/api/v4/thread/${id}${queryStr}`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<ThreadApiResponseV4['data']>(body)
    return { data, status: res.status, headers: res.headers } as ThreadApiResponseV4
}

/**
 * Get categories using V3 API (unified)
 * All endpoints under /api/v3/
 */
export const getCategoriesV3 = async (options?: RequestInit): Promise<getApiCategoriesResponse200 & { headers: Headers }> => {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/v3/categories`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<getApiCategoriesResponse200['data']>(body)
    return { data, status: res.status, headers: res.headers } as getApiCategoriesResponse200 & { headers: Headers }
}

/**
 * Get category using V3 API (unified)
 * All endpoints under /api/v3/
 */
export const getCategoryV3 = async (
    category: string,
    page?: string,
    options?: RequestInit
): Promise<getApiCategoryCategoryResponse200 & { headers: Headers }> => {
    const baseUrl = getBaseUrl()
    const queryStr = page ? `?page=${page}` : ''
    const url = `${baseUrl}/api/v3/category/${category}${queryStr}`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<getApiCategoryCategoryResponse200['data']>(body)
    return { data, status: res.status, headers: res.headers } as getApiCategoryCategoryResponse200 & { headers: Headers }
}

/**
 * Get categories using V4 API surface
 */
export const getCategoriesV4 = async (options?: RequestInit): Promise<getApiCategoriesResponse200 & { headers: Headers }> => {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/v4/categories`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<getApiCategoriesResponse200['data']>(body)
    return { data, status: res.status, headers: res.headers } as getApiCategoriesResponse200 & { headers: Headers }
}

/**
 * Get category using V4 API surface
 */
export const getCategoryV4 = async (
    category: string,
    params?: GetApiCategoryCategoryParams,
    options?: RequestInit
): Promise<getApiCategoryCategoryResponse200 & { headers: Headers }> => {
    const baseUrl = getBaseUrl()
    const queryStr = params?.page ? `?page=${params.page}` : ''
    const url = `${baseUrl}/api/v4/category/${category}${queryStr}`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data = parseResponseBody<getApiCategoryCategoryResponse200['data']>(body)
    return { data, status: res.status, headers: res.headers } as getApiCategoryCategoryResponse200 & { headers: Headers }
}

// Re-export types
export type { getApiCategoriesResponse200, getApiCategoryCategoryResponse200 } from './generated/categories/categories'
export type { ThreadApiResponse, ThreadApiResponseV1, ThreadApiResponseV2, ThreadApiResponseV4, ThreadResponseV1, ThreadResponseV2, ThreadResponseV4, Post, PostV1, PostV4, ApiResponse } from './types'
