import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async clearAuth() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const accessToken = localStorage.getItem('accessToken');
      return accessToken !== null && accessToken !== '';
    });
  }

  async getStoredTokens() {
    return await this.page.evaluate(() => {
      return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
      };
    });
  }

  async waitForAuthComplete(timeout = 5000) {
    await this.page.waitForFunction(
      () => {
        const accessToken = localStorage.getItem('accessToken');
        return accessToken !== null && accessToken !== '';
      },
      { timeout },
    );
  }
}
