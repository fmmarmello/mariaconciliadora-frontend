// API Configuration
// This file contains the API base URL configuration for different environments
// You can modify the URLs below to match your deployment setup

const API_CONFIG = {
  // Development API URL - used when running 'npm run dev'
  // This is typically where your local backend server is running
  DEV_API_URL: 'http://localhost:5000', // Changed from 5173 to 5000 as 5173 is the frontend port
  
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
    // Get the base URL for the current environment
    const baseUrl = API_CONFIG.getApiBaseUrl();
    
    // Remove leading slash from endpoint if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Ensure the base URL ends with a slash
    const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    
    // Construct and return the full URL
    return `${formattedBaseUrl}${cleanEndpoint}`;
  }
};

export default API_CONFIG;