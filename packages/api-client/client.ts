/**
 * API Client Wrappers
 * Wraps generated API functions to support dynamic base URLs
 */

import { getBaseUrl } from './config'
import * as generatedCategories from './generated/categories/categories'
import * as generatedThreads from './generated/threads/threads'
import type { getCategoriesResponse, getCategoryResponse } from './generated/categories/categories'
import type { getThreadResponse } from './generated/threads/threads'
import type { GetCategoryParams, GetThreadParams } from './generated/api.schemas'

const DEFAULT_BASE_URL = 'http://localhost:3000'

/**
 * Replace the default base URL with the configured one in URL strings
 */
function replaceBaseUrl(url: string): string {
    return url.replace(DEFAULT_BASE_URL, getBaseUrl())
}

// Categories API Wrappers

export const getCategories = async (options?: RequestInit): Promise<getCategoriesResponse> => {
    const url = generatedCategories.getGetCategoriesUrl()
    const configuredUrl = replaceBaseUrl(url)

    const res = await fetch(configuredUrl, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data: getCategoriesResponse['data'] = body ? JSON.parse(body) : {}
    return { data, status: res.status, headers: res.headers } as getCategoriesResponse
}

export const getCategory = async (
    category: string,
    params?: GetCategoryParams,
    options?: RequestInit
): Promise<getCategoryResponse> => {
    const url = generatedCategories.getGetCategoryUrl(category, params)
    const configuredUrl = replaceBaseUrl(url)

    const res = await fetch(configuredUrl, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data: getCategoryResponse['data'] = body ? JSON.parse(body) : {}
    return { data, status: res.status, headers: res.headers } as getCategoryResponse
}

// Threads API Wrappers

export const getThread = async (
    id: string,
    params?: GetThreadParams,
    options?: RequestInit
): Promise<getThreadResponse> => {
    const url = generatedThreads.getGetThreadUrl(id, params)
    const configuredUrl = replaceBaseUrl(url)

    const res = await fetch(configuredUrl, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data: getThreadResponse['data'] = body ? JSON.parse(body) : {}
    return { data, status: res.status, headers: res.headers } as getThreadResponse
}

/**
 * Get thread using V1 API (deprecated format with page on posts and nextPageUrl)
 */
export const getThreadV1 = async (
    id: string,
    params?: GetThreadParams,
    options?: RequestInit
): Promise<getThreadResponse> => {
    const baseUrl = getBaseUrl()
    const queryStr = params?.page ? `?page=${params.page}` : ''
    const url = `${baseUrl}/api/v1/thread/${id}${queryStr}`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data: getThreadResponse['data'] = body ? JSON.parse(body) : {}
    return { data, status: res.status, headers: res.headers } as getThreadResponse
}

/**
 * Get thread using V2 API (current format with pagination object)
 */
export const getThreadV2 = async (
    id: string,
    params?: GetThreadParams,
    options?: RequestInit
): Promise<getThreadResponse> => {
    const baseUrl = getBaseUrl()
    const queryStr = params?.page ? `?page=${params.page}` : ''
    const url = `${baseUrl}/api/v2/thread/${id}${queryStr}`

    const res = await fetch(url, {
        ...options,
        method: 'GET',
    })

    const body = [204, 205, 304].includes(res.status) ? null : await res.text()
    const data: getThreadResponse['data'] = body ? JSON.parse(body) : {}
    return { data, status: res.status, headers: res.headers } as getThreadResponse
}

// Re-export types
export type { getCategoriesResponse, getCategoryResponse, getThreadResponse }
