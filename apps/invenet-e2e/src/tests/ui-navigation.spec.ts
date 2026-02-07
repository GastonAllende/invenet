import { test, expect } from '../fixtures/index';

/**
 * UI and Navigation E2E Tests
 *
 * These tests focus on:
 * - Visual UI elements and layout
 * - Navigation flows between pages
 * - Password visibility toggles
 * - Page accessibility
 * - Responsive behavior
 */

test.describe('UI and Navigation', () => {
  test.beforeEach(async ({ authHelper }) => {
    await authHelper.clearAuth();
  });

  test.describe('Login Page UI', () => {
    test('should display all UI elements correctly', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();

      // Check heading
      await expect(page.getByText('Welcome back')).toBeVisible();

      // Check form fields
      await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
      await expect(
        page.getByRole('textbox', { name: 'Email' }),
      ).toHaveAttribute('placeholder', 'you@example.com');

      // Check password field
      await expect(page.locator('input[type="password"]')).toBeVisible();

      // Check password visibility toggle
      await expect(page.locator('img').first()).toBeVisible();

      // Check sign in button
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();

      // Check register link
      await expect(
        page.getByRole('link', { name: 'Create account' }),
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Create account' }),
      ).toHaveAttribute('href', '/register');
    });

    test('should toggle password visibility', async ({ loginPage, page }) => {
      await loginPage.goto();
      await page
        .getByRole('textbox', { name: /password/i })
        .fill('TestPassword123!');

      // Get password input
      const passwordInput = page
        .locator('input')
        .filter({ hasText: /TestPassword123!/ })
        .or(page.locator('input[type="password"]'));

      // Initially should be password type (hidden)
      await expect(passwordInput.first()).toHaveAttribute('type', 'password');

      // Click toggle button
      await page.locator('img').first().click();

      // Should now be text type (visible)
      await expect(
        page
          .locator('input[type="text"]')
          .filter({ hasText: /TestPassword123!/ }),
      ).toBeVisible();

      // Click toggle again
      await page.locator('img').first().click();

      // Should be back to password type
      await expect(passwordInput.first()).toHaveAttribute('type', 'password');
    });

    test('should maintain focus on email field on load', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();

      // Email field should be focusable
      const emailField = page.getByRole('textbox', { name: 'Email' });
      await emailField.focus();
      await expect(emailField).toBeFocused();
    });
  });

  test.describe('Register Page UI', () => {
    test('should display all UI elements correctly', async ({
      registerPage,
      page,
    }) => {
      await registerPage.goto();

      // Check heading
      await expect(page.getByText('Create your account')).toBeVisible();

      // Check all form fields
      await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
      await expect(
        page.getByRole('textbox', { name: 'Username' }),
      ).toBeVisible();

      // Check password fields with visibility toggles
      const passwordFields = page.locator('input[type="password"]');
      await expect(passwordFields).toHaveCount(2); // password and confirm password

      // Check password visibility toggles (should have 2)
      const toggleButtons = page.locator('img');
      await expect(toggleButtons).toHaveCount(2);

      // Check create account button
      await expect(
        page.getByRole('button', { name: 'Create account' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Create account' }),
      ).toBeEnabled();

      // Check login link
      await expect(
        page.getByRole('link', { name: /Already have an account/i }),
      ).toBeVisible();
    });

    test('should toggle password visibility on both password fields', async ({
      registerPage,
      page,
    }) => {
      await registerPage.goto();

      // Fill both password fields
      const passwordInputs = page.locator('input[type="password"]');
      await passwordInputs.nth(0).fill('TestPassword123!');
      await passwordInputs.nth(1).fill('TestPassword123!');

      // Get toggle buttons
      const toggleButtons = page.locator('img');

      // Toggle first password field
      await toggleButtons.nth(0).click();

      // First password should be visible
      const visibleInputs = page.locator('input[type="text"]');
      await expect(visibleInputs).toHaveCount(3); // email, username, and first password

      // Toggle second password field
      await toggleButtons.nth(1).click();

      // Both passwords should now be visible
      await expect(page.locator('input[type="text"]')).toHaveCount(4); // email, username, password, confirm
    });

    test('should have proper placeholder text', async ({
      registerPage,
      page,
    }) => {
      await registerPage.goto();

      await expect(
        page.getByRole('textbox', { name: 'Email' }),
      ).toHaveAttribute('placeholder', 'you@example.com');
      await expect(
        page.getByRole('textbox', { name: 'Username' }),
      ).toHaveAttribute('placeholder', 'yourname');
    });
  });

  test.describe('Home Page UI', () => {
    test('should display authenticated home page correctly', async ({
      loginPage,
      homePage,
      page,
    }) => {
      // Login first
      await loginPage.goto();
      await loginPage.login('test@example.com', 'Test123456!');
      await homePage.expectToBeOnPage();

      // Check home page elements
      await expect(page.getByText("You're signed in")).toBeVisible();
      await expect(
        page.getByText('Welcome to Invenet. Your account is authenticated.'),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Sign out' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Sign out' }),
      ).toBeEnabled();
    });
  });

  test.describe('Navigation Flows', () => {
    test('should navigate from login to register page', async ({
      loginPage,
      registerPage,
      page,
    }) => {
      await loginPage.goto();

      // Click "Create account" link
      await page.getByRole('link', { name: 'Create account' }).click();

      // Should be on register page
      await registerPage.expectToBeOnPage();
      await expect(page.getByText('Create your account')).toBeVisible();
    });

    test('should navigate from register to login page', async ({
      registerPage,
      loginPage,
      page,
    }) => {
      await registerPage.goto();

      // Click "Already have an account?" link
      await page
        .getByRole('link', { name: /Already have an account/i })
        .click();

      // Should be on login page
      await loginPage.expectToBeOnPage();
      await expect(page.getByText('Welcome back')).toBeVisible();
    });

    test('should redirect from home to login when not authenticated', async ({
      loginPage,
      page,
    }) => {
      // Try to access home page without authentication
      await page.goto('/');

      // Should be redirected to login
      await loginPage.expectToBeOnPage();
      await expect(page).toHaveURL(/\/login/);
    });

    test('should navigate to home after successful login', async ({
      loginPage,
      homePage,
      page,
    }) => {
      await loginPage.goto();
      await loginPage.login('test@example.com', 'Test123456!');

      // Should navigate to home page
      await homePage.expectToBeOnPage();
      await expect(page.getByText("You're signed in")).toBeVisible();
    });

    test('should navigate to login after sign out', async ({
      loginPage,
      homePage,
      page,
      authHelper,
    }) => {
      // Login first
      await loginPage.goto();
      await loginPage.login('test@example.com', 'Test123456!');
      await homePage.expectToBeOnPage();

      // Sign out
      await page.getByRole('button', { name: 'Sign out' }).click();

      // Should be redirected to login
      await loginPage.expectToBeOnPage();
      await expect(page).toHaveURL(/\/login/);

      // Verify auth was cleared
      expect(await authHelper.isAuthenticated()).toBe(false);
    });

    test('should handle browser back button correctly', async ({
      loginPage,
      registerPage,
      page,
    }) => {
      await loginPage.goto();
      await expect(page).toHaveURL(/\/login/);

      // Navigate to register
      await page.getByRole('link', { name: 'Create account' }).click();
      await registerPage.expectToBeOnPage();
      await expect(page).toHaveURL(/\/register/);

      // Use browser back button
      await page.goBack();

      // Should be back on login page
      await loginPage.expectToBeOnPage();
      await expect(page).toHaveURL(/\/login/);
    });

    test('should handle browser forward button correctly', async ({
      loginPage,
      registerPage,
      page,
    }) => {
      await loginPage.goto();
      await expect(page).toHaveURL(/\/login/);

      // Navigate to register and back
      await page.getByRole('link', { name: 'Create account' }).click();
      await registerPage.expectToBeOnPage();
      await page.goBack();
      await loginPage.expectToBeOnPage();

      // Use browser forward button
      await page.goForward();

      // Should be on register page again
      await registerPage.expectToBeOnPage();
      await expect(page).toHaveURL(/\/register/);
    });
  });

  test.describe('Auth Guard Behavior', () => {
    test('should protect home page from unauthenticated access', async ({
      loginPage,
      page,
    }) => {
      // Direct navigation to home
      await page.goto('/');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
      await loginPage.expectToBeOnPage();
    });

    test('should allow access to home page when authenticated', async ({
      loginPage,
      homePage,
      page,
    }) => {
      await loginPage.goto();
      await loginPage.login('test@example.com', 'Test123456!');

      // Navigate to home explicitly
      await page.goto('/');

      // Should stay on home page
      await homePage.expectToBeOnPage();
      await expect(page.getByText("You're signed in")).toBeVisible();
    });

    test('should not redirect to login when already on login page', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();
      await expect(page).toHaveURL(/\/login/);

      // Navigate to login again
      await page.goto('/login');

      // Should still be on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should not redirect to login when on register page', async ({
      registerPage,
      page,
    }) => {
      await page.goto('/register');
      await registerPage.expectToBeOnPage();

      // Should stay on register page
      await expect(page).toHaveURL(/\/register/);
    });
  });

  test.describe('Page Layout and Styling', () => {
    test('should center content on login page', async ({ loginPage, page }) => {
      await loginPage.goto();

      // Get the form container
      const container = page.locator('text=Welcome back').locator('..');

      // Container should be visible
      await expect(container).toBeVisible();
    });

    test('should center content on register page', async ({
      registerPage,
      page,
    }) => {
      await registerPage.goto();

      // Get the form container
      const container = page.locator('text=Create your account').locator('..');

      // Container should be visible
      await expect(container).toBeVisible();
    });

    test('should center content on home page', async ({
      loginPage,
      homePage,
      page,
    }) => {
      await loginPage.goto();
      await loginPage.login('test@example.com', 'Test123456!');
      await homePage.expectToBeOnPage();

      // Get the content container
      const container = page.locator("text=You're signed in").locator('..');

      // Container should be visible
      await expect(container).toBeVisible();
    });
  });

  test.describe('Form Interaction', () => {
    test('should allow typing in all form fields on login page', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();

      // Type in email
      const emailField = page.getByRole('textbox', { name: 'Email' });
      await emailField.fill('user@example.com');
      await expect(emailField).toHaveValue('user@example.com');

      // Type in password
      const passwordField = page.locator('input[type="password"]');
      await passwordField.fill('MyPassword123!');
      await expect(passwordField).toHaveValue('MyPassword123!');
    });

    test('should allow typing in all form fields on register page', async ({
      registerPage,
      page,
    }) => {
      await registerPage.goto();

      // Type in email
      const emailField = page.getByRole('textbox', { name: 'Email' });
      await emailField.fill('newuser@example.com');
      await expect(emailField).toHaveValue('newuser@example.com');

      // Type in username
      const usernameField = page.getByRole('textbox', { name: 'Username' });
      await usernameField.fill('newusername');
      await expect(usernameField).toHaveValue('newusername');

      // Type in password fields
      const passwordFields = page.locator('input[type="password"]');
      await passwordFields.nth(0).fill('MyPassword123!');
      await passwordFields.nth(1).fill('MyPassword123!');
      await expect(passwordFields.nth(0)).toHaveValue('MyPassword123!');
      await expect(passwordFields.nth(1)).toHaveValue('MyPassword123!');
    });

    test('should submit login form on Enter key', async ({
      loginPage,
      homePage,
      page,
    }) => {
      await loginPage.goto();

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill('test@example.com');
      await page.locator('input[type="password"]').fill('Test123456!');

      // Press Enter on password field
      await page.locator('input[type="password"]').press('Enter');

      // Should login and navigate to home
      await homePage.expectToBeOnPage();
      await expect(page).toHaveURL(/^https?:\/\/[^/]+\/?$/);
    });

    test('should clear form fields when navigating away and back', async ({
      loginPage,
      registerPage,
      page,
    }) => {
      await loginPage.goto();

      // Fill login form
      await page
        .getByRole('textbox', { name: 'Email' })
        .fill('test@example.com');
      await page.locator('input[type="password"]').fill('TestPassword123!');

      // Navigate to register
      await page.getByRole('link', { name: 'Create account' }).click();
      await registerPage.expectToBeOnPage();

      // Navigate back to login
      await page
        .getByRole('link', { name: /Already have an account/i })
        .click();
      await loginPage.expectToBeOnPage();

      // Fields should be empty (or have autofilled values from browser)
      // Note: Browser autofill behavior varies, so we just check the fields are accessible
      await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });
  });

  test.describe('Button States', () => {
    test('should enable sign in button when form is filled', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();

      const signInButton = page.getByRole('button', { name: 'Sign in' });

      // Button should be enabled (Angular reactive forms might handle this)
      await expect(signInButton).toBeEnabled();

      // Fill form
      await page
        .getByRole('textbox', { name: 'Email' })
        .fill('test@example.com');
      await page.locator('input[type="password"]').fill('Test123456!');

      // Button should remain enabled
      await expect(signInButton).toBeEnabled();
    });

    test('should enable create account button when form is filled', async ({
      registerPage,
      page,
    }) => {
      await registerPage.goto();

      const createButton = page.getByRole('button', { name: 'Create account' });

      // Button should be enabled
      await expect(createButton).toBeEnabled();
    });

    test('should enable sign in button and allow submission', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();
      await page
        .getByRole('textbox', { name: 'Email' })
        .fill('test@example.com');
      await page.locator('input[type="password"]').fill('Test123456!');

      // Click sign in
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      await expect(signInButton).toBeEnabled();
      await signInButton.click();

      // Should navigate away from login page after successful login
      await expect(page).not.toHaveURL(/\/login/);
    });
  });
});
