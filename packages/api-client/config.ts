/**
 * API Client Configuration
 * Manages runtime settings for the generated API client
 */

let apiBaseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}`
    : 'http://localhost:3000'

/**
 * Set the base URL for API requests
 * @param baseUrl - The base URL for API requests (e.g., 'https://api.example.com')
 */
export function setBaseUrl(baseUrl: string): void {
    apiBaseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash if present
}

/**
 * Get the current base URL
 */
export function getBaseUrl(): string {
    return apiBaseUrl
}

/**
 * Reset to default base URL
 */
export function resetBaseUrl(): void {
    apiBaseUrl = typeof window !== 'undefined'
        ? `${window.location.origin}`
        : 'http://localhost:3000'
}
