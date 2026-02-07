import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly signOutButton: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signOutButton = page.getByRole('button', { name: 'Sign out' });
    this.welcomeMessage = page.getByText("You're signed in");
  }

  async goto() {
    await this.page.goto('/');
  }

  async signOut() {
    await this.signOutButton.click();
  }

  async expectToBeSignedIn() {
    await expect(this.welcomeMessage).toBeVisible();
  }

  async expectToBeOnPage() {
    await expect(this.page).toHaveURL(/^https?:\/\/[^/]+\/?$/);
  }
}
