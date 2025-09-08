// API Configuration
// This file contains the API base URL configuration for different environments
// You can modify the URLs below to match your deployment setup

const API_CONFIG = {
  // Development API URL - used when running 'npm run dev'
  // This is typically where your local backend server is running
  DEV_API_URL: 'http://localhost:5000', // Backend base origin (path handled below)
  
  // Production API URL - used when running 'npm run build' and deploying
  // Replace this with your actual production API URL
  PROD_API_URL: 'http://localhost:5000',
  
  // Get the appropriate API base URL based on the current environment
  getApiBaseUrl: () => {
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      return API_CONFIG.DEV_API_URL;
    }

    // Check if we're in production mode
    if (import.meta.env.PROD) {
      // If we're being served by the backend (same origin), use relative URLs
      // This handles the case where the frontend is served by Flask
      if (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) {
        return ''; // Use relative URLs for same-origin requests
      }
      return API_CONFIG.PROD_API_URL;
    }

    // Default fallback to development URL
    return API_CONFIG.DEV_API_URL;
  },
  
  // Get the full API URL for a given endpoint
  // This function ensures proper URL construction regardless of how the base URL is configured
  getApiUrl: (endpoint) => {
    // Always hit the Flask blueprint prefix `/api`.
    // Avoid duplicating if the endpoint already includes it.
    const baseUrl = API_CONFIG.getApiBaseUrl();

    // Normalize endpoint
    const clean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const withApi = clean.startsWith('api/') ? clean : `api/${clean}`;

    // Build absolute URL to satisfy consumers using `new URL()`
    if (!baseUrl) {
      // Same-origin: use window.location.origin
      const origin = (typeof window !== 'undefined' && window.location && window.location.origin)
        ? window.location.origin
        : '';
      return `${origin}/${withApi}`;
    }

    // External/base origin provided
    const formattedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    // If base already ends with /api or /api/, don't add api twice
    const baseHasApi = /\/api\/?$/.test(formattedBase);
    const endpointPath = baseHasApi ? clean : withApi;
    return `${formattedBase}${endpointPath}`;
  }
};

export default API_CONFIG;
