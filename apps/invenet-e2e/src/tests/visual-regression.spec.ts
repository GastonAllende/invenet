import { test, expect } from '../fixtures/index';

/**
 * Visual Regression and Screenshot Tests
 *
 * These tests capture screenshots for visual regression testing
 * and verify the visual consistency of the application.
 */

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ authHelper }) => {
    await authHelper.clearAuth();
  });

  test.describe('Page Screenshots', () => {
    test('should capture login page screenshot', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();

      // Wait for page to be fully loaded
      await expect(page.getByText('Welcome back')).toBeVisible();

      // Take screenshot
      await expect(page).toHaveScreenshot('login-page.png', {
        fullPage: true,
      });
    });

    test('should capture register page screenshot', async ({
      registerPage,
      page,
    }) => {
      await registerPage.goto();

      // Wait for page to be fully loaded
      await expect(page.getByText('Create your account')).toBeVisible();

      // Take screenshot
      await expect(page).toHaveScreenshot('register-page.png', {
        fullPage: true,
      });
    });

    test('should capture authenticated home page screenshot', async ({
      loginPage,
      homePage,
      page,
    }) => {
      await loginPage.goto();
      await loginPage.login('test@example.com', 'Test123456!');
      await homePage.expectToBeOnPage();

      // Wait for page to be fully loaded
      await expect(page.getByText("You're signed in")).toBeVisible();

      // Take screenshot
      await expect(page).toHaveScreenshot('home-page-authenticated.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Component Screenshots', () => {
    test('should capture login form screenshot', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();

      // Get the form container
      const formContainer = page.locator('text=Welcome back').locator('..');

      // Take screenshot of form only
      await expect(formContainer).toHaveScreenshot('login-form.png');
    });

    test('should capture register form screenshot', async ({
      registerPage,
      page,
    }) => {
      await registerPage.goto();

      // Get the form container
      const formContainer = page
        .locator('text=Create your account')
        .locator('..');

      // Take screenshot of form only
      await expect(formContainer).toHaveScreenshot('register-form.png');
    });

    test('should capture authenticated card screenshot', async ({
      loginPage,
      homePage,
      page,
    }) => {
      await loginPage.goto();
      await loginPage.login('test@example.com', 'Test123456!');
      await homePage.expectToBeOnPage();

      // Get the content card
      const contentCard = page.locator("text=You're signed in").locator('..');

      // Take screenshot of card only
      await expect(contentCard).toHaveScreenshot('authenticated-card.png');
    });
  });

  test.describe('State-based Screenshots', () => {
    test('should capture password field in hidden state', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();

      const passwordField = page.locator('input[type="password"]');
      await passwordField.fill('TestPassword123!');

      await expect(passwordField).toHaveScreenshot('password-hidden.png');
    });

    test('should capture password field in visible state', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();

      // Fill password
      await page.locator('input[type="password"]').fill('TestPassword123!');

      // Click toggle to show password
      await page.locator('img').first().click();

      // Take screenshot of visible password field
      const visiblePasswordField = page
        .locator('input[type="text"]')
        .filter({ hasText: /TestPassword123!/ })
        .first();
      await expect(visiblePasswordField).toHaveScreenshot(
        'password-visible.png',
      );
    });

    test('should capture filled login form', async ({ loginPage, page }) => {
      await loginPage.goto();

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill('user@example.com');
      await page.locator('input[type="password"]').fill('MyPassword123!');

      const formContainer = page.locator('text=Welcome back').locator('..');
      await expect(formContainer).toHaveScreenshot('login-form-filled.png');
    });

    test('should capture filled register form', async ({
      registerPage,
      page,
    }) => {
      await registerPage.goto();

      await page
        .getByRole('textbox', { name: 'Email' })
        .fill('newuser@example.com');
      await page.getByRole('textbox', { name: 'Username' }).fill('newusername');
      const passwordFields = page.locator('input[type="password"]');
      await passwordFields.nth(0).fill('MyPassword123!');
      await passwordFields.nth(1).fill('MyPassword123!');

      const formContainer = page
        .locator('text=Create your account')
        .locator('..');
      await expect(formContainer).toHaveScreenshot('register-form-filled.png');
    });
  });

  test.describe('Responsive Screenshots', () => {
    test('should capture login page on mobile viewport', async ({
      loginPage,
      page,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await loginPage.goto();
      await expect(page.getByText('Welcome back')).toBeVisible();

      await expect(page).toHaveScreenshot('login-page-mobile.png', {
        fullPage: true,
      });
    });

    test('should capture register page on mobile viewport', async ({
      registerPage,
      page,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await registerPage.goto();
      await expect(page.getByText('Create your account')).toBeVisible();

      await expect(page).toHaveScreenshot('register-page-mobile.png', {
        fullPage: true,
      });
    });

    test('should capture home page on mobile viewport', async ({
      loginPage,
      homePage,
      page,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await loginPage.goto();
      await loginPage.login('test@example.com', 'Test123456!');
      await homePage.expectToBeOnPage();
      await expect(page.getByText("You're signed in")).toBeVisible();

      await expect(page).toHaveScreenshot('home-page-mobile.png', {
        fullPage: true,
      });
    });

    test('should capture login page on tablet viewport', async ({
      loginPage,
      page,
    }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await loginPage.goto();
      await expect(page.getByText('Welcome back')).toBeVisible();

      await expect(page).toHaveScreenshot('login-page-tablet.png', {
        fullPage: true,
      });
    });

    test('should capture login page on desktop viewport', async ({
      loginPage,
      page,
    }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      await loginPage.goto();
      await expect(page.getByText('Welcome back')).toBeVisible();

      await expect(page).toHaveScreenshot('login-page-desktop.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Hover and Focus States', () => {
    test('should capture button hover state', async ({ loginPage, page }) => {
      await loginPage.goto();

      const signInButton = page.getByRole('button', { name: 'Sign in' });
      await signInButton.hover();

      await expect(signInButton).toHaveScreenshot('sign-in-button-hover.png');
    });

    test('should capture input focus state', async ({ loginPage, page }) => {
      await loginPage.goto();

      const emailField = page.getByRole('textbox', { name: 'Email' });
      await emailField.focus();

      await expect(emailField).toHaveScreenshot('email-input-focus.png');
    });

    test('should capture link hover state', async ({ loginPage, page }) => {
      await loginPage.goto();

      const createAccountLink = page.getByRole('link', {
        name: 'Create account',
      });
      await createAccountLink.hover();

      await expect(createAccountLink).toHaveScreenshot(
        'create-account-link-hover.png',
      );
    });
  });
});
