# Maria Conciliadora Frontend Tests

This directory contains Playwright end-to-end tests for the Maria Conciliadora frontend application.

## Test Structure

### Test Files
- `transactions-list.spec.js` - Tests for the TransactionsList component
- `file-upload.spec.js` - Tests for the FileUpload component
- `navigation-layout.spec.js` - Tests for navigation and layout components
- `dialog-components.spec.js` - Tests for dialog/modal components
- `integration.spec.js` - Integration tests across multiple components

### Mock Infrastructure
- `mocks/mockData.js` - Mock data fixtures for all API responses
- `mocks/mockServer.js` - API mocking utilities using Playwright's request interception
- `global-setup.js` - Global test setup configuration

## Running Tests

### Prerequisites
- Node.js and pnpm installed
- Frontend dependencies installed (`pnpm install`)

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests with UI mode
pnpm test:ui

# Run tests in headed mode (visible browser)
pnpm test:headed

# Run tests in debug mode
pnpm test:debug

# Run only integration tests
pnpm test:integration

# Run only component tests
pnpm test:unit

# Run smoke tests
pnpm test:smoke

# Run tests for CI (GitHub Actions)
pnpm test:ci

# Show test report
pnpm test:report
```

## API Mocking

All tests use API mocking to avoid dependency on a live backend server. The mocking infrastructure includes:

### Mocked Endpoints
- `GET /api/transactions` - Transaction list with pagination
- `PUT /api/transactions/:id` - Update transaction
- `POST /api/upload-ofx` - Upload OFX files
- `POST /api/upload-xlsx` - Upload XLSX files
- `GET /api/company-financial` - Financial entries
- `GET /api/company-financial/summary` - Financial summary
- `GET /api/summary` - General summary
- `GET /api/insights` - AI insights

### Mock Data
Mock data is defined in `mocks/mockData.js` and includes:
- Sample transactions with various states (anomalies, reconciliations)
- Financial entries for company tracking
- Summary data with categories and banks
- Error responses for testing error scenarios

## Test Configuration

### Playwright Configuration (`playwright.config.js`)
- Runs tests in parallel for speed
- Uses HTML reporter
- Configured for multiple browsers (Chromium, Firefox, WebKit)
- Includes mobile viewport testing
- Global setup for API mocking

### Test Setup
Each test file includes:
1. API mocking setup in `beforeEach`
2. Navigation to the application
3. Component-specific test scenarios

## Writing New Tests

### Adding API Mocks
1. Add mock data to `mocks/mockData.js`
2. Add route interception in `mocks/mockServer.js`
3. Import and use `setupApiMocks()` in test `beforeEach`

### Adding Component Tests
1. Create new test file with `.spec.js` extension
2. Follow the existing pattern:
   - Import required utilities
   - Setup API mocking
   - Navigate to relevant section
   - Test component functionality

### Best Practices
- Use `data-testid` attributes for reliable element selection
- Avoid fixed timeouts - use proper wait strategies
- Test both success and error scenarios
- Include accessibility testing where possible
- Test responsive design across viewports

## Backend Integration Testing

For full integration testing with a live backend:

1. Start the backend server (see backend documentation)
2. Comment out API mocking in test files
3. Run tests with backend URL configured

### Environment Variables
- `BACKEND_URL` - Backend server URL for integration tests
- `CI` - Set to `true` for CI environment

## Troubleshooting

### Common Issues

1. **Tests failing due to selector changes**
   - Add `data-testid` attributes to components
   - Update selectors in test files

2. **API calls not mocked**
   - Ensure `setupApiMocks()` is called in `beforeEach`
   - Check that endpoint URLs match mock routes

3. **Flaky tests**
   - Replace fixed timeouts with proper waits
   - Use `page.waitForFunction()` for dynamic content
   - Add retry mechanisms for network-dependent tests

4. **Browser compatibility issues**
   - Test across all configured browsers
   - Use Playwright's browser-specific APIs when needed

### Debug Mode
```bash
# Run specific test in debug mode
pnpm test --debug --grep "test name"

# Run with headed browser
pnpm test:headed --grep "test name"
```

## Contributing

When adding new features:
1. Add corresponding tests
2. Update mock data if new API endpoints are added
3. Ensure tests pass across all browsers
4. Update this documentation as needed

## Test Coverage

Current test coverage includes:
- Component rendering and interactions
- Data filtering and sorting
- Form submissions and validation
- Error handling scenarios
- Responsive design
- Accessibility features
- Integration between components