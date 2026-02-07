# E2E Testing Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Prerequisites

Ensure both the frontend and backend are running:

```bash
# From project root
npm run dev
```

This starts:

- Frontend: http://localhost:4200
- Backend: http://localhost:5256

### 2. Install Playwright Browsers (First Time Only)

```bash
npx playwright install
```

### 3. Run Tests

```bash
# Run all tests
npx nx e2e invenet-e2e

# Or run with UI mode (recommended for beginners)
npx nx e2e invenet-e2e --ui
```

## 📝 Common Commands

```bash
# Run specific test file
npx nx e2e invenet-e2e --spec src/tests/login.spec.ts

# Run in headed mode (see the browser)
npx nx e2e invenet-e2e --headed

# Debug mode (step through tests)
npx nx e2e invenet-e2e --debug

# Run on specific browser
npx nx e2e invenet-e2e --project=chromium
npx nx e2e invenet-e2e --project=firefox
npx nx e2e invenet-e2e --project=webkit

# Generate test code (Codegen)
npx playwright codegen http://localhost:4200
```

## 📁 Test Files

| File                | Description          | Tests    |
| ------------------- | -------------------- | -------- |
| `login.spec.ts`     | Login functionality  | 10 tests |
| `register.spec.ts`  | Registration         | 10 tests |
| `logout.spec.ts`    | Logout functionality | 5 tests  |
| `auth-flow.spec.ts` | Complete auth flows  | 8 tests  |
| `smoke.spec.ts`     | Smoke tests          | 2 tests  |

**Total: 35+ comprehensive tests**

## 🎯 Quick Test Examples

### Basic Test

```typescript
import { test, expect } from './fixtures';

test('my first test', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.expectToBeOnPage();
});
```

### Using Generated Test Data

```typescript
import { test } from './fixtures';
import { generateTestUser } from './helpers';

test('register new user', async ({ registerPage, homePage }) => {
  const user = generateTestUser();
  await registerPage.goto();
  await registerPage.register(user.email, user.username, user.password);
  await homePage.expectToBeSignedIn();
});
```

### With Auth Helper

```typescript
import { test, expect } from './fixtures';

test('check auth state', async ({ authHelper }) => {
  const tokens = await authHelper.getStoredTokens();
  expect(tokens).not.toBeNull();
});
```

## 🐛 Debugging Tips

### 1. Use UI Mode (Best for Development)

```bash
npx nx e2e invenet-e2e --ui
```

- See all tests in a visual interface
- Time-travel through test steps
- See screenshots and DOM snapshots
- Rerun tests easily

### 2. Use Debug Mode

```bash
npx nx e2e invenet-e2e --debug
```

- Opens Playwright Inspector
- Step through test line by line
- Inspect page elements
- Execute commands in browser console

### 3. View Test Reports

```bash
npx playwright show-report
```

- See detailed HTML report
- View screenshots of failures
- Check trace files
- Analyze test timing

### 4. Enable Verbose Logging

```typescript
test('my test', async ({ page }) => {
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  // Your test code...
});
```

## ✅ Test Structure

```
src/
├── fixtures/          # Custom test fixtures (use these!)
├── helpers/           # Test utilities and data generators
├── pages/             # Page Object Models (one per page)
├── tests/             # Your test files go here
└── types/             # TypeScript type definitions
```

## 📚 Key Concepts

### Page Objects

Encapsulate page logic:

```typescript
// ✅ Good - Using page object
await loginPage.login(email, password);

// ❌ Bad - Direct selectors in test
await page.fill('#email', email);
await page.fill('#password', password);
await page.click('button[type="submit"]');
```

### Custom Fixtures

Pre-initialized helpers:

```typescript
test('example', async ({
  loginPage, // Ready to use
  homePage, // Ready to use
  authHelper, // Ready to use
}) => {
  // No need to initialize anything!
});
```

### Test Data

Generate unique data:

```typescript
const user = generateTestUser();
// user.email: "test.user.1234567890.1@example.com"
// user.username: "testuser12345678901"
// user.password: "Test123456!"
```

## 🎨 Best Practices

1. **✅ Each test is independent** - Can run in any order
2. **✅ Clean state** - Clear auth before each test
3. **✅ Unique data** - Use `generateTestUser()`
4. **✅ Page objects** - Never use selectors directly
5. **✅ Meaningful names** - Describe what test does
6. **✅ Wait for state** - Use `waitForAuthComplete()`
7. **❌ No hard waits** - Don't use `page.waitForTimeout()`
8. **❌ No brittle selectors** - Use semantic locators

## 🔥 Pro Tips

### Tip 1: Run Tests While Developing

```bash
npx nx e2e invenet-e2e --ui --headed
```

### Tip 2: Generate New Tests Quickly

```bash
npx playwright codegen http://localhost:4200
```

This opens a browser and generates test code as you interact!

### Tip 3: Run Only Failed Tests

```bash
npx nx e2e invenet-e2e --last-failed
```

### Tip 4: Parallel Execution

```bash
npx nx e2e invenet-e2e --workers=4
```

### Tip 5: Take Screenshots Manually

```typescript
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

## 🆘 Troubleshooting

### Tests Timeout

- Check if app is running on http://localhost:4200
- Check if API is running on http://localhost:5256
- Increase timeout in config if needed

### "Element not found" Errors

- Check if page loaded correctly
- Verify selectors in page objects
- Use `await expect(element).toBeVisible()` first

### Tests are Flaky

- Remove `page.waitForTimeout()`
- Use `waitForAuthComplete()` after login
- Check for race conditions

### Can't See What's Happening

- Run with `--headed` flag
- Use `--debug` mode
- Add `await page.pause()` in test

## 📖 Learn More

- [Full Documentation](./README.md) - Comprehensive guide
- [Playwright Docs](https://playwright.dev) - Official documentation
- [Page Objects](./src/pages/) - See examples
- [Test Examples](./src/tests/) - Learn from existing tests

---

**Ready to test? Run:** `npx nx e2e invenet-e2e --ui`
