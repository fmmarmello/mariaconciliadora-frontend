// Global setup for Playwright tests
// This file runs before all tests and can be used for global configuration

export default async function globalSetup() {
  // Global setup can be used for:
  // - Setting up test databases
  // - Starting external services
  // - Global test data initialization
  // - Environment validation

  console.log('🚀 Starting Playwright test suite with API mocking enabled');

  // You can add global setup logic here if needed
  // For now, we just log that mocking is enabled
}