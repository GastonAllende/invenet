# E2E Testing - Fresh Start

## Quick Start

```bash
# Run the smoke test
npx nx e2e invenet-e2e --spec src/smoke.spec.ts

# Run all auth tests
npx nx e2e invenet-e2e --spec src/tests/auth.spec.ts

# Run in UI mode (recommended)
npx nx e2e invenet-e2e --ui
```

## What We Have

### Page Objects (`src/pages/`)

- **LoginPage** - Simple login functionality
- **RegisterPage** - Simple registration functionality
- **HomePage** - Home page with auth verification

### Tests

- **smoke.spec.ts** - Quick end-to-end test
- **tests/auth.spec.ts** - Core authentication tests (5 tests)

## Test Structure

All tests follow this pattern:

```typescript
import { test, expect } from '../fixtures';
import { generateTestUser } from '../helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ authHelper }) => {
    await authHelper.clearAuth();
  });

  test('test name', async ({ registerPage, loginPage, homePage }) => {
    const user = generateTestUser();

    await registerPage.goto();
    await registerPage.register(user.email, user.username, user.password);
    await homePage.expectToBeAuthenticated();
  });
});
```

## Adding New Tests

1. Use the existing fixtures (page objects auto-injected)
2. Use `generateTestUser()` for unique test data
3. Clear auth state in `beforeEach`
4. Keep tests simple and focused

## Locators Used

- `#email` - Email input
- `#username` - Username input
- `#password input` - Password input (PrimeNG component)
- `#confirmPassword input` - Confirm password input
- `getByRole('button', { name: 'Sign in' })` - Submit buttons

## Tips

- Tests wait for `networkidle` after actions
- All page objects handle navigation automatically
- `authHelper` manages localStorage tokens
- Keep tests independent - each can run alone

**That's it! Simple, working tests.** 🎯
