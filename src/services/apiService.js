import API_CONFIG from '../config/api';

/**
 * Custom error class for API-related errors.
 * Includes status and data from the backend response.
 */
export class ApiError extends Error {
    constructor(message, status = null, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Helper function to make API requests.
 * @param {string} endpoint - The API endpoint to call (e.g., '/transactions').
 * @param {object} options - Fetch options (method, headers, body, etc.).
 * @returns {Promise<object>} - The parsed JSON response data.
 * @throws {ApiError} If the API request fails or returns an error status.
 */
async function request(endpoint, options) {
    const url = API_CONFIG.getApiUrl(endpoint);

    try {
        // Debug init
        try {
            console.debug('[apiService.request] init', {
                url,
                method: options && options.method,
                headers: options && options.headers
            });
        } catch (_) {}

        const response = await fetch(url, options);

        // Debug response meta
        try {
            console.debug('[apiService.request] resp', {
                status: response.status,
                ok: response.ok,
                contentType: response.headers.get('content-type')
            });
        } catch (_) {}

        let data = null;

        try {
            // Attempt to parse JSON, but it might not always be present or valid
            data = await response.json();
        } catch (e) {
            // If JSON parsing fails, data remains null or empty
            console.warn(`Failed to parse JSON response for ${url}:`, e);
        }

        if (!response.ok) {
            let errorMessage = `API request failed with status ${response.status}`;
            if (data) {
                const errorValue = data.error || data.message;
                if (typeof errorValue === 'string') {
                    errorMessage = errorValue;
                } else if (errorValue != null) {
                    errorMessage = JSON.stringify(errorValue);
                }
            }
            throw new ApiError(errorMessage, response.status, data);
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error; // Re-throw custom API errors
        } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
            // This usually indicates a network error or CORS issue
            throw new ApiError("Network error or failed to connect to API.", 0, null);
        } else {
            // Catch any other unexpected errors
            throw new ApiError(`An unexpected error occurred: ${error.message}`, 0, null);
        }
    }
}

/**
 * Performs a GET request to the specified endpoint.
 * @param {string} endpoint - The API endpoint.
 * @param {object} [params] - Optional URL parameters.
 * @returns {Promise<object>} - The parsed JSON response data.
 */
export async function get(endpoint, params) {
    const baseUrl = API_CONFIG.getApiUrl(endpoint);

    // Handle case where baseUrl is empty (same-origin requests)
    if (!baseUrl) {
        const url = new URL(endpoint, window.location.origin);
        if (params) {
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        }
        return request(url.pathname + url.search, { method: 'GET' });
    }

    const url = new URL(baseUrl);
    if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    return request(url.pathname + url.search, { method: 'GET' });
}

/**
 * Performs a POST request to the specified endpoint.
 * @param {string} endpoint - The API endpoint.
 * @param {object} [data] - The data to send in the request body.
 * @param {object} [headers] - Optional additional headers.
 * @returns {Promise<object>} - The parsed JSON response data.
 */
export async function post(endpoint, data, headers = {}) {
    // Handle FormData differently - don't set Content-Type, let browser set it with boundary
    const isFormData = data instanceof FormData;

    // Start with a copy of headers and remove any Content-Type if using FormData
    const sanitizedHeaders = { ...headers };
    if (isFormData) {
        Object.keys(sanitizedHeaders).forEach((k) => {
            if (k.toLowerCase() === 'content-type') {
                delete sanitizedHeaders[k];
            }
        });
    }

    const requestHeaders = isFormData ? sanitizedHeaders : {
        'Content-Type': 'application/json',
        ...sanitizedHeaders,
    };

    // Minimal diagnostics for uploads
    if (isFormData) {
        try {
            console.debug('[apiService.post] FormData upload', {
                endpoint,
                hasFile: typeof data.has === 'function' ? data.has('file') : false
            });
        } catch (_) {}
    }

    return request(endpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: isFormData ? data : JSON.stringify(data),
    });
}

/**
 * Performs a PUT request to the specified endpoint.
 * @param {string} endpoint - The API endpoint.
 * @param {object} [data] - The data to send in the request body.
 * @param {object} [headers] - Optional additional headers.
 * @returns {Promise<object>} - The parsed JSON response data.
 */
export async function put(endpoint, data, headers = {}) {
    return request(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(data),
    });
}

/**
 * Performs a DELETE request to the specified endpoint.
 * @param {string} endpoint - The API endpoint.
 * @param {object} [data] - Optional data to send in the request body (less common for DELETE).
 * @param {object} [headers] - Optional additional headers.
 * @returns {Promise<object>} - The parsed JSON response data.
 */
export async function remove(endpoint, data, headers = {}) { // Renamed to 'remove' to avoid conflict with 'delete' keyword
    return request(endpoint, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
    });
}