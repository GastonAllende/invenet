# E2E Testing Documentation

## Overview

This directory contains end-to-end tests for the Invenet application using Playwright. The tests follow best practices with Page Object Model (POM) pattern, custom fixtures, and organized test structure.

## Directory Structure

```
src/
├── fixtures/          # Custom Playwright fixtures
│   └── index.ts      # Extended test with page objects and helpers
├── helpers/          # Utility functions and test data
│   ├── auth.helper.ts    # Authentication utilities
│   ├── test-data.ts      # Test data generators
│   └── index.ts
├── pages/            # Page Object Models
│   ├── login.page.ts     # Login page POM
│   ├── register.page.ts  # Register page POM
│   ├── home.page.ts      # Home page POM
│   └── index.ts
├── tests/            # Test specifications
│   ├── login.spec.ts     # Login flow tests
│   ├── register.spec.ts  # Registration tests
│   └── logout.spec.ts    # Logout tests
└── smoke.spec.ts     # Smoke tests
```

## Running Tests

### Run all tests

```bash
npx nx e2e invenet-e2e
```

### Run tests in UI mode (recommended for development)

```bash
npx nx e2e invenet-e2e --ui
```

### Run specific test file

```bash
npx nx e2e invenet-e2e --spec src/tests/login.spec.ts
```

### Run tests in headed mode (see browser)

```bash
npx nx e2e invenet-e2e --headed
```

### Run tests in specific browser

```bash
npx nx e2e invenet-e2e --project=chromium
npx nx e2e invenet-e2e --project=firefox
npx nx e2e invenet-e2e --project=webkit
```

### Debug tests

```bash
npx nx e2e invenet-e2e --debug
```

## Test Structure Best Practices

### 1. Page Object Model (POM)

Each page in the application has a corresponding Page Object class that encapsulates:

- Locators for page elements
- Actions that can be performed on the page
- Assertions specific to that page

**Example:**

```typescript
import { test, expect } from './fixtures';

test('login test', async ({ loginPage, homePage }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await homePage.expectToBeOnPage();
});
```

### 2. Custom Fixtures

Custom fixtures provide pre-initialized page objects and helpers, reducing boilerplate code:

```typescript
import { test, expect } from './fixtures';

test('my test', async ({
  loginPage, // Pre-initialized LoginPage
  registerPage, // Pre-initialized RegisterPage
  homePage, // Pre-initialized HomePage
  authHelper, // Authentication utilities
}) => {
  // Test code...
});
```

### 3. Test Data Helpers

Use helpers to generate unique test data:

```typescript
import { generateTestUser } from './helpers';

const user = generateTestUser(); // Generates unique email, username, password
```

### 4. Authentication Helper

Manage authentication state with `AuthHelper`:

```typescript
// Wait for auth to complete
await authHelper.waitForAuthComplete();

// Check if authenticated
const isAuth = await authHelper.isAuthenticated();

// Get stored tokens
const tokens = await authHelper.getStoredTokens();

// Clear authentication
await authHelper.clearAuth();
```

## Test Organization

### Login Tests (`login.spec.ts`)

- ✅ Display login page correctly
- ✅ Successful login with valid credentials
- ✅ Failed login with invalid credentials
- ✅ Email validation
- ✅ Empty field validation
- ✅ Navigation to register page
- ✅ Password visibility toggle
- ✅ Persistent authentication
- ✅ Concurrent login requests
- ✅ Email whitespace trimming

### Registration Tests (`register.spec.ts`)

- ✅ Display registration page correctly
- ✅ Successful registration with valid data
- ✅ Password mismatch validation
- ✅ Duplicate email validation
- ✅ Invalid email format validation
- ✅ Weak password validation
- ✅ Empty field validation
- ✅ Navigation to login page
- ✅ Input whitespace trimming
- ✅ Password security criteria

### Logout Tests (`logout.spec.ts`)

- ✅ Successful logout and token clearing
- ✅ Protected route access after logout
- ✅ Session invalidation
- ✅ Handle logout when already logged out
- ✅ Separate sessions in different tabs

## Writing New Tests

### 1. Create a new test file in `src/tests/`

```typescript
import { test, expect } from '../fixtures';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ authHelper }) => {
    await authHelper.clearAuth();
  });

  test('should do something', async ({ loginPage, homePage }) => {
    // Your test code
  });
});
```

### 2. Add new page objects when needed

If testing a new page, create a new POM in `src/pages/`:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class NewPage {
  readonly page: Page;
  readonly someElement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.someElement = page.getByRole('button', { name: 'Submit' });
  }

  async goto() {
    await this.page.goto('/new-page');
  }

  async expectToBeOnPage() {
    await expect(this.page).toHaveURL(/\/new-page/);
  }
}
```

### 3. Update fixtures if needed

Add the new page to fixtures in `src/fixtures/index.ts`:

```typescript
export const test = base.extend<CustomFixtures>({
  // ... existing fixtures
  newPage: async ({ page }, use) => {
    const newPage = new NewPage(page);
    await use(newPage);
  },
});
```

## Configuration

Configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:4200` (configurable via `BASE_URL` env var)
- **Timeout**: 30s per test
- **Screenshots**: Captured on failure
- **Videos**: Retained on failure
- **Traces**: Captured on first retry

## Best Practices

1. **Use Page Objects**: Never use selectors directly in tests
2. **Generate Unique Data**: Use `generateTestUser()` for unique test data
3. **Clean State**: Clear auth state in `beforeEach` hooks
4. **Descriptive Names**: Use clear, descriptive test names
5. **Independent Tests**: Each test should be able to run independently
6. **Assertions**: Use expect assertions from fixtures
7. **Wait for State**: Use `waitForAuthComplete()` after login/register
8. **Avoid Hard Waits**: Use Playwright's auto-waiting features

## Troubleshooting

### Tests fail with "Cannot find page"

- Ensure the dev server is running on `http://localhost:4200`
- Check `webServer` configuration in `playwright.config.ts`

### Authentication issues

- Clear browser state with `authHelper.clearAuth()`
- Check localStorage for token data
- Verify API is running on `http://localhost:5256`

### Flaky tests

- Use Playwright's built-in waiting mechanisms
- Avoid `page.waitForTimeout()` - use `waitForSelector()` instead
- Check for race conditions in async operations

### Debug a specific test

```bash
npx playwright test src/tests/login.spec.ts --debug
```

## CI/CD Integration

To run tests in CI:

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run tests
npx nx e2e invenet-e2e --ci
```

## Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

---

**Happy Testing! 🎭**
