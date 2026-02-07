import { Page, Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly createAccountButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').last();
    this.createAccountButton = page.getByRole('button', {
      name: 'Create account',
    });
    this.loginLink = page.getByRole('link', {
      name: /Already have an account/i,
    });
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(email: string, username: string, password: string) {
    await this.emailInput.fill(email);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.createAccountButton.click();
  }

  async expectToBeOnPage() {
    await expect(this.page).toHaveURL(/\/register/);
  }
}
