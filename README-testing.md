# Playwright Testing Setup

This project now has Playwright e2e testing configured.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Basic test run:
```bash
npm run test
```

### Run with UI mode (interactive):
```bash
npm run test:ui
```

### Run in headed mode (see browser):
```bash
npm run test:headed
```

### Debug mode:
```bash
npm run test:debug
```

### Windows batch file:
```bash
run-tests.bat
```

## Test Files

- `tests/example.spec.ts` - Basic homepage tests
- `tests/company-management.spec.ts` - Company CRUD interface tests
- `tests/financial-dashboard.spec.ts` - Financial management interface tests

## Configuration

The `playwright.config.ts` file is configured to:
- Run tests against http://localhost:3003
- Start the dev server automatically before tests
- Run tests in Chromium, Firefox, and WebKit
- Generate HTML reports

## Notes

- Tests assume the Next.js dev server is available on port 3003
- The web server will be started automatically when running tests
- Tests are designed to be resilient and check for content that may or may not be present
- Modify tests based on your actual UI components and content